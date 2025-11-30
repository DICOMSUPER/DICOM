/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
// WorkspaceLayout and SidebarNav moved to layout.tsx
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { ReceptionFilters } from "@/components/reception/reception-filters";
import { ReceptionTableTabs } from "@/components/reception/reception-table-tabs";
import { QueueStatsCards } from "@/components/reception/queue-stats-cards";
import { QueueTable } from "@/components/reception/queue-table";
import { TabsContent } from "@/components/ui/tabs";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Clock, Users, CheckCircle } from "lucide-react";

import {
  useGetPatientEncounterStatsQuery,
  useGetPatientEncountersQuery,
} from "@/store/patientEncounterApi";
import { useGetReceptionAnalyticsQuery } from "@/store/analyticsApi";
export default function QueuePage() {
  const [notificationCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [appliedPriorityFilter, setAppliedPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch real data
  const {
    data: encounters,
    isLoading: encountersLoading,
    isFetching: encountersFetching,
    error: encountersError,
    refetch: refetchEncounters,
  } = useGetPatientEncountersQuery({
    searchTerm: appliedSearchTerm || undefined,
    priority: appliedPriorityFilter !== "all" ? appliedPriorityFilter : undefined,
    status: appliedStatusFilter !== "all" ? appliedStatusFilter : undefined,
  });
  const {
    data: encounterStats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useGetPatientEncounterStatsQuery(undefined);

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isFetching: analyticsFetching,
    refetch: refetchAnalytics,
  } = useGetReceptionAnalyticsQuery();

  // Handle errors
  useEffect(() => {
    if (encountersError) {
      setError("Failed to load queue data. Please try again.");
    } else {
      setError(null);
    }
  }, [encountersError]);

  const encounterList = Array.isArray(encounters)
    ? encounters
    : Array.isArray((encounters as any)?.data)
    ? (encounters as any).data
    : [];

  // Process real data from API
  const waitingAssignments =
    encounterList
      ?.filter(
        (encounter) =>
          encounter.status === "waiting" || encounter.status === "pending"
      )
      .map((encounter, index) => ({
        id: encounter.id,
        queueNumber: String(index + 1).padStart(3, "0"),
        encounter: {
          patient: {
            firstName: encounter.patient?.firstName || "Unknown",
            lastName: encounter.patient?.lastName || "Patient",
            patientCode: encounter.patient?.patientCode || "N/A",
          },
        },
        priority: encounter.priority || "normal",
        roomId: encounter.roomId || undefined,
        assignmentDate: new Date(encounter.encounterDate),
      })) || [];

  const inProgressAssignments =
    encounterList
      ?.filter(
        (encounter) =>
          encounter.status === "in-progress" || encounter.status === "active"
      )
      .map((encounter, index) => ({
        id: encounter.id,
        queueNumber: String(index + 1).padStart(3, "0"),
        encounter: {
          patient: {
            firstName: encounter.patient?.firstName || "Unknown",
            lastName: encounter.patient?.lastName || "Patient",
            patientCode: encounter.patient?.patientCode || "N/A",
          },
        },
        priority: encounter.priority || "normal",
        roomId: encounter.roomId || undefined,
        assignmentDate: new Date(encounter.encounterDate),
      })) || [];

  const completedAssignments =
    encounterList
      ?.filter(
        (encounter) =>
          encounter.status === "completed" || encounter.status === "finished"
      )
      .map((encounter, index) => ({
        id: encounter.id,
        queueNumber: String(index + 1).padStart(3, "0"),
        encounter: {
          patient: {
            firstName: encounter.patient?.firstName || "Unknown",
            lastName: encounter.patient?.lastName || "Patient",
            patientCode: encounter.patient?.patientCode || "N/A",
          },
        },
        priority: encounter.priority || "normal",
        roomId: encounter.roomId || undefined,
        assignmentDate: new Date(encounter.encounterDate),
      })) || [];

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleViewDetails = (assignment: any) => {
    console.log("View details:", assignment);
  };

  const handleEditAssignment = (assignment: any) => {
    console.log("Edit assignment:", assignment);
  };

  const handleRemoveFromQueue = (assignment: any) => {
    console.log("Remove from queue:", assignment);
  };

  const handleStartTreatment = (assignment: any) => {
    console.log("Start treatment:", assignment);
  };

  const handleMarkComplete = (assignment: any) => {
    console.log("Mark complete:", assignment);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchEncounters(), refetchStats(), refetchAnalytics()]);
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedPriorityFilter(priorityFilter);
    setAppliedStatusFilter(statusFilter);
  }, [searchTerm, priorityFilter, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setAppliedSearchTerm("");
    setAppliedPriorityFilter("all");
    setAppliedStatusFilter("all");
  }, []);

  const encountersByStatus = analyticsData?.data?.encountersByStatus || [];
  const getStatusCount = (statuses: string[]): number => {
    return encountersByStatus
      .filter((item: { status: string; count: number }) =>
        statuses.some((s) => s.toLowerCase() === item.status.toLowerCase())
      )
      .reduce((sum: number, item: { status: string; count: number }) => sum + item.count, 0);
  };

  const waitingCount = getStatusCount(['waiting', 'pending']);
  const inProgressCount = getStatusCount(['in-progress', 'in_progress', 'active', 'arrived']);
  const completedCount = getStatusCount(['completed', 'finished', 'done']);
  const totalCount = waitingCount + inProgressCount + completedCount;

  const tabs = [
    { value: "waiting", label: "Waiting", count: waitingCount },
    {
      value: "in-progress",
      label: "In Progress",
      count: inProgressCount,
    },
    {
      value: "completed",
      label: "Completed",
      count: completedCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions and Refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Queue Management
          </h1>
          <p className="text-foreground">
            Monitor and manage patient queue assignments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={encountersLoading || encountersFetching || statsLoading || statsFetching || analyticsLoading || analyticsFetching}
          />
          <QuickActionsBar />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorAlert title="Failed to load queue data" message={error} className="mb-4" />
      )}

      {/* Stats Cards */}
      <QueueStatsCards
        waitingCount={waitingCount}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        totalCount={totalCount}
        isLoading={statsLoading || analyticsLoading}
      />

      {/* Filters */}
      <ReceptionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={encountersLoading || encountersFetching}
      />

      {/* Queue Tables */}
      <ReceptionTableTabs tabs={tabs} defaultTab="waiting">
        <TabsContent value="waiting">
          <QueueTable
            assignments={waitingAssignments}
            isLoading={encountersLoading}
            emptyStateIcon={<Clock className="h-12 w-12" />}
            emptyStateTitle="No patients waiting"
            emptyStateDescription="All patients have been assigned or are being treated."
            onViewDetails={handleViewDetails}
            onEditAssignment={handleEditAssignment}
            onRemoveFromQueue={handleRemoveFromQueue}
            showWaitTime={true}
          />
        </TabsContent>

        <TabsContent value="in-progress">
          <QueueTable
            assignments={inProgressAssignments}
            isLoading={encountersLoading}
            emptyStateIcon={<Users className="h-12 w-12" />}
            emptyStateTitle="No In-Progress Assignments"
            emptyStateDescription="There are currently no patients being treated. New assignments will appear here when treatment begins."
            onViewDetails={handleViewDetails}
            onEditAssignment={handleEditAssignment}
            onStartTreatment={handleStartTreatment}
            onMarkComplete={handleMarkComplete}
            showWaitTime={true}
          />
        </TabsContent>

        <TabsContent value="completed">
          <QueueTable
            assignments={completedAssignments}
            isLoading={encountersLoading}
            emptyStateIcon={<CheckCircle className="h-12 w-12" />}
            emptyStateTitle="No Completed Assignments"
            emptyStateDescription="Completed treatments will appear here. Check back later to see finished cases."
            onViewDetails={handleViewDetails}
            onEditAssignment={handleEditAssignment}
            showCompletedTime={true}
          />
        </TabsContent>
      </ReceptionTableTabs>
    </div>
  );
}
