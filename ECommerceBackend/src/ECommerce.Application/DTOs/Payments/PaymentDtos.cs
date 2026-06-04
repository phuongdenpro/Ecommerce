using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs.Payments;

public class ProcessPaymentRequestDto
{
    public Guid OrderId { get; set; }
    public PaymentMethod Method { get; set; }
}

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? TransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
}
