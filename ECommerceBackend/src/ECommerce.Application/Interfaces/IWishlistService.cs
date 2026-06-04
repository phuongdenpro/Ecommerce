using ECommerce.Application.DTOs.Wishlist;

namespace ECommerce.Application.Interfaces;

public interface IWishlistService
{
    Task<IReadOnlyList<WishlistItemDto>> GetWishlistAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid userId, Guid productId, CancellationToken cancellationToken = default);
}
