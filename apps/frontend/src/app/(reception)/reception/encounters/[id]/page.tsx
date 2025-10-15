"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
  useGetPatientEncounterByIdQuery,
  useUpdatePatientEncounterMutation,
  useDeletePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import {
  Stethoscope,
  Calendar,
  User,
  Clock,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Activity,
} from "lucide-react";
import { EncounterForm } from "@/components/patient/EncounterForm";
// import { VitalSignsDisplay } from "@/components/patient/VitalSignsDisplay";

export default function EncounterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params.id as string;
  const [notificationCount] = useState(3);
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const {
    data: encounter,
    isLoading,
    error,
  } = useGetPatientEncounterByIdQuery(encounterId);
  const [updateEncounter, { isLoading: isUpdating }] =
    useUpdatePatientEncounterMutation();
  const [deleteEncounter, { isLoading: isDeleting }] =
    useDeletePatientEncounterMutation();

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (data: any) => {
    try {
      await updateEncounter({
        id: encounterId,
        data: data,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating encounter:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this encounter?")) {
      try {
        await deleteEncounter(encounterId).unwrap();
        router.push("/reception/encounters");
      } catch (error) {
        console.error("Error deleting encounter:", error);
      }
    }
  };

  const handleBack = () => {
    router.push("/reception/encounters");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-foreground">Loading encounter...</p>
        </div>
      </div>
    );
  }

  if (error || !encounter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Encounter Not Found
          </h2>
          <p className="text-foreground mb-4">
            The requested encounter could not be found.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Encounters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-8 w-8" />
                  Encounter Details
                </h1>
                <p className="text-foreground">
                  {encounter.patient
                    ? `${encounter.patient.firstName} ${encounter.patient.lastName}`
                    : "Unknown Patient"}{" "}
                  - {new Date(encounter.encounterDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Encounter Form or Details */}
          {isEditing ? (
            <EncounterForm
              encounter={encounter}
              onSubmit={handleSave}
              onCancel={handleCancel}
              loading={isUpdating}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Encounter Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Encounter Type
                        </Label>
                        <p className="text-lg">{encounter.encounterType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Status
                        </Label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              encounter.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {encounter.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Date & Time
                        </Label>
                        <p className="text-lg">
                          {new Date(encounter.encounterDate).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Duration
                        </Label>
                        <p className="text-lg">N/A</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chief Complaint */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Chief Complaint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">
                      {encounter.chiefComplaint ||
                        "No chief complaint recorded"}
                    </p>
                  </CardContent>
                </Card>

                {/* Symptoms */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">
                      {encounter.symptoms || "No symptoms recorded"}
                    </p>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">
                      {encounter.notes || "No notes recorded"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Patient Information */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {encounter.patient ? (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Name
                          </Label>
                          <p className="text-lg">
                            {encounter.patient.firstName}{" "}
                            {encounter.patient.lastName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Patient ID
                          </Label>
                          <p className="text-lg">
                            {encounter.patient.patientCode}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Date of Birth
                          </Label>
                          <p className="text-lg">N/A</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Gender
                          </Label>
                          <p className="text-lg">N/A</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-foreground">
                        Patient information not available
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Vital Signs */}
                {encounter.vitalSigns &&
                  Object.keys(encounter.vitalSigns).length > 0 && (
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Vital Signs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4 text-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Vital signs display component</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Assigned Physician */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Assigned Physician</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">
                      {encounter.assignedPhysicianId || "Not assigned"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    </div>
  );
}
