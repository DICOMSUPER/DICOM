'use client';

import { StatsCards } from '@/components/ui/stats-cards';
import { Users, Clock, CheckCircle } from 'lucide-react';

interface EncounterStats {
  totalEncounters?: number;
  totalArrivedEncounters?: number;
  totalCompletedEncounters?: number;
}

interface EncounterStatsCardsProps {
  stats: EncounterStats | undefined;
  isLoading?: boolean;
}

export function EncounterStatsCards({ stats, isLoading = false }: EncounterStatsCardsProps) {
  const statsData = [
    {
      title: 'Total Encounters',
      value: stats?.totalEncounters || 0,
      description: 'All registered encounters',
      icon: Users,
      isLoading,
    },
    {
      title: 'Arrived',
      value: stats?.totalArrivedEncounters || 0,
      description: 'Currently arrived',
      icon: Clock,
      isLoading,
    },
    {
      title: 'Completed',
      value: stats?.totalCompletedEncounters || 0,
      description: 'Completed encounters',
      icon: CheckCircle,
      isLoading,
    },
  ];

  return <StatsCards stats={statsData} />;
}

