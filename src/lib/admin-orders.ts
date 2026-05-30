import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import type { AdminOrderListItem, AdminOrderListResponse } from "@/types/api";

export const ADMIN_ORDERS_PER_PAGE = 20;

export type AdminOrderCatalogParams = {
  page: number;
  limit: number;
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

export function parseAdminOrderCatalogParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdminOrderCatalogParams {
  const pageValue = Number(
    typeof searchParams.page === "string" ? searchParams.page : "1",
  );
  const limitValue = Number(
    typeof searchParams.limit === "string" ? searchParams.limit : ADMIN_ORDERS_PER_PAGE,
  );

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    limit: Number.isFinite(limitValue)
      ? Math.min(50, Math.max(1, limitValue))
      : ADMIN_ORDERS_PER_PAGE,
    search:
      typeof searchParams.search === "string" ? searchParams.search.trim() : "",
    status:
      typeof searchParams.status === "string" ? searchParams.status : "all",
    dateFrom:
      typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : "",
    dateTo: typeof searchParams.dateTo === "string" ? searchParams.dateTo : "",
  };
}

function buildAdminOrderWhere(
  params: Pick<
    AdminOrderCatalogParams,
    "search" | "status" | "dateFrom" | "dateTo"
  >,
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (
    params.status !== "all" &&
    Object.values(OrderStatus).includes(params.status as OrderStatus)
  ) {
    where.status = params.status as OrderStatus;
  }

  if (params.search) {
    where.OR = [
      { orderCode: { contains: params.search, mode: "insensitive" } },
      { customerName: { contains: params.search, mode: "insensitive" } },
      { customerEmail: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) {
      where.createdAt.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      where.createdAt.lte = new Date(params.dateTo);
    }
  }

  return where;
}

const adminOrderListSelect = {
  id: true,
  orderCode: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  shippingAddress: true,
  status: true,
  totalAmount: true,
  shippingCost: true,
  discountAmount: true,
  couponCode: true,
  shippingZoneSnapshot: true,
  notes: true,
  trackingNumber: true,
  courier: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { items: true, paymentProofs: true } },
} satisfies Prisma.OrderSelect;

type AdminOrderListRow = Prisma.OrderGetPayload<{
  select: typeof adminOrderListSelect;
}>;

function serializeAdminOrder(order: AdminOrderListRow): AdminOrderListItem {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function getAdminOrderList(
  params: AdminOrderCatalogParams,
): Promise<AdminOrderListResponse> {
  const where = buildAdminOrderWhere(params);
  const skip = (params.page - 1) * params.limit;

  const [
    rows,
    total,
    totalOrders,
    pendingPayment,
    processing,
    completed,
  ] = await Promise.all([
    prisma.order.findMany({
      where,
      select: adminOrderListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.limit,
    }),
    prisma.order.count({ where }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: OrderStatus.PENDING_PAYMENT },
    }),
    prisma.order.count({
      where: { status: OrderStatus.PROCESSING },
    }),
    prisma.order.count({
      where: { status: OrderStatus.COMPLETED },
    }),
  ]);

  const totalPages = Math.ceil(total / params.limit) || 0;
  const page =
    totalPages > 0 && params.page > totalPages ? totalPages : params.page;

  let orders = rows;

  if (page !== params.page && totalPages > 0) {
    orders = await prisma.order.findMany({
      where,
      select: adminOrderListSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * params.limit,
      take: params.limit,
    });
  }

  return {
    orders: orders.map(serializeAdminOrder),
    pagination: {
      page,
      limit: params.limit,
      total,
      totalPages,
    },
    orderStats: {
      totalOrders,
      pendingPayment,
      processing,
      completed,
    },
  };
}
