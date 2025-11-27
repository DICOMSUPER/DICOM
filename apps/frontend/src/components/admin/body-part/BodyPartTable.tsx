'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Activity } from 'lucide-react';
import { BodyPart } from '@/interfaces/imaging/body-part.interface';
import { DataTable } from '@/components/ui/data-table';

interface BodyPartTableProps {
  bodyParts: BodyPart[];
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (bodyPart: BodyPart) => void;
  onEditBodyPart?: (bodyPart: BodyPart) => void;
  onDeleteBodyPart?: (bodyPart: BodyPart) => void;
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
}) => {
  const columns = [
    {
      header: 'Name',
      cell: (bodyPart: BodyPart) => (
        <div className="font-medium text-blue-600">
          {bodyPart.name}
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (bodyPart: BodyPart) => (
        <div className="text-foreground">
          {bodyPart.description || '—'}
        </div>
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
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEditBodyPart && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditBodyPart(bodyPart)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDeleteBodyPart && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteBodyPart(bodyPart)}
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
    <DataTable
      data={bodyParts}
      columns={columns}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    />
  );
};

