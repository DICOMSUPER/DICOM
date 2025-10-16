import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { Roles } from '@backend/shared-enums';
import { ROLES_KEY, IS_PUBLIC_KEY } from '@backend/shared-decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ✅ Nếu route có @Public() → bỏ qua kiểm tra role
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // ✅ Lấy danh sách role được phép
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu route không yêu cầu role cụ thể, cho phép qua
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request | IAuthenticatedRequest>();
    const user = (request as IAuthenticatedRequest)?.userInfo as
      | { userId: string; role: string }
      | undefined;

    // ❌ Nếu chưa login hoặc không có userInfo
    if (!user || !user.role) {
      throw new RpcException({
        message: 'User or role not found in request',
        code: 401,
        location: 'RoleGuard',
      });
    }

    // ❌ Nếu role không được phép
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