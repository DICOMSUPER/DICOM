"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// WorkspaceLayout and SidebarNav moved to layout.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  useGetPatientEncountersQuery,
  useDeletePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import {
  PatientEncounter,
  EncounterSearchFilters,
} from "@/interfaces/patient/patient-workflow.interface";
import { EncounterStatus, EncounterType } from "@/enums/patient-workflow.enum";
import {
  Stethoscope,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  FileText,
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { EncounterTable } from "@/components/reception/encounter-table";
import { EncounterStatsCards } from "@/components/reception/encounter-stats-cards";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ReceptionFilters } from "@/components/reception/reception-filters";

export default function EncountersPage() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filters, setFilters] = useState<EncounterSearchFilters>({
    encounterType: undefined,
    status: undefined,
    assignedPhysicianId: undefined,
    limit: 20,
    offset: 0,
    sortBy: "encounterDate",
    sortOrder: "desc",
  });

  // API hooks
  const {
    data: encounters,
    isLoading,
    error,
    refetch,
  } = useGetPatientEncountersQuery(filters);
  const [deleteEncounter, { isLoading: isDeleting }] =
    useDeletePatientEncounterMutation();

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleFilterChange = (
    key: keyof EncounterSearchFilters,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDeleteEncounter = async (encounter: any) => {
    if (confirm("Are you sure you want to delete this encounter?")) {
      try {
        await deleteEncounter(encounter.id).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting encounter:", error);
      }
    }
  };

  const handleViewEncounter = (encounter: any) => {
    router.push(`/reception/encounters/${encounter.id}`);
  };

  const handleEditEncounter = (encounter: any) => {
    router.push(`/reception/encounters/${encounter.id}?edit=true`);
  };

  const handleCreateEncounter = () => {
    router.push("/reception/patients");
  };

  const filteredEncounters =
    encounters?.data?.filter((encounter: PatientEncounter) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        encounter.patient?.firstName?.toLowerCase().includes(searchLower) ||
        encounter.patient?.lastName?.toLowerCase().includes(searchLower) ||
        encounter.patient?.patientCode?.toLowerCase().includes(searchLower) ||
        encounter.chiefComplaint?.toLowerCase().includes(searchLower) ||
        encounter.encounterType?.toLowerCase().includes(searchLower)
      );
    }) || [];

  // Calculate stats
  const scheduledCount = filteredEncounters?.filter(
    (e) => e.status === EncounterStatus.WAITING
  ).length;
  const inProgressCount = filteredEncounters.filter(
    (e) => e.status === EncounterStatus.ARRIVED
  ).length;
  const completedCount = filteredEncounters.filter(
    (e) => e.status === EncounterStatus.FINISHED
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions and Refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Encounter Management
          </h1>
          <p className="text-foreground">
            Search and manage patient encounters
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton onRefresh={() => refetch()} loading={isLoading} />
          {/* <Button
              onClick={handleCreateEncounter}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Encounter
            </Button> */}
        </div>
      </div>

      {/* Error Display */}
      {Boolean(error) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            An error occurred while loading encounters
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <EncounterStatsCards
        totalCount={filteredEncounters.length}
        scheduledCount={scheduledCount}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        isLoading={isLoading}
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

      {/* Encounters Table */}
      <EncounterTable
        encounters={filteredEncounters as any}
        isLoading={isLoading}
        emptyStateIcon={<Stethoscope className="h-12 w-12" />}
        emptyStateTitle="No encounters found"
        emptyStateDescription="No encounters match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewEncounter}
        onEditEncounter={handleEditEncounter}
        onDeleteEncounter={handleDeleteEncounter}
      />
    </div>
  );
}
