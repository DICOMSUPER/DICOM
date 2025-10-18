"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatientDetail } from "@/hooks/use-patient-detail";
import { PatientHeader } from "@/components/patients/detail/patient-header";
import { PatientProfileCard } from "@/components/patients/detail/patient-profile-card";
import { PatientSummaryTab } from "@/components/patients/detail/patient-summary";
import { MedicationsTab } from "@/components/patients/detail/medication-tab";
import { LabResultsTab } from "@/components/patients/detail/lab-result-tab";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalHistoryTab } from "@/components/patients/detail/medical-history-tab";
import { useGetPatientByCodeQuery, useGetPatientOverviewQuery } from "@/store/patientApi";
import { use } from "react";
import { PatientOverview } from "@/interfaces/patient/patient-workflow.interface";

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  //  const {
  //   patient,
  //   summary,
  //   medications,
  //   labResults,
  //   procedures,
  //   diagnoses,
  //   visits,
  //   immunizations,
  //   loading
  // } = usePatientDetail(params.id);
  const resolvedParams = use(params);

  const { data: patientData, isLoading } = useGetPatientByCodeQuery(
    resolvedParams.id
  );
  const { data: patientOverview, isLoading: isLoadingOverview } = useGetPatientOverviewQuery(
    resolvedParams.id
  );
  console.log(patientData?.data);
  console.log(patientOverview?.data);
  
  

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl ">
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
      </div>
    );
  }

  if (!patientData?.data ) {
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
      <div className="max-w-7xl">
        {/* <PatientHeader 
          title="Patient Details" 
          subtitle="View and manage patient information." 
        /> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Patient Profile Sidebar */}
          <div className="lg:col-span-1">
            <PatientProfileCard patient={patientData?.data} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                {/* display recent vital sign and conditions (first three) */}
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="results">Visit History</TabsTrigger>
                <TabsTrigger value="medical-history">
                  Condition
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6">
                {patientOverview?.data && <PatientSummaryTab overview={patientOverview.data} />}
              </TabsContent>
              <TabsContent value="results" className="space-y-6">
                {/* <LabResultsTab labResults={labResults} /> */}
              </TabsContent>

              <TabsContent value="medical-history" className="space-y-6">
                {/* <MedicalHistoryTab
                  procedures={procedures}
                  diagnoses={diagnoses}
                  visits={visits}
                  immunizations={immunizations}
                /> */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
