namespace ECommerce.Application.DTOs.Categories;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public IReadOnlyList<CategoryDto> Children { get; set; } = Array.Empty<CategoryDto>();
}

public class CreateCategoryRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCategoryRequestDto : CreateCategoryRequestDto { }
