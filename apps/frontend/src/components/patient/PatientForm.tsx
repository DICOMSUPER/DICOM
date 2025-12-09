"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { User, Save, Loader2, Phone, MapPin, Calendar, Heart, FileText } from "lucide-react";
import DatePickerDropdown from "@/components/radiologist/date-picker";
import {
  PatientFormProps,
  CreatePatientDto,
  UpdatePatientDto,
} from "@/interfaces/patient/patient-workflow.interface";
import { Gender, BloodType } from "@/enums/patient-workflow.enum";
import {
  formatInsuranceNumber,
  validateInsuranceNumber,
} from "@/lib/validation/patient-form";

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
  className,
}) => {
  const [formData, setFormData] = useState<CreatePatientDto | UpdatePatientDto>(
    {
      patientCode: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: Gender.MALE,
      phoneNumber: "",
      address: "",
      bloodType: BloodType.O_Positive,
      insuranceNumber: "",
      isActive: true,
    }
  );

  useEffect(() => {
    if (patient) {
      setFormData({
        patientCode: patient.patientCode,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: patient.gender,
        phoneNumber: patient.phoneNumber || "",
        address: patient.address || "",
        bloodType: patient.bloodType ?? BloodType.O_Positive,
        insuranceNumber: patient.insuranceNumber || "",
        isActive: patient.isActive,
      });
    }
  }, [patient]);

  const handleInputChange = (
    field: keyof (CreatePatientDto | UpdatePatientDto),
    value: string | boolean
  ) => {
    // Special handling for insurance number
    if (field === "insuranceNumber") {
      if (typeof value === "string") {
        const formattedValue = formatInsuranceNumber(value);
        setFormData((prev) => ({
          ...prev,
          insuranceNumber: formattedValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditMode = !!patient;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 shadow border-border border">
        <CardHeader className="px-0 pt-0 pb-6">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
            <User className="h-6 w-6" />
            {isEditMode ? "Edit Patient" : "Create New Patient"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update patient information and personal details"
              : "Enter patient personal information and contact details"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    className={errors.firstName ? "border-red-500" : ""}
                    required
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    className={errors.lastName ? "border-red-500" : ""}
                    required
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Date of Birth *
                  </Label>
                  <DatePickerDropdown
                    date={
                      formData.dateOfBirth
                        ? new Date(formData.dateOfBirth)
                        : undefined
                    }
                    onSelect={(date) =>
                      handleInputChange(
                        "dateOfBirth",
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    placeholder="Select date"
                    disabled={(date) => date > new Date()}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender *
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value as Gender)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={errors.gender ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHER}>Other</SelectItem>
                      <SelectItem value={Gender.UNKNOWN}>Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-red-600">{errors.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-sm font-medium flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" />
                    Blood Type
                  </Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) =>
                      handleInputChange("bloodType", value as BloodType)
                    }
                    disabled={loading}
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
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Phone className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Contact Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter phone number"
                    className={errors.phoneNumber ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceNumber" className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Insurance Number
                  </Label>
                  <Input
                    id="insuranceNumber"
                    value={formData.insuranceNumber || ""}
                    onChange={(e) =>
                      handleInputChange("insuranceNumber", e.target.value)
                    }
                    placeholder="Enter 10-digit insurance number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className={errors.insuranceNumber ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.insuranceNumber && (
                    <p className="text-xs text-red-600">{errors.insuranceNumber}</p>
                  )}
                  {formData.insuranceNumber &&
                    !validateInsuranceNumber(formData.insuranceNumber) && (
                      <p className="text-xs text-amber-600">
                        Insurance number must be exactly 10 digits
                      </p>
                    )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                  className={errors.address ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.address && (
                  <p className="text-xs text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="border-border"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update Patient" : "Create Patient"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default PatientForm;
