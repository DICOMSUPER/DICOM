import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';


export class DepartmentNotFoundException extends RpcException {
  constructor(message: string = 'Department not found') {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'DEPARTMENT_NOT_FOUND',
    });
  }
}


export class DepartmentAlreadyExistsException extends RpcException {
  constructor(message: string = 'Department code already exists') {
    super({
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'DEPARTMENT_ALREADY_EXISTS',
    });
  }
}


export class DepartmentCreationFailedException extends RpcException {
  constructor(message: string = 'Failed to create department') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'DEPARTMENT_CREATION_FAILED',
    });
  }
}

export class DepartmentUpdateFailedException extends RpcException {
  constructor(message: string = 'Failed to update department') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'DEPARTMENT_UPDATE_FAILED',
    });
  }
}

/**
 * Khi xóa phòng ban thất bại
 */
export class DepartmentDeletionFailedException extends RpcException {
  constructor(message: string = 'Failed to delete department') {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'DEPARTMENT_DELETION_FAILED',
    });
  }
}
