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
  total?: number;
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
  total,
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
      headerClassName: 'text-center',
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
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(machine)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(machine)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(machine)}
              className="h-8 text-xs font-medium border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
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
      total={total}
    />
  );
};

