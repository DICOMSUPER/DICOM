"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSystemStatusBadge } from "@/utils/status-badge";

interface SystemService {
  name: string;
  status: 'online' | 'warning' | 'offline';
  lastCheck?: string;
}

interface AdminSystemStatusProps {
  services?: SystemService[];
  isLoading?: boolean;
}

export function AdminSystemStatus({ 
  services = [],
  isLoading = false 
}: AdminSystemStatusProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    return getSystemStatusBadge(status);
  };

  if (!services || services.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">System Status</CardTitle>
          <CardDescription>
            Current system health indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No system status data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">System Status</CardTitle>
        <CardDescription>
          Current system health indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}></div>
              <span className="text-sm text-foreground">{service.name}</span>
            </div>
            {getStatusBadge(service.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
