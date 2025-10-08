import { SetMetadata, BadRequestException } from '@nestjs/common';
import {Roles } from '@backend/shared-enums';

export const ROLES_KEY = 'roles';

export const Role1s = (...roles: Roles[]) => {
  const allRoles = Object.values(Roles);
  const invalidRoles = roles.filter((role) => !allRoles.includes(role));
  if (invalidRoles.length > 0) {
    throw new BadRequestException(
      `Invalid role(s): ${invalidRoles.join(', ')}`,
    );
  }

  return SetMetadata(ROLES_KEY, roles);
};
