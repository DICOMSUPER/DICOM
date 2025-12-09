"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Image,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Camera,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImagingTechnicianDashboardStatsProps {
  stats: {
    totalImagingOrders: number;
    pendingImagingOrders: number;
    inProgressImagingOrders: number;
    completedImagingOrders: number;
    todayImagingOrders: number;
    totalStudies: number;
    todayStudies: number;
    activeMachines: number;
  };
  isLoading?: boolean;
}

export function ImagingTechnicianDashboardStats({
  stats,
  isLoading = false,
}: ImagingTechnicianDashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Imaging Orders */}
      {/* <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Today&apos;s Orders
          </CardTitle>
          <Image className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.todayImagingOrders}
            </div>
          )}
          <p className="text-xs text-foreground">Imaging orders today</p>
        </CardContent>
      </Card> */}

      {/* Pending Imaging Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Pending Orders
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingImagingOrders}
            </div>
          )}
          <p className="text-xs text-foreground">Awaiting processing</p>
        </CardContent>
      </Card>

      {/* In Progress Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            In Progress
          </CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgressImagingOrders}
            </div>
          )}
          <p className="text-xs text-foreground">Currently processing</p>
        </CardContent>
      </Card>

      {/* Completed Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Completed Orders
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
          <p className="text-xs text-foreground">Successfully completed</p>
        </CardContent>
      </Card>

      {/* Total Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total Studies
          </CardTitle>
          <Camera className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.totalStudies}
            </div>
          )}
          <p className="text-xs text-foreground">All studies</p>
        </CardContent>
      </Card>

      {/* Today's Studies */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Today&apos;s Studies
          </CardTitle>
          <Camera className="h-4 w-4 text-foreground" />
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

      {/* Total Imaging Orders */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Total Orders
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
          <p className="text-xs text-foreground">All imaging orders</p>
        </CardContent>
      </Card>

      {/* Active Machines */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Active Machines
          </CardTitle>
          <Activity className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-2xl font-bold text-foreground">
              {stats.activeMachines}
            </div>
          )}
          <p className="text-xs text-foreground">Available machines</p>
        </CardContent>
      </Card>
    </div>
  );
}
