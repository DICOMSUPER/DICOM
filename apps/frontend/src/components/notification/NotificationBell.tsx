"use client";

import React, { useState, useMemo } from "react";
import { Bell, Check, CheckCheck, Clock, Calendar, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { cn } from "@/lib/utils";

import { formatDistanceToNow } from "date-fns";
import {
  NotificationProvider,
  useNotifications,
} from "@/contexts/NotificationContext";
import { Notification } from "@/interfaces/system/notification.interface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { NotificationType } from "@/enums/notification.enum";
import { ScrollArea } from "../ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { getNavigationRoleFromUserRole } from "@/utils/role-formatter";

const NotificationBell: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.AI_RESULT:
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case NotificationType.ASSIGNMENT:
        return <Check className="h-4 w-4 text-green-500" />;
      case NotificationType.URGENT_CASE:
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.AI_RESULT:
        return "bg-blue-100 text-blue-800";
      case NotificationType.ASSIGNMENT:
        return "bg-green-100 text-green-800";
      case NotificationType.URGENT_CASE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

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
            <div className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] font-semibold shadow-md animate-in zoom-in-50">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
          {isConnected && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[420px] p-0 shadow-lg border-0">
        <div className="px-6 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Bell className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">We&apos;ll notify you when something arrives</p>
          </div>
        ) : (
          <ScrollArea className="h-[460px]">
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
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
