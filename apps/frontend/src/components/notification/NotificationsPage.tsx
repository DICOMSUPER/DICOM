"use client";

import { useState, useMemo, useCallback } from "react";
import { useNotifications } from "@/common/contexts/NotificationContext";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCheck, Search, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshButton } from "@/components/ui/refresh-button";
import { NotificationType, NotificationPriority } from "@/common/enums/notification.enum";
import { getNotificationTypeConfig, getNotificationPriorityConfig } from "@/common/utils/notification-utils";
import { useGetNotificationsByUserQuery } from "@/store/notificationApi";
import { FilterNotificationDto } from "@/common/interfaces/system/notification.interface";

export function NotificationsPage() {
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Build filter parameters for API
  const filterParams = useMemo<FilterNotificationDto>(() => {
    const params: FilterNotificationDto = {};

    // Search by title
    if (searchQuery.trim()) {
      params.title = searchQuery.trim();
    }

    // Type filter
    if (filterType !== "all") {
      params.type = filterType as NotificationType;
    }

    // Priority filter
    if (filterPriority !== "all" && filterPriority !== "none") {
      params.priority = filterPriority as NotificationPriority;
    }

    // Status filter
    if (filterStatus !== "all") {
      params.isRead = filterStatus === "read";
    }

    return params;
  }, [searchQuery, filterType, filterPriority, filterStatus]);

  // Fetch notifications with filters
  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsByUserQuery({ filter: filterParams });

  const notifications = notificationsResponse?.data || [];

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <div className="w-full flex flex-col space-y-6 h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Notifications
          </h1>
          <p className="text-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-0 bg-slate-100 hover:bg-slate-200"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <RefreshButton onRefresh={handleRefresh} loading={isFetching || isLoading} />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(NotificationType).map((type) => {
                const config = getNotificationTypeConfig(type);
                return (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.values(NotificationPriority).map((priority) => {
                const config = getNotificationPriorityConfig(priority);
                return (
                  <SelectItem key={priority} value={priority}>
                    {config?.label || priority}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-lg overflow-hidden flex flex-col flex-1 min-h-0 border border-border">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-600">Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Bell className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "We'll notify you when something arrives"}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 h-full">
            <div>
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
      </div>
    </div>
  );
}

