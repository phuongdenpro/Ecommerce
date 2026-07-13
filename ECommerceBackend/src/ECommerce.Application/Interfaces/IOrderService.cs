using ECommerce.Application.DTOs.Orders;
using ECommerce.Shared.Models;

namespace ECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDetailDto> CreateOrderAsync(Guid userId, CreateOrderRequestDto request, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderListDto>> GetMyOrdersAsync(Guid userId, PaginationQuery query, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> GetMyOrderByIdAsync(Guid userId, Guid orderId, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderListDto>> GetAllOrdersAsync(OrderAdminQueryDto query, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequestDto request, CancellationToken cancellationToken = default);
    Task CancelOrderAsync(Guid userId, Guid orderId, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> GetOrderByIdForAdminAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task AdminCancelOrderAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> CreateOrderForAdminAsync(AdminCreateOrderRequestDto request, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> UpdateOrderPaymentStatusAsync(Guid orderId, UpdateOrderPaymentStatusRequestDto request, CancellationToken cancellationToken = default);
    Task<byte[]> ExportOrdersToCsvAsync(OrderAdminQueryDto query, CancellationToken cancellationToken = default);
}
