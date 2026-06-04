using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Coupons;
using ECommerce.Application.DTOs.Orders;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class CreateAdminUserRequestValidator : AbstractValidator<CreateAdminUserRequestDto>
{
    public CreateAdminUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty();
    }
}

public class UpdateAdminUserRequestValidator : AbstractValidator<UpdateAdminUserRequestDto>
{
    public UpdateAdminUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
    }
}

public class AdminCreateOrderRequestValidator : AbstractValidator<AdminCreateOrderRequestDto>
{
    public AdminCreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
        RuleFor(x => x).Must(x => x.AddressId.HasValue || !string.IsNullOrWhiteSpace(x.ShippingAddress))
            .WithMessage("Shipping address or addressId is required.");
        RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0);
    }
}

public class UpdateOrderPaymentStatusRequestValidator : AbstractValidator<UpdateOrderPaymentStatusRequestDto>
{
    public UpdateOrderPaymentStatusRequestValidator()
    {
        RuleFor(x => x.PaymentStatus).IsInEnum();
    }
}

public class UpdatePaymentStatusRequestValidator : AbstractValidator<UpdatePaymentStatusRequestDto>
{
    public UpdatePaymentStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty();
    }
}

public class UpdateStoreSettingsRequestValidator : AbstractValidator<UpdateStoreSettingsRequestDto>
{
    public UpdateStoreSettingsRequestValidator()
    {
        RuleFor(x => x.StoreName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DefaultShippingFee).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FreeShippingThreshold).GreaterThanOrEqualTo(0);
    }
}

public class UpdateCouponRequestValidator : AbstractValidator<UpdateCouponRequestDto>
{
    public UpdateCouponRequestValidator()
    {
        RuleFor(x => x.DiscountValue).GreaterThan(0);
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate);
    }
}
