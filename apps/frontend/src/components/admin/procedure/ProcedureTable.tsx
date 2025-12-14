'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Building2 } from 'lucide-react';
import { RequestProcedure } from '@/common/interfaces/image-dicom/request-procedure.interface';
import { DataTable, SortConfig } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';

interface RequestProcedureTableProps {
  procedures: RequestProcedure[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (procedure: RequestProcedure) => void;
  onEditProcedure?: (procedure: RequestProcedure) => void;
  onDeleteProcedure?: (procedure: RequestProcedure) => void;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const RequestProcedureTable: React.FC<RequestProcedureTableProps> = ({
  procedures,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Building2 className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No procedures found",
  emptyStateDescription = "Create a procedure to see it listed here.",
  onViewDetails,
  onEditProcedure,
  onDeleteProcedure,
  onSort,
  initialSort,
}) => {
  const columns = [
    {
      header: 'Name',
      cell: (procedure: RequestProcedure) => (
        <div className="font-medium text-blue-600">
          {procedure.name}
        </div>
      ),
    },
    {
      header: 'Modality Name',
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground">{procedure.modality?.modalityName}</div>
      ),
    },
    {
      header: 'Body Part',
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground">{procedure.bodyPart?.name}</div>
      ),
    },
    {
      header: 'Description',
      cell: (procedure: RequestProcedure) => (
        <div className="max-w-[250px] truncate text-foreground">{procedure.description}</div>
      ),
    },
    {
      header: 'Active',
      headerClassName: 'text-center',
      cell: (procedure: RequestProcedure) => (
        <div className="flex justify-center">
          {getStatusBadge(procedure.isActive as boolean)}
        </div>
      ),
    },
    {
      header: 'Created',
      sortable: true,
      sortField: 'createdAt',
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground text-sm">{formatDateTime(procedure.createdAt)}</div>
      ),
    },
    {
      header: 'Updated',
      sortable: true,
      sortField: 'updatedAt',
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground text-sm">{formatDateTime(procedure.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (procedure: RequestProcedure) => (
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(procedure)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEditProcedure && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditProcedure(procedure)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDeleteProcedure && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteProcedure(procedure)}
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
    <DataTable<RequestProcedure>
      columns={columns}
      data={procedures}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(procedure) => procedure.id}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
