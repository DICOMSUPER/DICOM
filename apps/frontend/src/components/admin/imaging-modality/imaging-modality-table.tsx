'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Scan } from 'lucide-react';
import { ImagingModality } from '@/common/interfaces/image-dicom/imaging_modality.interface';
import { DataTable } from '@/components/ui/data-table';
import { getBooleanStatusBadge } from '@/common/utils/status-badge';
import { formatDateTime } from '@/common/utils/format-status';
import { SortConfig } from '@/components/ui/data-table';

interface ImagingModalityTableProps {
  modalityItems: ImagingModality[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (modality: ImagingModality) => void;
  onEdit?: (modality: ImagingModality) => void;
  onDelete?: (modality: ImagingModality) => void;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const ImagingModalityTable: React.FC<ImagingModalityTableProps> = ({
  modalityItems,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Scan className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No imaging modalities found",
  emptyStateDescription = "Create an imaging modality to see it listed here.",
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
      header: 'Modality Code',
      sortable: true,
      sortField: 'modalityCode',
      cell: (modality: ImagingModality) => (
        <div className="font-medium text-blue-600">
          {modality.modalityCode || '—'}
        </div>
      ),
    },
    {
      header: 'Modality Name',
      sortable: true,
      sortField: 'modalityName',
      cell: (modality: ImagingModality) => (
        <div className="text-foreground">
          {modality.modalityName || '—'}
        </div>
      ),
    },
    {
      header: 'Description',
      sortable: false,
      cell: (modality: ImagingModality) => (
        <div className="text-foreground">{modality.description || '—'}</div>
      ),
    },
    {
      header: 'Created At',
      sortable: true,
      sortField: 'createdAt',
      cell: (modality: ImagingModality) => (
        <div className="text-foreground text-sm">{formatDateTime(modality.createdAt)}</div>
      ),
    },
    {
      header: 'Updated At',
      sortable: true,
      sortField: 'updatedAt',
      cell: (modality: ImagingModality) => (
        <div className="text-foreground text-sm">{formatDateTime(modality.updatedAt)}</div>
      ),
    },
    {
      header: 'Status',
      sortable: false,
      cell: (modality: ImagingModality) => getStatusBadge(modality.isActive ?? true),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (modality: ImagingModality) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(modality)}
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
              onClick={() => onEdit(modality)}
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
              onClick={() => onDelete(modality)}
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
    <DataTable<ImagingModality>
      columns={columns}
      data={modalityItems}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(modality, index) => modality?.id || `modality-${index}`}
      showNumberColumn={true}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};

