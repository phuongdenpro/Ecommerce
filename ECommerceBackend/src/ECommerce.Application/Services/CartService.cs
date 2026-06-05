using ECommerce.Application.DTOs.Cart;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace ECommerce.Application.Services;

public class CartService : ICartService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CartService> _logger;

    public CartService(IApplicationDbContext context, ILogger<CartService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CartDto> GetCartAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken);
        return MapCart(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.Quantity <= 0)
            throw new BadRequestException("Quantity must be greater than 0.");

        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.ProductId && !x.IsDeleted && x.Status == ProductStatus.Active, cancellationToken);

        if (product == null)
            throw new NotFoundException("Product not found.");

        // Load cart (tracking) but do not rely on cart.Items for concurrency-sensitive updates
        var cart = await _context.Carts
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        if (cart == null)
        {
            cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Query CartItem directly from DbSet to avoid stale tracking on cart.Items
        var existingCartItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId, cancellationToken);

        if (existingCartItem == null)
        {
            if (request.Quantity > product.StockQuantity)
                throw new BadRequestException("Insufficient stock.");

            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.CartItems.Add(newItem);
            // update cart UpdatedAt minimally
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            var newQuantity = existingCartItem.Quantity + request.Quantity;
            if (newQuantity > product.StockQuantity)
                throw new BadRequestException("Insufficient stock.");

            // Try update existing CartItem; if concurrency occurs, delete and recreate
            existingCartItem.Quantity = newQuantity;
            existingCartItem.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException dbEx)
            {
                // Log detailed info for all entries
                foreach (var entry in dbEx.Entries)
                {
                    try
                    {
                        var entityName = entry.Entity?.GetType().Name ?? "<unknown>";
                        var state = entry.State.ToString();
                        var current = entry.CurrentValues?.Properties
                            .Select(p => $"{p.Name}={entry.CurrentValues[p.Name]}") ?? Array.Empty<string>();
                        var original = entry.OriginalValues?.Properties
                            .Select(p => $"{p.Name}={entry.OriginalValues[p.Name]}") ?? Array.Empty<string>();
                        _logger.LogError(dbEx, "Concurrency conflict on entity={Entity} state={State} current=[{Current}] original=[{Original}]", entityName, state, string.Join(",", current), string.Join(",", original));
                    }
                    catch (Exception logEx)
                    {
                        _logger.LogError(logEx, "Failed to log concurrency entry details");
                    }
                }

                // Remove stale item and recreate with desired quantity
                try
                {
                    _context.CartItems.Remove(existingCartItem);
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (Exception removeEx)
                {
                    _logger.LogError(removeEx, "Failed to remove stale CartItem during concurrency recovery");
                    throw; // allow middleware to handle
                }

                var recreated = new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = newQuantity,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(recreated);
                await _context.SaveChangesAsync(cancellationToken);
                cart.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Return fresh cart as no-tracking with items and product images
        var updatedCart = await _context.Carts
            .AsNoTracking()
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
                    .ThenInclude(x => x.Images)
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        if (updatedCart == null)
            throw new NotFoundException("Cart not found.");

        return MapCart(updatedCart);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.Quantity < 1) throw new BadRequestException("Quantity must be at least 1.");

        var cart = await GetOrCreateCartAsync(userId, cancellationToken, track: true);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new NotFoundException("Cart item not found.");

        var product = await _context.Products.FindAsync([item.ProductId], cancellationToken)
            ?? throw new NotFoundException("Product not found.");
        if (product.StockQuantity < request.Quantity)
            throw new BadRequestException("Insufficient stock.");

        item.Quantity = request.Quantity;
        item.UpdatedAt = DateTime.UtcNow;
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while updating cart item {ItemId} for user {UserId}", itemId, userId);
            throw new ConflictException("Không thể cập nhật giỏ hàng vì có thay đổi đồng thời. Vui lòng tải lại trang và thử lại.");
        }
        cart = await GetOrCreateCartAsync(userId, cancellationToken);
        return MapCart(cart);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, cancellationToken, track: true);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new NotFoundException("Cart item not found.");
        _context.CartItems.Remove(item);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency exception while removing cart item {ItemId} for user {UserId}", itemId, userId);
            throw new ConflictException("Không thể xóa mục trong giỏ hàng vì có thay đổi đồng thời. Vui lòng tải lại trang và thử lại.");
        }
        cart = await GetOrCreateCartAsync(userId, cancellationToken);
        return MapCart(cart);
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId, CancellationToken ct, bool track = false)
    {
        var query = _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Where(c => c.UserId == userId);

        var cart = track
            ? await query.FirstOrDefaultAsync(ct)
            : await query.AsNoTracking().FirstOrDefaultAsync(ct);

        if (cart is not null) return cart;

        cart = new Cart { UserId = userId };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync(ct);
        return await _context.Carts.Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .AsNoTracking().FirstAsync(c => c.Id == cart.Id, ct);
    }

    private static CartDto MapCart(Cart cart)
    {
        var items = cart.Items.Select(i =>
        {
            var price = i.Product.DiscountPrice ?? i.Product.Price;
            return new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductImageUrl = i.Product.Images.OrderBy(x => x.SortOrder).FirstOrDefault()?.ImageUrl,
                UnitPrice = price,
                Quantity = i.Quantity,
                StockQuantity = i.Product.StockQuantity,
                SubTotal = price * i.Quantity,
                IsInStock = i.Product.StockQuantity >= i.Quantity
            };
        }).ToList();

        return new CartDto
        {
            Id = cart.Id,
            Items = items,
            SubTotal = items.Sum(x => x.SubTotal),
            TotalItems = items.Sum(x => x.Quantity)
        };
    }
}
