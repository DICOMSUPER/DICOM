'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Scan } from 'lucide-react';
import { ImagingModality } from '@/interfaces/image-dicom/imaging_modality.interface';
import { DataTable } from '@/components/ui/data-table';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import { formatDate } from '@/lib/formatTimeDate';

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
}) => {

  const columns = [
    {
      header: 'Modality Code',
      cell: (modality: ImagingModality) => (
        <div className="font-medium text-blue-600">
          {modality.modalityCode || '—'}
        </div>
      ),
    },
    {
      header: 'Modality Name',
      cell: (modality: ImagingModality) => (
        <div className="text-foreground">
          {modality.modalityName || '—'}
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (modality: ImagingModality) => (
        <div className="text-foreground">{modality.description || '—'}</div>
      ),
    },
    {
      header: 'Created At',
      cell: (modality: ImagingModality) => (
        <div className="text-foreground">{formatDate(modality.createdAt)}</div>
      ),
    },
    {
      header: 'Status',
      cell: (modality: ImagingModality) => getStatusBadge(modality.isActive ?? true),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (modality: ImagingModality) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(modality)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(modality)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(modality)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
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
    />
  );
};

