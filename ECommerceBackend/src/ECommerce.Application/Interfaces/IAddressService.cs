using ECommerce.Application.DTOs.Addresses;

namespace ECommerce.Application.Interfaces;

public interface IAddressService
{
    Task<IReadOnlyList<AddressDto>> GetAddressesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AddressDto> CreateAsync(Guid userId, CreateAddressRequestDto request, CancellationToken cancellationToken = default);
    Task<AddressDto> UpdateAsync(Guid userId, Guid addressId, UpdateAddressRequestDto request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default);
    Task SetDefaultAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default);
}
