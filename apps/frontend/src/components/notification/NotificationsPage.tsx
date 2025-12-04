"use client";

import { useState, useMemo, useCallback } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
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
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheck, Search, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshButton } from "@/components/ui/refresh-button";

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">(
    "all"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      fetchNotifications();
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Search filter
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        filterType === "all" || notification.notificationType === filterType;

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "read" && notification.isRead) ||
        (filterStatus === "unread" && !notification.isRead);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notifications, searchQuery, filterType, filterStatus]);

  const unreadNotifications = useMemo(
    () => filteredNotifications.filter((n) => !n.isRead),
    [filteredNotifications]
  );

  const readNotifications = useMemo(
    () => filteredNotifications.filter((n) => n.isRead),
    [filteredNotifications]
  );

  const uniqueTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.notificationType));
    return Array.from(types);
  }, [notifications]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
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
          <RefreshButton onRefresh={handleRefresh} loading={isRefreshing} />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-lg overflow-hidden">
        <Tabs
          defaultValue="all"
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as any)}
        >
          <div>
            <TabsList className="h-12">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2 text-white">
                  {filteredNotifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="secondary" className="ml-2 text-white">
                  {unreadNotifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="read">
                Read
                <Badge variant="secondary" className="ml-2 text-white">
                  {readNotifications.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-foreground">
                <p className="text-sm font-medium">
                  No notifications found
                </p>
                <p className="text-sm mt-1">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div>
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            {unreadNotifications.length === 0 ? (
              <div className="p-12 text-center text-foreground">
                <p className="text-sm font-medium">
                  All caught up!
                </p>
                <p className="text-sm mt-1">
                  You have no unread notifications
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-0">
            {readNotifications.length === 0 ? (
              <div className="p-12 text-center text-foreground">
                <p className="text-sm font-medium">
                  No read notifications
                </p>
                <p className="text-sm mt-1">
                  Read notifications will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div>
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

