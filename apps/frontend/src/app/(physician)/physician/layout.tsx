"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useState } from "react";

interface PhysicianLayoutProps {
  children: React.ReactNode;
}

export default function PhysicianLayout({ children }: PhysicianLayoutProps) {
  return (
    <div className="min-h-screen  bg-background">
      {/* Workspace Layout */}
      <NotificationProvider>
        <WorkspaceLayout sidebar={<SidebarNav />}>{children}</WorkspaceLayout>
      </NotificationProvider>
    </div>
  );
}
