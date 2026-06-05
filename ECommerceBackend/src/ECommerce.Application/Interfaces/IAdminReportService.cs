using ECommerce.Application.DTOs.Admin;

namespace ECommerce.Application.Interfaces;

public interface IAdminReportService
{
    Task<RevenueReportDto> GetRevenueReportAsync(ReportDateRangeQueryDto query, CancellationToken cancellationToken = default);
    Task<OrdersReportDto> GetOrdersReportAsync(ReportDateRangeQueryDto query, CancellationToken cancellationToken = default);
    Task<CustomersReportDto> GetCustomersReportAsync(ReportDateRangeQueryDto query, CancellationToken cancellationToken = default);
    Task<(byte[] Content, string FileName)> ExportCsvAsync(string type, ReportDateRangeQueryDto query, CancellationToken cancellationToken = default);
}
