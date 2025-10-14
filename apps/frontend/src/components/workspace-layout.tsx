"use client";

import * as React from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AppHeader } from "@/components/app-header";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topToolbar?: React.ReactNode;
  noPadding?: boolean;
  noBreadcrumbs?: boolean;
}

export function WorkspaceLayout({ children, sidebar, topToolbar, noPadding = false, noBreadcrumbs = false }: WorkspaceLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const breadcrumbItems = useBreadcrumb();

  // Auto close/open based on breakpoint
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsSidebarOpen(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Toggle via custom event from header
  React.useEffect(() => {
    const handler = () => setIsSidebarOpen((v) => !v);
    window.addEventListener("workspace:toggleSidebar", handler as EventListener);
    // Close on ESC
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener("workspace:toggleSidebar", handler as EventListener);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Sidebar container with smooth width transition and full height */}
        <div
          className={
            `border-r border-border bg-card overflow-hidden transition-[width] duration-300 ease-in-out ` +
            (isSidebarOpen ? 'w-64' : 'w-0')
          }
        >
          <div className={(isSidebarOpen ? 'flex' : 'hidden') + ' lg:flex flex-col h-full'}>
            {/* Sidebar Top Branding */}
            <div className="px-4 py-3 h-16 border-b border-border">
              <h1 className="text-lg font-display font-bold text-foreground">DICOM System</h1>
              <p className="text-xs text-slate-500">Medical Management Platform</p>
            </div>
            {/* Sidebar Content */}
            <div className="flex-1 overflow-auto">
              {sidebar}
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="border-b border-border">
            {/* Always render AppHeader here; allow extra toolbar via topToolbar below if needed */}
            <AppHeader />
            {topToolbar}
          </div>
          {/* Main Content Area */}
          <div className={cn("flex-1", !noPadding && "p-4")}>
            {!noBreadcrumbs && (
              <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
