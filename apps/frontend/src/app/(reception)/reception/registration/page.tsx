"use client";

import { Card } from "@/components/ui/card";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { useState } from "react";
import { useCreatePatientMutation } from "@/store/patientApi";
import { CreatePatientDto } from "@/common/interfaces/patient/patient-workflow.interface";
// no need to import enums here; the form provides values
import { useRouter } from "next/navigation";
import PatientForm from "@/components/patient/PatientForm";
import { ErrorAlert } from "@/components/ui/error-alert";

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
    <div className="bg-background">
        <div className="mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Patient Registration</h1>
            <p className="text-foreground">
              Register a new patient in the system
            </p>
          </div>

          {formErrors.general && (
            <ErrorAlert
              className="mb-4"
              title="Registration failed"
              message={formErrors.general}
            />
          )}

          <PatientForm
            onSubmit={(data) => submitForm(data as CreatePatientDto)}
            onCancel={() => router.push("/reception/patients")}
            loading={isCreating}
            errors={formErrors}
          />
        </div>
      
    </div>
  );
}
