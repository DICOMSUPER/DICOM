'use client';

import { StatsCards } from '@/components/ui/stats-cards';
import { FileText, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface DiagnosisReportStatsCardsProps {
  totalCount: number;
  activeCount: number;
  resolvedCount: number;
  criticalCount: number;
  todayCount: number;
  isLoading?: boolean;
}

export function DiagnosisReportStatsCards({
  totalCount,
  activeCount,
  resolvedCount,
  criticalCount,
  todayCount,
  isLoading = false,
}: DiagnosisReportStatsCardsProps) {
  const stats = [
    {
      title: 'Total Reports',
      value: totalCount,
      description: 'All diagnosis reports',
      icon: FileText,
      isLoading,
    },
    {
      title: 'Active',
      value: activeCount,
      description: 'Currently active',
      icon: Clock,
      isLoading,
    },
    {
      title: 'Resolved',
      value: resolvedCount,
      description: 'Resolved reports',
      icon: CheckCircle,
      isLoading,
    },
    {
      title: 'Critical',
      value: criticalCount,
      description: 'Critical reports',
      icon: AlertTriangle,
      isLoading,
    },
    {
      title: 'Today',
      value: todayCount,
      description: 'Reports today',
      icon: Calendar,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}