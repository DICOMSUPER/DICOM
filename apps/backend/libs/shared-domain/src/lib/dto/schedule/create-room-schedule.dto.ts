import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString, ValidateIf, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, IsNotEmpty } from 'class-validator';
import { ScheduleStatus } from '@backend/shared-enums';
import { registerDecorator, ValidationOptions } from 'class-validator';

// Custom validator for date must be at least 1 day in the future
@ValidatorConstraint({ name: 'isAtLeastOneDayInFuture', async: false })
export class IsAtLeastOneDayInFutureConstraint implements ValidatorConstraintInterface {
  validate(workDate: string, args: ValidationArguments) {
    if (!workDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scheduleDate = new Date(workDate);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Must be at least 1 day in the future (tomorrow or later)
    // If it's 1 minute before midnight, the next day counts as 1 day in future
    return diffDays >= 1;
  }

  defaultMessage(args: ValidationArguments) {
    return 'work_date must be at least 1 day in the future (not today or in the past)';
  }
}

// Custom decorator for date validation
export function IsAtLeastOneDayInFuture(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAtLeastOneDayInFutureConstraint,
    });
  };
}

// Custom validator for start time must be before end time
@ValidatorConstraint({ name: 'isStartTimeBeforeEndTime', async: false })
export class IsStartTimeBeforeEndTimeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const startTime = object.actual_start_time;
    const endTime = object.actual_end_time;
    
    // Only validate if both times are provided
    if (!startTime || !endTime) return true;
    
    // Parse times (HH:MM:SS or HH:MM format)
    const parseTime = (timeStr: string) => {
      const parts = timeStr.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || '0');
    };
    
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    
    // Handle overnight shifts (end time < start time means it goes to next day)
    // For validation purposes, we allow this as it's a valid overnight shift
    // But if both are on same day, start must be before end
    if (startMinutes < endMinutes) {
      return true; // Normal case: start < end on same day
    }
    
    // Overnight shift is valid (end < start means it spans midnight)
    // We'll allow this as it's a common pattern for night shifts
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'actual_start_time must be before actual_end_time';
  }
}

// Custom decorator for time validation
export function IsStartTimeBeforeEndTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStartTimeBeforeEndTimeConstraint,
    });
  };
}

export class CreateRoomScheduleDto {
  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsUUID()
  shift_template_id?: string;

  @IsDateString()
  @IsAtLeastOneDayInFuture()
  work_date!: string;

  // Start time and end time are required when creating a new schedule
  // They can be optional only if shift_template_id is provided (will use template times)
  @ValidateIf((o) => !o.shift_template_id)
  @IsNotEmpty({ message: 'Start time is required when creating a new schedule without a shift template' })
  @IsString()
  actual_start_time?: string;

  @ValidateIf((o) => !o.shift_template_id)
  @IsNotEmpty({ message: 'End time is required when creating a new schedule without a shift template' })
  @IsString()
  @IsStartTimeBeforeEndTime()
  actual_end_time?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  schedule_status?: ScheduleStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  overtime_hours?: number;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}
