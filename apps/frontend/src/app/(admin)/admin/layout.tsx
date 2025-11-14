"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [notificationCount] = useState(3);
  const [currentRole, setCurrentRole] = useState("Admin");

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
      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        {children}
      </WorkspaceLayout>
    </div>
  );
}
