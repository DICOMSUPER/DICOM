import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Các import này nên trỏ vào cùng lib shared-exception
import {
  isCustomException,
  getErrorCode,
} from './custom-exceptions';

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
    correlationId?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      this.generateCorrelationId();

    const { statusCode, errorCode, message, details } =
      this.getErrorDetails(exception);

    this.logError(exception, request, correlationId, statusCode);

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      statusCode,
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        correlationId,
      },
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorDetails(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string;
    details?: any;
  } {
    if (isCustomException(exception)) {
      return {
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as any;

      return {
        statusCode: status,
        errorCode: getErrorCode(exception),
        message: response?.message || exception.message,
        details: response?.details || null,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: exception.message || 'An unexpected error occurred',
        details:
          process.env.NODE_ENV === 'development' ? exception.stack : null,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: exception,
    };
  }

  private logError(
    exception: unknown,
    request: Request,
    correlationId: string,
    statusCode: number,
  ): void {
    const logData = {
      correlationId,
      method: request.method,
      url: request.url,
      statusCode,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: (request as any).user?.id,
      error:
        exception instanceof Error
          ? {
            name: exception.name,
            message: exception.message,
            stack: exception.stack,
          }
          : exception,
    };

    if (statusCode >= 500) {
      this.logger.error('Server Error', logData);
    } else if (statusCode >= 400) {
      this.logger.warn('Client Error', logData);
    } else {
      this.logger.log('Other Error', logData);
    }
  }

  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
