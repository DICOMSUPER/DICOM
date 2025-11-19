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
  Building
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
      label: "User Management",
      icon: Users,
      description: "Manage system users and roles",
    },
    {
      href: "/admin/schedule",
      label: "Schedule Management",
      icon: Clock,
      description: "Manage staff schedules and assignments",
    },
    {
      href: "/admin/working-hours",
      label: "Working Hours",
      icon: Timer,
      description: "Configure clinic working hours and break times",
    },
    {
      href: "/admin/settings",
      label: "System Settings",
      icon: Settings,
      description: "Configure system settings",
    },
    {
      href: "/admin/service",
      label: "Service Management",
      icon: Cog,
      description: "Manage clinic services and offerings",
    },
    {
      href: "/admin/reports",
      label: "Analytics & Reports",
      icon: FileText,
      description: "Generate system reports",
    },
    {
      href: "/admin/security",
      label: "Security & Audit",
      icon: Shield,
      description: "Monitor security and audit logs",
    },
    {
      href: "/admin/database",
      label: "Database Management",
      icon: Database,
      description: "Manage database and backups",
    },
    {
      href: "/admin/docs",
      label: "Documentation",
      icon: BookOpen,
      description: "System documentation and guides",
    },
    {
      href: "/admin/monitoring",
      label: "System Monitoring",
      icon: Monitor,
      description: "Monitor system performance",
    },
    {
      href: "/admin/rooms",
      label: "Rooms Management",
      icon: Building2,
      description: "Manage clinic rooms and resources",
    },
    {
      href: "/admin/departments",
      label: "Departments Management",
      icon: Building,
      description: "Manage clinic departments and staff",
    },
    {
      href: "/admin/room-assignments",
      label: "Room Assignments",
      icon: UserCheck,
      description: "Assign employees to room schedules",
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
      label: "Diagnosis Reports",
      icon: Stethoscope,
      description: "Patient diagnoses management",
    },
    {
      href: "/physician/schedule",
      label: "Schedule",
      icon: Clock,
      description: "View your clinical schedule",
    },
    {
      href: "/physician/settings",
      label: "Settings",
      icon: Settings,
      description: "Personal settings",
    },
  ],

  // Image Technician - DICOM and imaging
  "Image Technician": [
    {
      href: "/imaging-technician",
      label: "Dashboard",
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
      href: "/imaging-technician/settings",
      label: "Settings",
      icon: Settings,
      description: "Imaging settings",
    },
  ],

  // Nurse - Patient care support
  Nurse: [
    {
      href: "/nurses",
      label: "Dashboard",
      icon: BarChart3,
      description: "Patient care overview",
    },
    {
      href: "/nurses/patients",
      label: "Patients",
      icon: Users,
      description: "Patient care management",
    },
    {
      href: "/nurses/vitals",
      label: "Vitals",
      icon: Activity,
      description: "Patient vital signs",
    },
    {
      href: "/nurses/medications",
      label: "Medications",
      icon: Stethoscope,
      description: "Medication management",
    },
    {
      href: "/nurses/schedule",
      label: "Schedule",
      icon: Clock,
      description: "Care schedule",
    },
    {
      href: "/nurses/settings",
      label: "Settings",
      icon: Settings,
      description: "Personal settings",
    },
  ],
};

export function getNavigationForRole(role: string): NavigationItem[] {
  return roleNavigation[role] || roleNavigation["Reception Staff"];
}

export function getAvailableRoles(): string[] {
  return Object.keys(roleNavigation);
}
