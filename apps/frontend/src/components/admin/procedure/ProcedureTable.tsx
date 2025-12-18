"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Building2 } from "lucide-react";
import { RequestProcedure } from "@/common/interfaces/image-dicom/request-procedure.interface";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import { formatDateTime } from "@/common/utils/format-status";

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
      header: "Name",
      cell: (procedure: RequestProcedure) => (
        <div className="font-medium text-blue-600">{procedure.name}</div>
      ),
    },
    {
      header: "Modality Name",
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground">
          {procedure.modality?.modalityName}
        </div>
      ),
    },
    {
      header: "Body Part",
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground">{procedure.bodyPart?.name}</div>
      ),
    },
    {
      header: "Description",
      cell: (procedure: RequestProcedure) => (
        <div className="max-w-[250px] truncate text-foreground">
          {procedure.description}
        </div>
      ),
    },
    {
      header: "Active",
      headerClassName: "text-center",
      cell: (procedure: RequestProcedure) => (
        <div className="flex justify-center">
          {getStatusBadge(procedure.isActive as boolean)}
        </div>
      ),
    },
    {
      header: "Created",
      sortable: true,
      sortField: "createdAt",
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground text-sm">
          {formatDateTime(procedure.createdAt)}
        </div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (procedure: RequestProcedure) => (
        <div className="text-foreground text-sm">
          {formatDateTime(procedure.updatedAt)}
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (procedure: RequestProcedure) => (
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(procedure)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditProcedure && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditProcedure(procedure)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteProcedure && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteProcedure(procedure)}
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
