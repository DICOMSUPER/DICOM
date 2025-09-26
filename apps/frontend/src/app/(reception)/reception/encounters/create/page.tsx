"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  useCreateEncounterMutation,
  useGetPatientsQuery
} from "@/store/patientApi";
import { 
  CreatePatientEncounterDto,
  Patient
} from "@/interfaces/patient/patient-workflow.interface";
import { EncounterType } from "@/enums/patient-workflow.enum";
import { 
  Stethoscope, 
  ArrowLeft,
  Save,
  X,
  User,
  Calendar,
  FileText,
  Activity
} from "lucide-react";
import { EncounterForm } from "@/components/patient/EncounterForm";

export default function CreateEncounterPage() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  // API hooks
  const [createEncounter, { isLoading: isCreating }] = useCreateEncounterMutation();
  const { data: patients, isLoading: patientsLoading } = useGetPatientsQuery({
    limit: 50,
    sortBy: 'firstName',
    sortOrder: 'asc'
  });

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleBack = () => {
    router.push('/reception/encounters/search');
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };

  const handleEncounterSubmit = async (data: CreatePatientEncounterDto) => {
    try {
      if (!selectedPatient) {
        alert('Please select a patient first');
        return;
      }

      const encounterData = {
        ...data,
        patientId: selectedPatient.id
      };

      await createEncounter(encounterData).unwrap();
      router.push('/reception/encounters/search');
    } catch (error) {
      console.error('Error creating encounter:', error);
    }
  };

  const handleCancel = () => {
    router.push('/reception/encounters/search');
  };

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
                Back to Search
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-8 w-8" />
                  Create Patient Encounter
                </h1>
                <p className="text-foreground">
                  Create a new patient encounter with medical details
                </p>
              </div>
            </div>
          </div>

          {/* Patient Selection */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPatient ? (
                <div className="space-y-4">
                  <p className="text-foreground">
                    Select a patient to create an encounter for:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients?.slice(0, 6).map((patient) => (
                      <Card 
                        key={patient.id} 
                        className="border-border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-foreground">
                                ID: {patient.patientCode}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {patients && patients.length > 6 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPatientSearch(true)}
                      className="w-full"
                    >
                      View All Patients ({patients.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h3>
                      <p className="text-sm text-foreground">
                        ID: {selectedPatient.patientCode}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Change Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Encounter Form */}
          {selectedPatient && (
            <EncounterForm
              patientId={selectedPatient.id}
              onSubmit={handleEncounterSubmit}
              onCancel={handleCancel}
              loading={isCreating}
            />
          )}

          {/* Patient Search Modal */}
          {showPatientSearch && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="border-border w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Patient</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPatientSearch(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patients?.map((patient) => (
                      <Card 
                        key={patient.id} 
                        className="border-border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-foreground">
                                ID: {patient.patientCode}
                              </p>
                              {patient.phoneNumber && (
                                <p className="text-sm text-foreground">
                                  Phone: {patient.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </div>
  );
}
