using ECommerce.Application.DTOs.Cart;

namespace ECommerce.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequestDto request, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequestDto request, CancellationToken cancellationToken = default);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default);
}
