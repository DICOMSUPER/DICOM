"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle, Image, Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RadiologistDashboardStatsProps {
  stats: {
    totalStudies: number;
    pendingStudies: number;
    inProgressStudies: number;
    completedStudies: number;
    todayStudies: number;
    totalReports: number;
    pendingReports: number;
    completedReports: number;
    todayReports: number;
  };
  isLoading?: boolean;
}

export function RadiologistDashboardStats({ stats, isLoading = false }: RadiologistDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Today&apos;s Studies
          </CardTitle>
          <Image className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.todayStudies}
            </div>
          )}
          <p className="text-xs text-foreground">Studies today</p>
        </CardContent>
      </Card>

      {/* Pending Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Pending Studies
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingStudies}
            </div>
          )}
          <p className="text-xs text-foreground">Awaiting interpretation</p>
        </CardContent>
      </Card>

      {/* In Progress Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            In Progress
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgressStudies}
            </div>
          )}
          <p className="text-xs text-foreground">Currently reviewing</p>
        </CardContent>
      </Card>

      {/* Completed Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Completed Studies
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-green-600">
              {stats.completedStudies}
            </div>
          )}
          <p className="text-xs text-foreground">Interpreted</p>
        </CardContent>
      </Card>

      {/* Total Reports */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total Reports
          </CardTitle>
          <FileText className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.totalReports}
            </div>
          )}
          <p className="text-xs text-foreground">All reports</p>
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

      {/* Completed Reports */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Completed Reports
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-green-600">
              {stats.completedReports}
            </div>
          )}
          <p className="text-xs text-foreground">Finalized reports</p>
        </CardContent>
      </Card>

      {/* Total Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total Studies
          </CardTitle>
          <Image className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.totalStudies}
            </div>
          )}
          <p className="text-xs text-foreground">All imaging studies</p>
        </CardContent>
      </Card>
    </div>
  );
}

