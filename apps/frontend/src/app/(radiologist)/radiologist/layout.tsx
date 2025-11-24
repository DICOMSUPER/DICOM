"use client";

import { Suspense } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/radiologist/side-bar";
import { Suspense } from "react";

interface RadiologistLayoutProps {
  children: React.ReactNode;
}

export default function RadiologistLayout({
  children,
}: RadiologistLayoutProps) {
  const pathname = usePathname();

  // Check if we're on the work tree route
  const isWorkTreeRoute = pathname?.startsWith("/radiologist/work-tree");

  // Conditionally render sidebar: Work Tree sidebar when on work tree route, otherwise normal navigation
  const sidebarContent = isWorkTreeRoute ? (
    <Suspense fallback={<div className="p-4">Loading sidebar...</div>}>
      <Sidebar />
    </Suspense>
  ) : (
    <SidebarNav />
  );

  return (
    <Suspense>
      <div className="min-h-screen bg-background">
        {/* Workspace Layout - same as other roles */}
        <WorkspaceLayout sidebar={sidebarContent}>{children}</WorkspaceLayout>
      </div>
    </Suspense>
  );
}
