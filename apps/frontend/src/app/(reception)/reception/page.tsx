"use client";

// WorkspaceLayout and SidebarNav moved to layout.tsx
import { DashboardStats } from "@/components/reception/dashboard-stats";
import { UrgentNotifications } from "@/components/reception/urgent-notifications";
import { QueuePreview } from "@/components/reception/queue-preview";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetPatientStatsQuery } from "@/store/patientApi";
import {
  useGetPatientEncounterStatsQuery,
  useGetPatientEncountersQuery,
} from "@/store/patientEncounterApi";
import { AppHeader } from "@/components/app-header";
export default function ReceptionDashboard() {
  const router = useRouter();
  const [notificationCount] = useState(3);

  // Fetch real data
  const { data: patientStatsData, isLoading: patientStatsLoading } =
    useGetPatientStatsQuery();
  const { data: encounterStats, isLoading: encounterStatsLoading } =
    useGetPatientEncounterStatsQuery(undefined);
  const { data: recentEncounters, isLoading: encountersLoading } =
    useGetPatientEncountersQuery({
      limit: 5,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const patientStats = patientStatsData?.data;
  // Calculate stats from real data
  const stats = {
    patientsWaiting: patientStats?.totalPatients || 0,
    checkinsCompleted: encounterStats?.totalEncounters || 0,
    urgentNotifications: 0, // TODO: Implement urgent notifications
    totalPatientsToday: patientStats?.totalPatients || 0,
  };

  // Transform encounters to queue format for preview (normalize to array first)
  const recentEncountersArray = Array.isArray(recentEncounters)
    ? recentEncounters
    : (recentEncounters as any)?.data || [];
  const recentQueue = recentEncountersArray.map((encounter: any) => ({
    id: encounter.id,
    name: encounter.patient
      ? `${encounter.patient.firstName} ${encounter.patient.lastName}`
      : "Unknown Patient",
    time: new Date(encounter.encounterDate).toLocaleTimeString(),
    priority: (encounter.priority || "normal") as any,
  }));

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleGoToPatients = () => {
    router.push("/reception/patients");
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reception Dashboard
        </h1>
        <p className="text-foreground">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Key Stats Summary */}
      <DashboardStats stats={stats} />

      <QueuePreview patients={recentQueue} onViewAll={handleGoToPatients} />
    </div>
  );
}
