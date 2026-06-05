using ECommerce.Application.DTOs.Payments;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
[Route("api/payments")]
public class PaymentsController : ApiControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService) => _paymentService = paymentService;

    [HttpPost("process")]
    public async Task<IActionResult> Process([FromBody] ProcessPaymentRequestDto request, CancellationToken ct) =>
        OkResponse(await _paymentService.ProcessPaymentAsync(GetUserId(), request, ct), "Payment processed");

    [HttpGet("order/{orderId:guid}")]
    public async Task<IActionResult> GetByOrder(Guid orderId, CancellationToken ct) =>
        OkResponse(await _paymentService.GetByOrderIdAsync(orderId, ct));
}
