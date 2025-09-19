import { 
  BarChart3,
  Users,
  Clock,
  UserCheck,
  Settings,
  Stethoscope,
  Camera,
  FileText,
  Search,
  Bell,
  Database,
  Shield,
  Activity
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
  "Administrator": [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "System overview and analytics"
    },
    {
      href: "/patients",
      label: "Patient Management",
      icon: Users,
      description: "Manage all patients"
    },
    {
      href: "/queue",
      label: "Queue Management",
      icon: Clock,
      description: "Monitor waiting queues"
    },
    {
      href: "/assignments",
      label: "Staff Assignments",
      icon: UserCheck,
      description: "Manage staff schedules"
    },
    {
      href: "/reports",
      label: "Reports",
      icon: FileText,
      description: "Generate system reports"
    },
    {
      href: "/settings",
      label: "System Settings",
      icon: Settings,
      description: "Configure system settings"
    }
  ],

  // Reception Staff - Patient registration and queue management
  "Reception Staff": [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Daily overview"
    },
    {
      href: "/reception",
      label: "Patients",
      icon: Users,
      description: "Patient registration and search"
    },
    {
      href: "/queue",
      label: "Queue",
      icon: Clock,
      description: "Waiting room management"
    },
    {
      href: "/assignments",
      label: "Assignments",
      icon: UserCheck,
      description: "Patient assignments"
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      description: "Personal settings"
    }
  ],

  // Physician - Patient care and medical records
  "Physician": [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Patient overview"
    },
    {
      href: "/patients",
      label: "My Patients",
      icon: Users,
      description: "Assigned patients"
    },
    {
      href: "/medical-records",
      label: "Medical Records",
      icon: FileText,
      description: "Patient conditions and records"
    },
    {
      href: "/diagnosis",
      label: "Diagnosis",
      icon: Stethoscope,
      description: "Diagnostic tools"
    },
    {
      href: "/schedule",
      label: "Schedule",
      icon: Clock,
      description: "Appointment schedule"
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      description: "Personal settings"
    }
  ],

  // Image Technician - DICOM and imaging
  "Image Technician": [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Imaging overview"
    },
    {
      href: "/imaging",
      label: "Imaging",
      icon: Camera,
      description: "DICOM image management"
    },
    {
      href: "/patients",
      label: "Patients",
      icon: Users,
      description: "Patient imaging records"
    },
    {
      href: "/queue",
      label: "Imaging Queue",
      icon: Clock,
      description: "Pending imaging studies"
    },
    {
      href: "/equipment",
      label: "Equipment",
      icon: Activity,
      description: "Imaging equipment status"
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      description: "Imaging settings"
    }
  ],

  // Nurse - Patient care support
  "Nurse": [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Patient care overview"
    },
    {
      href: "/patients",
      label: "Patients",
      icon: Users,
      description: "Patient care management"
    },
    {
      href: "/vitals",
      label: "Vitals",
      icon: Activity,
      description: "Patient vital signs"
    },
    {
      href: "/medications",
      label: "Medications",
      icon: Stethoscope,
      description: "Medication management"
    },
    {
      href: "/schedule",
      label: "Schedule",
      icon: Clock,
      description: "Care schedule"
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      description: "Personal settings"
    }
  ]
};

export function getNavigationForRole(role: string): NavigationItem[] {
  return roleNavigation[role] || roleNavigation["Reception Staff"];
}

export function getAvailableRoles(): string[] {
  return Object.keys(roleNavigation);
}
