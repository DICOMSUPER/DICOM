"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        {children}
      </WorkspaceLayout>
    </div>
  );
}
