using ECommerce.Application.DTOs.Users;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
[Route("api/users")]
public class UsersController : ApiControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken ct) =>
        OkResponse(await _userService.GetProfileAsync(GetUserId(), ct));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request, CancellationToken ct) =>
        OkResponse(await _userService.UpdateProfileAsync(GetUserId(), request, ct), "Profile updated");
}
