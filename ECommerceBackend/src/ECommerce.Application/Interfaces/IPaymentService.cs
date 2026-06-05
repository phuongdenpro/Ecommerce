using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Payments;
using ECommerce.Shared.Models;

namespace ECommerce.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto> ProcessPaymentAsync(Guid userId, ProcessPaymentRequestDto request, CancellationToken cancellationToken = default);
    Task<PaymentDto> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<PagedResult<AdminPaymentListDto>> GetAllForAdminAsync(AdminPaymentQueryDto query, CancellationToken cancellationToken = default);
    Task<PaymentDto> UpdateStatusForAdminAsync(Guid paymentId, UpdatePaymentStatusRequestDto request, CancellationToken cancellationToken = default);
}
