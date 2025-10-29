import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export const handleErrorFromMicroservices = (
  error: unknown,
  message: string,
  location: string
): RpcException => {
  const logger = new Logger(location);
  logger.error(error);
  if (error instanceof RpcException) {
    throw error;
  } else {
    const exception = new RpcException({
      code: 500,
      message: `${message}: ${(error as Error).message || error}`,
      location: location,
    });
    throw exception;
  }
};

type ParsedMicroserviceError = {
  code?: number;
  message?: string;
  location?: string;
};

const isParsedRPCException = (e: unknown): e is ParsedMicroserviceError => {
  return (
    typeof e === 'object' &&
    e !== null &&
    ('code' in (e as Record<string, unknown>) ||
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

  if (isParsedRPCException(error)) {
    // Ensure code is a valid number, otherwise use default status
    const statusCode =
      typeof error.code === 'number'
        ? error.code
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return new HttpException(
      {
        message: error.message || 'Internal Server Error',
        location: error.location || 'Unknown',
      },
      statusCode
    );
  }
  if (error instanceof HttpException) {
    return error;
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
      statusCode =
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
  throw new RpcException({ code, message, location });
};
