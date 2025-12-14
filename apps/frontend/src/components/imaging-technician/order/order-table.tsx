"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import { Monitor } from "lucide-react";
import React from "react";
import { ImagingOrder } from "@/common/interfaces/image-dicom/imaging-order.interface";
import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";
import { formatDateTime } from "@/common/utils/format-status";
import OrderStatus from "../order-status";
import StatusButton from "../status-button";

interface OrderTableProps {
  orders: ImagingOrder[];
  onViewDetails: (id: string) => void;
  onCallIn: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onMarkCancelled: (id: string) => void;
  isLoading: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function OrderTable({
  orders,
  onViewDetails,
  onCallIn,
  onMarkCompleted,
  onMarkCancelled,
  isLoading,
  emptyStateIcon = <Monitor className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No orders found",
  emptyStateDescription = "No orders match your search criteria. Try adjusting your filters or search terms.",
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}: OrderTableProps) {
  const formatOrderNumber = (n: string | number | null | undefined) => {
    const s = String(n ?? "");
    return `ORD${s.padStart(4, "0")}`;
  };

  const columns = [
    {
      header: "Order Number",
      sortable: true,
      sortField: "orderNumber",
      cell: (order: ImagingOrder) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            {formatOrderNumber(order.orderNumber)}
          </div>
          <div className="text-xs text-foreground">
            {formatDateTime(order.createdAt)}
          </div>
        </div>
      ),
    },
    {
      header: "MRN",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">
          {order.patient?.patientCode || "—"}
        </div>
      ),
    },
    {
      header: "Patient Name",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            {order.patient?.lastName || "—"}
          </div>
          <div className="text-foreground">
            {order.patient?.firstName || "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Physician",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">
          {order.orderPhysician
            ? `Dr. ${order.orderPhysician.lastName} ${order.orderPhysician.firstName}`
            : "—"}
        </div>
      ),
    },
    {
      header: "Body Part",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">
          {order.procedure?.bodyPart?.name || "—"}
        </div>
      ),
    },
    {
      header: "Modality",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <Badge
          variant="outline"
          className="bg-muted text-foreground border-border font-medium"
        >
          {order.procedure?.modality?.modalityName || "N/A"}
        </Badge>
      ),
    },
    {
      header: "Procedure",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">{order.procedure?.name || "N/A"}</div>
      ),
    },
    {
      header: "Clinical Indication",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">
          {order.clinicalIndication || "—"}
        </div>
      ),
    },
    {
      header: "Contrast",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">
          {order.contrastRequired ? "Yes" : "No"}
        </div>
      ),
    },
    {
      header: "Special Instructions",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">
          {order.specialInstructions || "—"}
        </div>
      ),
    },
    {
      header: "Status",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <OrderStatus status={order.orderStatus as ImagingOrderStatus} />
      ),
    },
    {
      header: "Completed Date",
      sortable: true,
      sortField: "completedDate",
      cell: (order: ImagingOrder) => (
        <div className="space-y-1">
          {order.completedDate ? (
            <div className="font-semibold text-foreground text-sm">
              {formatDateTime(order.completedDate)}
            </div>
          ) : (
            <div className="text-foreground">—</div>
          )}
        </div>
      ),
    },
    {
      header: "Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (order: ImagingOrder) => (
        <div className="text-foreground text-sm">{formatDateTime(order.updatedAt)}</div>
      ),
    },
    {
      header: "Notes",
      sortable: false,
      cell: (order: ImagingOrder) => (
        <div className="text-foreground">{order.notes || "—"}</div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (order: ImagingOrder) => (
        <div className="flex items-center gap-2 justify-center">
          {order.orderStatus && (
            <StatusButton
              status={order.orderStatus}
              orderId={order.id}
              onCallIn={onCallIn}
              onMarkCancelled={onMarkCancelled}
              onMarkCompleted={onMarkCompleted}
              onViewDetail={onViewDetails}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<ImagingOrder>
      columns={columns}
      data={orders}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(order) => order.id}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}

