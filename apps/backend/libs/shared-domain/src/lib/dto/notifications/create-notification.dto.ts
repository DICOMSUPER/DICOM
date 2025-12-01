import {
  NotificationPriority,
  NotificationType,
  RelatedEntityType,
} from '@backend/shared-enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  priority?: NotificationPriority = NotificationPriority.LOW;

  @IsOptional()
  @IsEnum(RelatedEntityType)
  relatedEntityType?: RelatedEntityType;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean = false;
}
