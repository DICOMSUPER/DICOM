"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { getBooleanStatusBadge } from "@/common/utils/status-badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Patient } from "@/common/interfaces/patient/patient-workflow.interface";
import { formatDateTime } from '@/common/utils/format-status';
import { SortConfig } from "@/components/ui/data-table";

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
  onDeletePatient?: (patient: Patient) => void;
  total?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function PatientTable({
  patients,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  onViewDetails,
  onEditPatient,
  onDeletePatient,
  total,
  onSort,
  initialSort,
}: PatientTableProps) {

  const formatAge = (dateOfBirth: string | Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatGender = (gender: string | null | undefined): string => {
    if (!gender) return "N/A";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const headers = [
    "Name",
    "Patient Code",
    "Age",
    "Gender",
    "Phone",
    "Address",
    "Status",
    "Last Visit",
    "Actions",
  ];

  return (
    <DataTable<Patient>
      columns={[
        {
          header: "Name",
          sortable: true,
          sortField: "lastName",
          cell: (patient) => (
            <div className="font-medium">
              {patient.firstName} {patient.lastName}
            </div>
          ),
        },
        {
          header: "Patient Code",
          sortable: true,
          sortField: "patientCode",
          cell: (patient) => patient.patientCode
        },
        {
          header: "Age",
          sortable: true,
          sortField: "dateOfBirth",
          cell: (patient) => (
            <div className="text-foreground text-center">
              {formatAge(patient?.dateOfBirth as Date)}
            </div>
          ),
        },
        {
          header: "Gender",
          sortable: true,
          sortField: "gender",
          cell: (patient) => (
            <div className="text-foreground text-center">
              {formatGender(patient.gender)}
            </div>
          ),
        },
        {
          header: "Phone",
          sortable: false,
          cell: (patient) => (
            <div className="text-foreground">
              {patient.phoneNumber || "N/A"}
            </div>
          ),
        },
        {
          header: "Address",
          sortable: false,
          cell: (patient) => (
            <div className="text-foreground">
              {patient.address || "N/A"}
            </div>
          ),
        },
        {
          header: "Status",
          headerClassName: "text-center",
          sortable: false,
          cell: (patient) => (
            <div className="flex justify-center">
              {getBooleanStatusBadge(patient.isActive ?? true)}
            </div>
          ),
        },
        {
          header: "Last Visit",
          sortable: false,
          cell: (patient) => {
            const encounter = patient.encounters?.[0];
            if (!encounter?.encounterDate) return "Never";
            const encounterDate =
              encounter.encounterDate instanceof Date
                ? encounter.encounterDate.toISOString()
                : String(encounter.encounterDate);
            return formatDateTime(encounterDate);
          },
        },
        {
          header: "Created",
          sortable: true,
          sortField: "createdAt",
          cell: (patient) => (
            <div className="text-foreground text-sm">
              {formatDateTime(patient.createdAt)}
            </div>
          ),
        },
        {
          header: "Updated",
          sortable: true,
          sortField: "updatedAt",
          cell: (patient) => (
            <div className="text-foreground text-sm">
              {formatDateTime(patient.updatedAt)}
            </div>
          ),
        },
        {
          header: "Actions",
          headerClassName: "text-center",
          cell: (patient) => (
            <div className="flex items-center justify-center gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(patient)}
                  className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
              )}
              {onEditPatient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditPatient(patient)}
                  className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
          ),
        },
      ]}
      data={patients}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      total={total}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}
