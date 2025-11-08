import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { NotificationType, NotificationPriority, RelatedEntityType } from '@backend/shared-enums';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  id!: string;

  @Column({ name: 'recipient_id' })
  recipientId!: string;

  @Column({ name: 'sender_id', nullable: true })
  senderId?: string;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  notificationType!: NotificationType;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.LOW })
  priority!: NotificationPriority;

  @Column({ name: 'related_entity_type', type: 'enum', enum: RelatedEntityType, nullable: true })
  relatedEntityType?: RelatedEntityType;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId?: string;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;
}
