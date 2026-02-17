import type { OrderStatus, PaymentProofStatus, DiscountType } from "@prisma/client";

export interface ShippingZone {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

export interface AdminShippingZone extends ShippingZone {
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  key: string;
  order: number;
  createdAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}

export interface AdminProductListItem extends ProductListItem {
  _count: { orderItems: number };
}

export interface ProductDetail extends ProductListItem {}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  products: ProductListItem[];
  pagination: Pagination;
}

export interface AdminProductListResponse {
  products: AdminProductListItem[];
  pagination: Pagination;
}

export interface AccessoryItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  groupName: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface AdminAccessory extends AccessoryItem {
  imageKey: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartAccessory {
  id: string;
  name: string;
  price: number;
  groupName: string | null;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  stock: number | null;
  image: string | null;
  accessories: CartAccessory[];
}

export interface AccessorySnapshot {
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: number;
  productNameSnapshot: string;
  accessoriesSnapshot: string | null;
  accessoriesTotal: number;
}

export interface CouponValidationResult {
  code: string;
  discountType: DiscountType;
  discountValue: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
}

export interface CreateOrderResponse {
  orderCode: string;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode: string | null;
  status: OrderStatus;
  items: OrderItem[];
}

export interface OrderStatusResponse {
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode: string | null;
  customerName: string;
  shippingAddress: string;
  trackingNumber: string | null;
  courier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProofResponse {
  id: string;
  imageUrl: string;
  status: PaymentProofStatus;
}

export interface AdminOrderListItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode: string | null;
  shippingZoneSnapshot: string | null;
  notes: string | null;
  trackingNumber: string | null;
  courier: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { items: number; paymentProofs: number };
}

export interface AdminOrderListResponse {
  orders: AdminOrderListItem[];
  pagination: Pagination;
  orderStats: {
    totalOrders: number;
    pendingPayment: number;
    processing: number;
    completed: number;
  };
}

export interface AdminOrderDetailItem extends OrderItem {
  product: { slug: string; isActive: boolean };
}

export interface AdminPaymentProof {
  id: string;
  orderId: string;
  imageUrl: string;
  imageKey: string;
  status: PaymentProofStatus;
  notes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  couponCode: string | null;
  shippingZoneSnapshot: string | null;
  notes: string | null;
  trackingNumber: string | null;
  courier: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderDetailItem[];
  paymentProofs: AdminPaymentProof[];
}
export interface AdminDashboardStats {
  todayOrders: number;
  pendingPayments: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: AdminOrderListItem[];
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
}

export interface ReviewListResponse {
  reviews: ReviewItem[];
  averageRating: number;
  totalReviews: number;
}

export interface ReviewableItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  hasReview: boolean;
}

export interface VerifyOrderResponse {
  orderCode: string;
  customerName: string;
  items: ReviewableItem[];
}
