"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/ui/refresh-button";
import { 
  useCreateEncounterMutation,
  useGetPatientByIdQuery
} from "@/store/patientApi";
import { 
  CreatePatientEncounterDto
} from "@/interfaces/patient/patient-workflow.interface";
import { 
  Stethoscope, 
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Activity
} from "lucide-react";
import { EncounterForm } from "@/components/patient/EncounterForm";

export default function CreatePatientEncounterPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const [notificationCount] = useState(3);

  // API hooks
  const [createEncounter, { isLoading: isCreating }] = useCreateEncounterMutation();
  const { data: patient, isLoading: patientLoading, error: patientError, refetch: refetchPatient } = useGetPatientByIdQuery(patientId);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleBack = () => {
    router.push(`/reception/patients/${patientId}`);
  };

  const handleEncounterSubmit = async (data: any) => {
    try {
      const encounterData = {
        ...data,
        patientId: patientId
      };

      await createEncounter(encounterData).unwrap();
      router.push(`/reception/patients/${patientId}`);
    } catch (error) {
      console.error('Error creating encounter:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/reception/patients/${patientId}`);
  };

  const handleRefresh = async () => {
    await refetchPatient();
  };

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-foreground">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Patient Not Found</h2>
          <p className="text-foreground mb-4">The requested patient could not be found.</p>
          <Button onClick={() => router.push('/reception/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-8 w-8" />
                  Create Encounter
                </h1>
                <p className="text-foreground">
                  Create a new encounter for {patient.firstName} {patient.lastName}
                </p>
              </div>
            </div>
            <RefreshButton 
              onRefresh={handleRefresh} 
              loading={patientLoading}
            />
          </div>

          {/* Patient Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-foreground">Patient Name</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium">{patient.patientCode}</p>
                      <p className="text-foreground">Patient ID</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {patient.phoneNumber || 'Not provided'}
                      </p>
                      <p className="text-foreground">Phone Number</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Encounter Form */}
          <EncounterForm
            patientId={patientId}
            onSubmit={handleEncounterSubmit}
            onCancel={handleCancel}
            loading={isCreating}
          />
        </div>
      </WorkspaceLayout>
    </div>
  );
}
