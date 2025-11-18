import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import React from "react";

export default function OrderStatus({
  status,
}: {
  status: ImagingOrderStatus;
}) {
  const getStatusStyles = (status: ImagingOrderStatus): string => {
    const styles = {
      [ImagingOrderStatus.PENDING]:
        "bg-yellow-50 text-yellow-600 border-yellow-200",
      [ImagingOrderStatus.IN_PROGRESS]:
        "bg-blue-50 text-blue-600 border-blue-200",
      [ImagingOrderStatus.COMPLETED]:
        "bg-green-50 text-green-600 border-green-200",
      [ImagingOrderStatus.CANCELLED]: "bg-red-50 text-red-600 border-red-200",
    };

    return styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const formatStatus = (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap border ${getStatusStyles(
        status
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}
