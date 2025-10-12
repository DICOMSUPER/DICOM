import { getAvailableRoles } from "@/config/navigation";

/**
 * Detects the user role based on the current pathname
 * @param pathname - The current pathname from usePathname()
 * @returns The detected role or "Reception Staff" as default
 */
export function detectRoleFromPath(pathname: string): string {
  // Remove leading slash and split the path
  const segments = pathname.replace(/^\//, '').split('/');
  
  if (segments.length === 0) {
    return "Reception Staff";
  }

  const firstSegment = segments[0];
  
  // Map route prefixes to roles
  const roleMap: Record<string, string> = {
    'reception': 'Reception Staff',
    'physicians': 'Physician',
    'imaging-technicians': 'Image Technician',
    'nurses': 'Nurse',
    'admin': 'Administrator', // Admin routes
    'dashboard': 'Administrator', // Default admin dashboard
    'patients': 'Administrator', // Default admin patients
    'settings': 'Administrator' // Default admin settings
  };

  // Check if the first segment matches a known role
  if (roleMap[firstSegment]) {
    return roleMap[firstSegment];
  }

  // Default to Reception Staff if no role is detected
  return "Reception Staff";
}

/**
 * Gets the available roles for validation
 * @returns Array of available role names
 */
export function getAvailableRoles(): string[] {
  return ["Administrator", "Reception Staff", "Physician", "Image Technician", "Nurse"];
}
