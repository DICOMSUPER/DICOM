"use client";

import { Card } from "@/components/ui/card";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { useState } from "react";
import { useCreatePatientMutation } from "@/store/patientApi";
import { CreatePatientDto } from "@/interfaces/patient/patient-workflow.interface";
// no need to import enums here; the form provides values
import { useRouter } from "next/navigation";
import PatientForm from "@/components/patient/PatientForm";

export default function PatientRegistration() {
  const router = useRouter();
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const submitForm = async (payload: CreatePatientDto) => {
    try {
      setFormErrors({});
      const finalPayload: CreatePatientDto = {
        ...payload,
        patientCode:
          payload.patientCode && payload.patientCode.length > 0
            ? payload.patientCode
            : `PAT${Date.now()}`,
        conditions: payload.conditions ?? [],
      };
      await createPatient(finalPayload).unwrap();
      router.push("/reception/patients");
    } catch (err: unknown) {
      const error = err as {
        data?: { message?: string; errors?: Record<string, string> };
      };
      if (error?.data?.message) {
        setFormErrors({ general: error.data.message });
      } else if (error?.data?.errors) {
        setFormErrors(error.data.errors);
      } else {
        setFormErrors({ general: "An error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Patient Registration</h1>
            <p className="text-foreground">
              Register a new patient in the system
            </p>
          </div>

          {formErrors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{formErrors.general}</p>
            </div>
          )}

          <PatientForm
            onSubmit={(data) => submitForm(data as CreatePatientDto)}
            onCancel={() => router.push("/reception/patients")}
            loading={isCreating}
            errors={formErrors}
          />
        </div>
      </WorkspaceLayout>
    </div>
  );
}
