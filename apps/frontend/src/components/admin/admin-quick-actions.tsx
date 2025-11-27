"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Settings,
  BarChart3,
  Monitor,
  Building2,
  Stethoscope
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
      id: 'rooms',
      label: 'Room Management',
      icon: Monitor,
      description: 'Manage rooms and equipment'
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      description: 'Manage departments'
    },
    {
      id: 'services',
      label: 'Services',
      icon: Stethoscope,
      description: 'Manage medical services'
    },
    {
      id: 'room-services',
      label: 'Room Services',
      icon: Settings,
      description: 'Manage room-service assignments'
    },
    {
      id: 'modalities',
      label: 'Imaging Modalities',
      icon: BarChart3,
      description: 'Manage imaging modalities'
    },
    {
      id: 'machines',
      label: 'Modality Machines',
      icon: Monitor,
      description: 'Manage modality machines'
    },
    {
      id: 'shift-templates',
      label: 'Shift Templates',
      icon: Calendar,
      description: 'Manage shift templates'
    }
  ];

  return (
    <Card className="border-0 shadow-sm">
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
