"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Settings,
  BarChart3,
  Shield,
  Database,
  BookOpen,
  Monitor,
  Cog
} from "lucide-react";

interface AdminQuickActionsProps {
  onActionClick?: (action: string) => void;
}

export function AdminQuickActions({ onActionClick }: AdminQuickActionsProps) {
  const actions = [
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage system users and roles'
    },
    {
      id: 'schedule',
      label: 'Schedule Management',
      icon: Calendar,
      description: 'Manage staff schedules and assignments'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Configure system parameters'
    },
    {
      id: 'configurations',
      label: 'System Configurations',
      icon: Cog,
      description: 'Advanced system configurations'
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      description: 'View system analytics and reports'
    },
    {
      id: 'security',
      label: 'Security & Audit',
      icon: Shield,
      description: 'Monitor security and audit logs'
    },
    {
      id: 'database',
      label: 'Database Management',
      icon: Database,
      description: 'Manage database and backups'
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: BookOpen,
      description: 'System documentation and guides'
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: Monitor,
      description: 'Monitor system performance'
    },
    {
      id: 'rooms',
      label: 'Room Management',
      icon: Monitor,
      description: 'Manage rooms and equipment'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
        <CardDescription>
          Common administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                className="h-20 flex flex-col items-center justify-center space-y-2 cursor-pointer"
                variant="outline"
                onClick={() => onActionClick?.(action.id)}
              >
                <IconComponent className="h-6 w-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
