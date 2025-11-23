"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { getEncounterTypeBadge } from "@/utils/status-badge";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";

// interface Encounter {
//   id: string;
//   patient: {
//     firstName: string;
//     lastName: string;
//     patientCode: string;
//   };
//   encounterType: string;
//   status: string;
//   chiefComplaint?: string;
//   encounterDate: string;
//   assignedPhysicianId?: string;
//   priority?: string;
//   roomId?: string;
// }

interface EncounterTableProps {
  encounters: PatientEncounter[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (encounter: PatientEncounter) => void;
  onEditEncounter?: (encounter: PatientEncounter) => void;
  onDeleteEncounter?: (encounter: PatientEncounter) => void;
}

export function EncounterTable({
  encounters,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  onViewDetails,
  onEditEncounter,
  onDeleteEncounter,
}: EncounterTableProps) {
  const formatTime = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const columns = [
    {
      header: "Patient",
      cell: (encounter: PatientEncounter) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">
              {encounter?.patient?.firstName} {encounter?.patient?.lastName}
            </div>
            <div className="text-sm text-foreground">
              ID: {encounter?.patient?.patientCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Encounter Type",
      cell: (encounter: PatientEncounter) => (
        <div className="flex justify-center">
          {getEncounterTypeBadge(encounter.encounterType)}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (encounter: PatientEncounter) => (
        <StatusBadge status={encounter.status} />
      ),
    },
    {
      header: "Chief Complaint",
      cell: (encounter: PatientEncounter) => (
        <div className="text-foreground max-w-xs truncate">
          {encounter.chiefComplaint || "No complaint recorded"}
        </div>
      ),
    },
    {
      header: "Date",
      cell: (encounter: PatientEncounter) => (
        <div className="flex items-center gap-1 text-foreground">
          <Calendar className="w-3 h-3" />
          {formatTime(encounter?.encounterDate)}
        </div>
      ),
    },
    {
      header: "Physician",
      cell: (encounter: PatientEncounter) => (
        <div className="text-foreground">
          {encounter?.assignedPhysician
            ? `Dr.${encounter?.assignedPhysician?.lastName} ${encounter?.assignedPhysician?.firstName}`
            : "Unassigned"}
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (encounter: PatientEncounter) => (
        <div className="flex items-center justify-center gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(encounter)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {/* {onEditEncounter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditEncounter(encounter)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDeleteEncounter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteEncounter(encounter)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <DataTable<PatientEncounter>
      columns={columns}
      data={encounters}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(encounter) => encounter.id}
    />
  );
}
