"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { useState } from "react";
import { useCreatePatientMutation } from "@/store/patientApi";
import { CreatePatientDto } from "@/interfaces/patient/patient-workflow.interface";
import { Gender, BloodType } from "@/enums/patient-workflow.enum";
import {
  formatInsuranceNumber,
  validateInsuranceNumber,
} from "@/lib/validation/patient-form";
import { useRouter } from "next/navigation";
import { User, Save } from "lucide-react";

export default function PatientRegistration() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for insurance number
    if (name === "insuranceNumber") {
      const formattedValue = formatInsuranceNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormErrors({});

      await createPatient(formData).unwrap();
      router.push("/reception/patients");
    } catch (error: any) {
      if (error.data?.message) {
        setFormErrors({ general: error.data.message });
      } else if (error.data?.errors) {
        setFormErrors(error.data.errors);
      } else {
        setFormErrors({ general: "An error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Patient Registration</h1>
            <p className="text-foreground">
              Register a new patient in the system
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {formErrors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic patient details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="space-y-2">
                    <Label htmlFor="patientCode">Patient Code</Label>
                    <Input
                      id="patientCode"
                      name="patientCode"
                      value={formData.patientCode}
                      onChange={handleInputChange}
                      className="bg-muted"
                    />
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: value as Gender,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="border-border">
                        <SelectItem value={Gender.MALE}>Male</SelectItem>
                        <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                        <SelectItem value={Gender.OTHER}>Other</SelectItem>
                        <SelectItem value={Gender.UNKNOWN}>Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceNumber">Insurance Number</Label>
                    <Input
                      id="insuranceNumber"
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit insurance number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                    />
                    {formData.insuranceNumber &&
                      !validateInsuranceNumber(formData.insuranceNumber) && (
                        <p className="text-sm text-amber-600">
                          Insurance number must be exactly 10 digits
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    name="bloodType"
                    value={formData.bloodType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        bloodType: value as BloodType,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      <SelectItem value={BloodType.A_Positive}>A+</SelectItem>
                      <SelectItem value={BloodType.A_Negative}>A-</SelectItem>
                      <SelectItem value={BloodType.B_Positive}>B+</SelectItem>
                      <SelectItem value={BloodType.B_Negative}>B-</SelectItem>
                      <SelectItem value={BloodType.AB_Positive}>AB+</SelectItem>
                      <SelectItem value={BloodType.AB_Negative}>AB-</SelectItem>
                      <SelectItem value={BloodType.O_Positive}>O+</SelectItem>
                      <SelectItem value={BloodType.O_Negative}>O-</SelectItem>
                      <SelectItem value={BloodType.Unknown}>Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/reception/patients")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? "Creating..." : "Create Patient"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </WorkspaceLayout>
    </div>
  );
}
