"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { useState } from "react";
import { NotificationProvider } from "@/contexts/NotificationContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [notificationCount] = useState(3);
  const [currentRole, setCurrentRole] = useState("Dashboard");

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
    <NotificationProvider>
      {" "}
      <div className="min-h-screen bg-background">
        {/* Workspace Layout */}
        <WorkspaceLayout sidebar={<SidebarNav />}>{children}</WorkspaceLayout>
      </div>
    </NotificationProvider>
  );
}
