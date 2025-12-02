'use client';

import { StatsCards } from '@/components/ui/stats-cards';
import { Activity, CheckCircle, XCircle, Wrench } from 'lucide-react';

interface ModalityMachineStats {
  totalMachines: number;
  activeMachines: number;
  inactiveMachines: number;
  maintenanceMachines: number;
}

interface MachineStatsCardsProps {
  stats: ModalityMachineStats | undefined;
  isLoading?: boolean;
}

export function MachineStatsCards({ stats, isLoading = false }: MachineStatsCardsProps) {
  const statsData = [
    {
      title: 'Total Machines',
      value: stats?.totalMachines || 0,
      description: 'All machines',
      icon: Activity,
      isLoading,
    },
    {
      title: 'Active',
      value: stats?.activeMachines || 0,
      description: 'Currently active',
      icon: CheckCircle,
      isLoading,
    },
    {
      title: 'Inactive',
      value: stats?.inactiveMachines || 0,
      description: 'Currently inactive',
      icon: XCircle,
      isLoading,
    },
    {
      title: 'Maintenance',
      value: stats?.maintenanceMachines || 0,
      description: 'Under maintenance',
      icon: Wrench,
      isLoading,
    },
  ];

  return <StatsCards stats={statsData} />;
}

