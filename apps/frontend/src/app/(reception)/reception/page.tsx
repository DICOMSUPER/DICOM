"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { DashboardStats } from "@/components/reception/dashboard-stats";
import { UrgentNotifications } from "@/components/reception/urgent-notifications";
import { QueuePreview } from "@/components/reception/queue-preview";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPatientStatsQuery,
  useGetEncounterStatsQuery,
  useGetAllEncountersQuery,
} from "@/store/patientApi";

export default function ReceptionDashboard() {
  const router = useRouter();
  const [notificationCount] = useState(3);

  // Fetch real data
  const { data: patientStats, isLoading: patientStatsLoading } =
    useGetPatientStatsQuery();
  const { data: encounterStats, isLoading: encounterStatsLoading } =
    useGetEncounterStatsQuery(undefined);
  const { data: recentEncounters, isLoading: encountersLoading } =
    useGetAllEncountersQuery({
      limit: 5,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  // Calculate stats from real data
  const stats = {
    patientsWaiting: patientStats?.totalPatients || 0,
    checkinsCompleted: encounterStats?.totalEncounters || 0,
    urgentNotifications: 0, // TODO: Implement urgent notifications
    totalPatientsToday: patientStats?.totalPatients || 0,
  };

  // Transform encounters to queue format for preview
  const recentQueue =
    recentEncounters?.map((encounter) => ({
      id: encounter.id,
      name: encounter.patient
        ? `${encounter.patient.firstName} ${encounter.patient.lastName}`
        : "Unknown Patient",
      time: new Date(encounter.encounterDate).toLocaleTimeString(),
      priority: (encounter.priority || "normal") as any,
    })) || [];

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
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
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
      </WorkspaceLayout>
    </div>
  );
}
