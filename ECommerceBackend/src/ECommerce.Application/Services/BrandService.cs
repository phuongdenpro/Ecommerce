using ECommerce.Application.DTOs.Brands;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using ECommerce.Shared.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class BrandService : IBrandService
{
    private readonly IApplicationDbContext _context;

    public BrandService(IApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Brands.AsNoTracking()
            .OrderBy(b => b.Name)
            .Select(b => Map(b))
            .ToListAsync(cancellationToken);

    public async Task<BrandDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = await _context.Brands.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id, cancellationToken)
            ?? throw new NotFoundException("Brand not found.");
        return Map(brand);
    }

    public async Task<BrandDto> CreateAsync(CreateBrandRequestDto request, CancellationToken cancellationToken = default)
    {
        var brand = new Brand
        {
            Name = request.Name.Trim(),
            Slug = SlugHelper.GenerateSlug(request.Name),
            LogoUrl = request.LogoUrl,
            Description = request.Description,
            Status = request.IsActive ? EntityStatus.Active : EntityStatus.Inactive
        };
        _context.Brands.Add(brand);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The brand was modified by another process. Please reload and try again.");
        }
        return Map(brand);
    }

    public async Task<BrandDto> UpdateAsync(Guid id, UpdateBrandRequestDto request, CancellationToken cancellationToken = default)
    {
        var brand = await _context.Brands.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("Brand not found.");
        brand.Name = request.Name.Trim();
        brand.Slug = SlugHelper.GenerateSlug(request.Name);
        brand.LogoUrl = request.LogoUrl;
        brand.Description = request.Description;
        brand.Status = request.IsActive ? EntityStatus.Active : EntityStatus.Inactive;
        brand.UpdatedAt = DateTime.UtcNow;
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The brand was modified by another process. Please reload and try again.");
        }
        return Map(brand);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = await _context.Brands.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("Brand not found.");
        _context.Brands.Remove(brand);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The brand was modified or deleted by another process. Please reload and try again.");
        }
    }

    private static BrandDto Map(Brand b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Slug = b.Slug,
        LogoUrl = b.LogoUrl,
        Description = b.Description,
        Status = b.Status.ToString()
    };
}
