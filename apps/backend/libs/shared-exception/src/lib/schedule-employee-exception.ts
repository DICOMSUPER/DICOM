import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';


export class EmployeeScheduleNotFoundException extends RpcException {
  constructor(message: string = 'Employee schedule not found') {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'EMPLOYEE_SCHEDULE_NOT_FOUND',
    });
  }
}


export class EmployeeScheduleAlreadyExistsException extends RpcException {
  constructor(message: string = 'Employee schedule already exists') {
    super({
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'EMPLOYEE_SCHEDULE_ALREADY_EXISTS',
    });
  }
}

export class InvalidEmployeeScheduleDataException extends RpcException {
  constructor(message: string = 'Invalid employee schedule data') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'INVALID_EMPLOYEE_SCHEDULE_DATA',
    });
  }
}

export class EmployeeScheduleForbiddenException extends RpcException {
  constructor(message: string = 'Access forbidden to employee schedule') {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message,
      error: 'EMPLOYEE_SCHEDULE_FORBIDDEN',
    });
  }
}


export class EmployeeScheduleInternalErrorException extends RpcException {
  constructor(message: string = 'Internal server error while processing employee schedule') {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'EMPLOYEE_SCHEDULE_INTERNAL_ERROR',
    });
  }
}


export class EmployeeScheduleCreationFailedException extends RpcException {
  constructor(message: string = 'Failed to create employee schedule') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'EMPLOYEE_SCHEDULE_CREATION_FAILED',
    });
  }
}

export class EmployeeScheduleUpdateFailedException extends RpcException {
  constructor(message: string = 'Failed to update employee schedule') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'EMPLOYEE_SCHEDULE_UPDATE_FAILED',
    });
  }
}

export class EmployeeScheduleDeletionFailedException extends RpcException {
  constructor(message: string = 'Failed to delete employee schedule') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'EMPLOYEE_SCHEDULE_DELETION_FAILED',
    });
  }
}
