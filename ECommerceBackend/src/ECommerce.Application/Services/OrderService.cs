using ECommerce.Application.DTOs.Orders;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using ECommerce.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;
    private readonly ICouponService _couponService;

    public OrderService(IApplicationDbContext context, ICouponService couponService)
    {
        _context = context;
        _couponService = couponService;
    }

    public async Task<OrderDetailDto> CreateOrderAsync(Guid userId, CreateOrderRequestDto request, CancellationToken cancellationToken = default)
    {
        var cart = await _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken)
            ?? throw new BadRequestException("Cart is empty.");

        if (!cart.Items.Any())
            throw new BadRequestException("Cart is empty.");

        foreach (var item in cart.Items)
        {
            if (item.Product.StockQuantity < item.Quantity)
                throw new BadRequestException($"Insufficient stock for {item.Product.Name}.");
        }

        var shippingAddress = request.ShippingAddress ?? "";
        if (request.AddressId.HasValue)
        {
            var addr = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == request.AddressId && a.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Address not found.");
            shippingAddress = $"{addr.FullName}, {addr.PhoneNumber}, {addr.AddressLine}, {addr.Ward}, {addr.District}, {addr.City}";
        }

        if (string.IsNullOrWhiteSpace(shippingAddress))
            throw new BadRequestException("Shipping address is required.");

        var totalAmount = cart.Items.Sum(i => (i.Product.DiscountPrice ?? i.Product.Price) * i.Quantity);
        var discountAmount = 0m;
        Guid? couponId = null;
        string? couponCode = null;

        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var validation = await _couponService.ValidateAsync(request.CouponCode, totalAmount, userId, cancellationToken);
            if (!validation.IsValid)
                throw new BadRequestException(validation.Message);
            discountAmount = validation.DiscountAmount;
            couponId = validation.CouponId;
            couponCode = validation.Code;
        }

        var finalAmount = totalAmount + request.ShippingFee - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        var order = new Order
        {
            UserId = userId,
            OrderCode = GenerateOrderCode(),
            TotalAmount = totalAmount,
            ShippingFee = request.ShippingFee,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Pending,
            ShippingAddress = shippingAddress,
            Note = request.Note,
            CouponId = couponId,
            CouponCode = couponCode
        };

        foreach (var item in cart.Items)
        {
            var unitPrice = item.Product.DiscountPrice ?? item.Product.Price;
            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductImageUrl = item.Product.Images.OrderBy(x => x.SortOrder).FirstOrDefault()?.ImageUrl,
                UnitPrice = unitPrice,
                Quantity = item.Quantity,
                SubTotal = unitPrice * item.Quantity
            });
            item.Product.StockQuantity -= item.Quantity;
        }

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.Items);

        if (couponId.HasValue)
        {
            var coupon = await _context.Coupons.FindAsync([couponId.Value], cancellationToken);
            if (coupon is not null)
            {
                coupon.UsedCount++;
                _context.CouponUsages.Add(new CouponUsage
                {
                    CouponId = coupon.Id,
                    UserId = userId,
                    OrderId = order.Id,
                    DiscountApplied = discountAmount
                });
            }
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The order or related data was modified by another process. Please reload and try again.");
        }
        return await GetOrderDetailAsync(order.Id, cancellationToken);
    }

    public async Task<PagedResult<OrderListDto>> GetMyOrdersAsync(Guid userId, PaginationQuery query, CancellationToken cancellationToken = default) =>
        await GetOrdersPagedAsync(query, userId, cancellationToken);

    public async Task<OrderDetailDto> GetMyOrderByIdAsync(Guid userId, Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.AsNoTracking().Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Order not found.");
        return MapDetail(order);
    }

    public async Task<PagedResult<OrderListDto>> GetAllOrdersAsync(OrderAdminQueryDto query, CancellationToken cancellationToken = default) =>
        await GetOrdersPagedAsync(query, query.UserId, cancellationToken, admin: true);

    public async Task<OrderDetailDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequestDto request, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.FindAsync([orderId], cancellationToken)
            ?? throw new NotFoundException("Order not found.");
        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;
        if (request.Status == OrderStatus.Delivered)
            order.PaymentStatus = PaymentStatus.Paid;
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The order was modified by another process. Please reload and try again.");
        }
        return await GetOrderDetailAsync(orderId, cancellationToken);
    }

    public async Task CancelOrderAsync(Guid userId, Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Order not found.");

        if (order.Status is OrderStatus.Shipping or OrderStatus.Delivered)
            throw new BadRequestException("Cannot cancel order that is already shipped or delivered.");

        if (order.Status == OrderStatus.Cancelled)
            throw new BadRequestException("Order is already cancelled.");

        foreach (var item in order.Items)
            item.Product.StockQuantity += item.Quantity;

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The order was modified by another process. Please reload and try again.");
        }
    }

    public async Task<OrderDetailDto> GetOrderByIdForAdminAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var exists = await _context.Orders.AnyAsync(o => o.Id == orderId, cancellationToken);
        if (!exists) throw new NotFoundException("Order not found.");
        return await GetOrderDetailAsync(orderId, cancellationToken);
    }

    public async Task AdminCancelOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
            ?? throw new NotFoundException("Order not found.");

        if (order.Status is OrderStatus.Shipping or OrderStatus.Delivered)
            throw new BadRequestException("Cannot cancel order that is already shipped or delivered.");

        if (order.Status == OrderStatus.Cancelled)
            throw new BadRequestException("Order is already cancelled.");

        foreach (var item in order.Items)
            item.Product.StockQuantity += item.Quantity;

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The order was modified by another process. Please reload and try again.");
        }
    }

    public async Task<OrderDetailDto> CreateOrderForAdminAsync(AdminCreateOrderRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.Items is null || !request.Items.Any())
            throw new BadRequestException("At least one order item is required.");

        var user = await _context.Users.FindAsync([request.CustomerId], cancellationToken)
            ?? throw new NotFoundException("Customer not found.");

        if (user.Role != UserRole.Customer)
            throw new BadRequestException("Orders can only be created for customers.");

        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
            throw new NotFoundException("One or more products not found.");

        foreach (var line in request.Items)
        {
            var product = products.First(p => p.Id == line.ProductId);
            if (product.StockQuantity < line.Quantity)
                throw new BadRequestException($"Insufficient stock for {product.Name}.");
        }

        var shippingAddress = request.ShippingAddress ?? "";
        if (request.AddressId.HasValue)
        {
            var addr = await _context.Addresses.FirstOrDefaultAsync(
                a => a.Id == request.AddressId && a.UserId == request.CustomerId, cancellationToken)
                ?? throw new NotFoundException("Address not found.");
            shippingAddress = $"{addr.FullName}, {addr.PhoneNumber}, {addr.AddressLine}, {addr.Ward}, {addr.District}, {addr.City}";
        }

        if (string.IsNullOrWhiteSpace(shippingAddress))
            throw new BadRequestException("Shipping address is required.");

        decimal totalAmount = 0;
        foreach (var line in request.Items)
        {
            var product = products.First(p => p.Id == line.ProductId);
            var unitPrice = product.DiscountPrice ?? product.Price;
            totalAmount += unitPrice * line.Quantity;
        }

        var discountAmount = 0m;
        Guid? couponId = null;
        string? couponCode = null;

        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var validation = await _couponService.ValidateAsync(request.CouponCode, totalAmount, request.CustomerId, cancellationToken);
            if (!validation.IsValid)
                throw new BadRequestException(validation.Message);
            discountAmount = validation.DiscountAmount;
            couponId = validation.CouponId;
            couponCode = validation.Code;
        }

        var finalAmount = totalAmount + request.ShippingFee - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        var order = new Order
        {
            UserId = request.CustomerId,
            OrderCode = GenerateOrderCode(),
            TotalAmount = totalAmount,
            ShippingFee = request.ShippingFee,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount,
            Status = OrderStatus.Pending,
            PaymentStatus = request.PaymentStatus,
            ShippingAddress = shippingAddress,
            Note = request.Note,
            CouponId = couponId,
            CouponCode = couponCode
        };

        foreach (var line in request.Items)
        {
            var product = products.First(p => p.Id == line.ProductId);
            var unitPrice = product.DiscountPrice ?? product.Price;
            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImageUrl = product.Images.OrderBy(x => x.SortOrder).FirstOrDefault()?.ImageUrl,
                UnitPrice = unitPrice,
                Quantity = line.Quantity,
                SubTotal = unitPrice * line.Quantity
            });
            product.StockQuantity -= line.Quantity;
        }

        _context.Orders.Add(order);

        if (couponId.HasValue)
        {
            var coupon = await _context.Coupons.FindAsync([couponId.Value], cancellationToken);
            if (coupon is not null)
            {
                coupon.UsedCount++;
                _context.CouponUsages.Add(new CouponUsage
                {
                    CouponId = coupon.Id,
                    UserId = request.CustomerId,
                    OrderId = order.Id,
                    DiscountApplied = discountAmount
                });
            }
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The payment or order was modified by another process. Please reload and try again.");
        }

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = request.PaymentMethod,
            Amount = order.FinalAmount,
            Status = request.PaymentStatus,
            TransactionId = $"ADM-{Guid.NewGuid():N}"[..20],
            PaidAt = request.PaymentStatus == PaymentStatus.Paid ? DateTime.UtcNow : null
        };
        if (request.PaymentStatus == PaymentStatus.Paid)
            payment.GatewayResponse = "Marked paid by admin.";
        else if (request.PaymentMethod == PaymentMethod.Cod)
            payment.GatewayResponse = "Cash on delivery.";
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetOrderDetailAsync(order.Id, cancellationToken);
    }

    public async Task<OrderDetailDto> UpdateOrderPaymentStatusAsync(Guid orderId, UpdateOrderPaymentStatusRequestDto request, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken)
            ?? throw new NotFoundException("Order not found.");

        order.PaymentStatus = request.PaymentStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (order.Payment is not null)
        {
            order.Payment.Status = request.PaymentStatus;
            if (request.PaymentStatus == PaymentStatus.Paid && !order.Payment.PaidAt.HasValue)
                order.Payment.PaidAt = DateTime.UtcNow;
            order.Payment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetOrderDetailAsync(orderId, cancellationToken);
    }

    private async Task<PagedResult<OrderListDto>> GetOrdersPagedAsync(PaginationQuery query, Guid? userId, CancellationToken ct, bool admin = false)
    {
        var q = _context.Orders.AsNoTracking().Include(o => o.User).Include(o => o.Items).AsQueryable();
        if (userId.HasValue) q = q.Where(o => o.UserId == userId);

        if (query is OrderAdminQueryDto adminQuery)
        {
            if (adminQuery.Status.HasValue)
                q = q.Where(o => o.Status == adminQuery.Status);
            if (adminQuery.PaymentStatus.HasValue)
                q = q.Where(o => o.PaymentStatus == adminQuery.PaymentStatus);
            if (adminQuery.CreatedFrom.HasValue)
                q = q.Where(o => o.CreatedAt >= adminQuery.CreatedFrom);
            if (adminQuery.CreatedTo.HasValue)
                q = q.Where(o => o.CreatedAt <= adminQuery.CreatedTo);
            if (adminQuery.PaymentMethod.HasValue)
            {
                var orderIds = _context.Payments.Where(p => p.Method == adminQuery.PaymentMethod).Select(p => p.OrderId);
                q = q.Where(o => orderIds.Contains(o.Id));
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(o =>
                o.OrderCode.Contains(s) ||
                o.User.FullName.Contains(s) ||
                o.User.Email.Contains(s) ||
                (o.User.PhoneNumber != null && o.User.PhoneNumber.Contains(s)));
        }

        q = query.SortDescending ? q.OrderByDescending(o => o.CreatedAt) : q.OrderBy(o => o.CreatedAt);
        var total = await q.CountAsync(ct);
        var orders = await q.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(ct);

        var items = orders.Select(o => new OrderListDto
        {
            Id = o.Id,
            OrderCode = o.OrderCode,
            FinalAmount = o.FinalAmount,
            Status = o.Status.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            ItemCount = o.Items.Count,
            CreatedAt = o.CreatedAt,
            CustomerName = admin ? o.User.FullName : null
        }).ToList();

        return PagedResult<OrderListDto>.Create(items, query.PageNumber, query.PageSize, total);
    }

    private async Task<OrderDetailDto> GetOrderDetailAsync(Guid orderId, CancellationToken ct)
    {
        var order = await _context.Orders.AsNoTracking().Include(o => o.Items)
            .FirstAsync(o => o.Id == orderId, ct);
        return MapDetail(order);
    }

    private static OrderDetailDto MapDetail(Order o) => new()
    {
        Id = o.Id,
        OrderCode = o.OrderCode,
        TotalAmount = o.TotalAmount,
        ShippingFee = o.ShippingFee,
        DiscountAmount = o.DiscountAmount,
        FinalAmount = o.FinalAmount,
        Status = o.Status.ToString(),
        PaymentStatus = o.PaymentStatus.ToString(),
        ShippingAddress = o.ShippingAddress,
        Note = o.Note,
        CouponCode = o.CouponCode,
        CreatedAt = o.CreatedAt,
        Items = o.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductImageUrl = i.ProductImageUrl,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            SubTotal = i.SubTotal
        }).ToList()
    };

    private static string GenerateOrderCode() =>
        $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
}
