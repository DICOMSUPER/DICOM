"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, DoorOpen, Stethoscope, Calendar, Activity } from "lucide-react";

interface AdminStatsProps {
  totalUsers: number;
  totalDepartments: number;
  totalRooms: number;
  totalServices: number;
  totalEncounters: number;
  todayEncounters: number;
  totalPatients: number;
  isLoading?: boolean;
}

export function AdminStats({ 
  totalUsers, 
  totalDepartments,
  totalRooms,
  totalServices,
  totalEncounters,
  todayEncounters,
  totalPatients,
  isLoading = false 
}: AdminStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
          <Users className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            System users
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Departments</CardTitle>
          <Building2 className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalDepartments.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            Active departments
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Rooms</CardTitle>
          <DoorOpen className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalRooms.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            Available rooms
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Services</CardTitle>
          <Stethoscope className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalServices.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            Medical services
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalPatients.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            Registered patients
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Total Encounters</CardTitle>
          <Calendar className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalEncounters.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            All time encounters
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Today&apos;s Encounters</CardTitle>
          <Activity className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{todayEncounters.toLocaleString()}</div>
          <p className="text-xs text-foreground">
            Encounters today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
