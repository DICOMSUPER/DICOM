"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
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
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Dashboard() {
  const [notificationCount] = useState(3);
  const [currentRole, setCurrentRole] = useState("Administrator");

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    console.log("Role changed to:", newRole);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout
        sidebar={<SidebarNav userRole={currentRole} />}
      >
      {/* System Overview Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <p className="text-xs text-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center">
              <Database className="w-4 h-4 mr-2" />
              DICOM Studies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">8,432</div>
            <p className="text-xs text-foreground">+156 this week</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">23</div>
            <p className="text-xs text-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-foreground">Uptime</p>
          </CardContent>
        </Card>
      </section>

      {/* Main Management Sections */}
      <section className="grid md:grid-cols-2 gap-8 mb-8">
        {/* System Management */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Management
            </CardTitle>
            <CardDescription>
              Monitor system performance and manage resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Database className="w-4 h-4 mr-2" />
              Database Management
            </Button>
            <Button variant="outline" className="w-full border-border">
              <Shield className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
            <Button variant="outline" className="w-full border-border">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage DICOM data and generate reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Data Export/Import
            </Button>
            <Button variant="outline" className="w-full border-border">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Reports
            </Button>
            <Button variant="outline" className="w-full border-border">
              <Database className="w-4 h-4 mr-2" />
              Backup Management
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* System Status and Recent Activity */}
      <section className="grid md:grid-cols-2 gap-8 mb-8">
        {/* System Status */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Database Server</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">DICOM Storage</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">AI Processing</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Backup System</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Warning
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent System Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent System Activity
            </CardTitle>
            <CardDescription>
              Latest system events and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Database Backup</h4>
                    <p className="text-sm text-foreground">Completed successfully</p>
                  </div>
                </div>
                <Badge className="bg-accent text-white">2 min ago</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">New DICOM Study</h4>
                    <p className="text-sm text-foreground">Patient ID: 2024001</p>
                  </div>
                </div>
                <Badge className="bg-accent text-white">15 min ago</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Performance Report</h4>
                    <p className="text-sm text-foreground">Generated automatically</p>
                  </div>
                </div>
                <Badge className="bg-accent text-white">1 hour ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Access */}
      <section>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Access</CardTitle>
            <CardDescription>
              Navigate to different system modules and functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col border-border">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Patient Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col border-border">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">DICOM Viewer</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col border-border">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col border-border">
                <Shield className="w-6 h-6 mb-2" />
                <span className="text-sm">Security</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      </WorkspaceLayout>
    </div>
  );
}
