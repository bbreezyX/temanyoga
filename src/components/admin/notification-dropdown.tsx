"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Package, CreditCard, Truck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@/generated/prisma/client";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
  order?: {
    orderCode: string;
    customerName: string;
  } | null;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  NEW_ORDER: <Package className="h-4 w-4 text-terracotta" />,
  PAYMENT_PROOF_UPLOADED: <CreditCard className="h-4 w-4 text-sage" />,
  ORDER_STATUS_CHANGED: <Truck className="h-4 w-4 text-warm-gray" />,
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=10");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return past.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-cream text-warm-gray transition-all hover:bg-warm-sand/30"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-terracotta p-0 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-terracotta hover:underline"
            >
              Tandai semua dibaca
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-warm-gray">
            Memuat...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-warm-gray">
            Tidak ada notifikasi
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-3 hover:bg-cream/50 cursor-pointer ${
                !notification.isRead ? "bg-terracotta/5" : ""
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notificationIcons[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-brown truncate">
                  {notification.title}
                </p>
                <p className="text-xs text-warm-gray line-clamp-2">
                  {notification.message}
                </p>
                {notification.order && (
                  <Link
                    href={`/admin/orders?search=${notification.order.orderCode}`}
                    className="text-xs text-terracotta hover:underline mt-1 block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Lihat Order #{notification.order.orderCode}
                  </Link>
                )}
                <p className="text-[10px] text-warm-gray/70 mt-1">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="flex-shrink-0 p-1 text-warm-gray/50 hover:text-terracotta transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}