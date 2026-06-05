using ECommerce.Application.DTOs.Coupons;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class CouponService : ICouponService
{
    private readonly IApplicationDbContext _context;

    public CouponService(IApplicationDbContext context) => _context = context;

    public async Task<CouponDto> CreateAsync(CreateCouponRequestDto request, CancellationToken cancellationToken = default)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await _context.Coupons.AnyAsync(c => c.Code == code, cancellationToken))
            throw new ConflictException("Coupon code already exists.");

        var coupon = new Coupon
        {
            Code = code,
            Description = request.Description,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinOrderAmount = request.MinOrderAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            UsageLimit = request.UsageLimit,
            IsActive = true
        };
        _context.Coupons.Add(coupon);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The coupon was modified or deleted by another process. Please reload and try again.");
        }
        return Map(coupon);
    }

    public async Task<CouponValidationDto> ValidateAsync(string code, decimal orderAmount, Guid userId, CancellationToken cancellationToken = default)
    {
        var coupon = await _context.Coupons.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == code.Trim().ToUpperInvariant(), cancellationToken);

        if (coupon is null)
            return Invalid("Coupon not found.");

        if (!coupon.IsActive)
            return Invalid("Coupon is inactive.");

        var now = DateTime.UtcNow;
        if (now < coupon.StartDate || now > coupon.EndDate)
            return Invalid("Coupon is expired or not yet active.");

        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit)
            return Invalid("Coupon usage limit reached.");

        if (coupon.MinOrderAmount.HasValue && orderAmount < coupon.MinOrderAmount)
            return Invalid($"Minimum order amount is {coupon.MinOrderAmount}.");

        var discount = CalculateDiscount(coupon, orderAmount);
        return new CouponValidationDto
        {
            IsValid = true,
            Message = "Coupon is valid.",
            DiscountAmount = discount,
            CouponId = coupon.Id,
            Code = coupon.Code
        };
    }

    public async Task<IReadOnlyList<CouponDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Coupons.AsNoTracking().OrderByDescending(c => c.CreatedAt)
            .Select(c => Map(c)).ToListAsync(cancellationToken);

    public async Task<CouponDto> UpdateAsync(Guid id, UpdateCouponRequestDto request, CancellationToken cancellationToken = default)
    {
        var coupon = await _context.Coupons.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("Coupon not found.");

        coupon.Description = request.Description;
        coupon.DiscountType = request.DiscountType;
        coupon.DiscountValue = request.DiscountValue;
        coupon.MinOrderAmount = request.MinOrderAmount;
        coupon.MaxDiscountAmount = request.MaxDiscountAmount;
        coupon.StartDate = request.StartDate.ToUniversalTime();
        coupon.EndDate = request.EndDate.ToUniversalTime();
        coupon.UsageLimit = request.UsageLimit;
        coupon.IsActive = request.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Map(coupon);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var coupon = await _context.Coupons.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("Coupon not found.");

        var hasUsages = await _context.CouponUsages.AnyAsync(u => u.CouponId == id, cancellationToken);
        if (hasUsages)
        {
            coupon.IsActive = false;
            coupon.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return;
        }

        _context.Coupons.Remove(coupon);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The coupon was modified or deleted by another process. Please reload and try again.");
        }
    }

    public static decimal CalculateDiscount(Coupon coupon, decimal orderAmount)
    {
        decimal discount = coupon.DiscountType switch
        {
            CouponDiscountType.Percentage => orderAmount * coupon.DiscountValue / 100m,
            CouponDiscountType.FixedAmount => coupon.DiscountValue,
            _ => 0
        };

        if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount)
            discount = coupon.MaxDiscountAmount.Value;

        return discount > orderAmount ? orderAmount : discount;
    }

    private static CouponValidationDto Invalid(string message) =>
        new() { IsValid = false, Message = message };

    private static CouponDto Map(Coupon c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        Description = c.Description,
        DiscountType = c.DiscountType.ToString(),
        DiscountValue = c.DiscountValue,
        StartDate = c.StartDate,
        EndDate = c.EndDate,
        UsageLimit = c.UsageLimit,
        UsedCount = c.UsedCount,
        IsActive = c.IsActive
    };
}
