"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import {
  Clock,
  Eye,
  User,
} from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IImagingOrderForm,
} from "@/common/interfaces/image-dicom/imaging-order-form.interface";
import { formatDate, formatTime } from "@/common/lib/formatTimeDate";

interface ImagingOrderFormTableProps {
  imagingOrderForm: IImagingOrderForm[];
  onViewDetails: (id: string) => void;
  isLoading: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  total?: number;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function ImagingOrderFormTable({
  imagingOrderForm,
  onViewDetails,
  isLoading,
  emptyStateIcon = <User className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No imaging orders found",
  emptyStateDescription = "No imaging orders match your search criteria. Try adjusting your filters or search terms.",
  total,
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}: ImagingOrderFormTableProps) {
  const columns = [
    {
      header: "Order ID",
      sortable: true,
      sortField: "id",
      cell: (order: IImagingOrderForm) => (
        <div className="text-base ml-6 text-foreground">
          {order.id.slice(-6).toUpperCase()}
        </div>
      ),
    },
    {
      header: "Name",
      sortable: false,
      cell: (order: IImagingOrderForm) => {
        const patient = order.patient;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {patient?.firstName} {patient?.lastName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Notes",
      sortable: false,
      cell: (order: IImagingOrderForm) => {
        const notes = order.notes?.trim() || "—";
        const maxLength = 50;
        const truncated =
          notes.length > maxLength
            ? `${notes.substring(0, maxLength)}...`
            : notes;

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-700 border-slate-200 font-medium max-w-xs cursor-help"
                >
                  {truncated}
                </Badge>
              </TooltipTrigger>
              {notes.length > maxLength && (
                <TooltipContent
                  side="top"
                  align="start"
                  className="max-w-sm z-50 bg-slate-900 text-white border-slate-700"
                  sideOffset={5}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {notes}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      header: "Create Date",
      headerClassName: "text-center",
      sortable: true,
      sortField: "createdAt",
      cell: (order: IImagingOrderForm) => (
        <div className="space-y-1 ml-6">
          <span className="font-semibold text-foreground text-sm">
            {formatDate(order.createdAt)}
          </span>
          <div className="flex items-center gap-4 text-xs text-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(order.createdAt)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (order: IImagingOrderForm) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(order.id)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<IImagingOrderForm>
      columns={columns}
      data={imagingOrderForm}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(order) => order.id}
      total={total}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}

