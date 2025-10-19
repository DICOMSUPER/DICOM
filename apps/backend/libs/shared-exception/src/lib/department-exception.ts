import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

// ─────────────────────────────────────────────
// Department Exceptions (for microservices)
// ─────────────────────────────────────────────

export class DepartmentNotFoundException extends RpcException {
  constructor(departmentId?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Department${departmentId ? ` '${departmentId}'` : ''} not found`,
      errorCode: 'DEPARTMENT_NOT_FOUND',
      details: { departmentId },
    });
  }
}

export class DepartmentAlreadyExistsException extends RpcException {
  constructor(field: string = 'code', value?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Department with ${field}${value ? ` '${value}'` : ''} already exists`,
      errorCode: 'DEPARTMENT_ALREADY_EXISTS',
      details: { field, value },
    });
  }
}

export class DepartmentCreationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Failed to create department',
      errorCode: 'DEPARTMENT_CREATION_FAILED',
      details,
    });
  }
}

export class DepartmentUpdateFailedException extends RpcException {
  constructor(departmentId?: string, details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Failed to update department${departmentId ? ` '${departmentId}'` : ''}`,
      errorCode: 'DEPARTMENT_UPDATE_FAILED',
      details: { departmentId, ...details },
    });
  }
}

export class DepartmentDeletionFailedException extends RpcException {
  constructor(departmentId?: string, details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to delete department${departmentId ? ` '${departmentId}'` : ''}`,
      errorCode: 'DEPARTMENT_DELETION_FAILED',
      details: { departmentId, ...details },
    });
  }
}
