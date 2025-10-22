"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { calculateAge, formatDate } from "@/lib/formatTimeDate";
import { Calendar, MapPin, Phone, Shield, Clock } from "lucide-react";

interface PatientProfileCardProps {
  patient: Patient;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  const initials = `${patient?.firstName?.[0] || ""}${
    patient?.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <Card className="h-fit border-0  shadow-lg">
      <CardHeader className="pb-6 bg-white border-b border-slate-200">
        <div className="">
          <CardTitle className="text-xl font-bold text-slate-900">
            Patient Profile
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Patient Avatar & Primary Info */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-blue-200 shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">
              {patient?.firstName} {patient?.lastName}
            </h2>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-600">
                {calculateAge(patient?.dateOfBirth as Date)} years old
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-slate-600 font-medium">
                {patient?.gender}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Contact Information
          </h3>
          <div className="space-y-3 bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-semibold">
                  Date of Birth
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(patient.dateOfBirth)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-semibold">
                  Phone Number
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {patient.phoneNumber}
                </p>
                
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-semibold">Address</p>
                <p className="text-sm font-medium text-slate-900">
                  {patient.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-semibold">Insurance Number</p>
                <p className="text-sm font-medium text-slate-900">
                  {patient.insuranceNumber}
                </p>
              </div>
          </div>
        </div>
        </div>



        {/* Record Metadata */}
        <div className="bg-slate-100 rounded-lg p-4 space-y-2 border border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-500" />
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Registered:</span>{" "}
              {formatDate(patient.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-slate-500" />
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Last Updated:</span>{" "}
              {formatDate(patient.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
