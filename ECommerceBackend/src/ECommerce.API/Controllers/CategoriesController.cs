using ECommerce.Application.DTOs.Categories;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/categories")]
public class CategoriesController : ApiControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService) => _categoryService = categoryService;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken ct = default) =>
        OkResponse(await _categoryService.GetAllAsync(includeInactive, ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        OkResponse(await _categoryService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequestDto request, CancellationToken ct) =>
        OkResponse(await _categoryService.CreateAsync(request, ct), "Category created");

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequestDto request, CancellationToken ct) =>
        OkResponse(await _categoryService.UpdateAsync(id, request, ct), "Category updated");

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _categoryService.DeleteAsync(id, ct);
        return OkMessage("Category deleted");
    }
}
