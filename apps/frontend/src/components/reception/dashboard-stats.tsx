"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    patientsWaiting: number;
    checkinsCompleted: number;
    urgentNotifications: number;
    totalPatientsToday: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Patients Waiting */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Patients Waiting
          </CardTitle>
          <Users className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.patientsWaiting}
          </div>
          <p className="text-xs text-foreground">Currently in queue</p>
        </CardContent>
      </Card>

      {/* Check-ins Completed */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Check-ins Completed
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.checkinsCompleted}
          </div>
          <p className="text-xs text-foreground">Today&quot; total</p>
        </CardContent>
      </Card>

      {/* Urgent Notifications */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Urgent Alerts
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.urgentNotifications}
          </div>
          <p className="text-xs text-foreground">Require attention</p>
        </CardContent>
      </Card>

      {/* Total Patients Today */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total Today
          </CardTitle>
          <Clock className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalPatientsToday}
          </div>
          <p className="text-xs text-foreground">All patients</p>
        </CardContent>
      </Card>
    </div>
  );
}
