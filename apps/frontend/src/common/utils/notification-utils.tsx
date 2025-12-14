import React from "react";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/common/lib/utils";
import { NotificationType, NotificationPriority } from "@/common/enums/notification.enum";

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
 * Get priority badge configuration
 * @param priority - Notification priority
 * @returns Badge configuration with label and className, or null if priority is not provided
 */
export const getNotificationPriorityConfig = (
  priority?: NotificationPriority
) => {
  if (!priority) return null;

  const priorityConfig: Record<
    NotificationPriority,
    { label: string; className: string }
  > = {
    [NotificationPriority.LOW]: {
      label: "Low",
      className: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
    },
    [NotificationPriority.MEDIUM]: {
      label: "Medium",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",
    },
    [NotificationPriority.HIGH]: {
      label: "High",
      className: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
    },
  };

  return (
    priorityConfig[priority] || {
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      className: "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200",
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

/**
 * Get notification priority badge component
 * @param priority - Notification priority
 * @param size - Badge size class (default: "text-xs")
 * @returns Badge component or null if priority is not provided
 */
export const getNotificationPriorityBadge = (
  priority?: NotificationPriority,
  size: string = "text-xs"
): React.ReactElement | null => {
  const config = getNotificationPriorityConfig(priority);
  if (!config) return null;

  return (
    <Badge variant="outline" className={cn(size, "font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

