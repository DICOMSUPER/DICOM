import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  Camera,
  Clock,
  Cog,
  Database,
  FileText,
  Logs,
  Monitor,
  Search,
  Settings,
  Shield,
  Stethoscope,
  Timer,
  UserCheck,
  Users,
  Building,
  Calendar,
  FolderTree,
  Link2
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
      href: "/admin",
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
      href: "/admin/settings",
      label: "System Settings",
      icon: Settings,
      description: "Configure system settings",
    },
    {
      href: "/admin/departments",
      label: "Departments",
      icon: Building,
      description: "Manage clinic departments and staff",
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
      href: "/admin/shift-templates",
      label: "Shift Templates",
      icon: Clock,
      description: "Manage shift templates",
    },
  ],

  // Reception Staff - Patient registration and queue management
  "Reception Staff": [
    {
      href: "/reception",
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
    // {
    //   href: "/reception/queue",
    //   label: "Queue",
    //   icon: Clock,
    //   description: "Waiting room management",
    // },
    // {
    //   href: "/reception/assignments",
    //   label: "Assignments",
    //   icon: UserCheck,
    //   description: "Patient assignments",
    // },
    {
      href: "/reception/schedule",
      label: "Schedule",
      icon: Clock,
      description: "View your work schedule",
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
      description: "Manage patient queue assignments",
    },
    {
      href: "/physician/imaging-orders",
      label: "Imaging Orders List",
      icon: Logs,
      description: "Patient diagnoses management",
    },
    {
      href: "/physician/diagnosis-report",
      label: "Reports",
      icon: Stethoscope,
      description: "Patient diagnoses management",
    },
    {
      href: "/physician/patient-study",
      label: "Reports",
      icon: Settings,
      description: "View Your Patient Studies",
    },
        {
      href: "/physician/schedule",
      label: "Schedule",
      icon: Clock,
      description: "View your clinical schedule",
    },
  ],

  // Imaging Technician - DICOM and imaging
  "Imaging Technician": [
    {
      href: "/imaging-technician",
      label: "Orders List",
      icon: BarChart3,
      description: "Imaging overview",
    },
    {
      href: "/imaging-technician/order",
      label: "Imaging",
      icon: Camera,
      description: "DICOM image management",
    },
    {
      href: "/imaging-technician/machines",
      label: "Machines",
      icon: Activity,
      description: "Imaging machines status",
    },
    {
      href: "/imaging-technician/schedule",
      label: "Schedule",
      icon: Calendar,
      description: "View your work schedule",
    },
    {
      href: "/imaging-technician/settings",
      label: "Settings",
      icon: Settings,
      description: "Imaging settings",
    },
  ],

  // Radiologist - Medical imaging interpretation
  Radiologist: [
    {
      href: "/radiologist",
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
  ],
};

export function getNavigationForRole(role?: string | null): NavigationItem[] {
  if (!role) return [];
  return roleNavigation[role] || [];
}

export function getAvailableRoles(): string[] {
  return Object.keys(roleNavigation);
}
