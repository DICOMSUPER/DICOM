"use client";

import PatientForm from "@/components/patient/PatientForm";
import {
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
} from "@/store/patientApi";
import { useParams, useRouter } from "next/navigation";
import {
  CreatePatientDto,
  UpdatePatientDto,
} from "@/interfaces/patient/patient-workflow.interface";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { AppHeader } from "@/components/app-header";
import { SidebarNav } from "@/components/sidebar-nav";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const { data: patient, isLoading } = useGetPatientByIdQuery(patientId);
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation();

  const handleSubmit = async (
    formData: CreatePatientDto | UpdatePatientDto
  ) => {
    await updatePatient({ id: patientId, data: formData }).unwrap();
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        notificationCount={0}
        onNotificationClick={() => {}}
        onLogout={() => {}}
      />

      <WorkspaceLayout sidebar={<SidebarNav />}>
        <PatientForm
          patient={patient}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          loading={isLoading || isUpdating}
          errors={{}}
          className=""
        />
      </WorkspaceLayout>
    </div>
  );
}
