"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { User, Save } from "lucide-react";
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
    <Card className={`border-border ${className ? className : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>{isEditMode ? "Edit Patient" : "Personal Information"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                className={errors.firstName ? "border-red-500" : ""}
                required
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                className={errors.lastName ? "border-red-500" : ""}
                required
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                className={errors.dateOfBirth ? "border-red-500" : ""}
                required
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  handleInputChange("gender", value as Gender)
                }
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
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Enter phone number"
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceNumber">Insurance Number</Label>
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
              />
              {errors.insuranceNumber && (
                <p className="text-sm text-red-600">{errors.insuranceNumber}</p>
              )}
              {formData.insuranceNumber &&
                !validateInsuranceNumber(formData.insuranceNumber) && (
                  <p className="text-sm text-amber-600">
                    Insurance number must be exactly 10 digits
                  </p>
                )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter full address"
              rows={3}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="bloodType">Blood Type</Label>
            <Select
              value={formData.bloodType}
              onValueChange={(value) =>
                handleInputChange("bloodType", value as BloodType)
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
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? "Update Patient" : "Create Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
