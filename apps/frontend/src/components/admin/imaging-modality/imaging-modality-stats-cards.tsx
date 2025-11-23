"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Scan, CheckCircle, XCircle, Activity } from "lucide-react";

interface ImagingModalityStatsCardsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  isLoading?: boolean;
}

export function ImagingModalityStatsCards({
  totalCount,
  activeCount,
  inactiveCount,
  isLoading = false,
}: ImagingModalityStatsCardsProps) {
  const stats = [
    {
      title: "Total Modalities",
      value: totalCount,
      description: "All registered imaging modalities",
      icon: Scan,
      isLoading,
    },
    {
      title: "Active Modalities",
      value: activeCount,
      description: "Currently active",
      icon: CheckCircle,
      isLoading,
    },
    {
      title: "Inactive Modalities",
      value: inactiveCount,
      description: "Currently inactive",
      icon: XCircle,
      isLoading,
    },
    {
      title: "Modality Activity",
      value: activeCount,
      description: "Active modalities",
      icon: Activity,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}

