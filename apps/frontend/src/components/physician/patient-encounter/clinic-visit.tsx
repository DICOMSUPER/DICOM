import { formatDate } from "@/lib/formatTimeDate";
import {
  EyeClosed,
  Plus,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  Weight,
  Ruler,
  User,
  Calendar,
  Phone,
  CreditCard,
  Stethoscope,
  ClipboardList,
  FileText,
  VenusAndMars,
  ChartBarStacked,
} from "lucide-react";
import React, { useState } from "react";
import { VitalSignForm } from "./vital-sign-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  PatientEncounter,
  VitalSignsSimplified,
} from "@/interfaces/patient/patient-workflow.interface";
import { useUpdatePatientEncounterMutation } from "@/store/patientEncounterApi";
import { toast } from "sonner";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { VisitInformationForm } from "./visit-information-form";
import { VisitInformationFormValues } from "@/lib/validation/visit-information-form";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";

interface ClinicVisitProps {
  detail: PatientEncounter;
}

const ClinicVisit = ({ detail }: ClinicVisitProps) => {
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [showVisitInformationModal, setShowVisitInformationModal] =
    useState(false);
  const [vitalSignsData, setVitalSignsData] = useState(
    detail.vitalSigns || null
  );
  const [visitInformationData, setVisitInformationData] =
    useState<Partial<VisitInformationFormValues> | null>({
      chiefComplaint: detail.chiefComplaint,
      symptoms: detail.symptoms,
    });
  const { data: serviceRoom } = useGetServiceRoomByIdQuery(
    detail.serviceRoomId as string,
    {
      skip: !detail.serviceRoomId,
    }
  );
  const router = useRouter();
  const [updatePatientEncounter, { isLoading: isUpdating }] =
    useUpdatePatientEncounterMutation();

  const handleOpenVitalSignsModal = () => {
    setShowVitalSignsModal(true);
  };
  const handleOpenVisitInformationModal = () => {
    setShowVisitInformationModal(true);
  };

  const handleCloseVitalSignsModal = () => {
    setShowVitalSignsModal(false);
  };

  const handleCloseVisitInformationModal = () => {
    setShowVisitInformationModal(false);
  };

  const handleVitalSignsSubmit = async (values: any) => {
    try {
      // Map form values to VitalSignsDto format
      const vitalSignsDto = {
        bpSystolic: values.bpSystolic,
        bpDiastolic: values.bpDiastolic,
        heartRate: values.heartRate,
        respiratoryRate: values.respiratoryRate,
        temperature: values.temperature,
        oxygenSaturation: values.oxygenSaturation,
        weight: values.weight,
        height: values.height,
      };

      // Call API to update encounter with vital signs
      await updatePatientEncounter({
        id: detail.id,
        data: {
          vitalSigns: vitalSignsDto,
        },
      }).unwrap();
      setVitalSignsData(vitalSignsDto);
      setShowVitalSignsModal(false);

      toast.success("Vital signs updated successfully!", {
        description: `Updated for ${detail.patient?.firstName} ${detail.patient?.lastName}`,
        duration: 3000,
      });
    } catch (error: any) {
      toast.error("Failed to update vital signs", {
        description: error?.data?.message || "Please try again later",
        duration: 4000,
      });
    }
    setVitalSignsData(values);
  };

  const handleVisitInformationSubmit = async (values: any) => {
    try {
      // Map form values to VitalSignsDto format
      const visitInformationDto = {
        chiefComplaint: values.chiefComplaint,
        symptoms: values.symptoms,
      };

      // Call API to update encounter with vital signs
      await updatePatientEncounter({
        id: detail.id,
        data: {
          chiefComplaint: visitInformationDto.chiefComplaint,
          symptoms: visitInformationDto.symptoms,
        },
      }).unwrap();
      setVisitInformationData(visitInformationDto);
      setShowVisitInformationModal(false);

      toast.success("Vital signs updated successfully!", {
        description: `Updated for ${detail.patient?.firstName} ${detail.patient?.lastName}`,
        duration: 3000,
      });
    } catch (error: any) {
      toast.error("Failed to update vital signs", {
        description: error?.data?.message || "Please try again later",
        duration: 4000,
      });
    }
    setVitalSignsData(values);
  };

  // Helper function to get vital sign display info
  const getVitalSignInfo = (key: string) => {
    const vitalSignMap: Record<
      string,
      { icon: any; label: string; unit: string; color: string }
    > = {
      bpSystolic: {
        icon: Activity,
        label: "Blood Pressure (Systolic)",
        unit: "mmHg",
        color: "text-red-600",
      },
      bpDiastolic: {
        icon: Activity,
        label: "Blood Pressure (Diastolic)",
        unit: "mmHg",
        color: "text-red-600",
      },
      heartRate: {
        icon: Heart,
        label: "Heart Rate",
        unit: "bpm",
        color: "text-pink-600",
      },
      respiratoryRate: {
        icon: Wind,
        label: "Respiratory Rate",
        unit: "/min",
        color: "text-blue-600",
      },
      temperature: {
        icon: Thermometer,
        label: "Temperature",
        unit: "°C",
        color: "text-orange-600",
      },
      oxygenSaturation: {
        icon: Droplets,
        label: "Oxygen Saturation",
        unit: "%",
        color: "text-cyan-600",
      },
      weight: {
        icon: Weight,
        label: "Weight",
        unit: "kg",
        color: "text-purple-600",
      },
      height: {
        icon: Ruler,
        label: "Height",
        unit: "cm",
        color: "text-green-600",
      },
    };
    return (
      vitalSignMap[key] || {
        icon: Activity,
        label: key,
        unit: "",
        color: "text-gray-600",
      }
    );
  };

  const convertVitalSignsToFormData = (vitalSigns: VitalSignsSimplified) => {
    if (!vitalSigns) return null;

    return {
      temperature:
        vitalSigns.respiratoryRate && vitalSigns.respiratoryRate !== 0
          ? vitalSigns.respiratoryRate
          : undefined,
      heartRate:
        vitalSigns.heartRate ||
        (vitalSigns.heartRate && vitalSigns.heartRate !== 0)
          ? vitalSigns.heartRate || vitalSigns.heartRate
          : undefined,
      bpSystolic:
        vitalSigns.bpSystolic && vitalSigns.bpSystolic !== 0
          ? vitalSigns.bpSystolic
          : undefined,
      bpDiastolic:
        vitalSigns.bpDiastolic && vitalSigns.bpDiastolic !== 0
          ? vitalSigns.bpDiastolic
          : undefined,
      respiratoryRate:
        vitalSigns.respiratoryRate && vitalSigns.respiratoryRate !== 0
          ? vitalSigns.respiratoryRate
          : undefined,
      oxygenSaturation:
        vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation !== 0
          ? vitalSigns.oxygenSaturation
          : undefined,
      weight:
        vitalSigns.weight && vitalSigns.weight !== 0
          ? vitalSigns.weight
          : undefined,
      height:
        vitalSigns.height && vitalSigns.height !== 0
          ? vitalSigns.height
          : undefined,
    };
  };

  const isUpdateMode = !!vitalSignsData;
  const initialData = convertVitalSignsToFormData(
    vitalSignsData as VitalSignsSimplified
  );
  const onViewPatientProfile = (encounterId: string) => {
    if (!vitalSignsData) {
      toast.error("No vital signs data to view patient profile.", {
        duration: 3000,
      });
      return;
    }
    router.push(`/physician/patients/${encounterId}`);
  };

  return (
    <div className="max-full mx-auto bg-linear-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="text-blue-600" size={28} />
              <h1 className="text-3xl font-bold text-gray-900">
                Clinic Visit Details
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-10">
              Visit ID:{" "}
              <span className="font-mono font-semibold">{detail.id}</span>
            </p>
          </div>

          <div>
            <Button
              onClick={() => onViewPatientProfile(detail?.id || "")}
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-600 hover:bg-gray-50"
            >
              <EyeClosed size={18} className="mr-2" />
              <span>View Patient Profile</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Patient + Vital Signs and Visit Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left column: Patient Information + Vital Signs */}
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-gray-300 to-gray-100 p-4">
              <div className="flex items-center gap-2">
                <User className="text-black" size={24} />
                <h2 className="text-xl font-semibold text-black">
                  Patient Information
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  Name:
                </span>
                <span className="font-semibold text-gray-900">
                  {detail.patient?.firstName} {detail.patient?.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  Patient ID:
                </span>
                <span className="font-mono font-semibold text-gray-900">
                  {detail.patient?.patientCode}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  Date of Birth:
                </span>
                <span className="text-gray-900">
                  {formatDate(detail.patient?.dateOfBirth)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <VenusAndMars className="text-gray-400" />
                  Gender:
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {detail.patient?.gender}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  Phone:
                </span>
                <span className="text-gray-900">
                  {detail.patient?.phoneNumber}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <CreditCard size={16} className="text-gray-400" />
                  Insurance:
                </span>
                <span className="font-mono text-gray-900">
                  {detail.patient?.insuranceNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-gray-300 to-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="text-black" size={24} />
                <h2 className="text-xl font-semibold text-black">
                  Vital Signs
                </h2>
              </div>
              {detail.vitalSigns && (
                <button
                  onClick={handleOpenVitalSignsModal}
                  className="px-3 py-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={14} />
                  Update
                </button>
              )}
            </div>
            {detail.vitalSigns ? (
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(detail.vitalSigns).map(([key, value]) => {
                    const info = getVitalSignInfo(key);
                    const Icon = info.icon;
                    return (
                      <div
                        key={key}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={20} className={info.color} />
                          <span className="text-xs font-medium text-gray-600">
                            {info.label}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {value || "—"}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {info.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-600 mb-4 font-medium">
                  No vital signs recorded
                </p>
                <button
                  onClick={handleOpenVitalSignsModal}
                  className="flex items-center gap-2 px-6 py-3  bg-gray-300 text-black rounded-lg hover:bg-gray-200 transition-colors shadow-md font-medium"
                >
                  <Plus size={18} />
                  Add Vital Signs
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Visit Information */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex justify-between bg-linear-to-r from-gray-300 to-gray-100 p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-black" size={24} />
              <h2 className="text-xl font-semibold text-black">
                Visit Information
              </h2>
            </div>

            <Button
              onClick={handleOpenVisitInformationModal}
              className="px-3 py-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Plus size={14} />
              Update
            </Button>
          </div>
          <div className="p-5">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  Visit Date:
                </span>
                <span className="text-gray-900 font-semibold">
                  {format(new TZDate(detail.encounterDate), "PPP")}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <ChartBarStacked className="text-gray-400" />
                  Visit Type:
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {detail.encounterType}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 flex items-center gap-2">
                  <ChartBarStacked className="text-gray-400" />
                  Service Name:
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {serviceRoom?.data.data.service?.serviceName ||
                    "No service room assigned"}
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <label className="font-semibold text-gray-700 block mb-2 text-sm uppercase tracking-wide">
                  Chief Complaint:
                </label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {detail.chiefComplaint || "No chief complaint provided"}
                </p>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-2 text-sm uppercase tracking-wide">
                  Symptoms:
                </label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {detail.symptoms || "No symptoms provided"}
                </p>
              </div>
              <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-sm uppercase tracking-wide">
                  <FileText size={16} className="text-gray-600" />
                  Clinical Notes:
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[100px]">
                  <p className="text-gray-800 leading-relaxed">
                    {detail.notes || "No notes available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Signs Modal */}
      <VitalSignForm
        open={showVitalSignsModal}
        onOpenChange={setShowVitalSignsModal}
        initialData={initialData}
        onSubmit={handleVitalSignsSubmit}
        mode={isUpdateMode ? "update" : "create"}
        isLoading={isUpdating}
      />

      <VisitInformationForm
        open={showVisitInformationModal}
        onOpenChange={setShowVisitInformationModal}
        initialData={visitInformationData}
        onSubmit={handleVisitInformationSubmit}
        mode={isUpdateMode ? "update" : "create"}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default ClinicVisit;
