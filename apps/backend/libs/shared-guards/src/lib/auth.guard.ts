import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, catchError, map } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { IS_PUBLIC_KEY } from '@backend/shared-decorators';
import { Reflector } from '@nestjs/core';


const logger = new Logger('AuthGuard');
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('USER_SERVICE') private readonly authClient: ClientProxy
  ) { }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromRequest(request);

    if (!accessToken) {
      throw new RpcException({
        message: 'Missing or invalid Authorization header',
        code: 401,
        location: 'AuthGuard',
      });
    }

    return this.verifyToken(accessToken, request);
  }

  private verifyToken(accessToken: string, request: any): Observable<boolean> {
    return this.authClient
      .send<{ userId: string; role: string }>('user.verify-token', {
        token: accessToken,
      })
      .pipe(
        map((payload) => {
          logger.log(`Handling token for userId: ${payload.userId}`);
          request['userInfo'] = payload; // { userId, role }
          return true;
        }),
        catchError((error) => {
          logger.error('Token verification failed:', error);

          // Handle connection errors specifically
          if (
            error.message === 'Connection closed' ||
            error.code === 'ECONNREFUSED'
          ) {
            throw new RpcException({
              message:
                'Authentication service is unavailable. Please try again later.',
              code: 503,
              location: 'AuthGuard',
            });
          }

          throw new RpcException({
            message: error.message || 'Invalid access token',
            code: 401,
            location: 'AuthGuard',
          });
        })
      );
  }

  private extractTokenFromRequest(request: any): string | null {
    // Priority 1: Authorization header (preferred for Swagger)
    const authHeader = request.headers?.authorization;

    if (authHeader) {
      const [type, token] = authHeader.split(' ');

      if (type === 'Bearer' && token) {
        logger.log('Handling token from header');
        return token;
      }
    }

    // Priority 2: Cookies (fallback for browser requests)
    const cookies = request.headers?.cookie;

    if (cookies) {
      const cookiePairs = cookies.split(';').map((pair: string) => pair.trim());
      for (const pair of cookiePairs) {
        const [name, value] = pair.split('=');
        if (name === 'accessToken' && value) {
          logger.log('Handling token from cookies');
          return decodeURIComponent(value); // Decode in case it's URL encoded
        }
      }
    }

    Logger.error('No valid token found');
    return null;
  }
}
