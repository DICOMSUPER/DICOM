"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  useFilterEncounterWithPaginationQuery,
  useGetPatientEncounterStatsQuery,
} from "@/store/patientEncounterApi";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { EncounterSearchFilters } from "@/interfaces/patient/patient-workflow.interface";
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
} from "@/enums/patient-workflow.enum";
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
import { ErrorAlert } from "@/components/ui/error-alert";
import { EncounterFilter } from "@/components/reception/encounter-filter";
import { FilterEncounterWithPaginationParams } from "@/interfaces/patient/patient-visit.interface";
import { Pagination } from "@/components/common/PaginationV1";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function EncountersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 5;

  // UI state (what user is typing/selecting)
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    EncounterPriorityLevel | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState<EncounterStatus | undefined>(
    undefined
  );
  const [startDate, setStartDate] = useState<Date | string | undefined>(
    undefined
  );
  const [endDate, setEndDate] = useState<Date | string | undefined>(undefined);
  const [serviceId, setServiceId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<EncounterType | undefined>(undefined);
  // Applied state (what's actually used in the query)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<
    EncounterStatus | undefined
  >(undefined);
  const [appliedStartDate, setAppliedStartDate] = useState<
    Date | string | undefined
  >(undefined);
  const [appliedEndDate, setAppliedEndDate] = useState<
    Date | string | undefined
  >(undefined);
  const [appliedServiceId, setAppliedServiceId] = useState<string | undefined>(
    undefined
  );
  const [appliedPriorityFilter, setAppliedPriorityFilter] = useState<
    string | undefined
  >(undefined);
  const [appliedType, setAppliedType] = useState<EncounterType | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);

  // Build query params from applied filters
  const queryParams = useMemo<FilterEncounterWithPaginationParams>(() => {
    return {
      page,
      limit,
      order: "desc",
      sortField: "encounterDate",
      search: appliedSearchTerm.trim() || undefined,
      status: appliedStatusFilter,
      startDate: appliedStartDate,
      endDate: appliedEndDate,
      serviceId: appliedServiceId,
      priority: appliedPriorityFilter,
      type: appliedType,
    };
  }, [
    page,
    limit,
    appliedSearchTerm,
    appliedStatusFilter,
    appliedStartDate,
    appliedEndDate,
    appliedServiceId,
    appliedPriorityFilter,
    appliedType,
  ]);

  // API hooks
  const {
    data: encounters,
    isLoading,
    error: encountersError,
    refetch,
  } = useFilterEncounterWithPaginationQuery(queryParams);

  const [deleteEncounter] = useDeletePatientEncounterMutation();

  // Error handling
  useEffect(() => {
    if (encountersError) {
      const error = encountersError as FetchBaseQueryError;
      const errorMessage =
        error?.data && typeof error.data === "object" && "message" in error.data
          ? (error.data as { message: string }).message
          : "Failed to load encounters. Please try again.";
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [encountersError]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedServiceId(serviceId);
    setPage(1);
    setAppliedPriorityFilter(priorityFilter);
    setAppliedType(type);
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    serviceId,
    priorityFilter,
    type,
  ]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setPriorityFilter(undefined);
    setStatusFilter(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setServiceId(undefined);
    setAppliedSearchTerm("");
    setAppliedStatusFilter(undefined);
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
    setAppliedServiceId(undefined);
    setAppliedType(undefined);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDeleteEncounter = useCallback(
    async (encounter: PatientEncounter) => {
      if (confirm("Are you sure you want to delete this encounter?")) {
        try {
          await deleteEncounter(encounter.id).unwrap();
          await refetch();
        } catch (err) {
          const error = err as ApiError;
          console.error("Error deleting encounter:", error?.data?.message);
        }
      }
    },
    [deleteEncounter, refetch]
  );

  const handleViewEncounter = useCallback(
    (encounter: PatientEncounter) => {
      router.push(`/reception/encounters/${encounter.id}`);
    },
    [router]
  );

  const handleEditEncounter = useCallback(
    (encounter: PatientEncounter) => {
      router.push(`/reception/encounters/${encounter.id}?edit=true`);
    },
    [router]
  );

  // Process encounters data
  const encountersArray = useMemo(() => {
    return encounters?.data ?? [];
  }, [encounters?.data]);

  const { data: encounterStatsData, isLoading: isLoadingEncounterStats } =
    useGetPatientEncounterStatsQuery();

  const encounterStats = encounterStatsData?.data || {
    totalEncounters: 0,
    encountersByType: {
      emergency: 0,
      inpatient: 0,
      outpatient: 0,
    },
    encountersThisMonth: 0,
    averageEncountersPerPatient: 0,
    todayEncounter: 0,
    todayStatEncounter: 0,
  };

  console.log(encounterStats);
  // Calculate stats from filtered data // TODO, using custom api later
  const stats = useMemo(() => {
    const scheduledCount = encountersArray.filter(
      (e) => e.status === EncounterStatus.WAITING
    ).length;
    const inProgressCount = encountersArray.filter(
      (e) => e.status === EncounterStatus.ARRIVED
    ).length;
    const completedCount = encountersArray.filter(
      (e) => e.status === EncounterStatus.FINISHED
    ).length;

    return {
      totalCount: encountersArray.length,
      scheduledCount,
      inProgressCount,
      completedCount,
    };
  }, [encountersArray]);

  // Pagination metadata
  const paginationMeta = useMemo(() => {
    if (!encounters) return null;
    return {
      total: encounters.total,
      page: encounters.page,
      limit: limit,
      totalPages: encounters.totalPages,
      hasNextPage: encounters.hasNextPage,
      hasPreviousPage: encounters.hasPreviousPage,
    };
  }, [encounters, limit]);
  return (
    <div className="space-y-6">
      {/* Header */}
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
          <RefreshButton onRefresh={handleRefresh} loading={isLoading} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorAlert
          className="mb-4"
          title="Failed to load encounters"
          message={error}
        />
      )}

      {/* Stats Cards */}
      <EncounterStatsCards
        totalCountThisMonth={encounterStats?.encountersThisMonth || 0}
        todayEncounter={encounterStats?.todayEncounter || 0}
        todayStatEncounter={encounterStats?.todayStatEncounter || 0}
        averageEncountersPerPatient={
          encounterStats?.averageEncountersPerPatient
        }
        isLoading={isLoadingEncounterStats}
      />

      {/* Filters */}
      <EncounterFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        type={type}
        onTypeChange={setType}
        serviceId={serviceId}
        onServiceIdChange={setServiceId}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={isLoading}
      />

      {/* Encounters Table */}
      <EncounterTable
        encounters={encountersArray}
        isLoading={isLoading}
        emptyStateIcon={<Stethoscope className="h-12 w-12" />}
        emptyStateTitle="No encounters found"
        emptyStateDescription="No encounters match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewEncounter}
        onEditEncounter={handleEditEncounter}
        onDeleteEncounter={handleDeleteEncounter}
      />

      {/* Pagination */}
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
