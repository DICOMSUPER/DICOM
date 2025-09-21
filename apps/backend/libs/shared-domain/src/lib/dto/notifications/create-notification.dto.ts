import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { NotificationType, NotificationPriority } from '@backend/shared-enums';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

@IsString()
  @IsNotEmpty()
  senderId!: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  notificationType!: NotificationType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

}