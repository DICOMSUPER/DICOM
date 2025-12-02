'use client';

import { StatsCards } from '@/components/ui/stats-cards';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ImagingOrderStatsCardsProps {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
  isLoading?: boolean;
}

export function ImagingOrderStatsCards({
  totalCount,
  pendingCount,
  completedCount,
  cancelledCount,
  isLoading = false,
}: ImagingOrderStatsCardsProps) {
  const stats = [
    {
      title: 'Total Orders',
      value: totalCount,
      description: 'All imaging orders',
      icon: FileText,
      isLoading,
    },
    {
      title: 'Pending',
      value: pendingCount,
      description: 'Pending orders',
      icon: Clock,
      isLoading,
    },
    {
      title: 'Completed',
      value: completedCount,
      description: 'Completed orders',
      icon: CheckCircle,
      isLoading,
    },
    {
      title: 'Cancelled',
      value: cancelledCount,
      description: 'Cancelled orders',
      icon: XCircle,
      isLoading,
    },
  ];

  return <StatsCards stats={stats} />;
}