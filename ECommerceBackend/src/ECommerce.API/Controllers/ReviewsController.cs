using ECommerce.Application.DTOs.Reviews;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/reviews")]
public class ReviewsController : ApiControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService) => _reviewService = reviewService;

    [HttpGet("product/{productId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByProduct(Guid productId, [FromQuery] PaginationQuery query, CancellationToken ct) =>
        OkResponse(await _reviewService.GetByProductIdAsync(productId, query, ct));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequestDto request, CancellationToken ct) =>
        OkResponse(await _reviewService.CreateAsync(GetUserId(), request, ct), "Review created");

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewRequestDto request, CancellationToken ct) =>
        OkResponse(await _reviewService.UpdateAsync(GetUserId(), id, request, ct), "Review updated");

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _reviewService.DeleteAsync(GetUserId(), id, ct);
        return OkMessage("Review deleted");
    }

    [HttpPut("{id:guid}/hide")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Hide(Guid id, CancellationToken ct)
    {
        await _reviewService.HideReviewAsync(id, ct);
        return OkMessage("Review hidden");
    }
}
