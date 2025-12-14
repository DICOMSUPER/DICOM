import { RequestProcedure } from "@/common/interfaces/image-dicom/request-procedure.interface";
import React from "react";

export default function ProcedureInfo({
  procedure,
}: {
  procedure: RequestProcedure;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Procedure
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Type</p>
          <p className="text-sm font-medium text-gray-900">
            {procedure.modality?.modalityName}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Body Part</p>
          <p className="text-sm font-medium text-gray-900">
            {procedure.bodyPart?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
