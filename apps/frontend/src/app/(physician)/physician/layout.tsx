"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { useState } from "react";

interface PhysicianLayoutProps {
  children: React.ReactNode;
}

export default function PhysicianLayout({ children }: PhysicianLayoutProps) {


  return (
    <div className="min-h-screen  bg-background">

      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav  />}>
        {children}
      </WorkspaceLayout>
    </div>
  );
}
