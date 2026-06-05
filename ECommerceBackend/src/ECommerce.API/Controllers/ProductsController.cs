using ECommerce.Application.DTOs.Products;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/products")]
public class ProductsController : ApiControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService) => _productService = productService;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetProducts([FromQuery] ProductQueryDto query, CancellationToken ct) =>
        OkResponse(await _productService.GetProductsAsync(query, ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        OkResponse(await _productService.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> Create([FromForm] CreateProductRequestDto request, [FromForm] IFormFileCollection? images, CancellationToken ct) =>
        OkResponse(await _productService.CreateAsync(request, images, ct), "Product created");

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateProductRequestDto request, [FromForm] IFormFileCollection? images, CancellationToken ct) =>
        OkResponse(await _productService.UpdateAsync(id, request, images, ct), "Product updated");

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _productService.DeleteAsync(id, ct);
        return OkMessage("Product deleted");
    }
}
