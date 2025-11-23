"use client";

import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { ReceptionFilters } from "@/components/reception/reception-filters";
import { PatientStatsCards } from "@/components/reception/patient-stats-cards";
import { PatientTable } from "@/components/reception/patient-table";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Pagination } from "@/components/common/PaginationV1";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetPatientsPaginatedQuery,
  useGetPatientStatsQuery,
  useDeletePatientMutation,
  useFilterPatientV2Query,
} from "@/store/patientApi";
import { Users, UserPlus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  Patient,
  PatientSearchFilters,
} from "@/interfaces/patient/patient-workflow.interface";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function ReceptionPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const filters: Omit<PatientSearchFilters, "limit" | "offset"> = {};

    if (appliedSearchTerm.trim()) {
      filters.searchTerm = appliedSearchTerm.trim();
    }

    if (appliedStatusFilter !== "all") {
      if (
        appliedStatusFilter === "active" ||
        appliedStatusFilter === "waiting" ||
        appliedStatusFilter === "in-progress"
      ) {
        filters.isActive = true;
      } else if (appliedStatusFilter === "completed") {
        filters.isActive = false;
      }
    }

    return {
      page,
      limit,
      filters,
    };
  }, [page, limit, appliedSearchTerm, appliedStatusFilter]);

  const {
    data: patientsData,
    isLoading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients,
  } = useFilterPatientV2Query({
    page,
    limit,
    search: appliedSearchTerm,
  });

  const {
    data: patientStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetPatientStatsQuery();

  useEffect(() => {
    if (patientsError) {
      const error = patientsError as FetchBaseQueryError;
      const errorMessage =
        error?.data && typeof error.data === "object" && "message" in error.data
          ? (error.data as { message: string }).message
          : "Failed to load patient data. Please try again.";
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [patientsError]);

  const patientsArray = useMemo(() => {
    return (patientsData?.data ?? []).map((patient: Patient) => ({
      id: patient.id,
      firstName: patient.firstName || "Unknown",
      lastName: patient.lastName || "Patient",
      patientCode: patient.patientCode || "N/A",
      dateOfBirth: patient.dateOfBirth
        ? typeof patient.dateOfBirth === "string"
          ? patient.dateOfBirth
          : patient.dateOfBirth.toISOString()
        : new Date().toISOString(),
      gender: patient.gender || "Unknown",
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      bloodType: patient.bloodType,
      isActive: patient.isActive ?? true,
      priority: "normal",
      encounters: patient.encounters || [],
    }));
  }, [patientsData?.data]);

  const paginationMeta = patientsData && {
    total: patientsData.total,
    page: patientsData.page,
    limit: limit,
    totalPages: patientsData.totalPages,
    hasNextPage: patientsData.hasNextPage,
    hasPreviousPage: patientsData.hasPreviousPage,
  };

  const handleRefresh = async () => {
    await Promise.all([refetchPatients(), refetchStats()]);
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setAppliedSearchTerm("");
    setAppliedStatusFilter("all");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleViewDetails = (patient: {
    id: string;
    firstName: string;
    lastName: string;
  }) => {
    router.push(`/reception/patients/${patient.id}`);
  };

  const handleEditPatient = (patient: {
    id: string;
    firstName: string;
    lastName: string;
  }) => {
    router.push(`/reception/patients/edit/${patient.id}`);
  };

  const [deletePatient] = useDeletePatientMutation();

  const handleDeletePatient = async (patient: {
    id: string;
    firstName: string;
    lastName: string;
  }) => {
    if (
      confirm(
        `Are you sure you want to delete patient ${patient.firstName} ${patient.lastName}?`
      )
    ) {
      try {
        await deletePatient(patient.id).unwrap();
        toast.success(
          `Patient ${patient.firstName} ${patient.lastName} deleted successfully`
        );
        await refetchPatients();
      } catch (err) {
        const error = err as ApiError;
        toast.error(error?.data?.message || `Failed to delete patient`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Patient Management
          </h1>
          <p className="text-foreground">Search and manage patient records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={patientsLoading || statsLoading}
          />
          <QuickActionsBar />
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Failed to load patients"
          message={error}
          className="mb-4"
        />
      )}

      <PatientStatsCards
        totalCount={patientStats?.data?.totalPatients || 0}
        activeCount={patientStats?.data?.activePatients || 0}
        newThisMonthCount={patientStats?.data?.newPatientsThisMonth || 0}
        inactiveCount={patientStats?.data?.inactivePatients || 0}
        isLoading={statsLoading}
      />

      <ReceptionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={patientsLoading}
      />

      <PatientTable
        patients={patientsArray as any}
        isLoading={patientsLoading}
        emptyStateIcon={<Users className="h-12 w-12" />}
        emptyStateTitle="No patients found"
        emptyStateDescription="No patients match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails as any}
        onEditPatient={handleEditPatient as any}
        onDeletePatient={handleDeletePatient as any}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
