"use client";

import { formatDistanceToNow, format } from "date-fns";
import {
  ExternalLink,
  Clock,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Notification } from "@/interfaces/system/notification.interface";
import { RelatedEntityType } from "@/enums/notification.enum";
import { useRouter } from "next/navigation";
import {
  getNotificationIcon,
  getNotificationTypeBadge,
  getNotificationPriorityBadge,
} from "@/utils/notification-utils";

interface NotificationDetailModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
  onMarkAsRead,
}: NotificationDetailModalProps) {
  const router = useRouter();

  if (!notification) return null;


  const getRelatedEntityLabel = (type?: string) => {
    switch (type) {
      case RelatedEntityType.ENCOUNTER:
        return "Patient Encounter";
      case RelatedEntityType.STUDY:
        return "DICOM Study";
      case RelatedEntityType.ORDER:
        return "Imaging Order";
      case RelatedEntityType.REPORT:
        return "Diagnosis Report";
      default:
        return "Related Item";
    }
  };

  const handleNavigate = () => {
    if (!notification.relatedEntityId || !notification.relatedEntityType) {
      return;
    }

    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
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

    onOpenChange(false);
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all",
                !notification.isRead
                  ? "bg-blue-100 ring-2 ring-blue-200"
                  : "bg-slate-100 ring-1 ring-slate-200"
              )}
            >
              {getNotificationIcon(notification.notificationType, "h-6 w-6")}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="text-xl font-semibold leading-tight">
                  {notification.title}
                </DialogTitle>
                {!notification.isRead && (
                  <Badge className="bg-blue-500">New</Badge>
                )}
              </div>
              <DialogDescription className="text-sm text-slate-500">
                {notification.createdAt
                  ? formatDistanceToNow(
                      new Date(
                        new Date(notification.createdAt).getTime() +
                          7 * 60 * 60 * 1000
                      ),
                      { addSuffix: true }
                    )
                  : "Unknown time"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Notification Content */}
        <div className="space-y-6">
          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileText className="h-4 w-4" />
              Message
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-slate-700 leading-relaxed">
              {notification.message}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Tag className="h-4 w-4" />
                Type
              </div>
              {getNotificationTypeBadge(notification.notificationType)}
            </div>

            {/* Priority */}
            {notification.priority && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <AlertCircle className="h-4 w-4" />
                  Priority
                </div>
                {getNotificationPriorityBadge(notification.priority)}
              </div>
            )}

            {/* Created At */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock className="h-4 w-4" />
                Created
              </div>
              <p className="text-sm text-slate-600">
                {notification.createdAt
                  ? format(
                      new Date(
                        new Date(notification.createdAt).getTime() +
                          7 * 60 * 60 * 1000
                      ),
                      "PPpp"
                    )
                  : "Unknown"}
              </p>
            </div>

            {/* Related Entity */}
            {notification.relatedEntityType && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ExternalLink className="h-4 w-4" />
                  Related To
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="font-normal bg-slate-700 text-white hover:bg-slate-800">
                    {getRelatedEntityLabel(notification.relatedEntityType)}
                  </Badge>
                  {notification.relatedEntityId && (
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">
                      {notification.relatedEntityId.substring(0, 8)}...
                    </code>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          {!notification.isRead && (
            <Button
              variant="secondary"
              onClick={handleMarkAsRead}
              className="w-full sm:w-auto text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-1 text-white" />
              Mark as Read
            </Button>
          )}

          {notification.relatedEntityId && notification.relatedEntityType && (
            <Button
              onClick={handleNavigate}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Go to {getRelatedEntityLabel(notification.relatedEntityType)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

