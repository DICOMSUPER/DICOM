import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = ctx.switchToHttp().getRequest();
    console.log('User in RolesGuard:', user);

    if (!user?.role)
      throw new ForbiddenException('Bạn không có quyền truy cập');

    const roles = Array.isArray(user.role) ? user.role : [user.role];
     if (roles.some((r: string) => requiredRoles.includes(r))) return true;

    throw new ForbiddenException('Bạn không có quyền truy cập');
  }
}
