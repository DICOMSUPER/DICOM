import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import React from "react";
import { formatStatus } from "@/utils/format-status";

export default function OrderStatus({
  status,
}: {
  status: ImagingOrderStatus;
}) {
  const getStatusConfig = (status: ImagingOrderStatus): { styles: string; dotColor: string; animate: boolean } => {
    const configs = {
      [ImagingOrderStatus.PENDING]: {
        styles: "bg-yellow-50 text-yellow-700 border-yellow-200",
        dotColor: "bg-yellow-500",
        animate: true,
      },
      [ImagingOrderStatus.IN_PROGRESS]: {
        styles: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
        animate: true,
      },
      [ImagingOrderStatus.COMPLETED]: {
        styles: "bg-green-50 text-green-700 border-green-200",
        dotColor: "bg-green-500",
        animate: false,
      },
      [ImagingOrderStatus.CANCELLED]: {
        styles: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
        animate: false,
      },
    };

    return configs[status] || { styles: "bg-gray-50 text-gray-700 border-gray-200", dotColor: "bg-gray-500", animate: false };
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap border ${config.styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${config.animate ? 'animate-pulse' : ''}`} />
      {formatStatus(status)}
    </span>
  );
}
