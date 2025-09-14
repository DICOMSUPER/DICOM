"use client";

import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  topToolbar?: ReactNode;
}

export function WorkspaceLayout({ children, sidebar }: WorkspaceLayoutProps) {
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
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
