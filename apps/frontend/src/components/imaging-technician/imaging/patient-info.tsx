import React from "react";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { UserRoundPen } from "lucide-react";

export default function PatientInfo({
  patient,
  handleChangeMrn,
}: {
  patient: Patient;
  handleChangeMrn?: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Patient
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Name</p>
          <p className="text-sm font-medium text-gray-900">
            {patient.lastName} {patient.firstName}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">MRN</p>
          <p className="text-sm font-medium text-gray-900">
            {patient.patientCode}
          </p>
          {handleChangeMrn && (
            <button
              onClick={() => handleChangeMrn(patient.id)}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <UserRoundPen className="h-4 w-4" />
              Change MRN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
