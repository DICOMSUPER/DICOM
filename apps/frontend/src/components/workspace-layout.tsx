"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AppHeader } from "@/components/app-header";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/store";
import { useLogout } from "@/hooks/use-logout";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topToolbar?: React.ReactNode;
  noPadding?: boolean;
  noBreadcrumbs?: boolean;
  sideBarClass?: string;
}

export function WorkspaceLayout({
  children,
  sidebar,
  topToolbar,
  noPadding = false,
  noBreadcrumbs = false,
  sideBarClass,
}: WorkspaceLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(false);
  const breadcrumbItems = useBreadcrumb();
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout: triggerLogout, isLoggingOut } = useLogout();

  // Ensure component is mounted before rendering user-specific content
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    triggerLogout();
  };
  const sideBarClassName = sideBarClass
    ? `flex-1 overflow-y-auto ${sideBarClass}`
    : "flex-1 overflow-y-auto";
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
    window.addEventListener(
      "workspace:toggleSidebar",
      handler as EventListener
    );
    // Close on ESC
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(
        "workspace:toggleSidebar",
        handler as EventListener
      );
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar container with smooth width transition and full height */}
      <div
        className={
          `border-r border-border bg-card overflow-hidden transition-[width] duration-300 ease-in-out h-screen ` +
          (isSidebarOpen ? "w-64" : "w-0")
        }
      >
        <div
          className={
            (isSidebarOpen ? "flex" : "hidden") + " lg:flex flex-col h-full"
          }
        >
          {/* Sidebar Top Branding */}
          <div className="px-4 py-3 h-16 border-b border-border flex-shrink-0">
            <h1 className="text-lg font-display font-bold text-foreground">
              DICOM System
            </h1>
            <p className="text-xs text-slate-500">
              Medical Management Platform
            </p>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className={sideBarClassName}>{sidebar}</div>

          {/* Logout Section - Fixed at Bottom */}
          <div className="border-t border-border bg-card flex-shrink-0">
            <div className="p-3">
              <div className="flex items-center gap-3 mb-2 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {isMounted ? (user?.email?.charAt(0).toUpperCase() || "U") : "U"}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {isMounted ? (user?.email?.split("@")[0] || "User") : "User"}
                  </p>
                  <p className="text-xs text-foreground truncate">
                    {isMounted ? (user?.role?.replace(/_/g, " ") || "Role") : "Role"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="group w-full justify-between text-red-600 hover:text-white! hover:bg-red-600! ease-in-out duration-200"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                {isLoggingOut ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 text-red-600 group-hover:text-white ease-in-out duration-200" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-shrink-0">
          {/* Always render AppHeader here; allow extra toolbar via topToolbar below if needed */}
          <AppHeader onLogout={handleLogout} />
          {topToolbar}
        </div>
        {/* Main Content Area - Scrollable */}
        <div className={cn("flex-1 overflow-y-auto", !noPadding && "p-4")}>
          {!noBreadcrumbs && breadcrumbItems.length > 1 && (
            <div className="mb-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
