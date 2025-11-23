"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Users, UserCheck, UserX, Shield } from "lucide-react";

interface UserStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  verifiedCount: number;
  isLoading?: boolean;
}

export function UserStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  verifiedCount,
  isLoading = false,
}: UserStatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: totalCount,
      description: "All registered users",
      icon: Users,
      isLoading,
    },
    {
      title: "Active Users",
      value: activeCount,
      description: "Currently active",
      icon: UserCheck,
      isLoading,
    },
    {
      title: "Inactive Users",
      value: inactiveCount,
      description: "Currently inactive",
      icon: UserX,
      isLoading,
    },
    {
      title: "Verified Users",
      value: verifiedCount,
      description: "Email verified",
      icon: Shield,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}

