using ECommerce.Application.DTOs.Wishlist;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class WishlistService : IWishlistService
{
    private readonly IApplicationDbContext _context;

    public WishlistService(IApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<WishlistItemDto>> GetWishlistAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _context.Wishlists.AsNoTracking()
            .Include(w => w.Product).ThenInclude(p => p.Images)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WishlistItemDto
            {
                Id = w.Id,
                ProductId = w.ProductId,
                ProductName = w.Product.Name,
                Slug = w.Product.Slug,
                Price = w.Product.Price,
                DiscountPrice = w.Product.DiscountPrice,
                PrimaryImageUrl = w.Product.Images.OrderBy(i => i.SortOrder).FirstOrDefault()!.ImageUrl,
                AddedAt = w.CreatedAt
            })
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default)
    {
        if (!await _context.Products.AnyAsync(p => p.Id == productId && !p.IsDeleted && p.Status == ProductStatus.Active, cancellationToken))
            throw new NotFoundException("Product not found.");

        if (await _context.Wishlists.AnyAsync(w => w.UserId == userId && w.ProductId == productId, cancellationToken))
            throw new ConflictException("Product is already in wishlist.");

        _context.Wishlists.Add(new Wishlist { UserId = userId, ProductId = productId });
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default)
    {
        var item = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId, cancellationToken)
            ?? throw new NotFoundException("Wishlist item not found.");
        _context.Wishlists.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
