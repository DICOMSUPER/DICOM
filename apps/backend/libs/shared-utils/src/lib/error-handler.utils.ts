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

export const handleError = (error: unknown) => {
  const logger = new Logger('SharedUtils - ErrorHandler');
  if (error instanceof HttpException) {
    throw error;
  }
  if (error instanceof RpcException) {
    throw new HttpException(
      error?.message || 'Internal Server Error',
      (error as any)?.code || HttpStatus.INTERNAL_SERVER_ERROR
    );
  } else {
    logger.error('Unhandled error has occured:', error);
    throw new HttpException(
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};
