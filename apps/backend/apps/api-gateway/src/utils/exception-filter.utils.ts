import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { handleError } from '@backend/shared-utils';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const httpException = handleError(exception);
    const status = httpException.getStatus();
    const payload = httpException.getResponse() as unknown;
    const message =
      typeof payload === 'string'
        ? payload
        : (payload as { message?: unknown }).message ?? 'Internal Server Error';
    const location =
      typeof payload === 'object' && payload !== null
        ? (payload as { location?: string }).location
        : undefined;

    response.status(status).json({
      statusCode: status,
      message: String(message),
      location,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
