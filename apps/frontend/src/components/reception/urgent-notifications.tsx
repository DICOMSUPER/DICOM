"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, AlertTriangle } from "lucide-react";

interface UrgentAlert {
  id: string;
  type: 'error' | 'warning';
  title: string;
  message: string;
  timestamp: string;
}

interface UrgentNotificationsProps {
  alerts: UrgentAlert[];
}

export function UrgentNotifications({ alerts }: UrgentNotificationsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Bell className="w-5 h-5 mr-2 text-red-600" />
        Urgent Notifications
      </h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}
