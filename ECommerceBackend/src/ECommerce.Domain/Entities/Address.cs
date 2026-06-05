using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Address : BaseEntity
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string? Ward { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public bool IsDefault { get; set; }

    public User User { get; set; } = null!;
}
