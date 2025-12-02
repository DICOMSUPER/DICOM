"use client";

import { StatsCards } from "@/components/ui/stats-cards";
import { Monitor, CheckCircle, XCircle, Wrench } from "lucide-react";
import { MachineStatus } from "@/enums/machine-status.enum";

interface ModalityMachineStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  maintenanceCount: number;
  isLoading?: boolean;
}

export function ModalityMachineStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  maintenanceCount,
  isLoading = false,
}: ModalityMachineStatsCardsProps) {
  const stats = [
    {
      title: "Total Machines",
      value: totalCount,
      description: "All registered modality machines",
      icon: Monitor,
      isLoading,
    },
    {
      title: "Active Machines",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Machines",
      value: inactiveCount,
      description: "Currently inactive",
      icon: XCircle,
      isLoading,
    },
    {
      title: "In Maintenance",
      value: maintenanceCount,
      description: "Under maintenance",
      icon: Wrench,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}

