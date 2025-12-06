"use client";

import { useState } from "react";
import { ImagingTechnicianDashboardStats } from "@/components/imaging-technician/imaging-technician-dashboard-stats";
import { ImagingTechnicianDashboardPreview } from "@/components/imaging-technician/imaging-technician-dashboard-preview";
import { ImagingTechnicianCharts } from "@/components/imaging-technician/imaging-technician-charts";
import { useRouter } from "next/navigation";
import { useGetImagingOrdersPaginatedQuery } from "@/store/imagingOrderApi";
import { useGetImagingTechnicianAnalyticsQuery } from "@/store/analyticsApi";
import { RefreshButton } from "@/components/ui/refresh-button";

export default function ImagingTechnicianDashboard() {
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
    useGetImagingTechnicianAnalyticsQuery(
      appliedPeriod && appliedValue ? { period: appliedPeriod, value: appliedValue } : undefined
    );

  const { data: recentOrdersData, isLoading: ordersLoading, refetch: refetchOrders } =
    useGetImagingOrdersPaginatedQuery({
      page: 1,
      limit: 10,
      sortField: "createdAt",
      order: "desc",
    });

  const stats = analyticsData?.data?.stats || {
    totalImagingOrders: 0,
    pendingImagingOrders: 0,
    inProgressImagingOrders: 0,
    completedImagingOrders: 0,
    todayImagingOrders: 0,
    totalStudies: 0,
    todayStudies: 0,
    activeMachines: 0,
  };
  
  const isLoading = analyticsLoading;
  const chartData = analyticsData?.data;

  const recentOrdersArray = recentOrdersData?.data || [];

  const handleGoToOrders = () => {
    router.push("/imaging-technician/imaging-orders");
  };

  const handleGoToMachines = () => {
    router.push("/imaging-technician/modality-machines");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchOrders(),
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
            Imaging Technician Dashboard
          </h1>
          <p className="text-foreground">
            Welcome back! Here&apos;s your overview for today.
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={isRefreshing || analyticsLoading || ordersLoading}
        />
      </div>

      <ImagingTechnicianDashboardStats stats={stats} isLoading={isLoading} />

      <ImagingTechnicianCharts 
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

      <ImagingTechnicianDashboardPreview
        orders={recentOrdersArray || []}
        onViewOrders={handleGoToOrders}
        onViewMachines={handleGoToMachines}
        isLoading={ordersLoading}
      />
    </div>
  );
}

