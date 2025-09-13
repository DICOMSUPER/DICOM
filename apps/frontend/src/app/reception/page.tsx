"use client";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { PatientSearch } from "@/components/reception/patient-search";
import { WaitingQueue } from "@/components/reception/waiting-queue";
import { PatientForward } from "@/components/reception/patient-forward";
import { NotificationsPanel } from "@/components/reception/notifications-panel";
import { useState } from "react";

export default function ReceptionPage() {
  const [notificationCount] = useState(3);
  const [currentRole, setCurrentRole] = useState("Reception Staff");

  const handleNotificationClick = () => {
    // Handle notification click - could open a notification panel
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    // Handle logout
    console.log("Logout clicked");
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    // In a real app, this would update the user's session/context
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
        {/* Quick Actions Bar */}
        <section className="mb-6">
          <QuickActionsBar />
        </section>

        {/* Search Section */}
        <section className="mb-6">
          <PatientSearch />
        </section>

        {/* Waiting Queue & Patient Forwarding */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <WaitingQueue />
          <PatientForward />
        </section>

        {/* Notifications & Alerts */}
        <section className="mb-6">
          <NotificationsPanel />
        </section>
      </WorkspaceLayout>
    </div>
  );
}
