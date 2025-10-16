"use client";
// WorkspaceLayout and SidebarNav moved to layout.tsx
import { QuickActionsBar } from "@/components/reception/quick-actions-bar";
import { ReceptionFilters } from "@/components/reception/reception-filters";
import { PatientStatsCards } from "@/components/reception/patient-stats-cards";
import { PatientTable } from "@/components/reception/patient-table";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPatientsQuery,
  useGetPatientStatsQuery,
  useDeletePatientMutation,
} from "@/store/patientApi";
import { Users, UserPlus } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export default function ReceptionPage() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch real data
  const {
    data: patients,
    isLoading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients,
  } = useGetPatientsQuery({});
  const {
    data: patientStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetPatientStatsQuery();

  // Handle errors
  useEffect(() => {
    if (patientsError) {
      setError("Failed to load patient data. Please try again.");
    } else {
      setError(null);
    }
  }, [patientsError]);

  // Process real data from API
  const filteredPatients = Array.isArray(patients?.data)
    ? ((patients as any)?.data as any[])
        .filter((patient) => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            patient.firstName?.toLowerCase().includes(searchLower) ||
            patient.lastName?.toLowerCase().includes(searchLower) ||
            patient.patientCode?.toLowerCase().includes(searchLower) ||
            patient.phoneNumber?.toLowerCase().includes(searchLower)
          );
        })
        .map((patient) => ({
          id: patient.id,
          firstName: patient.firstName || "Unknown",
          lastName: patient.lastName || "Patient",
          patientCode: patient.patientCode || "N/A",
          dateOfBirth: patient.dateOfBirth || new Date(),
          gender: patient.gender || "Unknown",
          phoneNumber: patient.phoneNumber,
          address: patient.address,
          bloodType: patient.bloodType,
          isActive: patient.isActive ?? true,
          priority: "normal",
          lastVisit: undefined,
        }))
    : [];

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleRefresh = async () => {
    await Promise.all([refetchPatients(), refetchStats()]);
  };

  const handleViewDetails = (patient: any) => {
    router.push(`/reception/patients/${patient.id}`);
  };

  const handleEditPatient = (patient: any) => {
    router.push(`/reception/patients/edit/${patient.id}`);
  };

  const [deletePatient] = useDeletePatientMutation();

  const handleDeletePatient = (patient: any) => {
    if (
      confirm(
        `Are you sure you want to delete patient ${patient.firstName} ${patient.lastName}?`
      )
    ) {
      deletePatient(patient.id);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header with Quick Actions and Refresh */}
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <PatientStatsCards
          totalCount={patientStats?.totalPatients || 0}
          activeCount={patientStats?.activePatients || 0}
          newThisMonthCount={patientStats?.newPatientsThisMonth || 0}
          inactiveCount={patientStats?.inactivePatients || 0}
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

        {/* Patient Table */}
        {!patientsLoading && (
          <PatientTable
            patients={filteredPatients as any}
            isLoading={patientsLoading}
            emptyStateIcon={<Users className="h-12 w-12" />}
            emptyStateTitle="No patients found"
            emptyStateDescription="No patients match your search criteria. Try adjusting your filters or search terms."
            onViewDetails={handleViewDetails}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
          />
        )}
    </div>
  );
}
