using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.AdminOrStaff)]
[Route("api/admin/payments")]
public class AdminPaymentsController : ApiControllerBase
{
    private readonly IPaymentService _paymentService;

    public AdminPaymentsController(IPaymentService paymentService) => _paymentService = paymentService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AdminPaymentQueryDto query, CancellationToken ct) =>
        OkResponse(await _paymentService.GetAllForAdminAsync(query, ct));

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdatePaymentStatusRequestDto request, CancellationToken ct) =>
        OkResponse(await _paymentService.UpdateStatusForAdminAsync(id, request, ct), "Payment status updated");
}
