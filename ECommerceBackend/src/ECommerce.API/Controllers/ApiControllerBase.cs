using ECommerce.Shared.Models;
using ECommerce.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult OkResponse<T>(T data, string message = "Success") =>
        Ok(ApiResponse<T>.Ok(data, message));

    protected IActionResult OkMessage(string message = "Success", object? data = null) =>
        Ok(ApiResponse.Ok(message, data));

    protected Guid GetUserId() =>
        Guid.Parse(User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedException("User is not authenticated."));
}
