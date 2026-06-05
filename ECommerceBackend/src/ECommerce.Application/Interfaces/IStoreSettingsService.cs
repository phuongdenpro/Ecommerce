using ECommerce.Application.DTOs.Admin;

namespace ECommerce.Application.Interfaces;

public interface IStoreSettingsService
{
    Task<StoreSettingsDto> GetAsync(CancellationToken cancellationToken = default);
    Task<StoreSettingsDto> UpdateAsync(UpdateStoreSettingsRequestDto request, CancellationToken cancellationToken = default);
}
