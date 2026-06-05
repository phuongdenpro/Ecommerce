using ECommerce.Application.DTOs.Addresses;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AddressService : IAddressService
{
    private readonly IApplicationDbContext _context;

    public AddressService(IApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<AddressDto>> GetAddressesAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await _context.Addresses.AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => Map(a))
            .ToListAsync(cancellationToken);

    public async Task<AddressDto> CreateAsync(Guid userId, CreateAddressRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.IsDefault)
            await ClearDefaultAsync(userId, cancellationToken);

        var address = new Address
        {
            UserId = userId,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            AddressLine = request.AddressLine.Trim(),
            Ward = request.Ward,
            District = request.District,
            City = request.City,
            IsDefault = request.IsDefault
        };
        _context.Addresses.Add(address);
        await _context.SaveChangesAsync(cancellationToken);
        return Map(address);
    }

    public async Task<AddressDto> UpdateAsync(Guid userId, Guid addressId, UpdateAddressRequestDto request, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address not found.");

        if (request.IsDefault && !address.IsDefault)
            await ClearDefaultAsync(userId, cancellationToken);

        address.FullName = request.FullName.Trim();
        address.PhoneNumber = request.PhoneNumber.Trim();
        address.AddressLine = request.AddressLine.Trim();
        address.Ward = request.Ward;
        address.District = request.District;
        address.City = request.City;
        address.IsDefault = request.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Map(address);
    }

    public async Task DeleteAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address not found.");
        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SetDefaultAsync(Guid userId, Guid addressId, CancellationToken cancellationToken = default)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address not found.");
        await ClearDefaultAsync(userId, cancellationToken);
        address.IsDefault = true;
        address.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task ClearDefaultAsync(Guid userId, CancellationToken ct)
    {
        var defaults = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefault).ToListAsync(ct);
        foreach (var a in defaults) a.IsDefault = false;
    }

    private static AddressDto Map(Address a) => new()
    {
        Id = a.Id,
        FullName = a.FullName,
        PhoneNumber = a.PhoneNumber,
        AddressLine = a.AddressLine,
        Ward = a.Ward,
        District = a.District,
        City = a.City,
        IsDefault = a.IsDefault
    };
}
