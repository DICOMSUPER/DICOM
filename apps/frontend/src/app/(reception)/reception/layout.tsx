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

interface ReceptionLayoutProps {
  children: React.ReactNode;
}

export default function ReceptionLayout({ children }: ReceptionLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        {children}
      </WorkspaceLayout>
    </div>
  );
}
