"use client";

import { useState, useEffect } from "react";
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
import { 
  Bell,
  User,
  Menu,
  LogOut
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useLogout } from "@/hooks/use-logout";
import NotificationBell from "./notification/NotificationBell";

interface AppHeaderProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  onMenuClick?: () => void;
}

export function AppHeader({
  notificationCount = 0,
  onNotificationClick,
  onLogout,
  isLoggingOut: externalIsLoggingOut,
  onMenuClick
}: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout: defaultLogout, isLoggingOut: internalIsLoggingOut } = useLogout();
  const logoutHandler = onLogout ?? defaultLogout;
  const isLoggingOut = externalIsLoggingOut ?? internalIsLoggingOut;

  // Prevent hydration mismatch by only showing user data after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use consistent fallback during SSR and initial render
  const displayName = mounted && user?.email?.split("@")[0] 
    ? user.email.split("@")[0] 
    : "User";

  return (
    <header className="h-16 border-b border-border bg-card">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left: mobile menu only (branding moved to sidebar) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              onClick={onMenuClick ?? (() => window.dispatchEvent(new Event('workspace:toggleSidebar')))}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>


          {/* Right Side - Notifications + User */}
          <div className="flex items-center space-x-4 px-4 py-2">
            {/* Notifications */}
            <div className="relative">
              {/* <Button 
                variant="outline" 
                size="sm" 
                className="border-border relative"
                onClick={onNotificationClick}
              >
                <Bell className="w-4 h-4 mr-2" />
                Alerts
                {notificationCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                    {notificationCount}
                  </Badge>
                )}
              </Button> */}
              <NotificationBell />
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
                  {displayName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 border-border p-2">
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors ease-in-out duration-200">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg shrink-0">
                      {mounted && user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                    {/* User Info */}
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-foreground">
                        {mounted && user?.email ? user.email : "No email"}
                      </p>
                      {mounted && user?.role && (
                        <p className="text-xs leading-none text-foreground capitalize">
                          {user.role.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  onClick={logoutHandler}
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
  );
}
