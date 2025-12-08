import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
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

        const errResponse: StandardResponse<null> = {
          success: false,
          data: null,
          statusCode:
            (error as any)?.status ||
            payloadCode ||
            (error as any)?.statusCode ||
            500,
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

        return throwError(() => errResponse);
      })
    );
  }
}
