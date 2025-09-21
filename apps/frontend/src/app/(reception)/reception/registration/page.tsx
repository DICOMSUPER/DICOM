"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { useState } from "react";
import { useCreatePatientMutation } from "@/store/patientApi";
import { CreatePatientDto, CreatePatientConditionDto } from "@/interfaces/patient/patient-workflow.interface";
import { Gender, BloodType } from "@/enums/patient-workflow.enum";
import { PatientConditionForm } from "@/components/patient/PatientConditionForm";
import { useRouter } from "next/navigation";

export default function PatientRegistration() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [formData, setFormData] = useState<CreatePatientDto>({
    patientCode: `PAT${Date.now()}`,
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: Gender.MALE,
    phoneNumber: "",
    address: "",
    bloodType: BloodType.O_Positive,
    insuranceNumber: "",
    isActive: true,
    conditions: [],
  });

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConditionsChange = (conditions: CreatePatientConditionDto[]) => {
    setFormData(prev => ({
      ...prev,
      conditions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient(formData).unwrap();
      router.push('/reception/patients');
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      {/* Workspace Layout */}
      <WorkspaceLayout
        sidebar={<SidebarNav />}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Patient Registration</CardTitle>
              <CardDescription>
                Register a new patient in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={Gender.MALE}>Male</option>
                        <option value={Gender.FEMALE}>Female</option>
                        <option value={Gender.OTHER}>Other</option>
                        <option value={Gender.UNKNOWN}>Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Insurance Number
                      </label>
                      <input
                        type="text"
                        name="insuranceNumber"
                        value={formData.insuranceNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Medical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Blood Type
                      </label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={BloodType.A_Positive}>A+</option>
                        <option value={BloodType.A_Negative}>A-</option>
                        <option value={BloodType.B_Positive}>B+</option>
                        <option value={BloodType.B_Negative}>B-</option>
                        <option value={BloodType.AB_Positive}>AB+</option>
                        <option value={BloodType.AB_Negative}>AB-</option>
                        <option value={BloodType.O_Positive}>O+</option>
                        <option value={BloodType.O_Negative}>O-</option>
                        <option value={BloodType.Unknown}>Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Patient Conditions Section */}
                <div className="mt-8">
                  <PatientConditionForm
                    patientId="temp" // Will be replaced with actual patient ID after creation
                    conditions={formData.conditions || []}
                    onSave={handleConditionsChange}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isCreating ? "Registering..." : "Register Patient"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </WorkspaceLayout>
    </div>
  );
}
