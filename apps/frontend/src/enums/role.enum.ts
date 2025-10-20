export enum UserRole {
  RECEPTION_STAFF = "reception_staff",
  PHYSICIAN = "physician", 
  IMAGING_TECHNICIAN = "imaging_technician",
  SYSTEM_ADMIN = "system_admin",
  RADIOLOGIST = "radiologist",
}

export const ROLE_LABELS = {
  [UserRole.RECEPTION_STAFF]: "Reception Staff",
  [UserRole.PHYSICIAN]: "Physician",
  [UserRole.IMAGING_TECHNICIAN]: "Imaging Technician", 
  [UserRole.SYSTEM_ADMIN]: "System Admin",
  [UserRole.RADIOLOGIST]: "Radiologist",
} as const;

export const ROLE_OPTIONS = Object.values(UserRole).map(role => ({
  value: role,
  label: ROLE_LABELS[role],
}));
