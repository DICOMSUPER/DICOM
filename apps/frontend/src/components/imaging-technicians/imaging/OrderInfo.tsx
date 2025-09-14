import React from "react";

export default function OrderInfo({ order }: { order: any }) {
  const getUrgencyBadge = (urgency: string) => {
    const normalized = urgency.toUpperCase();
    const colors: Record<string, string> = {
      STAT: "bg-red-100 text-red-800 border-red-200",
      URGENT: "bg-orange-100 text-orange-800 border-orange-200",
      ROUTINE: "bg-green-100 text-green-800 border-green-200",
    };
    return `px-3 py-1 rounded-full text-xs font-semibold border ${
      colors[normalized] ||
      "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]"
    }`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {order?.modality.modality_name} - {order?.body_part}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Patient: {order?.visit.patient.first_name}{" "}
            {order.visit.patient.last_name} (MRN:{" "}
            {order.visit.patient.patient_code})
          </p>
        </div>
        <span className={getUrgencyBadge(order.urgency)}>{order.urgency}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">
            Clinical Indication:
          </span>
          <div className="text-gray-900 mt-1">{order.clinical_indication}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Room:</span>
          <div className="text-gray-900 mt-1">{order.room.room_number}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Contrast:</span>
          <div className="text-gray-900 mt-1">
            {order.contrast_agent ? "Required" : "Not Required"}
          </div>
        </div>
      </div>

      {order.special_instructions && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <span className="font-medium text-yellow-800">
            Special Instructions:
          </span>
          <div className="text-yellow-900 mt-1">
            {order.special_instructions}
          </div>
        </div>
      )}
    </div>
  );
}
