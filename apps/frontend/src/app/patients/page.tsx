"use client";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { PatientToolbar } from "@/components/patients/patient-toolbar";
import { PatientList } from "@/components/patients/patient-list";
import { PatientFilters } from "@/components/patients/patient-filters";
import { useState } from "react";

export default function PatientsPage() {
  const [notificationCount] = useState(3);
  const [currentRole, setCurrentRole] = useState("Physician");

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    console.log("Role changed to:", newRole);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout
        sidebar={<SidebarNav userRole={currentRole} />}
      >
        <div className="flex flex-col gap-6">
          <PatientToolbar />
          <PatientFilters />
          <PatientList />
        </div>
      </WorkspaceLayout>
    </div>
  );
}
