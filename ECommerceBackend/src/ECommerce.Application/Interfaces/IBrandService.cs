using ECommerce.Application.DTOs.Brands;

namespace ECommerce.Application.Interfaces;

public interface IBrandService
{
    Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BrandDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BrandDto> CreateAsync(CreateBrandRequestDto request, CancellationToken cancellationToken = default);
    Task<BrandDto> UpdateAsync(Guid id, UpdateBrandRequestDto request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
