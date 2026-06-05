namespace ECommerce.Application.DTOs.Admin;

public class DashboardSummaryDto
{
    public int TotalUsers { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class RevenueByPeriodDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalSold { get; set; }
    public decimal Revenue { get; set; }
}

public class RecentOrderDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DashboardExtendedDto
{
    public DashboardSummaryDto Summary { get; set; } = new();
    public int TotalCustomers { get; set; }
    public int TotalStaff { get; set; }
    public int TotalAdmins { get; set; }
    public int TotalCategories { get; set; }
    public int TotalBrands { get; set; }
    public int PendingOrders { get; set; }
    public int ConfirmedOrders { get; set; }
    public int ProcessingOrders { get; set; }
    public int ShippingOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public int CancelledOrders { get; set; }
    public decimal RevenueToday { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public IReadOnlyList<LabelCountDto> OrdersByStatus { get; set; } = Array.Empty<LabelCountDto>();
    public IReadOnlyList<LabelCountDto> PaymentsByMethod { get; set; } = Array.Empty<LabelCountDto>();
    public IReadOnlyList<RevenueByPeriodDto> RevenueDaily { get; set; } = Array.Empty<RevenueByPeriodDto>();
    public IReadOnlyList<RevenueByPeriodDto> RevenueMonthly { get; set; } = Array.Empty<RevenueByPeriodDto>();
    public IReadOnlyList<SignupByPeriodDto> UserSignupsMonthly { get; set; } = Array.Empty<SignupByPeriodDto>();
}

public class LabelCountDto
{
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal? Amount { get; set; }
}

public class SignupByPeriodDto
{
    public string Period { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class LowStockProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string? PrimaryImageUrl { get; set; }
}

public class AdminReviewListDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsHidden { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RecentCustomerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminUserListDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminUserDetailDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public string? AdminNotes { get; set; }
    public IReadOnlyList<AddressBriefDto> Addresses { get; set; } = Array.Empty<AddressBriefDto>();
}

public class CreateAdminUserRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "Customer";
}

public class UpdateAdminUserRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UpdateUserAdminNotesRequestDto
{
    public string? AdminNotes { get; set; }
}

public class UserAdminNotesDto
{
    public Guid UserId { get; set; }
    public string? AdminNotes { get; set; }
}

public class AddressBriefDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string? City { get; set; }
    public bool IsDefault { get; set; }
}

public class AdminUserQueryDto : ECommerce.Shared.Models.PaginationQuery
{
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
}

public class UpdateUserStatusRequestDto
{
    public bool IsActive { get; set; }
}

public class UpdateUserRoleRequestDto
{
    public string Role { get; set; } = string.Empty;
}

public class AdminReviewQueryDto : ECommerce.Shared.Models.PaginationQuery
{
    public Guid? ProductId { get; set; }
    public int? Rating { get; set; }
    public bool? IsHidden { get; set; }
}

public class AdminPaymentListDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? TransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminPaymentQueryDto : ECommerce.Shared.Models.PaginationQuery
{
    public string? Status { get; set; }
    public string? Method { get; set; }
}

public class UpdatePaymentStatusRequestDto
{
    public string Status { get; set; } = string.Empty;
}

public class ReportDateRangeQueryDto
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}

public class RevenueReportDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public IReadOnlyList<RevenueByPeriodDto> ByDay { get; set; } = Array.Empty<RevenueByPeriodDto>();
}

public class OrdersReportDto
{
    public int TotalOrders { get; set; }
    public decimal TotalAmount { get; set; }
    public IReadOnlyList<LabelCountDto> ByStatus { get; set; } = Array.Empty<LabelCountDto>();
}

public class CustomersReportDto
{
    public int NewCustomers { get; set; }
    public IReadOnlyList<SignupByPeriodDto> ByMonth { get; set; } = Array.Empty<SignupByPeriodDto>();
}

public class StoreSettingsDto
{
    public string StoreName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? SupportEmail { get; set; }
    public string? Hotline { get; set; }
    public string? Address { get; set; }
    public decimal DefaultShippingFee { get; set; }
    public decimal FreeShippingThreshold { get; set; }
    public bool EnableCod { get; set; }
    public bool EnableBankTransfer { get; set; }
    public bool EnableOnlinePayment { get; set; }
}

public class UpdateStoreSettingsRequestDto
{
    public string StoreName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? SupportEmail { get; set; }
    public string? Hotline { get; set; }
    public string? Address { get; set; }
    public decimal DefaultShippingFee { get; set; }
    public decimal FreeShippingThreshold { get; set; }
    public bool EnableCod { get; set; }
    public bool EnableBankTransfer { get; set; }
    public bool EnableOnlinePayment { get; set; }
}
