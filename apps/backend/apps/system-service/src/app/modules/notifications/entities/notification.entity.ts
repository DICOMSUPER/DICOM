import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

import { NotificationType, NotificationPriority } from '@backend/shared-enums';

@Entity('notifications')
export class Notification {
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

  @Column({ name: 'related_entity_type', nullable: true })
  relatedEntityType?: string;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId?: string;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
