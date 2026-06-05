namespace ECommerce.Domain.Enums;

/// <summary>
/// Payment methods. Designed for future gateway integration (VNPay, Momo, Stripe).
/// </summary>
public enum PaymentMethod
{
    Cod = 0,
    BankTransfer = 1,
    OnlinePayment = 2
}
