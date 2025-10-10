"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  services = [
    { name: 'API Server', status: 'online' as const, lastCheck: '2 minutes ago' },
    { name: 'Database', status: 'online' as const, lastCheck: '1 minute ago' },
    { name: 'File Storage', status: 'warning' as const, lastCheck: '5 minutes ago' },
    { name: 'Email Service', status: 'online' as const, lastCheck: '3 minutes ago' },
  ],
  isLoading = false 
}: AdminSystemStatusProps) {
  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted animate-pulse rounded-full" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
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
    switch (status) {
      case 'online':
        return <Badge variant="secondary">Online</Badge>;
      case 'warning':
        return <Badge variant="outline">Warning</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
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
