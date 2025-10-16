"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  Users,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Shield,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [notificationCount] = useState(3);
  const [currentRole, setCurrentRole] = useState("Dashboard");

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    console.log("Role changed to:", newRole);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        {children}
      </WorkspaceLayout>
    </div>
  );
}
