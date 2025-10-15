"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { formatDate } from "@/lib/formatTimeDate";
import { User } from "lucide-react";
interface PatientProfileCardProps {
  patient: Patient;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  return (
    <Card className="h-fit border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Patient Profile
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Patient ID: {patient?.patientCode}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Basic Info */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20">
            {/* <AvatarImage src={patient.avatar} alt={patient.name} /> */}
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              {patient?.firstName} + " " +{" "}
              {patient?.lastName}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {patient?.firstName} {patient?.lastName}
            </h3>
            <p className="text-gray-600">
              {formatDate(patient?.dateOfBirth)} years • {patient?.gender}
            </p>
            <div className="flex justify-center mt-2">
              {/* insurance number */}
              <span className="text-gray-600">Insurance Number:</span>
              <span className="font-medium">{patient.insuranceNumber}</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">Personal Information</span>
          </div>
          <div className="space-y-2 pl-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">
                {formatDate(patient.dateOfBirth)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{patient.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {/* <span className="text-gray-600">Email:</span>
              <span className="font-medium text-blue-600">{patient.}</span> */}
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">{patient.address}</span>
            </div>
          </div>
        </div>

        {/* Registration Info */}
        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <div>Registered on: {formatDate(patient.createdAt)}</div>
          <div>Last Updated: {formatDate(patient.updatedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
