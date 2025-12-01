"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
// import { vi } from "date-fns/locale"; // Nếu muốn hiển thị tiếng Việt
import {
  Calendar,
  CreditCard,
  Info,
  Mail,
  AlertCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Hàm merge class (clsx + twMerge)
import { Notification } from "@/interfaces/system/notification.interface";
import { RelatedEntityType } from "@/enums/notification.enum";
// Import enum RelatedEntityType nếu có, hoặc dùng string literal
// import { RelatedEntityType } from "@/enums/..."

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void; // Hàm gọi API mark as read (tuỳ chọn)
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  const router = useRouter();

  // 1. Logic xác định Icon dựa trên Type
  const getIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT": // Ví dụ các enum type
      case "APPOINTMENT_REMINDER":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "PAYMENT":
      case "INVOICE":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "MESSAGE":
        return <Mail className="h-5 w-5 text-yellow-500" />;
      case "SYSTEM_ALERT":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "SUCCESS":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleNavigation = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (!notification.relatedEntityId || !notification.relatedEntityType) {
      return;
    }
    switch (notification.relatedEntityType) {
      case RelatedEntityType.ENCOUNTER:
        router.push(`/physician/clinic-visit/${notification.relatedEntityId}`);
        break;
      case RelatedEntityType.STUDY:
        router.push(`/dashboard/study/${notification.relatedEntityId}`);
        break;
      case RelatedEntityType.ORDER:
        router.push(
          `/imaging-technician/order/${notification.relatedEntityId}`
        );
        break;
      case RelatedEntityType.REPORT:
        router.push(`/physician/patient-study/${notification.relatedEntityId}`);
        break;
      default:
        // Mặc định hoặc log lỗi
        console.warn("Unknown entity type for navigation");
        break;
    }
  };

  return (
    <div
      onClick={handleNavigation}
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-4 border-b p-4 transition-all hover:bg-slate-50",
        // Logic style cho Read/Unread
        !notification.isRead ? "bg-blue-50/40 hover:bg-blue-50/60" : "bg-white"
      )}
    >
      {!notification.isRead && (
        <span className="absolute left-0 top-4 h-2 w-2 rounded-full bg-blue-600 shadow-sm content-[''] ml-1.5" />
      )}

      <div
        className={cn(
          "mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200 transition-colors group-hover:bg-white",
          !notification.isRead &&
            "bg-blue-100 ring-blue-200 group-hover:bg-blue-50"
        )}
      >
        {getIcon(notification.notificationType)}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-none text-gray-900",
              !notification.isRead && "font-bold text-black"
            )}
          >
            {notification.title}
          </p>
          <span>
            {notification.createdAt
              ? formatDistanceToNow(
                  new Date(
                    new Date(notification.createdAt).getTime() +
                      7 * 60 * 60 * 1000
                  ),
                  { addSuffix: true }
                )
              : "Unknown time"}
          </span>
        </div>

        <p
          className={cn(
            "line-clamp-2 text-sm text-gray-500",
            !notification.isRead ? "text-gray-700" : "text-gray-500"
          )}
        >
          {notification.message}
        </p>

        {/* Badge loại thông báo (Optional - chỉ hiện nếu cần thiết) */}
        {/* <div className="mt-2 flex items-center gap-2">
           <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
             {notification.notificationType.replace(/_/g, " ")}
           </span>
        </div> */}
      </div>
    </div>
  );
};
