"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/interfaces/system/notification.interface";
import { RelatedEntityType } from "@/enums/notification.enum";
import { Button } from "@/components/ui/button";
import { NotificationDetailModal } from "./NotificationDetailModal";
import {
  getNotificationIcon,
  getNotificationTypeBadge,
  getNotificationPriorityBadge,
} from "@/utils/notification-utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);


  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailModal(true);
  };

  const handleNavigation = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (!notification.relatedEntityId || !notification.relatedEntityType) {
      // If no related entity, just open the detail modal
      setShowDetailModal(true);
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
          `/imaging-technician/order-details/${notification.relatedEntityId}`
        );
        break;
      case RelatedEntityType.REPORT:
        router.push(`/physician/patient-study/${notification.relatedEntityId}`);
        break;
      default:
        console.warn("Unknown entity type for navigation");
        break;
    }
  };

  return (
    <div
      onClick={handleNavigation}
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-4 px-6 py-4 transition-all",
        // Subtle hover effect without borders
        "hover:bg-slate-50/80",
        // Unread styling - subtle background
        !notification.isRead ? "bg-blue-50/30" : "bg-white"
      )}
    >
      {/* Unread indicator - elegant left accent */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
      )}

      {/* Icon container - cleaner without border ring */}
      <div
        className={cn(
          "mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all",
          !notification.isRead
            ? "bg-blue-100 group-hover:bg-blue-200 group-hover:scale-105"
            : "bg-slate-100 group-hover:bg-slate-200 group-hover:scale-105"
        )}
      >
        {getNotificationIcon(notification.notificationType)}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "text-sm leading-snug text-slate-900 line-clamp-1",
              !notification.isRead && "font-semibold text-slate-950"
            )}
          >
            {notification.title}
          </p>
          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
            {notification.createdAt
              ? formatDistanceToNow(
                  new Date(
                    new Date(notification.createdAt).getTime() +
                      7 * 60 * 60 * 1000
                  ),
                  { addSuffix: true }
                ).replace('about ', '')
              : "Unknown"}
          </span>
        </div>

        <p
          className={cn(
            "line-clamp-2 text-sm leading-relaxed",
            !notification.isRead ? "text-slate-600" : "text-slate-500"
          )}
        >
          {notification.message}
        </p>

        {/* Type and Priority Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {getNotificationTypeBadge(notification.notificationType)}
          {getNotificationPriorityBadge(notification.priority)}
        </div>

        {/* Action Button - Always visible */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View Details
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={notification}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onMarkAsRead={onMarkAsRead}
      />
    </div>
  );
};
