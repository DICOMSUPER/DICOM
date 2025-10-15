import { formatDate } from "@/lib/formatTimeDate";
import { EyeClosed, Plus } from "lucide-react";
import React, { useState } from "react";
import { VitalSignForm } from "./vital-sign-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";



interface ClinicVisitProps {
  detail: PatientEncounter;
}

const ClinicVisit = ({ detail }: ClinicVisitProps) => {
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [vitalSignsData, setVitalSignsData] = useState(detail.vitalSigns || null);
  const router = useRouter();

  const handleOpenVitalSignsModal = () => {
    setShowVitalSignsModal(true);
  };

  const handleCloseVitalSignsModal = () => {
    setShowVitalSignsModal(false);
  };

  const handleVitalSignsSubmit = (values: any) => {
    console.log("Vital signs submitted:", values);
    // Update the vital signs data
    setVitalSignsData(values);
    // Here you can also make API call to save data
  };

// ...existing code...

const convertVitalSignsToFormData = (vitalSigns: any) => {
  if (!vitalSigns) return null;

  return {
    temperature: vitalSigns.temperature && vitalSigns.temperature !== 0 ? vitalSigns.temperature : undefined,
    heartRate: vitalSigns.pulse || vitalSigns.heart_rate && vitalSigns.heart_rate !== 0 ? vitalSigns.pulse || vitalSigns.heart_rate : undefined,
    bpSystolic: vitalSigns.blood_pressure ? 
      parseInt(vitalSigns.blood_pressure.split("/")[0]) || undefined : undefined,
    bpDiastolic: vitalSigns.blood_pressure ? 
      parseInt(vitalSigns.blood_pressure.split("/")[1]) || undefined : undefined,
    respiratoryRate: vitalSigns.respiratory_rate && vitalSigns.respiratory_rate !== 0 ? vitalSigns.respiratory_rate : undefined,
    spo2: vitalSigns.spo2 && vitalSigns.spo2 !== 0 ? vitalSigns.spo2 : undefined,
    weight: vitalSigns.weight && vitalSigns.weight !== 0 ? vitalSigns.weight : undefined,
    height: vitalSigns.height && vitalSigns.height !== 0 ? vitalSigns.height : undefined,
    glucose: vitalSigns.glucose && vitalSigns.glucose !== 0 ? vitalSigns.glucose : undefined,

  };
};

// ...existing code...
  const isUpdateMode = !!vitalSignsData;
  const initialData = convertVitalSignsToFormData(vitalSignsData);
  const onViewPatientProfile = (patientId:string) => {
    // Implement navigation to patient profile
      router.push(`physicians/patients/${patientId}`);
    console.log("Navigating to patient profile...");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="flex justify-between border-b border-gray-200 pb-4 mb-6">
        <div>

        <h1 className="text-2xl font-bold text-gray-900">
          Clinic Visit Details
        </h1>
        <p className="text-sm text-gray-600">Visit ID: {detail.id}</p>
        </div>
        <Button onClick={() => onViewPatientProfile(detail?.patient?.id || "")} variant="outline" size="sm">
          <EyeClosed size={16} className="mr-2" />
          <span>View patient profile</span>
        </Button>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Patient Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Name:</span>
              <span>
                {detail.patient?.firstName} {detail.patient?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Patient ID:</span>
              <span>{detail.patient?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Date of Birth:</span>
              <span>{formatDate(detail.patient?.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Gender:</span>
              <span>{detail.patient?.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Phone:</span>
              <span>{detail.patient?.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Insurance:</span>
              <span>{detail.patient?.insuranceNumber}</span>
            </div>
          </div>
        </div>

        {/* Visit Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-green-900 mb-3">
            Visit Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Visit Date:</span>
              <span>{formatDate(detail.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Visit Type:</span>
              <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                {detail.encounterType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Physician ID:</span>
              <span>{detail.assignedPhysicianId || "Not assigned"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chief Complaint & Symptoms */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-900 mb-3">
            Clinical Assessment
          </h2>
          <div className="space-y-3">
            <div>
              <label className="font-medium text-gray-700 block mb-1">
                Chief Complaint:
              </label>
              <p className="text-gray-800 bg-white p-2 rounded border">
                {detail.chiefComplaint || "None specified"}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-700 block mb-1">
                Symptoms:
              </label>
              <p className="text-gray-800 bg-white p-2 rounded border">
                {detail.symptoms || "None specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-900 mb-3">
            Vital Signs
          </h2>
          {detail.vitalSigns ? (
            <div className="space-y-2">
              {Object.entries(detail.vitalSigns).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium text-gray-700 capitalize">
                    {key.replace("_", " ")}:
                  </span>
                  <span className="text-gray-800">
                    {typeof value === "number" && key === "temperature"
                      ? `${value}°C`
                      : value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {/* <div className="mb-4 p-4 bg-red-100 rounded-full">
                <Plus size={32} className="text-red-600" />
              </div> */}
              <p className="text-gray-600 mb-3">No vital signs recorded</p>
              <button
                onClick={handleOpenVitalSignsModal}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Plus size={16} />
                Add Vital Signs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Clinical Notes
        </h2>
        <div className="bg-white p-3 rounded border min-h-[100px]">
          <p className="text-gray-800">
            {detail.notes || "No notes available"}
          </p>
        </div>
      </div>


      {/* Vital Signs Modal (Placeholder) */}

      <VitalSignForm
        open={showVitalSignsModal}
        onOpenChange={setShowVitalSignsModal}
        initialData={initialData}
        onSubmit={handleVitalSignsSubmit}
        mode={isUpdateMode ? "update" : "create"}
      />
    </div>
  );
};

export default ClinicVisit;
