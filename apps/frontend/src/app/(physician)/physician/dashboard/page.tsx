"use client";

import { useState } from "react";
import { PhysicianDashboardStats } from "@/components/physician/physician-dashboard-stats";
import { PhysicianDashboardPreview } from "@/components/physician/physician-dashboard-preview";
import { PhysicianCharts } from "@/components/physician/physician-charts";
import { useRouter } from "next/navigation";
import {
  useGetPatientEncountersQuery,
} from "@/store/patientEncounterApi";
import { useGetPhysicianAnalyticsQuery } from "@/store/analyticsApi";
import { RefreshButton } from "@/components/ui/refresh-button";

export default function PhysicianDashboard() {
  const router = useRouter();
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | undefined>();
  const [value, setValue] = useState<string>('');
  const [appliedPeriod, setAppliedPeriod] = useState<'week' | 'month' | 'year' | undefined>();
  const [appliedValue, setAppliedValue] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } =
    useGetPhysicianAnalyticsQuery(
      appliedPeriod && appliedValue ? { period: appliedPeriod, value: appliedValue } : undefined
    );

  const { data: recentEncounters, isLoading: encountersLoading, refetch: refetchEncounters } =
    useGetPatientEncountersQuery({
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const stats = analyticsData?.data?.stats || {
    totalPatients: 0,
    activePatients: 0,
    todayEncounters: 0,
    pendingEncounters: 0,
    completedReports: 0,
    pendingReports: 0,
    totalImagingOrders: 0,
    pendingImagingOrders: 0,
    completedImagingOrders: 0,
  };
  
  const isLoading = analyticsLoading;
  const chartData = analyticsData?.data;

  const recentEncountersArray = Array.isArray(recentEncounters)
    ? recentEncounters
    : (recentEncounters as any)?.data || [];

  const handleGoToEncounters = () => {
    router.push("/physician/clinic-visit");
  };

  const handleGoToReports = () => {
    router.push("/physician/diagnosis-reports");
  };

  const handleGoToImagingOrders = () => {
    router.push("/physician/imaging-orders");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchEncounters(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Physician Dashboard
          </h1>
          <p className="text-foreground">
            Welcome back! Here&apos;s your overview for today.
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={isRefreshing || analyticsLoading || encountersLoading}
        />
      </div>

      <PhysicianDashboardStats stats={stats} isLoading={isLoading} />

      <PhysicianCharts 
        data={chartData} 
        isLoading={analyticsLoading}
        period={period}
        value={value}
        appliedPeriod={appliedPeriod}
        appliedValue={appliedValue}
        onPeriodChange={handlePeriodChange}
        onValueChange={setValue}
        onApplyFilter={handleApplyFilter}
      />

      <PhysicianDashboardPreview
        encounters={recentEncountersArray || []}
        onViewEncounters={handleGoToEncounters}
        onViewReports={handleGoToReports}
        onViewImagingOrders={handleGoToImagingOrders}
        isLoading={encountersLoading}
      />
    </div>
  );
}
