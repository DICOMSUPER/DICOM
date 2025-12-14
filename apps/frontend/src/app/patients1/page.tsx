"use client";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { PatientToolbar } from "@/components/patients/patient-toolbar";
import { PatientList } from "@/components/patients/patient-list";
import { PatientFilters } from "@/components/patients/patient-filters";
import { AppHeader } from "@/components/app-header";
import { useState } from "react";
import { useLogout } from "@/common/hooks/use-logout";
import { NotificationProvider } from "@/common/contexts/NotificationContext";

export default function PatientsPage() {
  const [notificationCount] = useState(3);
  const { logout: triggerLogout, isLoggingOut } = useLogout();

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    triggerLogout();
  };

  return (
    <NotificationProvider>
      {" "}
      <div className="min-h-screen bg-background">
        {/* App Header */}
        <AppHeader
          notificationCount={notificationCount}
          onNotificationClick={handleNotificationClick}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        {/* Workspace Layout */}
        <WorkspaceLayout sidebar={<SidebarNav />}>
          <div className="flex flex-col gap-6">
            <PatientToolbar />
            <PatientFilters />
            <PatientList />
          </div>
        </WorkspaceLayout>
      </div>
    </NotificationProvider>
  );
}
