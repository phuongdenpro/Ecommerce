using ECommerce.Application.DTOs.Products;
using ECommerce.Shared.Models;
using Microsoft.AspNetCore.Http;

namespace ECommerce.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetProductsAsync(ProductQueryDto query, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> CreateAsync(CreateProductRequestDto request, IFormFileCollection? images, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> UpdateAsync(Guid id, UpdateProductRequestDto request, IFormFileCollection? images, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
