'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Stethoscope } from 'lucide-react';
import { PatientEncounter } from '@/interfaces/patient/patient-workflow.interface';
import { DataTable } from '@/components/ui/data-table';
import { getEncounterStatusBadge, getEncounterTypeBadge, getEncounterPriorityBadge } from '@/utils/status-badge';
import { formatDate } from '@/lib/formatTimeDate';

interface EncounterTableProps {
  encounters: PatientEncounter[];
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (encounter: PatientEncounter) => void;
  onEditEncounter?: (encounter: PatientEncounter) => void;
  page?: number;
  limit?: number;
}

export const EncounterTable: React.FC<EncounterTableProps> = ({
  encounters,
  isLoading = false,
  emptyStateIcon = <Stethoscope className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No encounters found",
  emptyStateDescription = "No encounters match your search criteria. Try adjusting your filters or search terms.",
  onViewDetails,
  onEditEncounter,
  page = 1,
  limit = 10,
}) => {
  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return { date: "N/A", time: "" };
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const columns = [
    {
      header: 'Patient',
      cell: (encounter: PatientEncounter) => (
        <div className="min-w-0">
          <div className="font-medium text-sm text-foreground">
            {encounter?.patient?.firstName} {encounter?.patient?.lastName}
          </div>
          <div className="text-xs text-foreground">
            <span className="font-mono">Patient Code: {encounter?.patient?.patientCode}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (encounter: PatientEncounter) => (
        <div>
          {getEncounterStatusBadge(encounter.status)}
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (encounter: PatientEncounter) => (
        <div>
          {getEncounterTypeBadge(encounter.encounterType)}
        </div>
      ),
    },
    {
      header: 'Priority',
      cell: (encounter: PatientEncounter) => (
        <div>
          {encounter.priority ? (
            getEncounterPriorityBadge(encounter.priority)
          ) : (
            <span className="text-xs text-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      header: 'Chief Complaint',
      cell: (encounter: PatientEncounter) => (
        <div className="max-w-[300px]">
          {encounter.chiefComplaint ? (
            <div className="min-w-0">
              <p className="text-sm text-foreground line-clamp-2">
                {encounter.chiefComplaint}
              </p>
              {encounter.notes && (
                <p className="text-xs text-foreground mt-1 line-clamp-1">
                  <span className="font-medium">Note:</span> {encounter.notes}
                </p>
              )}
            </div>
          ) : (
            <span className="text-xs text-foreground italic">
              No complaint recorded
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Date & Time',
      cell: (encounter: PatientEncounter) => {
        const dateTime = formatDateTime(encounter?.encounterDate);
        return (
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-medium text-foreground">
              {dateTime.date}
            </div>
            <div className="text-xs text-foreground">
              {dateTime.time}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Physician',
      cell: (encounter: PatientEncounter) => (
        <div className="min-w-[140px]">
          {encounter?.assignedPhysician ? (
            <div className="flex flex-col gap-0.5">
              <div className="text-sm font-medium text-foreground truncate">
                Dr. {encounter?.assignedPhysician?.lastName} {encounter?.assignedPhysician?.firstName}
              </div>
              <div className="text-xs text-foreground">
                {encounter?.assignedPhysician?.employeeId}
              </div>
            </div>
          ) : (
            <span className="text-xs text-foreground italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      header: 'Order Number',
      headerClassName: 'text-center',
      cell: (encounter: PatientEncounter) => (
        <div className="text-sm font-mono text-foreground text-center">
          {encounter.orderNumber}
        </div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (encounter: PatientEncounter) => (
        <div className="flex items-center gap-2 justify-center">
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
          {onEditEncounter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditEncounter(encounter)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
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
      page={page}
      limit={limit}
    />
  );
};
