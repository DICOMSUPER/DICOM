import { NotificationType, RelatedEntityType } from "@/common/enums/notification.enum";
import { BaseEntity } from "../base.interface";
import { QueryParams } from "../pagination/pagination.interface";
export interface Notification extends BaseEntity {
  id: string;
  recipientId?: string;
  senderId?: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: Date;
}
export interface FilterNotificationDto extends QueryParams {
  title?: string;
  type?: NotificationType;
  isRead?: boolean;
  startDate?: string; 
  endDate?: string;   
}

