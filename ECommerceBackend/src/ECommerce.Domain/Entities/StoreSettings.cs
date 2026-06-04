using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

/// <summary>
/// Singleton store configuration (single row, Id = 00000000-0000-0000-0000-000000000001).
/// </summary>
public class StoreSettings : BaseEntity
{
    public string StoreName { get; set; } = "ShopVN";
    public string? LogoUrl { get; set; }
    public string? SupportEmail { get; set; }
    public string? Hotline { get; set; }
    public string? Address { get; set; }
    public decimal DefaultShippingFee { get; set; } = 30000;
    public decimal FreeShippingThreshold { get; set; } = 500000;
    public bool EnableCod { get; set; } = true;
    public bool EnableBankTransfer { get; set; } = true;
    public bool EnableOnlinePayment { get; set; } = true;
}
