"use client";

import { ReceptionStatsCards } from "@/components/reception/reception-stats-cards";
import { Activity, CheckCircle, XCircle, FileText } from "lucide-react";

interface BodyPartStatsCardsProps {
  totalCount: number;
  isLoading?: boolean;
}

export function BodyPartStatsCards({
  totalCount,
  isLoading = false,
}: BodyPartStatsCardsProps) {
  const stats = [
    {
      title: "Total Body Parts",
      value: totalCount,
      description: "All registered body parts",
      icon: Activity,
      isLoading,
    },
  ];

  return <ReceptionStatsCards stats={stats} />;
}

