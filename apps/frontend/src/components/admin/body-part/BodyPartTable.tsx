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
  total?: number;
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
  total,
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
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(bodyPart)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditBodyPart && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditBodyPart(bodyPart)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteBodyPart && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteBodyPart(bodyPart)}
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
    <DataTable
      data={bodyParts}
      columns={columns}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      onSort={onSort}
      initialSort={initialSort}
      total={total}
    />
  );
};

