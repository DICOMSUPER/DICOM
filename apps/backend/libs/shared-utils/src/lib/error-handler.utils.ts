import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export const handleErrorFromMicroservices = (
  error: unknown,
  message: string,
  location: string
): RpcException => {
  const logger = new Logger(location);
  logger.error(error);

  //Debug log for error details
  console.log(
    'error handled in the microservice layer',
    error,
    typeof error,
    error instanceof RpcException
  );
  if (error instanceof RpcException) {
    throw error;
  } else {
    const exception = new RpcException({
      code:
        (error as any)?.code > 99 && (error as any)?.code < 1000
          ? (error as any)?.code
          : 500,
      message: `${message}: ${(error as any).message || error}`,
      location: (error as any)?.location || location,
    });
    throw exception;
  }
};

type ParsedMicroserviceError = {
  code?: number;
  statusCode?: number; // Add support for statusCode field
  message?: string;
  location?: string;
};

const isParsedRPCException = (e: unknown): e is ParsedMicroserviceError => {
  return (
    typeof e === 'object' &&
    e !== null &&
    ('code' in (e as Record<string, unknown>) ||
      'statusCode' in (e as Record<string, unknown>) ||
      'message' in (e as Record<string, unknown>) ||
      'location' in (e as Record<string, unknown>))
  );
};

export const handleError = (error: unknown): HttpException => {
  const logger = new Logger('SharedUtils - ErrorHandler');

  logger.error(error);
  // Handle connection errors with string error codes
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errorObj = error as Record<string, unknown>;
    const errorCode = errorObj.code;

    // Map common connection error codes to HTTP status codes
    if (typeof errorCode === 'string') {
      const connectionErrorMap: Record<string, number> = {
        ECONNREFUSED: HttpStatus.SERVICE_UNAVAILABLE,
        ECONNRESET: HttpStatus.SERVICE_UNAVAILABLE,
        ETIMEDOUT: HttpStatus.GATEWAY_TIMEOUT,
        ENOTFOUND: HttpStatus.SERVICE_UNAVAILABLE,
        ENETUNREACH: HttpStatus.SERVICE_UNAVAILABLE,
      };

      if (errorCode in connectionErrorMap) {
        return new HttpException(
          {
            message: errorObj.message || 'Service is temporarily unavailable',
            location:
              (typeof errorObj.location === 'string'
                ? errorObj.location
                : undefined) || 'Unknown',
          },
          connectionErrorMap[errorCode]
        );
      }
    }
  }

  // Check HttpException first before the broader isParsedRPCException check
  if (error instanceof HttpException) {
    return error;
  }

  if (isParsedRPCException(error)) {
    // Check both 'statusCode' and 'code' for compatibility
    const statusCode =
      (typeof error.statusCode === 'number' ? error.statusCode : undefined) ??
      (typeof error.code === 'number' ? error.code : undefined) ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    return new HttpException(
      {
        message: error.message || 'Internal Server Error',
        location: error.location || 'Unknown',
      },
      statusCode
    );
  }

  if (error instanceof RpcException) {
    // Extract the error details from RpcException
    const errorData = error.getError();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let location = 'Unknown';

    if (typeof errorData === 'object' && errorData !== null) {
      const errObj = errorData as Partial<ParsedMicroserviceError> &
        Record<string, unknown>;
      // Check both 'statusCode' and 'code' for compatibility with different RpcException formats
      statusCode =
        (typeof errObj.statusCode === 'number'
          ? errObj.statusCode
          : undefined) ??
        (typeof errObj.code === 'number' ? errObj.code : undefined) ??
        statusCode;
      message =
        (typeof errObj.message === 'string' ? errObj.message : undefined) ??
        message;
      location =
        (typeof errObj.location === 'string' ? errObj.location : undefined) ??
        location;
    }

    return new HttpException({ message, location }, statusCode);
  } else {
    logger.error('Unhandled error has occurred:', error);
    return new HttpException(
      {
        message: (error as Error).message || 'Internal Server Error',
        location: 'Unknown',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

export const ThrowMicroserviceException = (
  code: number,
  message: string,
  location: string
) => {
  console.log('Throw microservices exception', { code, message, location }); //debug for error status
  throw new RpcException({ code, message, location });
};
