"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  Activity,
  Database,
  Shield
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'user' | 'system' | 'warning' | 'config' | 'security' | 'database';
  message: string;
  timestamp: string;
  icon: any;
}

interface AdminRecentActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export function AdminRecentActivity({ 
  activities = [
    {
      id: '1',
      type: 'user',
      message: 'New user registered',
      timestamp: '2 minutes ago',
      icon: UserCheck
    },
    {
      id: '2',
      type: 'system',
      message: 'System backup completed',
      timestamp: '15 minutes ago',
      icon: CheckCircle
    },
    {
      id: '3',
      type: 'warning',
      message: 'High memory usage detected',
      timestamp: '1 hour ago',
      icon: AlertTriangle
    },
    {
      id: '4',
      type: 'config',
      message: 'System settings updated',
      timestamp: '2 hours ago',
      icon: Settings
    }
  ],
  isLoading = false 
}: AdminRecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return UserCheck;
      case 'system':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'config':
        return Settings;
      case 'security':
        return Shield;
      case 'database':
        return Database;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-600';
      case 'system':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'config':
        return 'bg-purple-100 text-purple-600';
      case 'security':
        return 'bg-red-100 text-red-600';
      case 'database':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge variant="outline">User</Badge>;
      case 'system':
        return <Badge variant="outline">System</Badge>;
      case 'warning':
        return <Badge variant="outline">Warning</Badge>;
      case 'config':
        return <Badge variant="outline">Config</Badge>;
      case 'security':
        return <Badge variant="outline">Security</Badge>;
      case 'database':
        return <Badge variant="outline">Database</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
        <CardDescription>
          Latest system events and user actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
                {getActivityBadge(activity.type)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
