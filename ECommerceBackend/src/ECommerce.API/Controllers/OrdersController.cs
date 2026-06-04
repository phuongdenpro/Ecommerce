using ECommerce.Application.DTOs.Orders;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using ECommerce.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
[Route("api/orders")]
public class OrdersController : ApiControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) => _orderService = orderService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequestDto request, CancellationToken ct) =>
        OkResponse(await _orderService.CreateOrderAsync(GetUserId(), request, ct), "Order created");

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders([FromQuery] PaginationQuery query, CancellationToken ct) =>
        OkResponse(await _orderService.GetMyOrdersAsync(GetUserId(), query, ct));

    [HttpGet("my-orders/{id:guid}")]
    public async Task<IActionResult> GetMyOrder(Guid id, CancellationToken ct) =>
        OkResponse(await _orderService.GetMyOrderByIdAsync(GetUserId(), id, ct));

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _orderService.CancelOrderAsync(GetUserId(), id, ct);
        return OkMessage("Order cancelled");
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> GetAll([FromQuery] OrderAdminQueryDto query, CancellationToken ct) =>
        OkResponse(await _orderService.GetAllOrdersAsync(query, ct));

    [HttpGet("{id:guid}")]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        OkResponse(await _orderService.GetOrderByIdForAdminAsync(id, ct));

    [HttpPost("{id:guid}/admin-cancel")]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> AdminCancel(Guid id, CancellationToken ct)
    {
        await _orderService.AdminCancelOrderAsync(id, ct);
        return OkMessage("Order cancelled");
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = AppRoles.AdminOrStaff)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequestDto request, CancellationToken ct) =>
        OkResponse(await _orderService.UpdateOrderStatusAsync(id, request, ct), "Order status updated");
}
