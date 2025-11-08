import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

// ─────────────────────────────────────────────
// EMPLOYEE SCHEDULE EXCEPTIONS
// ─────────────────────────────────────────────

export class RoomScheduleNotFoundException extends RpcException {
  constructor(scheduleId?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Employee schedule${scheduleId ? ` '${scheduleId}'` : ''} not found`,
      errorCode: 'EMPLOYEE_SCHEDULE_NOT_FOUND',
      details: { scheduleId },
    });
  }
}

export class RoomScheduleAlreadyExistsException extends RpcException {
  constructor(employeeId?: string, date?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Employee schedule for employee${employeeId ? ` '${employeeId}'` : ''} already exists on ${date || 'this date'}`,
      errorCode: 'EMPLOYEE_SCHEDULE_ALREADY_EXISTS',
      details: { employeeId, date },
    });
  }
}

export class InvalidRoomScheduleDataException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid employee schedule data',
      errorCode: 'INVALID_EMPLOYEE_SCHEDULE_DATA',
      details,
    });
  }
}

export class RoomScheduleForbiddenException extends RpcException {
  constructor(employeeId?: string) {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message: `Access forbidden to employee schedule${employeeId ? ` '${employeeId}'` : ''}`,
      errorCode: 'EMPLOYEE_SCHEDULE_FORBIDDEN',
      details: { employeeId },
    });
  }
}

export class RoomScheduleInternalErrorException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error while processing employee schedule',
      errorCode: 'EMPLOYEE_SCHEDULE_INTERNAL_ERROR',
      details,
    });
  }
}

export class RoomScheduleCreationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Failed to create employee schedule',
      errorCode: 'EMPLOYEE_SCHEDULE_CREATION_FAILED',
      details,
    });
  }
}

export class RoomScheduleUpdateFailedException extends RpcException {
  constructor(scheduleId?: string, details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Failed to update employee schedule${scheduleId ? ` '${scheduleId}'` : ''}`,
      errorCode: 'EMPLOYEE_SCHEDULE_UPDATE_FAILED',
      details: { scheduleId, ...details },
    });
  }
}

export class RoomScheduleDeletionFailedException extends RpcException {
  constructor(scheduleId?: string, details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to delete employee schedule${scheduleId ? ` '${scheduleId}'` : ''}`,
      errorCode: 'EMPLOYEE_SCHEDULE_DELETION_FAILED',
      details: { scheduleId, ...details },
    });
  }
}
