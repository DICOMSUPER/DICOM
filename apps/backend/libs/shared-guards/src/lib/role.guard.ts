import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { Roles } from '@backend/shared-enums';
import { ROLES_KEY } from '@backend/shared-decorators';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context
      .switchToHttp()
      .getRequest<Request | IAuthenticatedRequest>();
    const user = (request as IAuthenticatedRequest)?.userInfo as
      | { userId: string; role: string }
      | undefined;

    // Check if user exists (set by AuthGuard)
    if (!user || !user.role) {
      throw new RpcException({
        message: 'User or role not found in request',
        code: 401,
        location: 'RoleGuard',
      });
    }

    // Check if user's role is in the allowedRoles array
    const hasRole = allowedRoles.includes(user.role as Roles);

    if (!hasRole) {
      throw new RpcException({
        message: `User role '${user.role}' is not authorized for this resource`,
        code: 403,
        location: 'RoleGuard',
      });
    }

    return true;
  }
}
