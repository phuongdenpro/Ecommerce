using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Reviews;
using ECommerce.Shared.Models;

namespace ECommerce.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(Guid userId, CreateReviewRequestDto request, CancellationToken cancellationToken = default);
    Task<ReviewDto> UpdateAsync(Guid userId, Guid reviewId, UpdateReviewRequestDto request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, Guid reviewId, CancellationToken cancellationToken = default);
    Task<PagedResult<ReviewDto>> GetByProductIdAsync(Guid productId, PaginationQuery query, CancellationToken cancellationToken = default);
    Task HideReviewAsync(Guid reviewId, CancellationToken cancellationToken = default);
    Task UnhideReviewAsync(Guid reviewId, CancellationToken cancellationToken = default);
    Task<PagedResult<AdminReviewListDto>> GetAllForAdminAsync(AdminReviewQueryDto query, CancellationToken cancellationToken = default);
    Task AdminDeleteAsync(Guid reviewId, CancellationToken cancellationToken = default);
    Task<PagedResult<AdminReviewListDto>> GetByUserIdForAdminAsync(Guid userId, PaginationQuery query, CancellationToken cancellationToken = default);
}
