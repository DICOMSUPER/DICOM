"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Users, CheckCircle, Calendar, AlertTriangle } from "lucide-react";

interface PatientStatsCardsProps {
  totalCount: number;
  activeCount: number;
  newThisMonthCount: number;
  inactiveCount: number;
  isLoading?: boolean;
}

export function PatientStatsCards({
  totalCount,
  activeCount,
  newThisMonthCount,
  inactiveCount,
  isLoading = false,
}: PatientStatsCardsProps) {
  const stats = [
    {
      title: "Total Patients",
      value: totalCount,
      description: "All registered patients",
      icon: Users,
      isLoading,
    },
    {
      title: "Active Patients",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "New This Month",
      value: newThisMonthCount,
      description: "Registered this month",
      icon: Calendar,
      isLoading,
    },
    {
      title: "Inactive Patients",
      value: inactiveCount,
      description: "Require attention",
      icon: AlertTriangle,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}
