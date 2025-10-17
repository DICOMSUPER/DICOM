"use client";

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

interface AppHeaderProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export function AppHeader({
  notificationCount = 0,
  onNotificationClick,
  onLogout,
  onMenuClick
}: AppHeaderProps) {
  const user = useSelector((state: RootState) => state.auth.user);

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
              <Button 
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
              <DropdownMenuContent align="end" className="w-64 border-border p-2">
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
                  onClick={onLogout}
                  className="group cursor-pointer text-red-600 focus:text-white focus:bg-red-600 p-3 rounded-md ease-in-out duration-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Logout</span>
                    <LogOut className="w-4 h-4 text-red-600 group-hover:text-white ease-in-out duration-200" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
    </header>
  );
}
