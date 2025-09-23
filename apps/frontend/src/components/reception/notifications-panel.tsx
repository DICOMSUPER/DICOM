import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, CheckCircle } from "lucide-react";
import { NotificationType } from "@/enums/notification.enum";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  action: {
    label: string;
    variant?: 'default' | 'outline';
    color?: string;
  };
}

const notifications: Notification[] = [
  {
    id: '1',
    type: NotificationType.URGENT,
    title: 'Urgent: Patient waiting 45+ minutes',
    description: 'John Doe (MRN: 2024001) - Cardiology',
    action: {
      label: 'Handle Now',
      color: 'bg-red-500 hover:bg-red-600 text-white'
    }
  },
  {
    id: '2',
    type: NotificationType.SYSTEM,
    title: 'System: Dr. Smith running 15 min late',
    description: 'Next 3 appointments may be delayed',
    action: {
      label: 'Notify Patients',
      variant: 'outline'
    }
  },
  {
    id: '3',
    type: NotificationType.INFO,
    title: 'Info: New patient registration completed',
    description: 'Sarah Miller (MRN: 2024002) - Ready for consultation',
    action: {
      label: 'View Details',
      variant: 'outline'
    }
  }
];

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case NotificationType.URGENT:
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />
      };
    case NotificationType.SYSTEM:
      return {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
      };
    case NotificationType.INFO:
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        icon: <CheckCircle className="w-5 h-5 text-blue-600" />
      };
  }
};

export function NotificationsPanel() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications & Alerts
        </CardTitle>
        <CardDescription>
          Important updates and system notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map(notification => {
            const styles = getNotificationStyles(notification.type);
            return (
              <div 
                key={notification.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${styles.border} ${styles.bg}`}
              >
                <div className="flex items-center space-x-3">
                  {styles.icon}
                  <div>
                    <div className="font-medium text-foreground">{notification.title}</div>
                    <div className="text-sm text-foreground">{notification.description}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={notification.action.variant || 'default'}
                  className={notification.action.color || 'border-border'}
                >
                  {notification.action.label}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}