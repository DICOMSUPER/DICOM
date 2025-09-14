"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  User,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { getAvailableRoles } from "@/config/navigation";

interface AppHeaderProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
  onLogout?: () => void;
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export function AppHeader({
  notificationCount = 0,
  onNotificationClick,
  onLogout,
  currentRole = "Reception Staff",
  onRoleChange
}: AppHeaderProps) {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const roles = getAvailableRoles();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">DICOM System</h1>
              <p className="text-sm text-slate-500">Medical Management Platform</p>
            </div>
          </div>

          {/* Right Side - Role Switcher + Notifications + User */}
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              >
                <User className="w-4 h-4 mr-2" />
                {currentRole}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showRoleSwitcher && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-md shadow-lg z-50">
                  <div className="p-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 ${
                          currentRole === role ? 'bg-slate-100 font-medium' : ''
                        }`}
                        onClick={() => {
                          onRoleChange?.(role);
                          setShowRoleSwitcher(false);
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
      </div>
    </header>
  );
}
