"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { getBooleanStatusBadge } from "@/utils/status-badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { formatDate, formatDateTime } from "@/lib/formatTimeDate";


interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
  onDeletePatient?: (patient: Patient) => void;
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
          cell: (patient) => (
            <div className="font-medium">
              {patient.firstName} {patient.lastName}
            </div>
          ),
        },
        { header: "Patient Code", cell: (patient) => patient.patientCode },
        {
          header: "Age",
          cell: (patient) => `${formatAge(patient?.dateOfBirth as Date)} years`,
        },
        {
          header: "Gender",
          cell: (patient) => formatGender(patient.gender),
        },
        {
          header: "Phone",
          cell: (patient) => (
            <div className="text-foreground">
              {patient.phoneNumber || "N/A"}
            </div>
          ),
        },
        {
          header: "Address",
          cell: (patient) => (
            <div className="text-foreground">
              {patient.address || "N/A"}
            </div>
          ),
        },
        {
          header: "Status",
          headerClassName: "text-center",
          cell: (patient) => (
            <div className="flex justify-center">
              {getBooleanStatusBadge(patient.isActive ?? true)}
            </div>
          ),
        },
        {
          header: "Last Visit",
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
          header: "Actions",
          headerClassName: "text-center",
          cell: (patient) => (
            <div className="flex items-center justify-center gap-2">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(patient)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4 text-green-600" />
                </Button>
              )}
              {onEditPatient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPatient(patient)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
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
    />
  );
}
