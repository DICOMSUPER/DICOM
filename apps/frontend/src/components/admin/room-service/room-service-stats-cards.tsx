"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Link2, CheckCircle, XCircle, Activity } from "lucide-react";

interface RoomServiceStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  totalRooms: number;
  isLoading?: boolean;
}

export function RoomServiceStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  totalRooms,
  isLoading = false,
}: RoomServiceStatsCardsProps) {
  const stats = [
    {
      title: "Total Assignments",
      value: totalCount,
      description: "All service-room assignments",
      icon: Link2,
      isLoading,
    },
    {
      title: "Active Assignments",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Assignments",
      value: inactiveCount,
      description: "Currently inactive",
      icon: XCircle,
      isLoading,
    },
    {
      title: "Rooms with Services",
      value: totalRooms,
      description: "Unique rooms assigned",
      icon: Activity,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}

