using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Wishlist;
using ECommerce.Shared.Models;

namespace ECommerce.Application.Interfaces;

public interface IAdminUserService
{
    Task<PagedResult<AdminUserListDto>> GetUsersAsync(AdminUserQueryDto query, CancellationToken cancellationToken = default);
    Task<AdminUserDetailDto> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task SetUserActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default);
    Task SetUserRoleAsync(Guid id, string role, CancellationToken cancellationToken = default);
    Task<AdminUserDetailDto> CreateUserAsync(CreateAdminUserRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminUserDetailDto> UpdateUserAsync(Guid id, UpdateAdminUserRequestDto request, CancellationToken cancellationToken = default);
    Task<UserAdminNotesDto> GetUserNotesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserAdminNotesDto> SetUserNotesAsync(Guid id, UpdateUserAdminNotesRequestDto request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WishlistItemDto>> GetUserWishlistAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<AdminReviewListDto>> GetUserReviewsAsync(Guid id, PaginationQuery query, CancellationToken cancellationToken = default);
}
