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
import { Suspense, useState } from "react";

interface ImagingTechnicianLayoutProps {
  children: React.ReactNode;
}

export default function ImagingTechnicianLayout({
  children,
}: ImagingTechnicianLayoutProps) {
  return (
    <Suspense>
      <div className="min-h-screen bg-background">
        {/* Workspace Layout */}
        <WorkspaceLayout sidebar={<SidebarNav />}>{children}</WorkspaceLayout>
      </div>
    </Suspense>
  );
}
