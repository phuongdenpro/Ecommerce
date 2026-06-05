using ECommerce.Domain.Enums;
using ECommerce.Shared.Models;

namespace ECommerce.Application.DTOs.Orders;

public class CreateOrderRequestDto
{
    public Guid? AddressId { get; set; }
    public string? ShippingAddress { get; set; }
    public string? Note { get; set; }
    public string? CouponCode { get; set; }
    public decimal ShippingFee { get; set; }
}

public class UpdateOrderStatusRequestDto
{
    public OrderStatus Status { get; set; }
}

public class UpdateOrderPaymentStatusRequestDto
{
    public PaymentStatus PaymentStatus { get; set; }
}

public class AdminCreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class AdminCreateOrderRequestDto
{
    public Guid CustomerId { get; set; }
    public Guid? AddressId { get; set; }
    public string? ShippingAddress { get; set; }
    public IReadOnlyList<AdminCreateOrderItemDto> Items { get; set; } = Array.Empty<AdminCreateOrderItemDto>();
    public string? CouponCode { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public decimal ShippingFee { get; set; }
    public string? Note { get; set; }
}

public class OrderAdminQueryDto : PaginationQuery
{
    public OrderStatus? Status { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public Guid? UserId { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
}

public class OrderListDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CustomerName { get; set; }
}

public class OrderDetailDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? CouponCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<OrderItemDto> Items { get; set; } = Array.Empty<OrderItemDto>();
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal { get; set; }
}
