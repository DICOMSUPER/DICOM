'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Activity } from 'lucide-react';
import { BodyPart } from '@/common/interfaces/imaging/body-part.interface';
import { DataTable } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';

import { SortConfig } from '@/components/ui/data-table';

interface BodyPartTableProps {
  bodyParts: BodyPart[];
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (bodyPart: BodyPart) => void;
  onEditBodyPart?: (bodyPart: BodyPart) => void;
  onDeleteBodyPart?: (bodyPart: BodyPart) => void;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const BodyPartTable: React.FC<BodyPartTableProps> = ({
  bodyParts,
  isLoading = false,
  emptyStateIcon = <Activity className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No body parts found",
  emptyStateDescription = "Create a body part to see it listed here.",
  onViewDetails,
  onEditBodyPart,
  onDeleteBodyPart,
  onSort,
  initialSort,
}) => {
  const columns = [
    {
      header: 'Name',
      sortable: true,
      sortField: 'name',
      cell: (bodyPart: BodyPart) => (
        <div className="font-medium text-blue-600">
          {bodyPart.name}
        </div>
      ),
    },
    {
      header: 'Description',
      sortable: false,
      cell: (bodyPart: BodyPart) => (
        <div className="text-foreground">
          {bodyPart.description || '—'}
        </div>
      ),
    },
    {
      header: 'Created At',
      sortable: true,
      sortField: 'createdAt',
      cell: (bodyPart: BodyPart) => (
        <div className="text-foreground text-sm">{formatDateTime(bodyPart.createdAt)}</div>
      ),
    },
    {
      header: 'Updated At',
      sortable: true,
      sortField: 'updatedAt',
      cell: (bodyPart: BodyPart) => (
        <div className="text-foreground text-sm">{formatDateTime(bodyPart.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (bodyPart: BodyPart) => (
        <div className="flex justify-center gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(bodyPart)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {onEditBodyPart && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditBodyPart(bodyPart)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {onDeleteBodyPart && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteBodyPart(bodyPart)}
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
    <DataTable
      data={bodyParts}
      columns={columns}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};

