import { NotificationPriority, NotificationType, RelatedEntityType } from "@/enums/notification.enum";
import { BaseEntity } from "../base.interface";
import { QueryParams } from "../pagination/pagination.interface";
export interface Notification extends BaseEntity {
  id: string;
  recipientId?: string;
  senderId?: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: Date;
}
export interface FilterNotificationDto extends QueryParams {
  title?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
}

