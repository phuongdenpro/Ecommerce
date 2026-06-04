using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.Interfaces;
using ECommerce.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = AppRoles.Admin)]
[Route("api/admin/settings")]
public class AdminSettingsController : ApiControllerBase
{
    private readonly IStoreSettingsService _storeSettingsService;

    public AdminSettingsController(IStoreSettingsService storeSettingsService) =>
        _storeSettingsService = storeSettingsService;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        OkResponse(await _storeSettingsService.GetAsync(ct));

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateStoreSettingsRequestDto request, CancellationToken ct) =>
        OkResponse(await _storeSettingsService.UpdateAsync(request, ct), "Settings updated");
}
