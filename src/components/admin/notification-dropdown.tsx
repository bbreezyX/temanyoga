"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, Package, CreditCard, Truck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@prisma/client";

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

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
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectSSERef = useRef<() => void>(() => {});

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const eventSource = new EventSource("/api/admin/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        if (parsed.type === "init") {
          setNotifications(parsed.data.notifications);
          setUnreadCount(parsed.data.unreadCount);
          reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        } else if (parsed.type === "notification") {
          setNotifications((prev) => [parsed.data, ...prev.slice(0, 9)]);
          setUnreadCount((prev) => prev + 1);
          reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        } else if (parsed.type === "unreadCount") {
          setUnreadCount(parsed.data);
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
      reconnectTimeoutRef.current = setTimeout(connectSSERef.current, delay);
    };
  }, []);

  useEffect(() => {
    connectSSERef.current = connectSSE;
  }, [connectSSE]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative h-10 w-10 rounded-full bg-cream text-warm-gray transition-all hover:bg-warm-sand/30"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-terracotta p-0 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="notification-dropdown-panel absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-y-auto rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <span className="font-display font-bold text-dark-brown">Notifikasi</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-terracotta hover:underline font-medium"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-warm-gray hover:bg-muted hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-warm-gray">
                Tidak ada notifikasi
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-cream/50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-terracotta/5" : ""
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-brown leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-xs text-warm-gray line-clamp-2 mt-0.5 leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.order && (
                        <Link
                          href={`/admin/orders/${notification.orderId}`}
                          className="text-xs text-terracotta hover:underline mt-1 block font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                          }}
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
                      className="flex-shrink-0 p-1.5 rounded-lg text-warm-gray/50 hover:text-terracotta hover:bg-terracotta/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}