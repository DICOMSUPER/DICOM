"use client";
import { Skeleton } from "@/components/ui/skeleton";
import ClinicVisit from "@/components/physician/patient-encounter/clinic-visit";
import { use } from "react";
import { useGetPatientEncounterByIdQuery } from "@/store/patientEncounterApi";

interface ClinicVisitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClinicVisitDetailPage({
  params,
}: ClinicVisitDetailPageProps) {
  const resolvedParams = use(params);

  const { data: patientEncounter, isLoading: isLoadingEncounter } =
    useGetPatientEncounterByIdQuery(resolvedParams.id);

  if (isLoadingEncounter) {
    return (
      <div className="min-h-screen ">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!patientEncounter?.data || !patientEncounter?.data.patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Patient not found
          </h2>
          <p className="text-gray-600">
            The patient you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Patient Profile Sidebar */}
        {/* <div className="lg:col-span-1">
            <PatientProfileCard patient={patientEncounter?.data?.patient} />
          </div> */}

        {/* Main Content */}
        <div className="lg:col-span-4">
          <ClinicVisit detail={patientEncounter.data} />
        </div>
      </div>
    </div>
  );
}
