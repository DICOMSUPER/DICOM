import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface StandardResponse<T> {
  success: boolean;
  data: T | null;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  traceId: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<T>> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse();
    const traceId = uuidv4();

    const path = request.url;
    const method = request.method;
    const startTime = Date.now();

    return next.handle().pipe(
      map((data: any) => {
        const duration = Date.now() - startTime;

        const message =
          typeof data === 'object' && data !== null && data?.message
            ? data.message
            : 'Success';

        const payload =
          typeof data === 'object' && data !== null && 'message' in data
            ? Object.fromEntries(
                Object.entries(data).filter(([k]) => k !== 'message')
              )
            : data;

        const result: StandardResponse<T> = {
          success: true,
          data: payload ?? null,
          statusCode: response.statusCode ?? 200,
          message,
          timestamp: new Date().toISOString(),
          path,
          method,
          traceId,
        };

        this.logger.log(
          `[${method}] ${path} - ${response.statusCode} (${duration}ms) traceId=${traceId}`
        );

        return result;
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        // Unwrap RPC/microservice error payloads so status/message are meaningful
        const rpcPayload =
          (error as any)?.response ||
          (error as any)?.message ||
          (error as any)?.error;
        const payloadCode =
          (rpcPayload as any)?.code ||
          (rpcPayload as any)?.statusCode ||
          (rpcPayload as any)?.status;
        const payloadMessage =
          typeof rpcPayload === 'string'
            ? rpcPayload
            : (rpcPayload as any)?.message || (error as any)?.message;

        const payloadLocation =
          typeof (rpcPayload as any)?.location === 'string'
            ? (rpcPayload as any)?.location
            : undefined;

        // Map common database error codes to HTTP status
        const mapDbCodeToHttp = (code: unknown): number => {
          switch (code) {
            case '23505': // unique_violation
              return HttpStatus.CONFLICT;
            case '23503': // foreign_key_violation
              return HttpStatus.BAD_REQUEST;
            case '22P02': // invalid_text_representation
              return HttpStatus.BAD_REQUEST;
            default:
              return HttpStatus.INTERNAL_SERVER_ERROR;
          }
        };

        // If upstream already threw HttpException/RpcException, bubble it up
        if (error instanceof HttpException || error instanceof RpcException) {
          return throwError(() => error);
        }

        console.log('Error details in transform.interceptor.ts:', {
          error,
          rpcPayload,
          payloadCode,
          payloadMessage,
          payloadLocation,
        });

        const rawStatus =
          (error as any)?.code ||
          (error as any)?.status ||
          payloadCode ||
          (error as any)?.statusCode;

        const statusCode = (() => {
          if (typeof rawStatus === 'number') return rawStatus;
          if (typeof rawStatus === 'string') {
            const numeric = Number(rawStatus);
            if (!Number.isNaN(numeric)) return numeric;
            return mapDbCodeToHttp(rawStatus);
          }
          return HttpStatus.INTERNAL_SERVER_ERROR;
        })();

        const errResponse: StandardResponse<null> = {
          success: false,
          data: null,
          statusCode,
          message: payloadMessage || 'Internal Server Error',
          timestamp: new Date().toISOString(),
          path,
          method,
          traceId,
        };

        this.logger.error(
          `[${method}] ${path} - ${errResponse.statusCode} (${duration}ms) traceId=${traceId}`,
          (error as any)?.stack
        );

        // Re-throw as HttpException so global filters can map status correctly
        const httpError = new HttpException(
          {
            message: errResponse.message,
            location: payloadLocation,
            traceId,
            path,
            method,
          },
          statusCode
        );

        return throwError(() => httpError);
      })
    );
  }
}
