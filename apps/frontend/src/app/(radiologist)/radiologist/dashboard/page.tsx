"use client";

import { useState } from "react";
import { RadiologistDashboardStats } from "@/components/radiologist/radiologist-dashboard-stats";
import { RadiologistDashboardPreview } from "@/components/radiologist/radiologist-dashboard-preview";
import { RadiologistCharts } from "@/components/radiologist/radiologist-charts";
import { useRouter } from "next/navigation";
import { useGetRadiologistAnalyticsQuery } from "@/store/analyticsApi";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useGetPaginatedDicomStudiesQuery } from "@/store/dicomStudyApi";

export default function RadiologistDashboard() {
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
    useGetRadiologistAnalyticsQuery(
      appliedPeriod && appliedValue ? { period: appliedPeriod, value: appliedValue } : undefined
    );

  const { data: recentStudiesData, isLoading: studiesLoading, refetch: refetchStudies } =
    useGetPaginatedDicomStudiesQuery({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });

  const stats = analyticsData?.data?.stats || {
    totalStudies: 0,
    pendingStudies: 0,
    inProgressStudies: 0,
    completedStudies: 0,
    todayStudies: 0,
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    todayReports: 0,
  };
  
  const isLoading = analyticsLoading;
  const chartData = analyticsData?.data;

  const recentStudiesArray = recentStudiesData?.data || [];

  const handleGoToWorkTree = () => {
    router.push("/radiologist/work-tree");
  };

  const handleGoToReports = () => {
    router.push("/radiologist/reports");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchStudies(),
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
            Radiologist Dashboard
          </h1>
          <p className="text-foreground">
            Welcome back! Here&apos;s your overview for today.
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={isRefreshing || analyticsLoading || studiesLoading}
        />
      </div>

      <RadiologistDashboardStats stats={stats} isLoading={isLoading} />

      <RadiologistCharts 
        data={chartData} 
        isLoading={analyticsLoading}
        period={period}
        value={value}
        appliedPeriod={appliedPeriod}
        onPeriodChange={handlePeriodChange}
        onValueChange={setValue}
        onApplyFilter={handleApplyFilter}
      />

      <RadiologistDashboardPreview
        studies={recentStudiesArray || []}
        onViewWorkTree={handleGoToWorkTree}
        onViewReports={handleGoToReports}
        isLoading={studiesLoading}
      />
    </div>
  );
}

