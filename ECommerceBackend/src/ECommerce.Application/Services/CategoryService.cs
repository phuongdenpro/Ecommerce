using ECommerce.Application.DTOs.Categories;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using ECommerce.Shared.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;

    public CategoryService(IApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Categories.AsNoTracking().Where(c => !c.IsDeleted);
        if (!includeInactive)
            query = query.Where(c => c.Status == EntityStatus.Active);

        var all = await query.OrderBy(c => c.Name).ToListAsync(cancellationToken);
        var roots = all.Where(c => c.ParentId == null).ToList();
        return roots.Select(r => MapTree(r, all)).ToList();
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Category not found.");
        var all = await _context.Categories.AsNoTracking().Where(c => !c.IsDeleted).ToListAsync(cancellationToken);
        return MapTree(category, all);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.ParentId.HasValue && !await _context.Categories.AnyAsync(c => c.Id == request.ParentId && !c.IsDeleted, cancellationToken))
            throw new NotFoundException("Parent category not found.");

        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = SlugHelper.GenerateSlug(request.Name),
            Description = request.Description,
            ParentId = request.ParentId,
            Status = request.IsActive ? EntityStatus.Active : EntityStatus.Inactive
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(category.Id, cancellationToken);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryRequestDto request, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        if (request.ParentId == id)
            throw new BadRequestException("Category cannot be its own parent.");

        category.Name = request.Name.Trim();
        category.Slug = SlugHelper.GenerateSlug(request.Name);
        category.Description = request.Description;
        category.ParentId = request.ParentId;
        category.Status = request.IsActive ? EntityStatus.Active : EntityStatus.Inactive;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Category not found.");
        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static CategoryDto MapTree(Category category, List<Category> all) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Slug = category.Slug,
        Description = category.Description,
        ParentId = category.ParentId,
        Status = category.Status.ToString(),
        Children = all.Where(c => c.ParentId == category.Id).Select(c => MapTree(c, all)).ToList()
    };
}
