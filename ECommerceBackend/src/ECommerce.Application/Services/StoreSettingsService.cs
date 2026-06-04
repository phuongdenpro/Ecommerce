using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class StoreSettingsService : IStoreSettingsService
{
    public static readonly Guid SingletonId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private readonly IApplicationDbContext _context;

    public StoreSettingsService(IApplicationDbContext context) => _context = context;

    public async Task<StoreSettingsDto> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await EnsureSettingsAsync(cancellationToken);
        return Map(settings);
    }

    public async Task<StoreSettingsDto> UpdateAsync(UpdateStoreSettingsRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.StoreName))
            throw new BadRequestException("Store name is required.");

        var settings = await EnsureSettingsAsync(cancellationToken);
        settings.StoreName = request.StoreName.Trim();
        settings.LogoUrl = request.LogoUrl?.Trim();
        settings.SupportEmail = request.SupportEmail?.Trim();
        settings.Hotline = request.Hotline?.Trim();
        settings.Address = request.Address?.Trim();
        settings.DefaultShippingFee = request.DefaultShippingFee;
        settings.FreeShippingThreshold = request.FreeShippingThreshold;
        settings.EnableCod = request.EnableCod;
        settings.EnableBankTransfer = request.EnableBankTransfer;
        settings.EnableOnlinePayment = request.EnableOnlinePayment;
        settings.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Map(settings);
    }

    private async Task<StoreSettings> EnsureSettingsAsync(CancellationToken cancellationToken)
    {
        var settings = await _context.StoreSettings.FirstOrDefaultAsync(s => s.Id == SingletonId, cancellationToken);
        if (settings is not null)
            return settings;

        settings = new StoreSettings { Id = SingletonId };
        _context.StoreSettings.Add(settings);
        await _context.SaveChangesAsync(cancellationToken);
        return settings;
    }

    private static StoreSettingsDto Map(StoreSettings s) => new()
    {
        StoreName = s.StoreName,
        LogoUrl = s.LogoUrl,
        SupportEmail = s.SupportEmail,
        Hotline = s.Hotline,
        Address = s.Address,
        DefaultShippingFee = s.DefaultShippingFee,
        FreeShippingThreshold = s.FreeShippingThreshold,
        EnableCod = s.EnableCod,
        EnableBankTransfer = s.EnableBankTransfer,
        EnableOnlinePayment = s.EnableOnlinePayment
    };
}
