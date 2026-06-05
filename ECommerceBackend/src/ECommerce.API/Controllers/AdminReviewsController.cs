using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.AdminOrStaff)]
[Route("api/admin/reviews")]
public class AdminReviewsController : ApiControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly IAdminDashboardService _dashboardService;

    public AdminReviewsController(IReviewService reviewService, IAdminDashboardService dashboardService)
    {
        _reviewService = reviewService;
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AdminReviewQueryDto query, CancellationToken ct) =>
        OkResponse(await _reviewService.GetAllForAdminAsync(query, ct));

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 10, CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetRecentReviewsAsync(count, ct));

    [HttpPut("{id:guid}/hide")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Hide(Guid id, CancellationToken ct)
    {
        await _reviewService.HideReviewAsync(id, ct);
        return OkMessage("Review hidden");
    }

    [HttpPut("{id:guid}/unhide")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Unhide(Guid id, CancellationToken ct)
    {
        await _reviewService.UnhideReviewAsync(id, ct);
        return OkMessage("Review visible");
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _reviewService.AdminDeleteAsync(id, ct);
        return OkMessage("Review deleted");
    }
}
