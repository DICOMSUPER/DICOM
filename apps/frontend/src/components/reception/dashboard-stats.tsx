"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    activePatient: number;
    dailyCheckins: number;
    urgentNotifications: number;
    newPatientsThisMonth: number;
    todayEncounters: number;
    todayStatEncounters: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Patients Waiting */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Active Patients
          </CardTitle>
          <Users className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.activePatient}
          </div>
          <p className="text-xs text-foreground">Registered in the system</p>
        </CardContent>
      </Card>

      {/* Check-ins Completed */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Daily Check-ins
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.todayEncounters}
          </div>
          <p className="text-xs text-foreground">Today&apos;s check-ins </p>
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
            {stats.todayStatEncounters}
          </div>
          <p className="text-xs text-foreground">Require attention</p>
        </CardContent>
      </Card>

      {/* Total Patients Today */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Monthly New Patients
          </CardTitle>
          <Clock className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.newPatientsThisMonth}
          </div>
          <p className="text-xs text-foreground">
            Patients registerd this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
