"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { PatientForward } from "@/components/reception/patient-forward";
import { useGetPatientByIdQuery, useGetEncountersByPatientIdQuery } from "@/store/patientApi";
import { useGetConditionsByPatientIdQuery } from "@/store/patientConditionApi";
import { PatientConditionList } from "@/components/patient/PatientConditionList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id as string;

  // Fetch real patient data
  const { data: patient, isLoading: patientLoading, error: patientError } = useGetPatientByIdQuery(patientId);
  const { data: encounters, isLoading: encountersLoading } = useGetEncountersByPatientIdQuery(patientId);
  const { data: conditions, isLoading: conditionsLoading } = useGetConditionsByPatientIdQuery(patientId);

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
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {patient?.firstName} {patient?.lastName}
              </h1>
              <p className="text-foreground">Patient ID: {patient?.patientCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-border">
              <Edit className="w-4 h-4 mr-2" />
              Edit Patient
            </Button>
            <Button variant="outline" className="border-border text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Layout */}
      <WorkspaceLayout
        sidebar={<SidebarNav />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Patient Information</CardTitle>
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
                        {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Activity className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Gender:</span>
                      </div>
                      <p className="font-medium text-foreground">{patient?.gender || 'N/A'}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Activity className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Blood Type:</span>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {patient?.bloodType || 'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Phone:</span>
                      </div>
                      <p className="font-medium text-foreground">{patient?.phoneNumber || 'N/A'}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Address:</span>
                      </div>
                      <p className="font-medium text-foreground">{patient?.address || 'N/A'}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FileText className="w-4 h-4 mr-2 text-foreground" />
                        <span className="text-foreground">Insurance:</span>
                      </div>
                      <p className="font-medium text-foreground">{patient?.insuranceNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Encounters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Medical Encounters</CardTitle>
                <CardDescription>
                  Medical visits and appointments history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {encountersLoading ? (
                    <div className="text-center py-4">Loading encounters...</div>
                  ) : encounters?.length ? (
                    encounters.map((encounter) => (
                      <div
                        key={encounter.id}
                        className="border border-border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-foreground">
                              {encounter.encounterType} - {new Date(encounter.encounterDate).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-foreground">
                              Chief Complaint: {encounter.chiefComplaint || 'N/A'}
                            </p>
                            <p className="text-sm text-foreground mt-1">
                              {encounter.notes || 'No notes available'}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-foreground">No encounters found</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Conditions */}
            <div className="col-span-1">
              <PatientConditionList
                conditions={conditions || []}
                canEdit={true}
                onAdd={() => console.log('Add condition')}
                onEdit={(condition) => console.log('Edit condition', condition)}
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
