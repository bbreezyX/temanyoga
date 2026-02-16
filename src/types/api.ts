import type { OrderStatus, PaymentProofStatus } from "@/generated/prisma/enums";

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

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  stock: number | null;
  image: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: number;
  productNameSnapshot: string;
}

export interface CreateOrderResponse {
  orderCode: string;
  totalAmount: number;
  shippingCost: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface OrderStatusResponse {
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
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
