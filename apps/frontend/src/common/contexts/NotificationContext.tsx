"use client";

import { Notification } from "@/common/interfaces/system/notification.interface";
import { AppDispatch, RootState } from "@/store";
import {
  notificationApi,
  useGetNotificationsByUserQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/store/notificationApi";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isFetching: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<any>;
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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const reduxToken = useSelector((state: RootState) => state.auth.token);
  const {
    data: notificationsResponse,
    refetch,
    isFetching,
  } = useGetNotificationsByUserQuery({});

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
    console.log(process.env.NEXT_PUBLIC_SOCKET_URL);

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3006";

    const tokenFromStorage =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : undefined;
    const authToken = reduxToken || tokenFromStorage;

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: authToken ? { token: authToken } : undefined,
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

    socketRef.current = newSocket;

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [dispatch, reduxToken]);

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
        isFetching,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
