import React from "react";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/common/lib/utils";
import { NotificationType } from "@/common/enums/notification.enum";

/**
 * Get icon component for notification type
 * @param type - Notification type
 * @param size - Icon size class (default: "h-5 w-5")
 * @returns Icon component
 */
export const getNotificationIcon = (
  type: NotificationType | string,
  size: string = "h-5 w-5"
): React.ReactElement => {
  switch (type) {
    case NotificationType.AI_RESULT:
      return <Calendar className={`${size} text-blue-500`} />;
    case NotificationType.ASSIGNMENT:
      return <CheckCircle2 className={`${size} text-green-500`} />;
    case NotificationType.URGENT_CASE:
      return <AlertCircle className={`${size} text-red-500`} />;
    default:
      return <Bell className={`${size} text-gray-500`} />;
  }
};

/**
 * Get type badge configuration
 * @param type - Notification type
 * @returns Badge configuration with label and className
 */
export const getNotificationTypeConfig = (type: NotificationType) => {
  const typeConfig: Record<
    NotificationType,
    { label: string; className: string }
  > = {
    [NotificationType.AI_RESULT]: {
      label: "AI Result",
      className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    },
    [NotificationType.ASSIGNMENT]: {
      label: "Assignment",
      className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    [NotificationType.URGENT_CASE]: {
      label: "Urgent Case",
      className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    },
  };

  return (
    typeConfig[type] || {
      label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    }
  );
};

/**
 * Get notification type badge component
 * @param type - Notification type
 * @param size - Badge size class (default: "text-xs")
 * @returns Badge component
 */
export const getNotificationTypeBadge = (
  type: NotificationType,
  size: string = "text-xs"
): React.ReactElement => {
  const config = getNotificationTypeConfig(type);

  return (
    <Badge variant="outline" className={cn(size, "font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

