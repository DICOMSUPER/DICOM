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
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertCircle,
  User,
  Stethoscope,
  Hash,
  DoorOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetPatientEncountersByPatientIdQuery,
  useCreatePatientEncounterMutation,
  useUpdatePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import PatientInfo from "@/components/reception/patient/[id]/patient-info";
import { PaginationParams } from "@/common/interfaces/pagination/pagination.interface";
import {
  PatientEncounter,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
} from "@/common/interfaces/patient/patient-workflow.interface";
import EncounterModal from "@/components/reception/patient/[id]/encounter-modal";
import PatientConditionModal from "@/components/reception/patient/[id]/patient-condition-modal";
import { PatientCondition } from "@/common/interfaces/patient/patient-condition.interface";

// Skeleton component for PatientInfo
function PatientInfoSkeleton() {
  return (
    <div className="rounded-2xl p-6 shadow border-border border space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Hero Section Skeleton */}
      <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-9 w-64" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-20 w-32 rounded-2xl" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Information Skeleton */}
      <section className="rounded-2xl p-6 shadow border-border border space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl md:col-span-2" />
          <Skeleton className="h-24 rounded-2xl md:col-span-3" />
        </div>
      </section>
    </div>
  );
}

// Skeleton component for PatientForward
function PatientForwardSkeleton() {
  return (
    <div className="rounded-2xl border border-border shadow">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Step Indicator Skeleton */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              {i < 3 && <Skeleton className="h-0.5 flex-1" />}
            </div>
          ))}
        </div>

        {/* Form Fields Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Encounter Type Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-md" />
            ))}
          </div>
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

// Skeleton component for EncounterList
function EncounterListSkeleton() {
  return (
    <div className="rounded-2xl shadow border-border border space-y-4 h-60 overflow-y-auto">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Stethoscope className="h-5 w-5" />
        Recent Encounters
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            {/* Header Row Skeleton */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>

            {/* Date and Time Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>

            {/* Information Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div
                  key={j}
                  className="flex items-start gap-2 p-2.5 rounded-md border border-border"
                >
                  <Skeleton className="h-3.5 w-3.5 rounded mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button Skeleton */}
            <div className="flex justify-end pt-2 border-t border-border/30">
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  // State for condition view
  const [viewCondition, setViewCondition] = useState<PatientCondition | null>(
    null
  );

  // Fetch real patient data
  const {
    data: patientData,
    isLoading: patientLoading,
    isFetching: patientFetching,
    error: patientError,
    refetch: refetchPatient,
  } = useGetPatientByIdQuery(patientId);
  const {
    data: encountersData,
    isLoading: encountersLoading,
    isFetching: encountersFetching,
    refetch: refetchEncounters,
  } = useGetPatientEncountersByPatientIdQuery({
    patientId,
    pagination: { page: 1, limit: 3 },
  });

  const {
    data: conditionsData,
    isLoading: conditionsLoading,
    isFetching: conditionsFetching,
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
      // Refetch encounters after successful create/update
      await refetchEncounters();
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          {patientLoading ? (
            <>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground">
                {patient?.firstName} {patient?.lastName}
              </h1>
              <p className="text-foreground">
                Patient ID: {patient?.patientCode}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="border-border"
            onClick={() => {
              router.push("/reception/patients");
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={
              patientLoading ||
              patientFetching ||
              encountersLoading ||
              encountersFetching ||
              conditionsLoading ||
              conditionsFetching
            }
          />
          {!patientLoading && (
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                router.push(`/reception/patients/edit/${patient?.id}`);
              }}
            >
              <Edit className="w-4 h-4" />
              Edit Patient
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Patient Information and Encounters */}
        <div className="xl:col-span-8 space-y-6">
          {patientLoading ? (
            <PatientInfoSkeleton />
          ) : patient ? (
            <PatientInfo patient={patient} />
          ) : null}

          {/* Medical Encounters */}
          {patientLoading ? (
            <EncounterListSkeleton />
          ) : (
            <EncounterList
              encounters={encounters}
              loading={encountersLoading}
              onEdit={handleEditEncounter}
              onView={(encounter) => setViewEncounter(encounter)}
              onCreate={handleCreateEncounter}
              page={encountersData?.page || 1}
              totalPages={encountersData?.totalPages || 1}
            />
          )}

          {/* Patient Conditions */}
          {!conditionsLoading && (
            <PatientConditionList
              conditions={conditions || []}
              onView={(condition) => setViewCondition(condition)}
            />
          )}
          {conditionsLoading && (
            <div className="rounded-2xl p-6 shadow border-border border">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <AlertCircle className="h-5 w-5" />
                Medical Conditions
              </div>
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Loading conditions...
                </p>
                <p className="text-xs text-foreground mt-1">
                  Please wait while we fetch the data
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="sticky top-6">
            {/* Patient Forwarding */}
            {patientLoading ? (
              <PatientForwardSkeleton />
            ) : patient && patient.id ? (
              <PatientForward
                patientId={patient?.id}
                hasFollowUp={encounters.length !== 0}
              />
            ) : null}
          </div>
        </div>
      </div>

      <EncounterModal
        encounter={viewEncounter}
        onClose={() => setViewEncounter(null)}
      />

      <PatientConditionModal
        condition={viewCondition}
        onClose={() => setViewCondition(null)}
      />
    </div>
  );
}
