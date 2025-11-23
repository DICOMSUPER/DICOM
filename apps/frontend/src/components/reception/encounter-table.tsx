"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  TableRowEnhanced,
  TableCellEnhanced,
} from "@/components/ui/table-enhanced";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Stethoscope,
  Clock,
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

  const formatEncounterType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const headers = [
    "Patient",
    "Encounter Type",
    "Status",
    "Chief Complaint",
    "Date",
    "Physician",
    "Actions",
  ];

  return (
    <DataTable
      headers={headers}
      isLoading={isLoading}
      isEmpty={encounters.length === 0}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    >
      {encounters.map((encounter) => (
        <TableRowEnhanced key={encounter.id}>
          <TableCellEnhanced>
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
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-foreground" />
              <span className="text-foreground">
                {formatEncounterType(encounter.encounterType)}
              </span>
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <StatusBadge status={encounter.status} />
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground max-w-xs truncate">
              {encounter.chiefComplaint || "No complaint recorded"}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="flex items-center gap-1 text-foreground">
              <Calendar className="w-3 h-3" />
              {formatTime(encounter?.encounterDate)}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {encounter?.assignedPhysician
                ? `Dr.${encounter?.assignedPhysician?.lastName} ${encounter?.assignedPhysician?.firstName}`
                : "Unassigned"}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced isLast>
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(encounter)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {/* {onEditEncounter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditEncounter(encounter)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDeleteEncounter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteEncounter(encounter)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )} */}
            </div>
          </TableCellEnhanced>
        </TableRowEnhanced>
      ))}
    </DataTable>
  );
}
