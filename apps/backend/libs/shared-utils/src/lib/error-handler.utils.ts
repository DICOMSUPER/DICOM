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
    throw new RpcException({
      code: 500,
      message: `${message}: ${error instanceof Error ? error.message : error}`,
      location: location,
    });
  }
};

type ParsedError = {
  code?: number;
  message?: string;
  location?: string;
};

const isParsedError = (e: unknown): e is ParsedError => {
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

  if (isParsedError(error)) {
    return new HttpException(
      {
        message: error.message || 'Internal Server Error',
        location: error.location || 'Unknown',
      },
      error.code || HttpStatus.INTERNAL_SERVER_ERROR
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
      const errObj = errorData as Partial<ParsedError> &
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
        message: 'Internal Server Error',
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
