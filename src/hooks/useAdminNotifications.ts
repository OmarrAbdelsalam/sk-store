"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { orderService, Order } from "@/services/orders";

export interface OrderNotification {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  government: string;
  created_at: string;
  isRead: boolean;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [pushGranted, setPushGranted] = useState(false);

  // Load recent orders (last 48h) on mount
  useEffect(() => {
    const loadRecent = async () => {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, government, created_at, is_read")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(
          data.map((o) => ({ ...o, isRead: o.is_read === true }))
        );
      }
    };

    loadRecent();

    if ("Notification" in window) {
      setPushGranted(Notification.permission === "granted");
    }
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as any;
          const newNotif: OrderNotification = {
            id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            total: Number(order.total),
            government: order.government,
            created_at: order.created_at,
            isRead: false,
          };

          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));

          // Push notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🛍️ New Order!", {
              body: `${order.customer_name} — ${Number(order.total).toLocaleString()} EGP`,
              icon: "/SK_Logo.svg",
              tag: order.id,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    // Persist to DB
    try {
      await orderService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // Persist to DB
    try {
      await orderService.markAllRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (id: string): Promise<Order | null> => {
    try {
      return await orderService.getById(id);
    } catch {
      return null;
    }
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
      setPushGranted(true);
      return true;
    }
    const result = await Notification.requestPermission();
    const granted = result === "granted";
    setPushGranted(granted);
    return granted;
  }, []);

  return {
    notifications,
    unreadCount,
    pushGranted,
    markAllRead,
    markRead,
    fetchOrderDetail,
    requestPushPermission,
  };
}
