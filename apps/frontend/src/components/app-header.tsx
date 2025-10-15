"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  User,
  Menu
} from "lucide-react";

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

            {/* User */}
            <Button 
              variant="outline" 
              size="sm" 
              className="border-border"
              onClick={onLogout}
            >
              <User className="w-4 h-4 mr-2" />
              User
            </Button>
          </div>
        </div>
    </header>
  );
}
