import React from "react";

export default function OrderInfo({ order }: { order: any }) {
  const getStatusBadge = (status: string) => {
    const normalized = status?.toUpperCase();
    const colors: Record<string, string> = {
      STAT: "bg-red-100 text-red-800 border-red-200",
      URGENT: "bg-orange-100 text-orange-800 border-orange-200",
      ROUTINE: "bg-green-100 text-green-800 border-green-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
    };
    return `px-3 py-1 rounded-full text-xs font-semibold border ${
      colors[normalized] ||
      "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"
    }`;
  };

  if (!order) {
    return <div>No order information available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {order?.procedure?.name || "Imaging Order"}
            {order?.orderNumber && ` - Order #${order.orderNumber}`}
          </h2>
          {order?.imagingOrderForm?.patient && (
            <p className="text-sm text-gray-600 mt-1">
              Patient: {order.imagingOrderForm.patient.firstName || ""}{" "}
              {order.imagingOrderForm.patient.lastName || ""}
              {order.imagingOrderForm.patient.patientCode && (
                <> (MRN: {order.imagingOrderForm.patient.patientCode})</>
              )}
            </p>
          )}
        </div>
        {order?.orderStatus && (
          <span className={getStatusBadge(order.orderStatus)}>
            {order.orderStatus.replace("_", " ").toUpperCase()}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">
            Clinical Indication:
          </span>
          <div className="text-gray-900 mt-1">
            {order?.clinicalIndication || "N/A"}
          </div>
        </div>
        {order?.room?.roomNumber && (
          <div>
            <span className="font-medium text-gray-700">Room:</span>
            <div className="text-gray-900 mt-1">{order.room.roomNumber}</div>
          </div>
        )}
        <div>
          <span className="font-medium text-gray-700">Contrast:</span>
          <div className="text-gray-900 mt-1">
            {order?.contrastRequired ? "Required" : "Not Required"}
          </div>
        </div>
      </div>

      {order?.specialInstructions && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <span className="font-medium text-yellow-800">
            Special Instructions:
          </span>
          <div className="text-yellow-900 mt-1">
            {order.specialInstructions}
          </div>
        </div>
      )}
    </div>
  );
}
