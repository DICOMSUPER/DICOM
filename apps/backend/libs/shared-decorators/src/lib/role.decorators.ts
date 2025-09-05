// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '@backend/shared-enums';

export const ROLES_KEY = RoleEnum;
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
