"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User } from "lucide-react";
import type { RootState } from "@/store";
import { useLogout } from "@/hooks/use-logout";
import { SidebarNav } from "@/components/sidebar-nav";

interface RadiologistLayoutProps {
  children: React.ReactNode;
  topToolbar?: React.ReactNode;
  noPadding?: boolean;
  noBreadcrumbs?: boolean;
}

export function RadiologistWorkspaceLayout({
  children,
  topToolbar,
  noPadding = false,
  noBreadcrumbs = false,
}: RadiologistLayoutProps) {
  const breadcrumbItems = useBreadcrumb();
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout: triggerLogout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    triggerLogout();
  };

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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
          <div className="px-4 py-3 h-16 border-b border-border shrink-0">
            <h1 className="text-lg font-display font-bold text-foreground">
              DICOM System
            </h1>
            <p className="text-xs text-slate-500">
              Radiologist Workspace
            </p>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>

          {/* Logout Section - Fixed at Bottom */}
          <div className="border-t border-border bg-card shrink-0">
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-white hover:bg-red-600"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="shrink-0">
          {/* Custom Header for Radiologist */}
          <header className="h-16 border-b border-border bg-card">
            <div className="h-full flex items-center justify-between px-4">
              {/* Left: Logo and Branding */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                    D
                  </div>
                  <div>
                    <h1 className="text-lg font-display font-bold text-foreground">
                      DICOM System
                    </h1>
                    <p className="text-xs text-slate-500">
                      Radiologist Workspace
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Notifications + User */}
              <div className="flex items-center space-x-4 px-4 py-2">
                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border relative"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                      3
                    </Badge>
                  </Button>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user?.email?.split("@")[0] || "User"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 border-border p-2"
                  >
                    <DropdownMenuLabel className="p-0">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors ease-in-out duration-200">
                        {/* Avatar */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        {/* User Info */}
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none">
                            {user?.email?.split("@")[0] || "User"}
                          </p>
                          <p className="text-xs leading-none text-foreground">
                            {user?.email || "No email"}
                          </p>
                          {user?.role && (
                            <p className="text-xs leading-none text-foreground capitalize">
                              {user.role.replace(/_/g, " ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="group cursor-pointer text-red-600 focus:text-white focus:bg-red-600 p-3 rounded-md ease-in-out duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        {isLoggingOut ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4 text-red-600 group-hover:text-white ease-in-out duration-200" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          {topToolbar}
        </div>

        {/* Main Content Area - Scrollable */}
        <div className={cn("flex-1 overflow-y-auto")}>{children}</div>
      </main>
    </div>
  );
}
