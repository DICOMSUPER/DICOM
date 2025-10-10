"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topToolbar?: React.ReactNode;
  noPadding?: boolean;
  noBreadcrumbs?: boolean;
}

export function WorkspaceLayout({ children, sidebar, noPadding = false, noBreadcrumbs = false }: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  const pathMap: Record<string, string> = {
    'reception': 'Reception',
    'register': 'Register Patient',
    'patients': 'Patients',
    'dashboard': 'Dashboard',
    'imaging': 'Imaging',
    'queue': 'Queue',
    'settings': 'Settings',
    'admin': 'Admin',
    'users': 'User Management',
    'schedule': 'Schedule Management',
    'configurations': 'System Configurations',
    'reports': 'Analytics & Reports',
    'security': 'Security & Audit',
    'database': 'Database Management',
    'docs': 'Documentation',
    'monitoring': 'System Monitoring',
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-card">
          {sidebar}
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 flex flex-col">
          {/* Main Content Area */}
          <div className={cn("flex-1", !noPadding && "p-4")}>
            {!noBreadcrumbs && (
              <div className="mb-4">
                <Breadcrumb
                  items={paths.map((path, index) => ({
                    label: pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
                    href: '/' + paths.slice(0, index + 1).join('/'),
                    active: index === paths.length - 1
                  }))}
                />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
