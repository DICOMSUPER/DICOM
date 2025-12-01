import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

// ─────────────────────────────────────────────
// Request Procedure Exceptions (for microservices)
// ─────────────────────────────────────────────

export class RequestProcedureNotFoundException extends RpcException {
  constructor(requestProcedureId?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Request Procedure${requestProcedureId ? ` '${requestProcedureId}'` : ''} not found`,
      errorCode: 'REQUEST_PROCEDURE_NOT_FOUND',
      details: { requestProcedureId },
    });
  }
}

export class RequestProcedureAlreadyExistsException extends RpcException {
  constructor(field: string = 'code', value?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Request Procedure with ${field}${value ? ` '${value}'` : ''} already exists`,
      errorCode: 'REQUEST_PROCEDURE_ALREADY_EXISTS',
      details: { field, value },
    });
  }
}

export class RequestProcedureCreationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Failed to create request procedure',
      errorCode: 'REQUEST_PROCEDURE_CREATION_FAILED',
      details,
    });
  }
}

export class RequestProcedureUpdateFailedException extends RpcException {
  constructor(requestProcedureId?: string, details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Failed to update request procedure${requestProcedureId ? ` '${requestProcedureId}'` : ''}`,
      errorCode: 'REQUEST_PROCEDURE_UPDATE_FAILED',
      details: { requestProcedureId, ...details },
    });
  }
}

export class RequestProcedureDeletionFailedException extends RpcException {
  constructor(requestProcedureId?: string, details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to delete request procedure${requestProcedureId ? ` '${requestProcedureId}'` : ''}`,
      errorCode: 'REQUEST_PROCEDURE_DELETION_FAILED',
      details: { requestProcedureId, ...details },
    });
  }
}
