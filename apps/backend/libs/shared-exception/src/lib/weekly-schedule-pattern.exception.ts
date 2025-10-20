import { HttpStatus } from '@nestjs/common';
import { CustomException } from '@backend/shared-exception'; // đổi path tùy project của bạn

/**
 * Weekly Schedule Pattern Exception Set
 */
export class WeeklySchedulePatternNotFoundException extends CustomException {
  constructor(identifier?: string) {
    super(
      identifier
        ? `Weekly schedule pattern with identifier '${identifier}' not found`
        : 'Weekly schedule pattern not found',
      HttpStatus.NOT_FOUND,
      'WEEKLY_SCHEDULE_PATTERN_NOT_FOUND',
      { identifier },
    );
  }
}

export class WeeklySchedulePatternAlreadyExistsException extends CustomException {
  constructor(message: string = 'Weekly schedule pattern already exists', details?: any) {
    super(
      message,
      HttpStatus.CONFLICT,
      'WEEKLY_SCHEDULE_PATTERN_ALREADY_EXISTS',
      details,
    );
  }
}

export class WeeklySchedulePatternCreationFailedException extends CustomException {
  constructor(details?: any) {
    super(
      'Failed to create weekly schedule pattern',
      HttpStatus.BAD_REQUEST,
      'WEEKLY_SCHEDULE_PATTERN_CREATION_FAILED',
      details,
    );
  }
}

export class WeeklySchedulePatternUpdateFailedException extends CustomException {
  constructor(details?: any) {
    super(
      'Failed to update weekly schedule pattern',
      HttpStatus.BAD_REQUEST,
      'WEEKLY_SCHEDULE_PATTERN_UPDATE_FAILED',
      details,
    );
  }
}

export class WeeklySchedulePatternDeletionFailedException extends CustomException {
  constructor(details?: any) {
    super(
      'Failed to delete weekly schedule pattern',
      HttpStatus.BAD_REQUEST,
      'WEEKLY_SCHEDULE_PATTERN_DELETION_FAILED',
      details,
    );
  }
}

export class InvalidWeeklySchedulePatternDataException extends CustomException {
  constructor(details?: any) {
    super(
      'Invalid weekly schedule pattern data provided',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'INVALID_WEEKLY_SCHEDULE_PATTERN_DATA',
      details,
    );
  }
}
