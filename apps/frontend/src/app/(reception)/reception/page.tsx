"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  UserPlus,
  Search,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReceptionDashboard() {
  const router = useRouter();
  const [notificationCount] = useState(3);

  // Mock data for dashboard
  const stats = {
    patientsWaiting: 12,
    checkinsCompleted: 8,
    urgentNotifications: 2,
    totalPatientsToday: 24
  };

  const urgentAlerts = [
    { id: 1, message: "X-ray machine offline - Maintenance required", type: "error" },
    { id: 2, message: "High patient volume - Consider additional staff", type: "warning" }
  ];

  const recentQueue = [
    { id: 1, name: "John Doe", time: "09:15", priority: "high" },
    { id: 2, name: "Jane Smith", time: "09:30", priority: "normal" },
    { id: 3, name: "Bob Johnson", time: "09:45", priority: "normal" },
    { id: 4, name: "Alice Brown", time: "10:00", priority: "normal" }
  ];

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleGoToPatients = () => {
    router.push('/reception/patients');
  };

  const handleRegisterPatient = () => {
    router.push('/reception/registration');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout
        sidebar={<SidebarNav />}
      >
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reception Dashboard</h1>
          <p className="text-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Key Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Patients Waiting */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Patients Waiting</CardTitle>
              <Users className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.patientsWaiting}</div>
              <p className="text-xs text-foreground">
                Currently in queue
              </p>
            </CardContent>
          </Card>

          {/* Check-ins Completed */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Check-ins Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.checkinsCompleted}</div>
              <p className="text-xs text-foreground">
                Today's total
              </p>
            </CardContent>
          </Card>

          {/* Urgent Notifications */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Urgent Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgentNotifications}</div>
              <p className="text-xs text-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          {/* Total Patients Today */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Today</CardTitle>
              <Clock className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalPatientsToday}</div>
              <p className="text-xs text-foreground">
                All patients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Notifications */}
        {urgentAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-red-600" />
              Urgent Notifications
            </h2>
            <div className="space-y-3">
              {urgentAlerts.map((alert) => (
                <Alert key={alert.id} className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-foreground">
                    {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Mini Queue Preview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mini Queue Preview */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Current Queue
              </CardTitle>
              <CardDescription>
                Next patients in line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQueue.slice(0, 4).map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <p className="text-sm text-foreground">Arrived: {patient.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        patient.priority === 'high' ? 'bg-red-100 text-red-800' :
                        patient.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {patient.priority}
                    </Badge>
                  </div>
                ))}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-border"
                    onClick={handleGoToPatients}
                  >
                    View Full Queue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription>
                Common reception tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start"
                  onClick={handleGoToPatients}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Go to Patients
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-border justify-start"
                  onClick={handleRegisterPatient}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register New Patient
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-border justify-start"
                  onClick={() => router.push('/reception/patients')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <section className="mb-6">
          <QuickActionsBar />
        </section>
      </WorkspaceLayout>
    </div>
  );
}
