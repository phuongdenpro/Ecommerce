export type UserRole = "Admin" | "Staff" | "Customer";

export interface UserBrief {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserBrief;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  categoryName: string;
  brandName: string;
  status: string;
  isFeatured: boolean;
  primaryImageUrl?: string;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductDetail extends ProductListItem {
  description?: string;
  categoryId: string;
  brandId: string;
  images: ProductImage[];
  averageRating?: number;
  reviewCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  status: string;
  children: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  logoUrl?: string;
  status: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
  subTotal: number;
  isInStock: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subTotal: number;
  totalItems: number;
}

export interface OrderListItem {
  id: string;
  orderCode: string;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
  customerName?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
}

export interface OrderDetail {
  id: string;
  orderCode: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: string;
  note?: string;
  couponCode?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment?: string;
  isHidden: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  price: number;
  discountPrice?: number;
  primaryImageUrl?: string;
  addedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface CouponValidation {
  isValid: boolean;
  message: string;
  discountAmount: number;
  couponId?: string;
  code?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

export interface DashboardSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderCode: string;
  customerName: string;
  finalAmount: number;
  status: string;
  createdAt: string;
}
