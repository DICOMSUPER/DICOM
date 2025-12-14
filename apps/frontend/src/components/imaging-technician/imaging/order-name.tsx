import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";
import { ImagingOrder } from "@/common/interfaces/image-dicom/imaging-order.interface";
import React from "react";
import { formatStatus } from "@/common/utils/format-status";

const getStatusBadgeColor = (status: ImagingOrderStatus) => {
  switch (status) {
    case ImagingOrderStatus.COMPLETED:
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case ImagingOrderStatus.IN_PROGRESS:
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case ImagingOrderStatus.CANCELLED:
      return "bg-red-50 text-red-700 ring-1 ring-red-100";
    case ImagingOrderStatus.PENDING:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-100";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-100";
  }
};
export default function OrderName({ order }: { order: ImagingOrder }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 leading-tight">
          {order?.procedure?.name}
        </h2>
        <p className="text-sm text-gray-600 tracking-tight">
          Order <span className="font-semibold text-gray-900">#{String(order.orderNumber).padStart(6, "0")}</span>
        </p>
      </div>
      <span
        className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeColor(
          order.orderStatus as ImagingOrderStatus
        )}`}
      >
        {formatStatus(order.orderStatus)}
      </span>
    </div>
  );
}
