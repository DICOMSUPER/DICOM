import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export class WeeklySchedulePatternNotFoundException extends RpcException {
  constructor(message: string = 'Weekly schedule pattern not found') {
    super({
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'WEEKLY_SCHEDULE_PATTERN_NOT_FOUND',
    });
  }
}

export class WeeklySchedulePatternAlreadyExistsException extends RpcException {
  constructor(message: string = 'Weekly schedule pattern already exists') {
    super({
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'WEEKLY_SCHEDULE_PATTERN_ALREADY_EXISTS',
    });
  }
}

export class WeeklySchedulePatternCreationFailedException extends RpcException {
  constructor(message: string = 'Failed to create weekly schedule pattern') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'WEEKLY_SCHEDULE_PATTERN_CREATION_FAILED',
    });
  }
}

export class WeeklySchedulePatternUpdateFailedException extends RpcException {
  constructor(message: string = 'Failed to update weekly schedule pattern') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'WEEKLY_SCHEDULE_PATTERN_UPDATE_FAILED',
    });
  }
}

export class WeeklySchedulePatternDeletionFailedException extends RpcException {
  constructor(message: string = 'Failed to delete weekly schedule pattern') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'WEEKLY_SCHEDULE_PATTERN_DELETION_FAILED',
    });
  }
}

export class InvalidWeeklySchedulePatternDataException extends RpcException {
  constructor(message: string = 'Invalid weekly schedule pattern data provided') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'INVALID_WEEKLY_SCHEDULE_PATTERN_DATA',
    });
  }
}

