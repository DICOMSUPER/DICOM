"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topToolbar?: React.ReactNode;
}

export function WorkspaceLayout({ children, sidebar }: WorkspaceLayoutProps) {
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
          <div className="flex-1 p-4">
            <div className="mb-4">
              <Breadcrumb
                items={paths.map((path, index) => ({
                  label: pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
                  href: '/' + paths.slice(0, index + 1).join('/'),
                  active: index === paths.length - 1
                }))}
              />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
