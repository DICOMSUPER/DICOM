"use client";

import { Notification } from "@/interfaces/system/notification.interface";
import { AppDispatch } from "@/store";
import {
  notificationApi,
  useGetNotificationsByUserQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/store/notificationApi";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const { data: notificationsResponse, refetch } =
    useGetNotificationsByUserQuery({});

  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();

  const notifications = notificationsResponse?.data || [];

  useEffect(() => {
    if (notificationsResponse?.data) {
      const count = notificationsResponse.data.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    }
  }, [notificationsResponse]);

  // 5. Effect: Socket Connection
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5006";

    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification server");
      setIsConnected(false);
    });

    // --- XỬ LÝ NHẬN NOTIFICATION ---
    newSocket.on("new_notification", (notification: Notification) => {
      console.log("Received new notification:", notification);

      toast(notification.title, {
        description: notification.message,
        action: {
          label: "View",
          onClick: () => console.log("Click notification:", notification.id),
        },
      });

      dispatch(
        notificationApi.util.updateQueryData(
          "getNotificationsByUser",
          {},
          (draft) => {
            // draft là ApiResponse<Notification[]>
            if (draft.success && Array.isArray(draft.data)) {
              draft.data.unshift(notification);
            }
          }
        )
      );

      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [dispatch]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await markAsReadMutation(notificationId).unwrap();

      if (response.success) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await markAllAsReadMutation().unwrap();
      if (response.success) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        fetchNotifications: () => refetch(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
