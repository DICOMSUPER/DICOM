"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { NotificationProvider } from "@/common/contexts/NotificationContext";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <WorkspaceLayout sidebar={<SidebarNav />}>{children}</WorkspaceLayout>
      </div>
    </NotificationProvider>
  );
}
