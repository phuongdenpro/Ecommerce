using ECommerce.Application.DTOs.Cart;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
[Route("api/cart")]
public class CartController : ApiControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService) => _cartService = cartService;

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken ct) =>
        OkResponse(await _cartService.GetCartAsync(GetUserId(), ct));

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequestDto request, CancellationToken ct) =>
        OkResponse(await _cartService.AddItemAsync(GetUserId(), request, ct), "Item added to cart");

    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemRequestDto request, CancellationToken ct) =>
        OkResponse(await _cartService.UpdateItemAsync(GetUserId(), itemId, request, ct), "Cart updated");

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId, CancellationToken ct)
    {
        var cart = await _cartService.RemoveItemAsync(GetUserId(), itemId, ct);
        return OkResponse(cart, "Item removed");
    }
}
