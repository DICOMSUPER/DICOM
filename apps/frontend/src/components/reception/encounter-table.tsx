'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Stethoscope } from 'lucide-react';
import { PatientEncounter } from '@/common/interfaces/patient/patient-workflow.interface';
import { DataTable } from '@/components/ui/data-table';
import { getEncounterStatusBadge, getEncounterTypeBadge, getEncounterPriorityBadge } from '@/common/utils/status-badge';
import { formatDateTime } from '@/common/utils/format-status';
import { SortConfig } from '@/components/ui/data-table';

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
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
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
  onSort,
  initialSort,
}) => {
  const formatDateTimeLocal = (date: string | Date | undefined) => {
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
      sortable: false,
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
      sortable: false,
      cell: (encounter: PatientEncounter) => (
        <div>
          {getEncounterStatusBadge(encounter.status)}
        </div>
      ),
    },
    {
      header: 'Type',
      sortable: false,
      cell: (encounter: PatientEncounter) => (
        <div>
          {getEncounterTypeBadge(encounter.encounterType)}
        </div>
      ),
    },
    {
      header: 'Priority',
      sortable: false,
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
      sortable: false,
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
      sortable: true,
      sortField: 'encounterDate',
      cell: (encounter: PatientEncounter) => {
        const dateTime = formatDateTimeLocal(encounter?.encounterDate);
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
      header: 'Created',
      sortable: true,
      sortField: 'createdAt',
      cell: (encounter: PatientEncounter) => (
        <div className="text-foreground text-sm">{formatDateTime(encounter.createdAt)}</div>
      ),
    },
    {
      header: 'Updated',
      sortable: true,
      sortField: 'updatedAt',
      cell: (encounter: PatientEncounter) => (
        <div className="text-foreground text-sm">{formatDateTime(encounter.updatedAt)}</div>
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
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
