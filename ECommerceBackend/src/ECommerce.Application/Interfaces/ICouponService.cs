using ECommerce.Application.DTOs.Coupons;

namespace ECommerce.Application.Interfaces;

public interface ICouponService
{
    Task<CouponDto> CreateAsync(CreateCouponRequestDto request, CancellationToken cancellationToken = default);
    Task<CouponValidationDto> ValidateAsync(string code, decimal orderAmount, Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CouponDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CouponDto> UpdateAsync(Guid id, UpdateCouponRequestDto request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
