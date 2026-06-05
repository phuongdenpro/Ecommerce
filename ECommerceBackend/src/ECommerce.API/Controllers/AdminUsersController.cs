using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Addresses;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.AdminOrStaff)]
[Route("api/admin/users")]
public class AdminUsersController : ApiControllerBase
{
    private readonly IAdminUserService _adminUserService;
    private readonly ECommerce.Application.Interfaces.IAddressService _addressService;

    public AdminUsersController(IAdminUserService adminUserService, ECommerce.Application.Interfaces.IAddressService addressService)
    {
        _adminUserService = adminUserService;
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] AdminUserQueryDto query, CancellationToken ct) =>
        OkResponse(await _adminUserService.GetUsersAsync(query, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id, CancellationToken ct) =>
        OkResponse(await _adminUserService.GetUserByIdAsync(id, ct));

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] UpdateUserStatusRequestDto request, CancellationToken ct)
    {
        await _adminUserService.SetUserActiveAsync(id, request.IsActive, ct);
        return OkMessage("User status updated");
    }

    [HttpPut("{id:guid}/role")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> SetRole(Guid id, [FromBody] UpdateUserRoleRequestDto request, CancellationToken ct)
    {
        await _adminUserService.SetUserRoleAsync(id, request.Role, ct);
        return OkMessage("User role updated");
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdminUserRequestDto request, CancellationToken ct) =>
        OkResponse(await _adminUserService.CreateUserAsync(request, ct), "User created");

    [HttpPost("{id:guid}/addresses")]
    public async Task<IActionResult> CreateAddressForUser(Guid id, [FromBody] ECommerce.Application.DTOs.Addresses.CreateAddressRequestDto request, CancellationToken ct) =>
        OkResponse(await _addressService.CreateAsync(id, request, ct), "Address created");

    [HttpPut("{id:guid}/addresses/{addressId:guid}/default")]
    public async Task<IActionResult> SetDefaultAddressForUser(Guid id, Guid addressId, CancellationToken ct)
    {
        await _addressService.SetDefaultAsync(id, addressId, ct);
        return OkMessage("Default address updated");
    }

    [HttpPut("{id:guid}/addresses/{addressId:guid}")]
    public async Task<IActionResult> UpdateAddressForUser(Guid id, Guid addressId, [FromBody] UpdateAddressRequestDto request, CancellationToken ct) =>
        OkResponse(await _addressService.UpdateAsync(id, addressId, request, ct), "Address updated");

    [HttpDelete("{id:guid}/addresses/{addressId:guid}")]
    public async Task<IActionResult> DeleteAddressForUser(Guid id, Guid addressId, CancellationToken ct)
    {
        await _addressService.DeleteAsync(id, addressId, ct);
        return OkMessage("Address deleted");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAdminUserRequestDto request, CancellationToken ct) =>
        OkResponse(await _adminUserService.UpdateUserAsync(id, request, ct), "User updated");

    [HttpGet("{id:guid}/wishlist")]
    public async Task<IActionResult> GetWishlist(Guid id, CancellationToken ct) =>
        OkResponse(await _adminUserService.GetUserWishlistAsync(id, ct));

    [HttpGet("{id:guid}/notes")]
    public async Task<IActionResult> GetNotes(Guid id, CancellationToken ct) =>
        OkResponse(await _adminUserService.GetUserNotesAsync(id, ct));

    [HttpPut("{id:guid}/notes")]
    public async Task<IActionResult> SetNotes(Guid id, [FromBody] UpdateUserAdminNotesRequestDto request, CancellationToken ct) =>
        OkResponse(await _adminUserService.SetUserNotesAsync(id, request, ct), "Notes updated");

    [HttpGet("{id:guid}/reviews")]
    public async Task<IActionResult> GetReviews(Guid id, [FromQuery] ECommerce.Shared.Models.PaginationQuery query, CancellationToken ct) =>
        OkResponse(await _adminUserService.GetUserReviewsAsync(id, query, ct));
}
