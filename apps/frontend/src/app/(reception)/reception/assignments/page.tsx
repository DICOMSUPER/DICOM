"use client";

import { useState, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { ReceptionFilters } from "@/components/reception/reception-filters";
import { ReceptionTableTabs } from "@/components/reception/reception-table-tabs";
import { AssignmentsStatsCards } from "@/components/reception/assignments-stats-cards";
import { AssignmentsTable } from "@/components/reception/assignments-table";
import { TabsContent } from "@/components/ui/tabs";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Clock, Users, CheckCircle } from "lucide-react";
import { 
  useGetAllEncountersQuery,
  useGetEncounterStatsQuery,
} from "@/store/patientApi";

export default function AssignmentsPage() {
  const [notificationCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch real data
  const { data: encounters, isLoading: encountersLoading, error: encountersError, refetch: refetchEncounters } =
    useGetAllEncountersQuery({
      searchTerm: searchTerm || undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  const { data: encounterStats, isLoading: statsLoading, refetch: refetchStats } =
    useGetEncounterStatsQuery(undefined);

  // Handle errors
  useEffect(() => {
    if (encountersError) {
      setError('Failed to load assignment data. Please try again.');
    } else {
      setError(null);
    }
  }, [encountersError]);

  // Process real data from API
  const activeAssignments = encounters?.filter(encounter => 
    encounter.status === 'active' || encounter.status === 'in-progress'
  ).map(encounter => ({
    id: encounter.id,
    patient: {
      firstName: encounter.patient?.firstName || 'Unknown',
      lastName: encounter.patient?.lastName || 'Patient',
      patientCode: encounter.patient?.patientCode || 'N/A',
      phoneNumber: encounter.patient?.phoneNumber || 'N/A'
    },
    physician: {
      firstName: encounter.assignedPhysicianId ? 'Dr. ' : 'Unassigned',
      lastName: encounter.assignedPhysicianId || '',
      specialty: encounter.physicianSpecialty || 'General'
    },
    room: {
      name: encounter.roomId || 'Unassigned',
      floor: encounter.roomFloor || 'N/A'
    },
    priority: encounter.priority || 'normal',
    assignmentDate: new Date(encounter.encounterDate),
    status: encounter.status || 'active'
  })) || [];

  const pendingAssignments = encounters?.filter(encounter => 
    encounter.status === 'pending' || encounter.status === 'waiting'
  ).map(encounter => ({
    id: encounter.id,
    patient: {
      firstName: encounter.patient?.firstName || 'Unknown',
      lastName: encounter.patient?.lastName || 'Patient',
      patientCode: encounter.patient?.patientCode || 'N/A',
      phoneNumber: encounter.patient?.phoneNumber || 'N/A'
    },
    physician: {
      firstName: encounter.assignedPhysicianId ? 'Dr. ' : 'Unassigned',
      lastName: encounter.assignedPhysicianId || '',
      specialty: encounter.physicianSpecialty || 'General'
    },
    room: {
      name: encounter.roomId || 'Unassigned',
      floor: encounter.roomFloor || 'N/A'
    },
    priority: encounter.priority || 'normal',
    assignmentDate: new Date(encounter.encounterDate),
    status: encounter.status || 'pending'
  })) || [];

  const completedAssignments = encounters?.filter(encounter => 
    encounter.status === 'completed' || encounter.status === 'finished'
  ).map(encounter => ({
    id: encounter.id,
    patient: {
      firstName: encounter.patient?.firstName || 'Unknown',
      lastName: encounter.patient?.lastName || 'Patient',
      patientCode: encounter.patient?.patientCode || 'N/A',
      phoneNumber: encounter.patient?.phoneNumber || 'N/A'
    },
    physician: {
      firstName: encounter.assignedPhysicianId ? 'Dr. ' : 'Unassigned',
      lastName: encounter.assignedPhysicianId || '',
      specialty: encounter.physicianSpecialty || 'General'
    },
    room: {
      name: encounter.roomId || 'Unassigned',
      floor: encounter.roomFloor || 'N/A'
    },
    priority: encounter.priority || 'normal',
    assignmentDate: new Date(encounter.encounterDate),
    status: encounter.status || 'completed'
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

  const handleRemoveAssignment = (assignment: any) => {
    console.log("Remove assignment:", assignment);
  };

  const handleMarkComplete = (assignment: any) => {
    console.log("Mark complete:", assignment);
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchEncounters(),
      refetchStats()
    ]);
  };

  const tabs = [
    { value: "active", label: "Active", count: activeAssignments.length },
    { value: "pending", label: "Pending", count: pendingAssignments.length },
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
        {/* Header with Quick Actions and Refresh */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assignment Management</h1>
            <p className="text-foreground">Manage patient-physician assignments and room allocations</p>
          </div>
          <div className="flex items-center gap-4">
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={encountersLoading || statsLoading}
            />
            <QuickActionsBar />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

          {/* Stats Cards */}
        <AssignmentsStatsCards
          activeCount={activeAssignments.length}
          pendingCount={pendingAssignments.length}
          completedCount={completedAssignments.length}
          totalCount={activeAssignments.length + pendingAssignments.length + completedAssignments.length}
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

        {/* Assignment Tables */}
        <ReceptionTableTabs tabs={tabs} defaultTab="active">
            <TabsContent value="active">
            <AssignmentsTable
              assignments={activeAssignments}
              isLoading={encountersLoading}
              emptyStateIcon={<Users className="h-12 w-12" />}
              emptyStateTitle="No Active Assignments"
              emptyStateDescription="There are currently no active assignments. New assignments will appear here when they are created."
              onViewDetails={handleViewDetails}
              onEditAssignment={handleEditAssignment}
              onRemoveAssignment={handleRemoveAssignment}
              onMarkComplete={handleMarkComplete}
            />
            </TabsContent>

            <TabsContent value="pending">
            <AssignmentsTable
              assignments={pendingAssignments}
              isLoading={encountersLoading}
              emptyStateIcon={<Clock className="h-12 w-12" />}
              emptyStateTitle="No Pending Assignments"
              emptyStateDescription="There are currently no pending assignments. New assignments will appear here when they are created."
              onViewDetails={handleViewDetails}
              onEditAssignment={handleEditAssignment}
              onRemoveAssignment={handleRemoveAssignment}
            />
            </TabsContent>

            <TabsContent value="completed">
            <AssignmentsTable
              assignments={completedAssignments}
              isLoading={encountersLoading}
              emptyStateIcon={<CheckCircle className="h-12 w-12" />}
              emptyStateTitle="No Completed Assignments"
              emptyStateDescription="Completed assignments will appear here. Check back later to see finished cases."
              onViewDetails={handleViewDetails}
              onEditAssignment={handleEditAssignment}
            />
            </TabsContent>
        </ReceptionTableTabs>
      </WorkspaceLayout>
    </div>
  );
}
