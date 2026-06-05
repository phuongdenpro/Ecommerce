using ECommerce.Application.DTOs.Coupons;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Route("api/coupons")]
public class CouponsController : ApiControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService) => _couponService = couponService;

    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponRequest request, CancellationToken ct) =>
        OkResponse(await _couponService.ValidateAsync(request.Code, request.OrderAmount, GetUserId(), ct));

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        OkResponse(await _couponService.GetAllAsync(ct));

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Create([FromBody] CreateCouponRequestDto request, CancellationToken ct) =>
        OkResponse(await _couponService.CreateAsync(request, ct), "Coupon created");

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCouponRequestDto request, CancellationToken ct) =>
        OkResponse(await _couponService.UpdateAsync(id, request, ct), "Coupon updated");

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _couponService.DeleteAsync(id, ct);
        return OkMessage("Coupon removed or deactivated");
    }
}

public class ValidateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}
