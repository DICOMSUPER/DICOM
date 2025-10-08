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
      href: "/patients/registration",
      label: "Register Patient",
      icon: UserCheck,
      description: "Register new patients"
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
      href: "/reception",
      label: "Dashboard",
      icon: BarChart3,
      description: "Daily overview"
    },
    {
      href: "/reception/patients",
      label: "Patients",
      icon: Users,
      description: "Patient registration and search"
    },
    {
      href: "/reception/registration",
      label: "Register Patient",
      icon: UserCheck,
      description: "Register new patients"
    },
    {
      href: "/reception/encounters",
      label: "Encounters",
      icon: Search,
      description: "Search and filter patient encounters"
    },
    {
      href: "/reception/queue",
      label: "Queue",
      icon: Clock,
      description: "Waiting room management"
    },
    {
      href: "/reception/assignments",
      label: "Assignments",
      icon: UserCheck,
      description: "Patient assignments"
    }
  ],

  // Physician - Patient care and medical records
  "Physician": [
    {
      href: "/physicians",
      label: "Dashboard",
      icon: BarChart3,
      description: "Patient overview"
    },
    {
      href: "/physicians/patients",
      label: "My Patients",
      icon: Users,
      description: "Assigned patients"
    },
    {
      href: "/physicians/medical-records",
      label: "Medical Records",
      icon: FileText,
      description: "Patient conditions and records"
    },
    {
      href: "/physicians/diagnoses",
      label: "Diagnoses",
      icon: Stethoscope,
      description: "Patient diagnoses management"
    },
    {
      href: "/physicians/schedule",
      label: "Schedule",
      icon: Clock,
      description: "Appointment schedule"
    },
    {
      href: "/physicians/settings",
      label: "Settings",
      icon: Settings,
      description: "Personal settings"
    }
  ],

  // Image Technician - DICOM and imaging
  "Image Technician": [
    {
      href: "/imaging-technicians",
      label: "Dashboard",
      icon: BarChart3,
      description: "Imaging overview"
    },
    {
      href: "/imaging-technicians/imaging",
      label: "Imaging",
      icon: Camera,
      description: "DICOM image management"
    },
    {
      href: "/imaging-technicians/patients",
      label: "Patients",
      icon: Users,
      description: "Patient imaging records"
    },
    {
      href: "/imaging-technicians/queue",
      label: "Imaging Queue",
      icon: Clock,
      description: "Pending imaging studies"
    },
    {
      href: "/imaging-technicians/equipment",
      label: "Equipment",
      icon: Activity,
      description: "Imaging equipment status"
    },
    {
      href: "/imaging-technicians/settings",
      label: "Settings",
      icon: Settings,
      description: "Imaging settings"
    }
  ],

  // Nurse - Patient care support
  "Nurse": [
    {
      href: "/nurses",
      label: "Dashboard",
      icon: BarChart3,
      description: "Patient care overview"
    },
    {
      href: "/nurses/patients",
      label: "Patients",
      icon: Users,
      description: "Patient care management"
    },
    {
      href: "/nurses/vitals",
      label: "Vitals",
      icon: Activity,
      description: "Patient vital signs"
    },
    {
      href: "/nurses/medications",
      label: "Medications",
      icon: Stethoscope,
      description: "Medication management"
    },
    {
      href: "/nurses/schedule",
      label: "Schedule",
      icon: Clock,
      description: "Care schedule"
    },
    {
      href: "/nurses/settings",
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
