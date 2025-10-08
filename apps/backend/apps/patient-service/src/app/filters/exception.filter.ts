import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { 
  ErrorResponseDto,
  NotFoundErrorResponseDto,
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  InternalServerErrorResponseDto
} from '@backend/shared-domain';

@Catch()
export class PatientServiceExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('PatientServiceExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let errorResponse: ErrorResponseDto;

    if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, request.url);
    } else if (exception instanceof RpcException) {
      errorResponse = this.handleRpcException(exception, request.url);
    } else {
      errorResponse = this.handleUnknownException(exception, request.url);
    }

    this.logger.error(
      `Exception caught: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(errorResponse.statusCode || 500).json(errorResponse);
  }

  private handleHttpException(exception: HttpException, path: string): ErrorResponseDto {
    const status = exception.getStatus();
    const response = exception.getResponse();
    
    let message = 'An error occurred';
    let errors: Record<string, string[]> | undefined;

    if (typeof response === 'string') {
      message = response;
    } else if (typeof response === 'object' && response !== null) {
      const errorObj = response as any;
      message = errorObj.message || errorObj.error || message;
      errors = errorObj.errors;
    }

    switch (status) {
      case HttpStatus.NOT_FOUND:
        return new NotFoundErrorResponseDto('Resource', undefined, path);
      
      case HttpStatus.UNAUTHORIZED:
        return new UnauthorizedErrorResponseDto(message, path);
      
      case HttpStatus.FORBIDDEN:
        return new ForbiddenErrorResponseDto(message, path);
      
      case HttpStatus.BAD_REQUEST:
        return new ValidationErrorResponseDto(message, errors, path);
      
      default:
        return new ErrorResponseDto(message, status, 'HttpException', path);
    }
  }

  private handleRpcException(exception: RpcException, path: string): ErrorResponseDto {
    const error = exception.getError();
    
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      const code = errorObj.code || 500;
      const message = errorObj.message || 'Microservice error';
      const location = errorObj.location || 'Microservice';

      return new ErrorResponseDto(message, code, location, path);
    }

    return new InternalServerErrorResponseDto(
      typeof error === 'string' ? error : 'Microservice error',
      'RpcException',
      path
    );
  }

  private handleUnknownException(exception: unknown, path: string): ErrorResponseDto {
    const message = exception instanceof Error 
      ? exception.message 
      : 'Unknown error occurred';

    return new InternalServerErrorResponseDto(message, 'Unknown', path);
  }
}
