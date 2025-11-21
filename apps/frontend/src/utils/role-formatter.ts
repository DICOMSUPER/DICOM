import { Roles } from "@/enums/user.enum";

/**
 * Formats a role string to a human-readable format
 * @param role - The role string (e.g., 'reception_staff', 'radiologist', etc.)
 * @returns Formatted role string (e.g., 'Reception Staff', 'Radiologist', etc.)
 */
export function formatRole(role?: string | null): string {
  if (!role) return 'Staff';

  // Map role values to formatted display names
  const roleMap: Record<string, string> = {
    'reception_staff': 'Reception Staff',
    'physician': 'Physician',
    'imaging_technician': 'Imaging Technician',
    'radiologist': 'Radiologist',
    'system_admin': 'System Admin',
  };

  // Return mapped value if exists, otherwise format by replacing underscores and capitalizing
  if (roleMap[role.toLowerCase()]) {
    return roleMap[role.toLowerCase()];
  }

  // Fallback: replace underscores with spaces and capitalize words
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Maps Roles enum to navigation role display names
 * Used to convert user role from auth to navigation role keys
 * @param role - The role from Roles enum or string
 * @returns Navigation role display name or undefined if no role
 */
export function getNavigationRoleFromUserRole(role?: Roles | string): string | undefined {
  if (!role) return undefined;
  
  const roleMap: Record<string, string> = {
    [Roles.SYSTEM_ADMIN]: "Administrator",
    [Roles.RECEPTION_STAFF]: "Reception Staff",
    [Roles.PHYSICIAN]: "Physician",
    [Roles.IMAGING_TECHNICIAN]: "Imaging Technician",
    [Roles.RADIOLOGIST]: "Radiologist",
  };
  
  return roleMap[role];
}

