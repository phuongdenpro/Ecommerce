using ECommerce.Application.DTOs.Brands;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/brands")]
public class BrandsController : ApiControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService) => _brandService = brandService;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        OkResponse(await _brandService.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        OkResponse(await _brandService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> Create([FromBody] CreateBrandRequestDto request, CancellationToken ct) =>
        OkResponse(await _brandService.CreateAsync(request, ct), "Brand created");

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandRequestDto request, CancellationToken ct) =>
        OkResponse(await _brandService.UpdateAsync(id, request, ct), "Brand updated");

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _brandService.DeleteAsync(id, ct);
        return OkMessage("Brand deleted");
    }
}
