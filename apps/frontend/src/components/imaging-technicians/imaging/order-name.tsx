import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";
import React from "react";

const getStatusBadgeColor = (status: ImagingOrderStatus) => {
  switch (status) {
    case ImagingOrderStatus.COMPLETED:
      return "bg-green-100 text-green-700";
    case ImagingOrderStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-700";
    case ImagingOrderStatus.CANCELLED:
      return "bg-red-100 text-red-700";
    case ImagingOrderStatus.PENDING:
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusLabel = (status: ImagingOrderStatus) => {
  const text = String(status).toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};
export default function OrderName({ order }: { order: ImagingOrder }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-1">
          {order?.procedure?.name}
        </h2>
        <p className="text-sm text-gray-600">
          Order #{String(order.orderNumber).padStart(6, "0")}
        </p>
      </div>
      <span
        className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusBadgeColor(
          order.orderStatus as ImagingOrderStatus
        )}`}
      >
        {getStatusLabel(order.orderStatus as ImagingOrderStatus)}
      </span>
    </div>
  );
}
