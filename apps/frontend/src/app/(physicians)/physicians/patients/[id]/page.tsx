'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientDetail } from '@/hooks/use-patient-detail';
import { PatientHeader } from '@/components/patients/detail/patient-header';
import { PatientProfileCard } from '@/components/patients/detail/patient-profile-card';
import { PatientSummaryTab } from '@/components/patients/detail/patient-summary';
import { MedicationsTab } from '@/components/patients/detail/medication-tab';
import { LabResultsTab } from '@/components/patients/detail/lab-result-tab';
import { Skeleton } from '@/components/ui/skeleton';
import { MedicalHistoryTab } from '@/components/patients/detail/medical-history-tab';

interface PatientDetailPageProps {
  params: {
    id: string;
  };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
   const { 
    patient, 
    summary, 
    medications, 
    labResults, 
    procedures,
    diagnoses,
    visits,
    immunizations,
    loading 
  } = usePatientDetail(params.id);

  if (loading) {
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

  if (!patient || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient not found</h2>
          <p className="text-gray-600">The patient you're looking for doesn't exist.</p>
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
            <PatientProfileCard patient={patient} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {/* <TabsTrigger value="appointments">Appointments</TabsTrigger> */}
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="medical-history">Medical History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <PatientSummaryTab summary={summary} />
              </TabsContent>
{/* 
              <TabsContent value="appointments" className="space-y-6">
                <AppointmentsTab appointments={appointments} />
              </TabsContent> */}

              <TabsContent value="prescriptions" className="space-y-6">
                <MedicationsTab medications={medications} />
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <LabResultsTab labResults={labResults} />
              </TabsContent>

              <TabsContent value="medical-history" className="space-y-6">
                <MedicalHistoryTab
                  procedures={procedures}
                  diagnoses={diagnoses}
                  visits={visits}
                  immunizations={immunizations}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}