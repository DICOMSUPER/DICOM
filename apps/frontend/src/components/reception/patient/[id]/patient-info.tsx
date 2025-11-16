import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { Calendar, FileText, Heart, MapPin, Phone, User } from "lucide-react";
import React, { Activity } from "react";

export default function PatientInfo({ patient }: { patient: Patient }) {
  return (
    <Card className="border-border">
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
                {patient?.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-foreground" />
                <span className="text-foreground">Gender:</span>
              </div>
              <p className="font-medium text-foreground">
                {patient?.gender || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Heart className="w-4 h-4 mr-2 text-foreground" />
                <span className="text-foreground">Blood Type:</span>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {patient?.bloodType || "N/A"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-2 text-foreground" />
                <span className="text-foreground">Phone:</span>
              </div>
              <p className="font-medium text-foreground">
                {patient?.phoneNumber || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-foreground" />
                <span className="text-foreground">Address:</span>
              </div>
              <p className="font-medium text-foreground">
                {patient?.address || "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-foreground" />
                <span className="text-foreground">Insurance:</span>
              </div>
              <p className="font-medium text-foreground">
                {patient?.insuranceNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
