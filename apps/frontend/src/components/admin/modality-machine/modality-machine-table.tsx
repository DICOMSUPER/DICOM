'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Monitor } from 'lucide-react';
import { ModalityMachine } from '@/common/interfaces/image-dicom/modality-machine.interface';
import { DataTable } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';
import { getMachineStatusBadgeSimple } from '@/common/utils/status-badge';
import { SortConfig } from '@/components/ui/data-table';

interface ModalityMachineTableProps {
  machineItems: ModalityMachine[];
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (machine: ModalityMachine) => void;
  onEdit?: (machine: ModalityMachine) => void;
  onDelete?: (machine: ModalityMachine) => void;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const ModalityMachineTable: React.FC<ModalityMachineTableProps> = ({
  machineItems,
  isLoading = false,
  emptyStateIcon = <Monitor className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No modality machines found",
  emptyStateDescription = "Create a modality machine to see it listed here.",
  onViewDetails,
  onEdit,
  onDelete,
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}) => {

  const columns = [
    {
      header: 'Machine Name',
      sortable: true,
      sortField: 'name',
      cell: (machine: ModalityMachine) => (
        <div className="font-medium text-blue-600">
          {machine.name || '—'}
        </div>
      ),
    },
    {
      header: 'Imaging Modality',
      sortable: false,
      cell: (machine: ModalityMachine) => {
        if (!machine.modality && machine.modalityId) {
          console.warn('Modality relation missing for machine:', machine.id, 'modalityId:', machine.modalityId);
        }
        return (
          <div className="text-foreground">
            {machine.modality?.modalityName || '—'} ({machine.modality?.modalityCode || '—'})
          </div>
        );
      },
    },
    {
      header: 'Manufacturer',
      sortable: true,
      sortField: 'manufacturer',
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground">{machine.manufacturer || '—'}</div>
      ),
    },
    {
      header: 'Model',
      sortable: true,
      sortField: 'model',
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground">{machine.model || '—'}</div>
      ),
    },
    {
      header: 'Status',
      sortable: false,
      cell: (machine: ModalityMachine) => getMachineStatusBadgeSimple(machine.status),
    },
    {
      header: 'Created At',
      sortable: true,
      sortField: 'createdAt',
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground text-sm">{formatDateTime(machine.createdAt)}</div>
      ),
    },
    {
      header: 'Updated At',
      sortable: true,
      sortField: 'updatedAt',
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground text-sm">{formatDateTime(machine.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (machine: ModalityMachine) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(machine)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(machine)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(machine)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<ModalityMachine>
      columns={columns}
      data={machineItems}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(machine, index) => machine?.id || `machine-${index}`}
      showNumberColumn={true}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};

