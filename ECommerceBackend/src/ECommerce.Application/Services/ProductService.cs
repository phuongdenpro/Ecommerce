using ECommerce.Application.DTOs.Products;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using ECommerce.Shared.Helpers;
using ECommerce.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;

    public ProductService(IApplicationDbContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task<PagedResult<ProductListDto>> GetProductsAsync(ProductQueryDto query, CancellationToken cancellationToken = default)
    {
        var q = _context.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(p => p.Name.Contains(query.Search) || p.SKU.Contains(query.Search));
        if (query.CategoryId.HasValue) q = q.Where(p => p.CategoryId == query.CategoryId);
        if (query.BrandId.HasValue) q = q.Where(p => p.BrandId == query.BrandId);
        if (query.Status.HasValue) q = q.Where(p => p.Status == query.Status);
        if (query.MinPrice.HasValue) q = q.Where(p => p.Price >= query.MinPrice);
        if (query.MaxPrice.HasValue) q = q.Where(p => p.Price <= query.MaxPrice);
        if (query.InStock == true) q = q.Where(p => p.StockQuantity > 0);
        if (query.IsFeatured.HasValue) q = q.Where(p => p.IsFeatured == query.IsFeatured);

        q = (query.SortBy?.ToLower()) switch
        {
            "price" => query.SortDescending ? q.OrderByDescending(p => p.Price) : q.OrderBy(p => p.Price),
            "name" => query.SortDescending ? q.OrderByDescending(p => p.Name) : q.OrderBy(p => p.Name),
            _ => query.SortDescending ? q.OrderByDescending(p => p.CreatedAt) : q.OrderBy(p => p.CreatedAt)
        };

        var total = await q.CountAsync(cancellationToken);
        var items = await q.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(cancellationToken);
        return PagedResult<ProductListDto>.Create(items.Select(MapList).ToList(), query.PageNumber, query.PageSize, total);
    }

    public async Task<ProductDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.AsNoTracking()
            .Include(p => p.Category).Include(p => p.Brand).Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Product not found.");
        var reviews = await _context.Reviews.AsNoTracking()
            .Where(r => r.ProductId == id && !r.IsHidden).ToListAsync(cancellationToken);
        var detail = MapDetail(product);
        detail.AverageRating = reviews.Count > 0 ? reviews.Average(r => r.Rating) : null;
        detail.ReviewCount = reviews.Count;
        return detail;
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductRequestDto request, IFormFileCollection? images, CancellationToken cancellationToken = default)
    {
        await ValidateRefsAsync(request.CategoryId, request.BrandId, cancellationToken);
        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = SlugHelper.GenerateSlug(request.Name),
            Description = request.Description,
            Price = request.Price,
            DiscountPrice = request.DiscountPrice,
            StockQuantity = request.StockQuantity,
            SKU = request.SKU.Trim(),
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            Status = request.Status,
            IsFeatured = request.IsFeatured
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);
        await SaveImagesAsync(product, images, cancellationToken);
        return await GetByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDetailDto> UpdateAsync(Guid id, UpdateProductRequestDto request, IFormFileCollection? images, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Product not found.");
        await ValidateRefsAsync(request.CategoryId, request.BrandId, cancellationToken);
        product.Name = request.Name.Trim();
        product.Slug = SlugHelper.GenerateSlug(request.Name);
        product.Description = request.Description;
        product.Price = request.Price;
        product.DiscountPrice = request.DiscountPrice;
        product.StockQuantity = request.StockQuantity;
        product.SKU = request.SKU.Trim();
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.Status = request.Status;
        product.IsFeatured = request.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        if (images?.Count > 0) await SaveImagesAsync(product, images, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Product not found.");
        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidateRefsAsync(Guid categoryId, Guid brandId, CancellationToken ct)
    {
        if (!await _context.Categories.AnyAsync(c => c.Id == categoryId && !c.IsDeleted, ct))
            throw new NotFoundException("Category not found.");
        if (!await _context.Brands.AnyAsync(b => b.Id == brandId, ct))
            throw new NotFoundException("Brand not found.");
    }

    private async Task SaveImagesAsync(Product product, IFormFileCollection? images, CancellationToken ct)
    {
        if (images is null || images.Count == 0) return;
        var urls = await _fileStorage.SaveFilesAsync(images, "products", ct);
        var order = product.Images.Count;
        foreach (var url in urls)
        {
            _context.ProductImages.Add(new ProductImage
            {
                ProductId = product.Id,
                ImageUrl = url,
                IsPrimary = product.Images.Count == 0 && order == 0,
                SortOrder = order++
            });
        }
        await _context.SaveChangesAsync(ct);
    }

    private static ProductListDto MapList(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        Price = p.Price,
        DiscountPrice = p.DiscountPrice,
        StockQuantity = p.StockQuantity,
        SKU = p.SKU,
        CategoryName = p.Category?.Name ?? "",
        BrandName = p.Brand?.Name ?? "",
        Status = p.Status.ToString(),
        IsFeatured = p.IsFeatured,
        PrimaryImageUrl = p.Images.OrderBy(i => i.SortOrder).FirstOrDefault(i => i.IsPrimary)?.ImageUrl
            ?? p.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl,
        CreatedAt = p.CreatedAt
    };

    private static ProductDetailDto MapDetail(Product p)
    {
        var list = MapList(p);
        return new ProductDetailDto
        {
            Id = list.Id,
            Name = list.Name,
            Slug = list.Slug,
            Price = list.Price,
            DiscountPrice = list.DiscountPrice,
            StockQuantity = list.StockQuantity,
            SKU = list.SKU,
            CategoryName = list.CategoryName,
            BrandName = list.BrandName,
            Status = list.Status,
            IsFeatured = list.IsFeatured,
            PrimaryImageUrl = list.PrimaryImageUrl,
            CreatedAt = list.CreatedAt,
            Description = p.Description,
            CategoryId = p.CategoryId,
            BrandId = p.BrandId,
            Images = p.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsPrimary = i.IsPrimary,
                SortOrder = i.SortOrder
            }).ToList()
        };
    }
}
