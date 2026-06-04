using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.AdminOrStaff)]
[Route("api/admin/reports")]
public class AdminReportsController : ApiControllerBase
{
    private readonly IAdminReportService _reportService;

    public AdminReportsController(IAdminReportService reportService) => _reportService = reportService;

    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue([FromQuery] ReportDateRangeQueryDto query, CancellationToken ct) =>
        OkResponse(await _reportService.GetRevenueReportAsync(query, ct));

    [HttpGet("orders")]
    public async Task<IActionResult> Orders([FromQuery] ReportDateRangeQueryDto query, CancellationToken ct) =>
        OkResponse(await _reportService.GetOrdersReportAsync(query, ct));

    [HttpGet("customers")]
    public async Task<IActionResult> Customers([FromQuery] ReportDateRangeQueryDto query, CancellationToken ct) =>
        OkResponse(await _reportService.GetCustomersReportAsync(query, ct));

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] string type, [FromQuery] string format = "csv", [FromQuery] ReportDateRangeQueryDto? query = null, CancellationToken ct = default)
    {
        if (!format.Equals("csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(ApiResponse.Fail("Only csv format is supported."));

        var (content, fileName) = await _reportService.ExportCsvAsync(type, query ?? new ReportDateRangeQueryDto(), ct);
        return File(content, "text/csv", fileName);
    }
}
