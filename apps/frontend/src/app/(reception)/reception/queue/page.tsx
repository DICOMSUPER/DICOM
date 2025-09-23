"use client";

import { useState, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { ReceptionFilters } from "@/components/reception/reception-filters";
import { ReceptionTableTabs } from "@/components/reception/reception-table-tabs";
import { QueueStatsCards } from "@/components/reception/queue-stats-cards";
import { QueueTable } from "@/components/reception/queue-table";
import { TabsContent } from "@/components/ui/tabs";
import { Clock, Users, CheckCircle } from "lucide-react";
import {
  useGetAllEncountersQuery,
  useGetEncounterStatsQuery,
} from "@/store/patientApi";

export default function QueuePage() {
  const [notificationCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch real data
  const { data: encounters, isLoading: encountersLoading, error: encountersError } =
    useGetAllEncountersQuery({
      searchTerm: searchTerm || undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  const { data: encounterStats, isLoading: statsLoading } =
    useGetEncounterStatsQuery(undefined);

  // Handle errors
  useEffect(() => {
    if (encountersError) {
      setError('Failed to load queue data. Please try again.');
    } else {
      setError(null);
    }
  }, [encountersError]);

  // Process real data from API
  const waitingAssignments = encounters?.filter(encounter => 
    encounter.status === 'waiting' || encounter.status === 'pending'
  ).map((encounter, index) => ({
    id: encounter.id,
    queueNumber: String(index + 1).padStart(3, '0'),
    encounter: {
      patient: {
        firstName: encounter.patient?.firstName || 'Unknown',
        lastName: encounter.patient?.lastName || 'Patient',
        patientCode: encounter.patient?.patientCode || 'N/A'
      }
    },
    priority: encounter.priority || 'normal',
    roomId: encounter.roomId || undefined,
    assignmentDate: new Date(encounter.encounterDate)
  })) || [];

  const inProgressAssignments = encounters?.filter(encounter => 
    encounter.status === 'in-progress' || encounter.status === 'active'
  ).map((encounter, index) => ({
    id: encounter.id,
    queueNumber: String(index + 1).padStart(3, '0'),
    encounter: {
      patient: {
        firstName: encounter.patient?.firstName || 'Unknown',
        lastName: encounter.patient?.lastName || 'Patient',
        patientCode: encounter.patient?.patientCode || 'N/A'
      }
    },
    priority: encounter.priority || 'normal',
    roomId: encounter.roomId || undefined,
    assignmentDate: new Date(encounter.encounterDate)
  })) || [];

  const completedAssignments = encounters?.filter(encounter => 
    encounter.status === 'completed' || encounter.status === 'finished'
  ).map((encounter, index) => ({
    id: encounter.id,
    queueNumber: String(index + 1).padStart(3, '0'),
    encounter: {
      patient: {
        firstName: encounter.patient?.firstName || 'Unknown',
        lastName: encounter.patient?.lastName || 'Patient',
        patientCode: encounter.patient?.patientCode || 'N/A'
      }
    },
    priority: encounter.priority || 'normal',
    roomId: encounter.roomId || undefined,
    assignmentDate: new Date(encounter.encounterDate)
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

  const tabs = [
    { value: "waiting", label: "Waiting", count: waitingAssignments.length },
    { value: "in-progress", label: "In Progress", count: inProgressAssignments.length },
    { value: "completed", label: "Completed", count: completedAssignments.length },
  ];

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
        {/* Quick Actions Bar */}
        <section className="mb-6">
          <QuickActionsBar />
        </section>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <QueueStatsCards
          waitingCount={waitingAssignments.length}
          inProgressCount={inProgressAssignments.length}
          completedCount={completedAssignments.length}
          totalCount={waitingAssignments.length + inProgressAssignments.length + completedAssignments.length}
          isLoading={statsLoading}
        />

        {/* Filters */}
        <ReceptionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
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
      </WorkspaceLayout>
    </div>
  );
}