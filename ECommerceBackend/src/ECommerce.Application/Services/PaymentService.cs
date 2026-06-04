using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Payments;
using ECommerce.Shared.Models;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

/// <summary>
/// Mock payment processor. Replace ProcessOnlinePaymentAsync with real gateway (VNPay, Momo, Stripe).
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly IApplicationDbContext _context;

    public PaymentService(IApplicationDbContext context) => _context = context;

    public async Task<PaymentDto> ProcessPaymentAsync(Guid userId, ProcessPaymentRequestDto request, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Order not found.");

        if (order.PaymentStatus == PaymentStatus.Paid)
            throw new BadRequestException("Order is already paid.");

        var existing = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id, cancellationToken);
        if (existing is not null)
            _context.Payments.Remove(existing);

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = request.Method,
            Amount = order.FinalAmount,
            Status = PaymentStatus.Pending
        };

        payment = request.Method switch
        {
            PaymentMethod.Cod => ProcessCod(payment),
            PaymentMethod.BankTransfer => ProcessBankTransfer(payment),
            PaymentMethod.OnlinePayment => await ProcessOnlinePaymentAsync(payment, cancellationToken),
            _ => throw new BadRequestException("Unsupported payment method.")
        };

        order.PaymentStatus = payment.Status;
        order.UpdatedAt = DateTime.UtcNow;
        _context.Payments.Add(payment);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The payment or order was modified by another process. Please reload and try again.");
        }
        return Map(payment);
    }

    public async Task<PaymentDto> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments.AsNoTracking().FirstOrDefaultAsync(p => p.OrderId == orderId, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");
        return Map(payment);
    }

    public async Task<PagedResult<AdminPaymentListDto>> GetAllForAdminAsync(AdminPaymentQueryDto query, CancellationToken cancellationToken = default)
    {
        var q = _context.Payments.AsNoTracking()
            .Include(p => p.Order).ThenInclude(o => o.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<PaymentStatus>(query.Status, true, out var status))
            q = q.Where(p => p.Status == status);

        if (!string.IsNullOrWhiteSpace(query.Method) && Enum.TryParse<PaymentMethod>(query.Method, true, out var method))
            q = q.Where(p => p.Method == method);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(p =>
                p.Order.OrderCode.Contains(s) ||
                p.Order.User.FullName.Contains(s) ||
                (p.TransactionId != null && p.TransactionId.Contains(s)));
        }

        q = q.OrderByDescending(p => p.CreatedAt);
        var total = await q.CountAsync(cancellationToken);
        var payments = await q.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(cancellationToken);

        var items = payments.Select(p => new AdminPaymentListDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            OrderCode = p.Order.OrderCode,
            CustomerName = p.Order.User.FullName,
            Method = p.Method.ToString(),
            Status = p.Status.ToString(),
            Amount = p.Amount,
            TransactionId = p.TransactionId,
            PaidAt = p.PaidAt,
            CreatedAt = p.CreatedAt
        }).ToList();

        return PagedResult<AdminPaymentListDto>.Create(items, query.PageNumber, query.PageSize, total);
    }

    public async Task<PaymentDto> UpdateStatusForAdminAsync(Guid paymentId, UpdatePaymentStatusRequestDto request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<PaymentStatus>(request.Status, true, out var status))
            throw new BadRequestException("Invalid payment status.");

        var payment = await _context.Payments.Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        payment.Status = status;
        payment.UpdatedAt = DateTime.UtcNow;
        if (status == PaymentStatus.Paid && !payment.PaidAt.HasValue)
            payment.PaidAt = DateTime.UtcNow;

        payment.Order.PaymentStatus = status;
        payment.Order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Map(payment);
    }

    private static Payment ProcessCod(Payment payment)
    {
        payment.Status = PaymentStatus.Pending;
        payment.TransactionId = $"COD-{Guid.NewGuid():N}"[..20];
        payment.GatewayResponse = "Cash on delivery - pay when order is delivered.";
        return payment;
    }

    private static Payment ProcessBankTransfer(Payment payment)
    {
        payment.Status = PaymentStatus.Pending;
        payment.TransactionId = $"BT-{Guid.NewGuid():N}"[..20];
        payment.GatewayResponse = "Bank transfer initiated. Awaiting confirmation.";
        return payment;
    }

    private static Task<Payment> ProcessOnlinePaymentAsync(Payment payment, CancellationToken _)
    {
        // Mock successful online payment
        payment.Status = PaymentStatus.Paid;
        payment.TransactionId = $"MOCK-{Guid.NewGuid():N}"[..24];
        payment.GatewayResponse = "{\"provider\":\"mock\",\"status\":\"success\"}";
        payment.PaidAt = DateTime.UtcNow;
        return Task.FromResult(payment);
    }

    private static PaymentDto Map(Payment p) => new()
    {
        Id = p.Id,
        OrderId = p.OrderId,
        Method = p.Method.ToString(),
        Status = p.Status.ToString(),
        Amount = p.Amount,
        TransactionId = p.TransactionId,
        PaidAt = p.PaidAt
    };
}
