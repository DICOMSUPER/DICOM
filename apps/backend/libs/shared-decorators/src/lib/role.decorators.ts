// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Roles as RoleEnums} from '@backend/shared-enums';

export const ROLES_KEY = RoleEnums;
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
