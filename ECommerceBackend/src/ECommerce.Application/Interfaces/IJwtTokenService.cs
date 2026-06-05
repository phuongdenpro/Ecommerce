using System.Security.Claims;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public class TokenResult
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
}

public interface IJwtTokenService
{
    TokenResult GenerateTokens(User user);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string accessToken);
}
