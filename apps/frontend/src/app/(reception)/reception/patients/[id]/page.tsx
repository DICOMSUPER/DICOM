"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PatientForward } from "@/components/reception/patient-forward";
import { useGetPatientByIdQuery } from "@/store/patientApi";
import { useGetConditionsByPatientIdQuery } from "@/store/patientConditionApi";
import { PatientConditionList } from "@/components/patient/PatientConditionList";
import { EncounterList } from "@/components/patient/EncounterList";
import { EncounterForm } from "@/components/patient/EncounterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
  Calendar,
  Phone,
  MapPin,
  FileText,
  Activity,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetPatientEncountersByPatientIdQuery,
  useCreatePatientEncounterMutation,
  useUpdatePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import PatientInfo from "@/components/reception/patient/[id]/patient-info";
import { PaginationParams } from "@/interfaces/pagination/pagination.interface";
import {
  PatientEncounter,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
} from "@/interfaces/patient/patient-workflow.interface";
import EncounterModal from "@/components/reception/patient/[id]/encounter-modal";

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id as string;
  const router = useRouter();
  // State for encounter management
  const [showEncounterForm, setShowEncounterForm] = useState<boolean>(false);
  const [viewEncounter, setViewEncounter] = useState<PatientEncounter | null>(
    null
  );
  const [editingEncounter, setEditingEncounter] =
    useState<PatientEncounter | null>(null);

  // Fetch real patient data
  const {
    data: patientData,
    isLoading: patientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = useGetPatientByIdQuery(patientId);
  const {
    data: encountersData,
    isLoading: encountersLoading,
    refetch: refetchEncounters,
  } = useGetPatientEncountersByPatientIdQuery({
    patientId,
    pagination: { page: 1, limit: 3 },
  });

  const {
    data: conditionsData,
    isLoading: conditionsLoading,
    refetch: refetchConditions,
  } = useGetConditionsByPatientIdQuery(patientId);

  // console.log("conditionData", conditionsData);

  const patient = patientData?.data;
  const encounters = encountersData?.data || [];
  const conditions = conditionsData?.data;
  // Encounter mutations
  const [createEncounter, { isLoading: isCreatingEncounter }] =
    useCreatePatientEncounterMutation();
  const [updateEncounter, { isLoading: isUpdatingEncounter }] =
    useUpdatePatientEncounterMutation();

  // Encounter handlers
  const handleCreateEncounter = () => {
    setEditingEncounter(null);
    setShowEncounterForm(true);
  };

  const handleEditEncounter = (encounter: PatientEncounter) => {
    setEditingEncounter(encounter);
    setShowEncounterForm(true);
  };

  const handleCancelEncounter = () => {
    setShowEncounterForm(false);
    setEditingEncounter(null);
  };

  const handleEncounterSubmit = async (
    data: CreatePatientEncounterDto | UpdatePatientEncounterDto
  ) => {
    try {
      if (editingEncounter) {
        await updateEncounter({
          id: editingEncounter.id,
          data: data as UpdatePatientEncounterDto,
        }).unwrap();
      } else {
        await createEncounter(data as CreatePatientEncounterDto).unwrap();
      }
      setShowEncounterForm(false);
      setEditingEncounter(null);
    } catch (error) {
      console.error("Error saving encounter:", error);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchPatient(),
      refetchEncounters(),
      refetchConditions(),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="border-border"
            onClick={() => {
              router.push("/reception/patients");
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {patient?.firstName} {patient?.lastName}
            </h1>
            <p className="text-foreground">
              Patient ID: {patient?.patientCode}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={patientLoading || encountersLoading || conditionsLoading}
          />
          <Button
            variant="outline"
            className="border-border"
            onClick={() => {
              router.push(`/reception/patients/edit/${patient?.id}`);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Patient
          </Button>
          {/* <Button
            variant="outline"
            className="border-border text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          {patient && <PatientInfo patient={patient} />}

          {/* Medical Encounters */}
          <EncounterList
            encounters={encounters}
            loading={encountersLoading}
            onEdit={handleEditEncounter}
            onDelete={(encounterId) =>
              console.log("Delete encounter:", encounterId)
            }
            onView={(encounter) => setViewEncounter(encounter)}
            onCreate={handleCreateEncounter}
            page={encountersData?.page || 1}
            totalPages={encountersData?.totalPages || 1}
          />

          {/* Patient Conditions */}
          <div className="col-span-1">
            {!conditionsLoading && (
              <PatientConditionList
                conditions={conditions || []}
                canEdit={true}
                onEdit={(condition) => console.log("Edit condition", condition)}
              />
            )}
            {conditionsLoading && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        <EncounterModal
          encounter={viewEncounter}
          onClose={() => setViewEncounter(null)}
        />
        {/* Patient Forwarding */}
        {patient && patient.id && <PatientForward patientId={patient?.id} />}
      </div>
    </div>
  );
}
