"use client";

import { Notification } from "@/interfaces/system/notification.interface";
// Import type AppDispatch từ store của bạn (như đã bàn ở trên)
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
  // 1. State quản lý socket và connection
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // 2. State đếm số lượng chưa đọc (Có thể lấy từ API riêng hoặc tính toán từ list)
  const [unreadCount, setUnreadCount] = useState(0);

  const dispatch = useDispatch<AppDispatch>();

  // 3. RTK Query hooks
  const {
    data: notificationsResponse, // Đổi tên biến cho rõ nghĩa (ApiResponse)
    refetch,
  } = useGetNotificationsByUserQuery({}); // Lưu ý: Params phải khớp với cache key

  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();

  // Helper: Lấy list data an toàn
  const notifications = notificationsResponse?.data || [];

  // 4. Effect: Đồng bộ unreadCount khi data thay đổi (khi mới load hoặc refetch)
  useEffect(() => {
    if (notificationsResponse?.data) {
      const count = notificationsResponse.data.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    }
  }, [notificationsResponse]);

  // 5. Effect: Socket Connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3006"; 
    
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

      // A. Hiện Toast
      toast(notification.title, {
        description: notification.message,
        action: {
          label: "View",
          onClick: () => console.log("Click notification:", notification.id),
        },
      });

      // B. Cập nhật Cache RTK Query (Optimistic Update)
      // Giúp UI hiển thị ngay lập tức mà không cần Refetch
      dispatch(
        notificationApi.util.updateQueryData(
          "getNotificationsByUser",
          {}, // Phải khớp với params ở hook useGetNotificationsByUserQuery
          (draft) => {
             // draft là ApiResponse<Notification[]>
             if (draft.success && Array.isArray(draft.data)) {
                draft.data.unshift(notification);
             }
          }
        )
      );
      
      // C. Tăng số lượng chưa đọc
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [dispatch]);


  // 6. Xử lý logic Mark as Read
  const markAsRead = async (notificationId: string) => {
    try {
      // Gọi API (RTK Query sẽ tự invalidate tags và refetch list mới)
      const response = await markAsReadMutation(notificationId).unwrap();
      
      if (response.success) {
         // Nếu API config có invalidatesTags: ['LIST'] -> List sẽ tự reload
         // Ta chỉ cần trừ unread count để phản hồi nhanh UI (hoặc đợi refetch cũng được)
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
        // List sẽ tự reload nhờ invalidatesTags trong notificationApi
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications, // Dùng biến lấy trực tiếp từ RTK Query
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