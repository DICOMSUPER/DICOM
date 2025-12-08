import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Camera,
  Clock,
  Cog,
  FileText,
  Logs,
  Monitor,
  Search,
  Settings,
  Stethoscope,
  UserCheck,
  Users,
  Building,
  Calendar,
  FolderTree,
  Link2,
  Layers,
  GitPullRequest,
  File,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
}

export interface RoleNavigation {
  [key: string]: NavigationItem[];
}

export const roleNavigation: RoleNavigation = {
  // Administrator - Full system access
  Administrator: [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "System overview and analytics",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      description: "Manage system users and roles",
    },
    {
      href: "/admin/room-assignments",
      label: "Room Assignments",
      icon: UserCheck,
      description: "Assign employees to room schedules",
    },
    {
      href: "/admin/departments",
      label: "Departments",
      icon: Building,
      description: "Manage clinic departments and staff",
    },
    {
      href: "/admin/body-parts",
      label: "Body Parts",
      icon: Layers,
      description: "Manage body parts",
    },
    {
      href: "/admin/imaging-modalities",
      label: "Imaging Modalities",
      icon: Monitor,
      description: "Manage imaging modalities",
    },
    {
      href: "/admin/modality-machines",
      label: "Modality Machines",
      icon: Activity,
      description: "Manage modality machines",
    },
    {
      href: "/admin/rooms",
      label: "Rooms",
      icon: Building2,
      description: "Manage clinic rooms and resources",
    },
    {
      href: "/admin/room-services",
      label: "Room Services",
      icon: Link2,
      description: "Manage room service assignments",
    },
    {
      href: "/admin/services",
      label: "Services",
      icon: Cog,
      description: "Manage clinic services and offerings",
    },
    {
      href: "/admin/procedures",
      label: "Procedures",
      icon: GitPullRequest,
      description: "Manage request procedures and modalities",
    },
    {
      href: "/admin/shift-templates",
      label: "Shift Templates",
      icon: Clock,
      description: "Manage shift templates",
    },
  ],

  // Reception Staff - Patient registration and queue management
  "Reception Staff": [
    {
      href: "/reception/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Daily overview",
    },
    {
      href: "/reception/patients",
      label: "Patients",
      icon: Users,
      description: "Patient registration and search",
    },
    {
      href: "/reception/registration",
      label: "Register Patient",
      icon: UserCheck,
      description: "Register new patients",
    },
    {
      href: "/reception/encounters",
      label: "Encounters",
      icon: Search,
      description: "Search and filter patient encounters",
    },
    {
      href: "/reception/schedule",
      label: "Schedule",
      icon: Clock,
      description: "View your work schedule",
    },
    {
      href: "/reception/notifications",
      label: "Notifications",
      icon: Bell,
      description: "View notification history",
    },
  ],

  // Physician - Patient care and medical records
  Physician: [
    {
      href: "/physician/dashboard",

      label: "Dashboard",
      icon: BarChart3,
      description: "Patient overview",
    },
    {
      href: "/physician/clinic-visit",
      label: "Clinic Visit",

      icon: FileText,
      description: "Manage patient clinic visit",
    },
    {
      href: "/physician/imaging-orders",
      label: "Imaging Orders List",
      icon: Logs,
      description: "Manage patient imaging orders",
    },
    {
      href: "/physician/diagnosis-reports",
      label: "Diagnosis Reports",
      icon: Stethoscope,
      description: "Manage patient diagnosis reports",
    },
    {
      href: "/physician/patient-study",
      label: "Patient Studies",
      icon: Settings,
      description: "View your patient studies",
    },
    {
      href: "/physician/schedule",
      label: "Schedule",
      icon: Clock,
      description: "View your clinical schedule",
    },
    {
      href: "/physician/notifications",
      label: "Notifications",
      icon: Bell,
      description: "View notification history",
    },
  ],

  // Imaging Technician - DICOM and imaging
  "Imaging Technician": [
    {
      href: "/imaging-technician/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Daily overview",
    },
    {
      href: "/imaging-technician/imaging-orders",
      label: "Imaging Orders",
      icon: Camera,
      description: "Manage imaging orders",
    },
    {
      href: "/imaging-technician/order-details",
      label: "Order Details",
      icon: File,
      description: "View and manage DICOM studies",
    },
    {
      href: "/imaging-technician/modality-machines",
      label: "Modality Machines",
      icon: Activity,
      description: "Manage modality machines",
    },
    {
      href: "/imaging-technician/schedule",
      label: "Schedule",
      icon: Calendar,
      description: "View your work schedule",
    },
    {
      href: "/imaging-technician/notifications",
      label: "Notifications",
      icon: Bell,
      description: "View notification history",
    },
  ],

  // Radiologist - Medical imaging interpretation
  Radiologist: [
    {
      href: "/radiologist/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Clinical overview",
    },
    {
      href: "/radiologist/work-tree",
      label: "Work Tree",
      icon: FolderTree,
      description: "View imaging studies by modality and machine",
    },
    {
      href: "/radiologist/schedule",
      label: "Schedule",
      icon: Clock,
      description: "View your clinical schedule",
    },
    {
      href: "/radiologist/notifications",
      label: "Notifications",
      icon: Bell,
      description: "View notification history",
    },
  ],
};

export function getNavigationForRole(role?: string | null): NavigationItem[] {
  if (!role) return [];
  return roleNavigation[role] || [];
}

export function getAvailableRoles(): string[] {
  return Object.keys(roleNavigation);
}
