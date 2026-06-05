import type { DashboardSummary, RevenueByPeriod } from "./index";

export interface LabelCount {
  label: string;
  count: number;
  amount?: number;
}

export interface SignupByPeriod {
  period: string;
  count: number;
}

export interface DashboardExtended {
  summary: DashboardSummary;
  totalCustomers: number;
  totalStaff: number;
  totalAdmins: number;
  totalCategories: number;
  totalBrands: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueToday: number;
  revenueThisMonth: number;
  ordersByStatus: LabelCount[];
  paymentsByMethod: LabelCount[];
  revenueDaily: RevenueByPeriod[];
  revenueMonthly: RevenueByPeriod[];
  userSignupsMonthly: SignupByPeriod[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  primaryImageUrl?: string;
}

export interface AdminReviewListItem {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  rating: number;
  comment?: string;
  isHidden: boolean;
  createdAt: string;
}

export interface RecentCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface AddressBrief {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city?: string;
  isDefault: boolean;
}

export interface AdminUserDetail {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  adminNotes?: string;
  addresses: AddressBrief[];
}

export interface CreateAdminUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl?: string;
  supportEmail?: string;
  hotline?: string;
  address?: string;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  enableCod: boolean;
  enableBankTransfer: boolean;
  enableOnlinePayment: boolean;
}

export type UpdateStoreSettings = StoreSettings;

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  byDay: { period: string; revenue: number; orderCount: number }[];
}

export interface OrdersReport {
  totalOrders: number;
  totalAmount: number;
  byStatus: LabelCount[];
}

export interface CustomersReport {
  newCustomers: number;
  byMonth: SignupByPeriod[];
}

export interface AdminPaymentListItem {
  id: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  method: string;
  status: string;
  amount: number;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}
