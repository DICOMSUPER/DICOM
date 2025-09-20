import { PaginationDto } from '@backend/database';
import { NotificationType, NotificationPriority } from '@backend/shared-enums';
import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class FilterNotificationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(NotificationType, { 
    message: `type must be one of: ${Object.values(NotificationType).join(', ')}` 
  })
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority, { 
    message: `priority must be one of: ${Object.values(NotificationPriority).join(', ')}` 
  })
  priority?: NotificationPriority;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;


  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

}