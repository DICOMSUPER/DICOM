"use client";

import { useState } from "react";
import { DashboardStats } from "@/components/reception/dashboard-stats";
import { QueuePreview } from "@/components/reception/queue-preview";
import { ReceptionCharts } from "@/components/reception/reception-charts";
import { useRouter } from "next/navigation";
import { useGetPatientStatsQuery } from "@/store/patientApi";
import {
  useGetPatientEncounterStatsQuery,
  useGetPatientEncountersQuery,
} from "@/store/patientEncounterApi";
import { useGetReceptionAnalyticsQuery } from "@/store/analyticsApi";
import { RefreshButton } from "@/components/ui/refresh-button";

export default function ReceptionDashboard() {
  const router = useRouter();
  const [period, setPeriod] = useState<"week" | "month" | "year" | undefined>();
  const [value, setValue] = useState<string>("");
  const [appliedPeriod, setAppliedPeriod] = useState<
    "week" | "month" | "year" | undefined
  >();
  const [appliedValue, setAppliedValue] = useState<string>("");

  const getWeekNumber = (date: Date): string => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const getDefaultValue = (periodType: "week" | "month" | "year"): string => {
    const now = new Date();
    if (periodType === "week") {
      return getWeekNumber(now);
    }
    if (periodType === "month") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
    if (periodType === "year") {
      return now.getFullYear().toString();
    }
    return "";
  };

  const handlePeriodChange = (
    newPeriod: "week" | "month" | "year" | undefined
  ) => {
    setPeriod(newPeriod);
    if (newPeriod) {
      setValue(getDefaultValue(newPeriod));
    } else {
      setValue("");
    }
  };

  const handleApplyFilter = () => {
    setAppliedPeriod(period);
    setAppliedValue(value);
  };

  const {
    data: patientStatsData,
    isLoading: patientStatsLoading,
    refetch: refetchPatientStats,
  } = useGetPatientStatsQuery();
  const {
    data: encounterStats,
    isLoading: encounterStatsLoading,
    refetch: refetchEncounterStats,
  } = useGetPatientEncounterStatsQuery(undefined);
  const { data: recentEncounters, isLoading: encountersLoading } =
    useGetPatientEncountersQuery({
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useGetReceptionAnalyticsQuery(
    appliedPeriod && appliedValue
      ? { period: appliedPeriod, value: appliedValue }
      : undefined
  );

  const patientStats = patientStatsData?.data;
  const encounterStatsData = encounterStats?.data;

  const stats = {
    activePatient: patientStats?.activePatients || 0,
    dailyCheckins: encounterStatsData?.todayEncounter || 0,
    urgentNotifications: encounterStatsData?.todayStatEncounter || 0,
    newPatientsThisMonth: patientStats?.newPatientsThisMonth || 0,
    todayEncounters: encounterStatsData?.todayEncounter || 0,
    todayStatEncounters: encounterStatsData?.todayStatEncounter || 0,
  };

  const isLoading = patientStatsLoading || encounterStatsLoading;
  const chartData = analyticsData?.data;

  const recentEncountersArray = Array.isArray(recentEncounters)
    ? recentEncounters
    : (recentEncounters as any)?.data || [];

  const handleGoToPatients = () => {
    router.push("/reception/patients");
  };

  const handleGoToEncounters = () => {
    router.push("/reception/encounters");
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchAnalytics(),
      refetchPatientStats(),
      refetchEncounterStats(),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Reception Dashboard
          </h1>
          <p className="text-foreground">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          loading={
            analyticsLoading || patientStatsLoading || encounterStatsLoading
          }
        />
      </div>

      <DashboardStats stats={stats} isLoading={isLoading} />

      <ReceptionCharts
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

      <QueuePreview
        encounters={recentEncountersArray || []}
        onViewAll={handleGoToPatients}
        onViewEncounters={handleGoToEncounters}
      />
    </div>
  );
}
