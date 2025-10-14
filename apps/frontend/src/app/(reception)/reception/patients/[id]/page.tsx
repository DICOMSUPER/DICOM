"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { PatientForward } from "@/components/reception/patient-forward";
import {
  useGetPatientByIdQuery,
  useCreateEncounterMutation,
  useUpdateEncounterMutation,
} from "@/store/patientApi";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetPatientEncountersByPatientIdQuery } from "@/store/patientEncounterApi";

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id as string;
  const router = useRouter();
  // State for encounter management
  const [showEncounterForm, setShowEncounterForm] = useState(false);
  const [editingEncounter, setEditingEncounter] = useState(null);

  // Fetch real patient data
  const {
    data: patient,
    isLoading: patientLoading,
    error: patientError,
    refetch: refetchPatient,
  } = useGetPatientByIdQuery(patientId);
  const {
    data: encounters,
    isLoading: encountersLoading,
    refetch: refetchEncounters,
  } = useGetPatientEncountersByPatientIdQuery(patientId);
  const {
    data: conditions,
    isLoading: conditionsLoading,
    refetch: refetchConditions,
  } = useGetConditionsByPatientIdQuery(patientId);

  // Encounter mutations
  const [createEncounter, { isLoading: isCreatingEncounter }] =
    useCreateEncounterMutation();
  const [updateEncounter, { isLoading: isUpdatingEncounter }] =
    useUpdateEncounterMutation();

  // Encounter handlers
  const handleCreateEncounter = () => {
    setEditingEncounter(null);
    setShowEncounterForm(true);
  };

  const handleEditEncounter = (encounter) => {
    setEditingEncounter(encounter);
    setShowEncounterForm(true);
  };

  const handleCancelEncounter = () => {
    setShowEncounterForm(false);
    setEditingEncounter(null);
  };

  const handleEncounterSubmit = async (data) => {
    try {
      if (editingEncounter) {
        await updateEncounter({
          id: editingEncounter.id,
          data: data,
        }).unwrap();
      } else {
        await createEncounter(data).unwrap();
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
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
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
      </div>

      {/* Workspace Layout */}
      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Patient Information
                </CardTitle>
                <CardDescription>
                  Personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Date of Birth:</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {patient?.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Activity className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Gender:</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {patient?.gender || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Activity className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Blood Type:</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        {patient?.bloodType || "Unknown"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Phone:</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {patient?.phoneNumber || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Address:</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {patient?.address || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FileText className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Insurance:</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {patient?.insuranceNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Encounters */}
            {showEncounterForm ? (
              <EncounterForm
                encounter={editingEncounter}
                patientId={patientId}
                onSubmit={handleEncounterSubmit}
                onCancel={handleCancelEncounter}
                loading={isCreatingEncounter || isUpdatingEncounter}
              />
            ) : (
              <EncounterList
                encounters={encounters || []}
                loading={encountersLoading}
                onEdit={handleEditEncounter}
                onDelete={(encounterId) =>
                  console.log("Delete encounter:", encounterId)
                }
                onView={(encounter) =>
                  console.log("View encounter:", encounter)
                }
                onCreate={handleCreateEncounter}
              />
            )}

            {/* Patient Conditions */}
            <div className="col-span-1">
              <PatientConditionList
                conditions={conditions || []}
                canEdit={true}
                onEdit={(condition) => console.log("Edit condition", condition)}
              />
            </div>
          </div>

          {/* Patient Forwarding */}
          <PatientForward />
        </div>
      </WorkspaceLayout>
    </div>
  );
}
