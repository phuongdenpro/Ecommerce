using System.Globalization;
using System.Text;
using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AdminReportService : IAdminReportService
{
    private readonly IApplicationDbContext _context;

    public AdminReportService(IApplicationDbContext context) => _context = context;

    public async Task<RevenueReportDto> GetRevenueReportAsync(ReportDateRangeQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = NormalizeRange(query);
        var orders = await _context.Orders.AsNoTracking()
            .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Status != OrderStatus.Cancelled)
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
            .ToListAsync(cancellationToken);

        return new RevenueReportDto
        {
            TotalRevenue = orders.Sum(o => o.FinalAmount),
            TotalOrders = orders.Count,
            ByDay = orders
                .GroupBy(o => o.CreatedAt.ToString("yyyy-MM-dd"))
                .OrderBy(g => g.Key)
                .Select(g => new RevenueByPeriodDto
                {
                    Period = g.Key,
                    Revenue = g.Sum(x => x.FinalAmount),
                    OrderCount = g.Count()
                })
                .ToList()
        };
    }

    public async Task<OrdersReportDto> GetOrdersReportAsync(ReportDateRangeQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = NormalizeRange(query);
        var orders = await _context.Orders.AsNoTracking()
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
            .ToListAsync(cancellationToken);

        return new OrdersReportDto
        {
            TotalOrders = orders.Count,
            TotalAmount = orders.Sum(o => o.FinalAmount),
            ByStatus = orders
                .GroupBy(o => o.Status)
                .Select(g => new LabelCountDto
                {
                    Label = g.Key.ToString(),
                    Count = g.Count(),
                    Amount = g.Sum(x => x.FinalAmount)
                })
                .OrderBy(x => x.Label)
                .ToList()
        };
    }

    public async Task<CustomersReportDto> GetCustomersReportAsync(ReportDateRangeQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = NormalizeRange(query);
        var customers = await _context.Users.AsNoTracking()
            .Where(u => u.Role == UserRole.Customer && u.CreatedAt >= from && u.CreatedAt <= to)
            .ToListAsync(cancellationToken);

        return new CustomersReportDto
        {
            NewCustomers = customers.Count,
            ByMonth = customers
                .GroupBy(u => u.CreatedAt.ToString("yyyy-MM"))
                .OrderBy(g => g.Key)
                .Select(g => new SignupByPeriodDto { Period = g.Key, Count = g.Count() })
                .ToList()
        };
    }

    public async Task<(byte[] Content, string FileName)> ExportCsvAsync(string type, ReportDateRangeQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = NormalizeRange(query);
        var sb = new StringBuilder();

        switch (type.ToLowerInvariant())
        {
            case "revenue":
                var revenue = await GetRevenueReportAsync(query, cancellationToken);
                sb.AppendLine("Period,Revenue,OrderCount");
                foreach (var row in revenue.ByDay)
                    sb.AppendLine($"{row.Period},{row.Revenue.ToString(CultureInfo.InvariantCulture)},{row.OrderCount}");
                return (Encoding.UTF8.GetBytes(sb.ToString()), $"revenue-{from:yyyyMMdd}-{to:yyyyMMdd}.csv");

            case "orders":
                var orders = await _context.Orders.AsNoTracking()
                    .Include(o => o.User)
                    .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync(cancellationToken);
                sb.AppendLine("OrderCode,Customer,Status,PaymentStatus,FinalAmount,CreatedAt");
                foreach (var o in orders)
                    sb.AppendLine($"{o.OrderCode},{Escape(o.User.FullName)},{o.Status},{o.PaymentStatus},{o.FinalAmount.ToString(CultureInfo.InvariantCulture)},{o.CreatedAt:O}");
                return (Encoding.UTF8.GetBytes(sb.ToString()), $"orders-{from:yyyyMMdd}-{to:yyyyMMdd}.csv");

            case "customers":
                var users = await _context.Users.AsNoTracking()
                    .Where(u => u.Role == UserRole.Customer && u.CreatedAt >= from && u.CreatedAt <= to)
                    .OrderByDescending(u => u.CreatedAt)
                    .ToListAsync(cancellationToken);
                sb.AppendLine("FullName,Email,Phone,IsActive,CreatedAt");
                foreach (var u in users)
                    sb.AppendLine($"{Escape(u.FullName)},{u.Email},{Escape(u.PhoneNumber)},{u.IsActive},{u.CreatedAt:O}");
                return (Encoding.UTF8.GetBytes(sb.ToString()), $"customers-{from:yyyyMMdd}-{to:yyyyMMdd}.csv");

            default:
                throw new BadRequestException("Export type must be revenue, orders, or customers.");
        }
    }

    private static (DateTime From, DateTime To) NormalizeRange(ReportDateRangeQueryDto query)
    {
        var to = query.To?.ToUniversalTime() ?? DateTime.UtcNow;
        var from = query.From?.ToUniversalTime() ?? to.AddDays(-30);
        if (from > to)
            throw new BadRequestException("'from' must be before 'to'.");
        return (from, to);
    }

    private static string Escape(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        return value.Contains(',') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
    }
}
