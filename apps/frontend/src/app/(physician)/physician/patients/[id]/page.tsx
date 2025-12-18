"use client";

import { PatientProfileCard } from "@/components/patients/detail/patient-profile-card";
import { PatientSummaryTab } from "@/components/patients/detail/patient-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EncounterHistoryTab } from "@/components/patients/detail/visit-history";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPatientByCodeQuery,
  useGetPatientOverviewQuery,
} from "@/store/patientApi";
import {
  useGetPatientEncounterByIdQuery,
  useGetPatientEncountersByPatientIdQuery,
} from "@/store/patientEncounterApi";
import { use, useState, useEffect } from "react";
import CreateImagingOrder from "@/components/patients/detail/create-order-form";
import { PatientConditionsTab } from "@/components/patients/detail/patient-conditions-tab";

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: patientEncounterData, isLoading, refetch: refetchEncounter } =
    useGetPatientEncounterByIdQuery(resolvedParams.id);

  // Listen for patient update events to refetch encounter data
  useEffect(() => {
    const handlePatientUpdate = (event: CustomEvent) => {
      if (event.detail?.patientId === patientEncounterData?.data?.patientId) {
        refetchEncounter();
      }
    };
    window.addEventListener('patient:updated', handlePatientUpdate as EventListener);
    return () => {
      window.removeEventListener('patient:updated', handlePatientUpdate as EventListener);
    };
  }, [patientEncounterData?.data?.patientId, refetchEncounter]);

  const { data: patientOverview, isLoading: isLoadingOverview } =
    useGetPatientOverviewQuery(
      patientEncounterData?.data?.patient?.patientCode as string,
      {
        skip: !patientEncounterData?.data?.patient?.patientCode,
      }
    );
  console.log("Patient Encounter Data:", patientEncounterData);
  console.log("Patient Overview:", patientOverview);

  const { data: encountersData, isLoading: isLoadingEncounters } =
    useGetPatientEncountersByPatientIdQuery(
      {
        patientId: patientEncounterData?.data?.patientId as string,
        pagination: {
          page: 1,
          limit: 10,
        },
      },
      {
        skip: activeTab !== "results",
      }
    );
  console.log("Encounters Data:", encountersData);

  // Conditionally fetch conditions only when tab is active
  // const { data: conditionsData, isLoading: isLoadingConditions } = useGetPatientConditionsByPatientIdQuery(
  //   {
  //     patientId: resolvedParams.id,
  //     pagination: {
  //       page: 1,
  //       limit: 10,
  //     }
  //   },
  //   {
  //     skip: activeTab !== "medical-history", // Only fetch when medical-history tab is active
  //   }
  // );

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
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

  if (!patientEncounterData?.data.patient) {
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
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Patient Profile Sidebar */}
          <div className="lg:col-span-1">
            <PatientProfileCard patient={patientEncounterData?.data?.patient} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              defaultValue="overview"
              className="space-y-6"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                {/* display recent vital sign and conditions (first three) */}
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="results">Encounter History</TabsTrigger>
                <TabsTrigger value="imaging-order">
                  Create Order Form
                </TabsTrigger>
                <TabsTrigger value="patient-condition">Condition</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6">
                {patientOverview?.data && (
                  <PatientSummaryTab overview={patientOverview?.data} />
                )}
              </TabsContent>
              <TabsContent value="results" className="space-y-6">
                {isLoadingEncounters ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <EncounterHistoryTab
                    encounterHistory={encountersData?.data || []}
                  />
                )}
              </TabsContent>

              <TabsContent value="imaging-order" className="space-y-6">
                <CreateImagingOrder
                  patient={patientEncounterData?.data?.patient}
                  encounterId={resolvedParams.id}
                />
              </TabsContent>
              <TabsContent value="patient-condition" className="space-y-6">
                {patientEncounterData?.data?.patientId && (
                  <PatientConditionsTab patientId={patientEncounterData.data.patientId} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
