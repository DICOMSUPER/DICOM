"use client";

import { useState } from "react";
import { 
  AdminStats, 
  AdminQuickActions, 
  AnalyticsCharts
} from "@/components/admin";
import { useRouter } from "next/navigation";
import { useGetAnalyticsQuery } from "@/store/analyticsApi";
import { RefreshButton } from "@/components/ui/refresh-button";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | undefined>();
  const [value, setValue] = useState<string>('');
  const [appliedPeriod, setAppliedPeriod] = useState<'week' | 'month' | 'year' | undefined>();
  const [appliedValue, setAppliedValue] = useState<string>('');

  const getWeekNumber = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  const getDefaultValue = (periodType: 'week' | 'month' | 'year'): string => {
    const now = new Date();
    if (periodType === 'week') {
      return getWeekNumber(now);
    }
    if (periodType === 'month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    if (periodType === 'year') {
      return now.getFullYear().toString();
    }
    return '';
  };

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year' | undefined) => {
    setPeriod(newPeriod);
    if (newPeriod) {
      setValue(getDefaultValue(newPeriod));
    } else {
      setValue('');
    }
  };

  const handleApplyFilter = () => {
    setAppliedPeriod(period);
    setAppliedValue(value);
  };

  const { data: analyticsData, isLoading, refetch } = useGetAnalyticsQuery(
    appliedPeriod && appliedValue ? { period: appliedPeriod, value: appliedValue } : undefined
  );
  
  const stats = analyticsData?.data?.stats || {
    totalUsers: 0,
    totalDepartments: 0,
    totalRooms: 0,
    totalServices: 0,
    totalPatients: 0,
    activePatients: 0,
    newPatientsThisMonth: 0,
    inactivePatients: 0,
    totalEncounters: 0,
    todayEncounters: 0,
    todayStatEncounters: 0,
    encountersThisMonth: 0,
  };

  const chartData = analyticsData?.data || {
    stats: stats,
    encountersOverTime: [],
    patientsOverTime: [],
    encountersByType: [],
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        router.push('/admin/users');
        break;
      case 'schedule':
        router.push('/admin/schedule');
        break;
      case 'rooms':
        router.push('/admin/rooms');
        break;
      case 'departments':
        router.push('/admin/departments');
        break;
      case 'services':
        router.push('/admin/services');
        break;
      case 'room-services':
        router.push('/admin/room-services');
        break;
      case 'modalities':
        router.push('/admin/imaging-modalities');
        break;
      case 'machines':
        router.push('/admin/modality-machines');
        break;
      case 'shift-templates':
        router.push('/admin/shift-templates');
        break;
      default:
        break;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-foreground">System administration and management overview</p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={isRefreshing || isLoading}
        />
      </div>

      <AdminStats
        totalUsers={stats.totalUsers}
        totalDepartments={stats.totalDepartments}
        totalRooms={stats.totalRooms}
        totalServices={stats.totalServices}
        totalEncounters={stats.totalEncounters}
        todayEncounters={stats.todayEncounters}
        totalPatients={stats.totalPatients}
        isLoading={isLoading}
      />

      <AnalyticsCharts 
        data={chartData} 
        isLoading={isLoading}
        period={period}
        value={value}
        appliedPeriod={appliedPeriod}
        appliedValue={appliedValue}
        onPeriodChange={handlePeriodChange}
        onValueChange={setValue}
        onApplyFilter={handleApplyFilter}
      />

      <AdminQuickActions onActionClick={handleQuickAction} />
    </div>
  );
}