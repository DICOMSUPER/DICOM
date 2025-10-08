import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  SuccessResponseDto, 
  PaginatedApiResponseDto,
  HealthCheckResponseDto 
} from '@backend/shared-domain';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Skip wrapping for health checks
        if (this.isHealthCheck(context)) {
          return data;
        }

        // Skip wrapping if data is already wrapped
        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        // Handle paginated responses
        if (this.isPaginatedResponse(data)) {
          return new PaginatedApiResponseDto(
            'Data retrieved successfully',
            data.data,
            {
              total: data.total,
              page: data.page,
              limit: data.limit || 10,
              totalPages: data.totalPages,
              hasNextPage: data.hasNextPage,
              hasPreviousPage: data.hasPreviousPage,
            }
          );
        }

        // Handle array responses
        if (Array.isArray(data)) {
          return new SuccessResponseDto(
            'Data retrieved successfully',
            data
          );
        }

        // Handle single object responses
        if (data && typeof data === 'object') {
          return new SuccessResponseDto(
            'Operation completed successfully',
            data
          );
        }

        // Handle primitive responses
        return new SuccessResponseDto(
          'Operation completed successfully',
          data
        );
      })
    );
  }

  private isHealthCheck(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const className = context.getClass().name;
    return (
      className === 'AppController' &&
      (handler.name === 'getData' || handler.name === 'checkHealth')
    );
  }

  private isAlreadyWrapped(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'message' in data &&
      'timestamp' in data
    );
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'total' in data &&
      'page' in data &&
      'totalPages' in data
    );
  }
}
