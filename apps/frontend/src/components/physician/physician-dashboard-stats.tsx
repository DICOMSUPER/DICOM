"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Stethoscope, Image, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PhysicianDashboardStatsProps {
  stats: {
    totalPatients: number;
    activePatients: number;
    todayEncounters: number;
    pendingEncounters: number;
    completedReports: number;
    pendingReports: number;
    totalImagingOrders: number;
    pendingImagingOrders: number;
    completedImagingOrders: number;
  };
  isLoading?: boolean;
}

export function PhysicianDashboardStats({ stats, isLoading = false }: PhysicianDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Encounters */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Today&apos;s Encounters
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.todayEncounters}
            </div>
          )}
          <p className="text-xs text-foreground">Patient visits today</p>
        </CardContent>
      </Card>

      {/* Pending Encounters */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Pending Encounters
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingEncounters}
            </div>
          )}
          <p className="text-xs text-foreground">Awaiting attention</p>
        </CardContent>
      </Card>

      {/* Completed Reports */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Completed Reports
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-green-600">
              {stats.completedReports}
            </div>
          )}
          <p className="text-xs text-foreground">Diagnosis reports</p>
        </CardContent>
      </Card>

      {/* Pending Reports */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Pending Reports
          </CardTitle>
          <FileText className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingReports}
            </div>
          )}
          <p className="text-xs text-foreground">Reports in progress</p>
        </CardContent>
      </Card>

      {/* Total Imaging Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Imaging Orders
          </CardTitle>
          <Image className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.totalImagingOrders}
            </div>
          )}
          <p className="text-xs text-foreground">Total orders</p>
        </CardContent>
      </Card>

      {/* Pending Imaging Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Pending Imaging
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-red-600">
              {stats.pendingImagingOrders}
            </div>
          )}
          <p className="text-xs text-foreground">Awaiting completion</p>
        </CardContent>
      </Card>

      {/* Active Patients */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Active Patients
          </CardTitle>
          <Users className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.activePatients}
            </div>
          )}
          <p className="text-xs text-foreground">In your care</p>
        </CardContent>
      </Card>

      {/* Completed Imaging Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Completed Imaging
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-green-600">
              {stats.completedImagingOrders}
            </div>
          )}
          <p className="text-xs text-foreground">Ready for review</p>
        </CardContent>
      </Card>
    </div>
  );
}

