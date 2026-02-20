import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { DashboardContent } from "@/components/admin/dashboard-content";
import type { AdminDashboardStats } from "@/types/api";

export const dynamic = "force-dynamic";

async function getDashboardData(): Promise<AdminDashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    pendingPayments,
    revenueAggr,
    totalProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.order.count({
      where: { status: OrderStatus.PENDING_PAYMENT },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED,
          ],
        },
      },
      _sum: { totalAmount: true },
    }),
    prisma.product.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true, paymentProofs: true } },
      },
    }),
  ]);

  return {
    todayOrders,
    pendingPayments,
    totalRevenue: revenueAggr._sum.totalAmount || 0,
    totalProducts,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
  };
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  const data = await getDashboardData();
  return <DashboardContent initialData={data} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="animate-fade-in-up">
        <div className="h-12 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-80 mt-2 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[32px] bg-card p-6 shadow-soft ring-1 ring-border"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="mt-4">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-9 w-24 mt-2 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[40px] bg-card p-4 md:p-8 shadow-soft ring-1 ring-border">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-11 w-44 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-4 border-b border-border/50"
            >
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-6 w-28 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              <div className="h-9 w-9 bg-muted animate-pulse rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}