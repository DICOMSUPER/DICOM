"use client";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { PatientSearch } from "@/components/reception/patient-search";
import { NotificationsPanel } from "@/components/reception/notifications-panel";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReceptionPage() {
  const router = useRouter();
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
        {/* Quick Actions Bar */}
        <section className="mb-6">
          <QuickActionsBar />
        </section>

        {/* Patient Search Section */}
        <section className="mb-6">
          <PatientSearch 
            onPatientSelect={(patient) => router.push(`/reception/patients/${patient.id}`)}
            showStats={true}
          />
        </section>

        {/* Notifications & Alerts */}
        <section className="mb-6">
          <NotificationsPanel />
        </section>
      </WorkspaceLayout>
    </div>
  );
}
