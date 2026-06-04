using ECommerce.Application.DTOs.Orders;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequestDto>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x).Must(x => x.AddressId.HasValue || !string.IsNullOrWhiteSpace(x.ShippingAddress))
            .WithMessage("Shipping address or addressId is required.");
        RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0);
    }
}
