import { NotificationPriority, NotificationType } from "@/enums/notification.enum";
import { BaseEntity } from "../base.interface";
export interface Notification extends BaseEntity {
  notification_id: string;
  recipient_id: string;
  sender_id?: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  related_entity_type?: 'study' | 'patient' | 'order' | 'analysis';
  related_entity_id?: string;
  is_read?: boolean;
  read_at?: Date;
}