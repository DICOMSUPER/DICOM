"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { NotificationProvider } from "@/common/contexts/NotificationContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Layout */}
      <NotificationProvider>
        <WorkspaceLayout sidebar={<SidebarNav />}>{children}</WorkspaceLayout>
      </NotificationProvider>
    </div>
  );
}
