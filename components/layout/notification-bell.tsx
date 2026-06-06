"use client";

import { apiUrl } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  Loader2,
  Info,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/notifications"));
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Simple polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(apiUrl(`/api/notifications/${id}`), {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      // For now, mark them one by one locally or via a specialized endpoint
      // To keep it simple, we'll just update local state if we don't want to create a bulk endpoint yet
      // But typically we should have a bulk endpoint.
      // Let's just do it locally for now and mark them on next fetch
      for (const n of notifications.filter((n) => !n.isRead)) {
        await fetch(apiUrl(`/api/notifications/${n.id}`), { method: "PATCH" });
      }
      await fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group transition-all duration-300"
        >
          <Bell className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] animate-in zoom-in duration-300"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 shadow-2xl border-primary/10"
      >
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <h3 className="text-sm font-bold">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs p-0 text-primary hover:text-primary hover:bg-transparent"
            >
              {isLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3 mr-1" />
              )}
              Hepsini Oku
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="size-10 bg-muted rounded-full flex items-center justify-center mb-3">
                <Bell className="size-5 text-muted-foreground opacity-30" />
              </div>
              <p className="text-xs text-muted-foreground">
                Şu an bir bildiriminiz bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col gap-1 p-4 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                    !n.isRead && "bg-primary/5",
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {n.title.includes("Red") ? (
                        <AlertCircle className="size-3 text-rose-500" />
                      ) : n.title.includes("Onay") ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Info className="size-3 text-blue-500 mb-0.5" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-bold",
                          !n.isRead ? "text-primary" : "text-foreground/70",
                        )}
                      >
                        {n.title}
                      </span>
                    </div>
                    {!n.isRead && (
                      <div className="size-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 opacity-60">
                    <Calendar className="size-3" />
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t bg-muted/50 flex justify-center">
          <Button variant="link" size="sm" className="text-xs text-muted-foreground" asChild>
            <Link href="/dashboard/notifications">Tüm Bildirimleri Gör</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
