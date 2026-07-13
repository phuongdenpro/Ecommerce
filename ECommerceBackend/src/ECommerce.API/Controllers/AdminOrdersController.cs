using ECommerce.Application.DTOs.Orders;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.AdminOrStaff)]
[Route("api/admin/orders")]
public class AdminOrdersController : ApiControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService) => _orderService = orderService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdminCreateOrderRequestDto request, CancellationToken ct) =>
        OkResponse(await _orderService.CreateOrderForAdminAsync(request, ct), "Order created");

    [HttpPut("{id:guid}/payment-status")]
    public async Task<IActionResult> UpdatePaymentStatus(Guid id, [FromBody] UpdateOrderPaymentStatusRequestDto request, CancellationToken ct) =>
        OkResponse(await _orderService.UpdateOrderPaymentStatusAsync(id, request, ct), "Payment status updated");

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] OrderAdminQueryDto query, CancellationToken ct)
    {
        var fileBytes = await _orderService.ExportOrdersToCsvAsync(query, ct);
        return File(fileBytes, "text/csv", $"orders_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }
}
