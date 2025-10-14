"use client";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { PatientToolbar } from "@/components/patients/patient-toolbar";
import { PatientList } from "@/components/patients/patient-list";
import { PatientFilters } from "@/components/patients/patient-filters";
import { useState } from "react";

export default function PatientsPage() {
  const [notificationCount] = useState(3);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout
        sidebar={<SidebarNav />}
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
