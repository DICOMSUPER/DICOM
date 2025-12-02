"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Building2, CheckCircle, AlertTriangle, Home } from "lucide-react";

interface RoomStatsCardsProps {
  totalCount: number;
  availableCount: number;
  occupiedCount: number;
  maintenanceCount: number;
  isLoading?: boolean;
}

export function RoomStatsCards({
  totalCount,
  availableCount,
  occupiedCount,
  maintenanceCount,
  isLoading = false,
}: RoomStatsCardsProps) {
  const stats = [
    {
      title: "Total Rooms",
      value: totalCount,
      description: "All registered rooms",
      icon: Building2,
      isLoading,
    },
    {
      title: "Available Rooms",
      value: availableCount,
      description: "Currently available",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Occupied Rooms",
      value: occupiedCount,
      description: "Currently in use",
      icon: Home,
      isLoading,
    },
    {
      title: "Maintenance",
      value: maintenanceCount,
      description: "Under maintenance",
      icon: AlertTriangle,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}

