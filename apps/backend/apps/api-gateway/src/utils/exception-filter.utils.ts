import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { handleError } from '@backend/shared-utils';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Process the exception using handleError
    const httpException = handleError(exception);
    const status = httpException.getStatus();
    const payload = httpException.getResponse() as unknown;

    // Extract message and location from the payload
    const message =
      typeof payload === 'string'
        ? payload
        : (payload as { message?: unknown }).message ?? 'Internal Server Error';
    const location =
      typeof payload === 'object' && payload !== null
        ? (payload as { location?: string }).location
        : undefined;

    // Log the exception details for debugging
    console.error('Exception caught:', {
      status,
      message,
      location,
      exception,
    });

    // Handle RpcException explicitly
    if (exception instanceof RpcException) {
      const rpcError = exception.getError() as {
        code?: number;
        message?: string;
        location?: string;
      };
      if (rpcError) {
        const rpcStatus = rpcError.code || HttpStatus.INTERNAL_SERVER_ERROR;
        const rpcMessage = rpcError.message || 'Internal Server Error';
        const rpcLocation = rpcError.location || 'Unknown';

        response.status(rpcStatus).json({
          statusCode: rpcStatus,
          message: rpcMessage,
          location: rpcLocation,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return;
      }
    }

    // Send the response
    response.status(status).json({
      statusCode: status,
      message: String(message),
      location,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
