import React from "react";

export default function ClinicalIndication({
  indication,
  contrastRequired,
}: {
  indication: string;
  contrastRequired: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Clinical
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Indication</p>
          <p className="text-sm font-medium text-gray-900">{indication}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Contrast</p>
          <p className="text-sm font-medium text-gray-900">
            {contrastRequired ? "Required" : "Not Required"}
          </p>
        </div>
      </div>
    </div>
  );
}
