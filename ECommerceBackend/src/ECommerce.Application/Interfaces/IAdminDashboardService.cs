using ECommerce.Application.DTOs.Admin;

namespace ECommerce.Application.Interfaces;

public interface IAdminDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RevenueByPeriodDto>> GetRevenueByPeriodAsync(string period, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TopProductDto>> GetTopSellingProductsAsync(int count = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecentOrderDto>> GetRecentOrdersAsync(int count = 10, CancellationToken cancellationToken = default);
    Task<DashboardExtendedDto> GetExtendedAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LowStockProductDto>> GetLowStockProductsAsync(int count = 10, int threshold = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminReviewListDto>> GetRecentReviewsAsync(int count = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecentCustomerDto>> GetRecentCustomersAsync(int count = 10, CancellationToken cancellationToken = default);
}
