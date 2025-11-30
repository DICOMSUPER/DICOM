"use client";

import React, { useState } from "react";
import { Bell, Check, CheckCheck, Clock, Calendar, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification } from "@/interfaces/system/notification.interface";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { NotificationType } from "@/enums/notification.enum";
import { ScrollArea } from "../ui/scroll-area";

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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
          className="relative p-2 rounded-lg hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <div
            className={cn(
              "absolute -bottom-1 -right-1 h-2 w-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors",
                    notification.isRead
                      ? "border-l-transparent bg-white"
                      : "border-l-blue-500 bg-blue-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notificationType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            "text-sm truncate",
                            notification.isRead
                              ? "font-normal"
                              : "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h4>

                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            getNotificationBadgeColor(notification.notificationType)
                          )}
                        >
                          {notification.notificationType.replace("_", " ").toLowerCase()}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                          {notification.createdAt
                            ? formatDistanceToNow(
                                new Date(
                                  new Date(notification.createdAt).getTime() 
                                ),
                                { addSuffix: true }
                              )
                            : "Unknown time"}
                        </span>

                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full ml-auto" />
                        )}
                      </div>

                      {/* {notification && (
                        <div className="mt-2 text-xs text-gray-500">
                          {notification.data.patientName && (
                            <span>
                              Patient: {notification.data.patientName}
                            </span>
                          )}
                          {notification.data.consultantName && (
                            <span>
                              Consultant: {notification.data.consultantName}
                            </span>
                          )}
                          {notification.data.bookingTime && (
                            <div>
                              Time:{" "}
                              {new Date(
                                notification.data.bookingTime
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-center text-blue-600 hover:text-blue-800"
              onClick={() => {
                // Navigate to notifications page
                console.log("View all notifications");
                setIsOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;