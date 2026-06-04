using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
[Route("api/wishlist")]
public class WishlistController : ApiControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService) => _wishlistService = wishlistService;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        OkResponse(await _wishlistService.GetWishlistAsync(GetUserId(), ct));

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId, CancellationToken ct)
    {
        await _wishlistService.AddAsync(GetUserId(), productId, ct);
        return OkMessage("Added to wishlist");
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId, CancellationToken ct)
    {
        await _wishlistService.RemoveAsync(GetUserId(), productId, ct);
        return OkMessage("Removed from wishlist");
    }
}
