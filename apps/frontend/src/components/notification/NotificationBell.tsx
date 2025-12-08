"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { cn } from "@/lib/utils";

import { useNotifications } from "@/contexts/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { getNavigationRoleFromUserRole } from "@/utils/role-formatter";

const NotificationBell: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected,
    fetchNotifications,
    isFetching,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(
    new Set()
  );
  const seenIdsRef = useRef<Set<string>>(new Set());
  const highlightTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  // Track new notifications to apply a temporary highlight animation
  useEffect(() => {
    const currentIds = notifications.map((n) => n.id);
    const seenIds = seenIdsRef.current;

    // First load: just record ids, no highlight
    if (seenIds.size === 0 && currentIds.length > 0) {
      seenIdsRef.current = new Set(currentIds);
      return;
    }

    const newOnes = currentIds.filter((id) => !seenIds.has(id));
    if (newOnes.length === 0) {
      return;
    }

    const nextHighlighted = new Set(highlightedIds);
    newOnes.forEach((id) => {
      nextHighlighted.add(id);
      // Clear any existing timeout
      const existing = highlightTimeouts.current[id];
      if (existing) {
        clearTimeout(existing);
      }
      highlightTimeouts.current[id] = setTimeout(() => {
        setHighlightedIds((prev) => {
          const copy = new Set(prev);
          copy.delete(id);
          return copy;
        });
      }, 3000);
    });

    setHighlightedIds(nextHighlighted);
    seenIdsRef.current = new Set(currentIds);

    const timeoutsSnapshot = { ...highlightTimeouts.current };
    return () => {
      newOnes.forEach((id) => {
        const t = timeoutsSnapshot[id];
        if (t) clearTimeout(t);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // Cleanup on unmount
  useEffect(() => {
    const timeoutsSnapshot = { ...highlightTimeouts.current };
    return () => {
      Object.values(timeoutsSnapshot).forEach((t) => clearTimeout(t));
    };
  }, []);

  const notificationsPath = useMemo(() => {
    if (!user?.role) return "/";
    const navRole = getNavigationRoleFromUserRole(user.role);
    
    if (!navRole) return "/";
    
    // Map navigation roles to paths
    const rolePathMap: Record<string, string> = {
      "Physician": "/physician/notifications",
      "Reception Staff": "/reception/notifications",
      "Imaging Technician": "/imaging-technician/notifications",
      "Radiologist": "/radiologist/notifications",
    };
    
    return rolePathMap[navRole] || "/";
  }, [user?.role]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-all border-2 border-slate-200 hover:border-slate-300"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white text-[10px] font-semibold shadow-md animate-in zoom-in-50">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
          {isConnected ? (
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
          ) : (
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-slate-300 ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[420px] p-0 shadow-lg border-0">
        <div className="px-6 py-4 bg-linear-to-br from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => fetchNotifications()}
                aria-label="Refresh notifications"
                disabled={isFetching}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 transition",
                    isFetching ? "animate-spin" : ""
                  )}
                />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-3"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[300px] text-center">
            {isFetching ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <RefreshCw className="h-7 w-7 text-slate-500 animate-spin" />
                </div>
                <p className="text-sm font-medium text-slate-600">Refreshing notifications…</p>
                <p className="text-xs text-slate-400 mt-1">Checking for new alerts</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Bell className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">We&apos;ll notify you when something arrives</p>
              </>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[460px]">
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  highlight={highlightedIds.has(notification.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-white h-9"
              onClick={() => {
                router.push(notificationsPath);
                setIsOpen(false);
              }}
            >
              View all notifications →
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
