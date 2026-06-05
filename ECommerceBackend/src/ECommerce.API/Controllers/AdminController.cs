using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.AdminOrStaff)]
[Route("api/admin")]
public class AdminController : ApiControllerBase
{
    private readonly IAdminDashboardService _dashboardService;

    public AdminController(IAdminDashboardService dashboardService) => _dashboardService = dashboardService;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct) =>
        OkResponse(await _dashboardService.GetSummaryAsync(ct));

    [HttpGet("dashboard/revenue")]
    public async Task<IActionResult> GetRevenue([FromQuery] string period = "day", CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetRevenueByPeriodAsync(period, ct));

    [HttpGet("dashboard/top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] int count = 10, CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetTopSellingProductsAsync(count, ct));

    [HttpGet("dashboard/recent-orders")]
    public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 10, CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetRecentOrdersAsync(count, ct));

    [HttpGet("dashboard/extended")]
    public async Task<IActionResult> GetExtended(CancellationToken ct) =>
        OkResponse(await _dashboardService.GetExtendedAsync(ct));

    [HttpGet("dashboard/low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int count = 10, [FromQuery] int threshold = 10, CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetLowStockProductsAsync(count, threshold, ct));

    [HttpGet("dashboard/recent-reviews")]
    public async Task<IActionResult> GetRecentReviews([FromQuery] int count = 10, CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetRecentReviewsAsync(count, ct));

    [HttpGet("dashboard/recent-customers")]
    public async Task<IActionResult> GetRecentCustomers([FromQuery] int count = 10, CancellationToken ct = default) =>
        OkResponse(await _dashboardService.GetRecentCustomersAsync(count, ct));
}
