"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Eye, Edit, Trash2, User, Calendar, Phone, MapPin } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  address?: string;
  bloodType?: string;
  isActive: boolean;
  priority?: string;
  lastVisit?: string;
}

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
  onDeletePatient?: (patient: Patient) => void;
}

export function PatientTable({
  patients,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  onViewDetails,
  onEditPatient,
  onDeletePatient,
}: PatientTableProps) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatGender = (gender: string | null | undefined): string => {
    if (!gender) return "N/A";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const headers = [
    "Patient",
    "Patient Code",
    "Age/Gender",
    "Contact",
    "Status",
    "Last Visit",
    "Actions",
  ];

  return (
    <DataTable<Patient>
      columns={[
        {
          header: "Patient",
          cell: (patient) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">
                  {patient.firstName} {patient.lastName}
                </div>
                <div className="text-sm text-foreground">
                  {patient.bloodType && `Blood Type: ${patient.bloodType}`}
                </div>
              </div>
            </div>
          ),
        },
        { header: "Patient Code", cell: (patient) => patient.patientCode },
        {
          header: "Age/Gender",
          cell: (patient) =>
            `${formatAge(patient.dateOfBirth)} years • ${formatGender(patient.gender)}`,
        },
        {
          header: "Contact",
          cell: (patient) => (
            <div className="text-foreground">
              {patient.phoneNumber ? (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {patient.phoneNumber}
                </div>
              ) : (
                <span className="text-foreground">No phone</span>
              )}
              {patient.address && (
                <div className="flex items-center gap-1 text-sm text-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  {patient.address}
                </div>
              )}
            </div>
          ),
        },
        {
          header: "Status",
          headerClassName: "text-center",
          cell: (patient) => (
            <div className="flex justify-center">
              <StatusBadge status={patient.isActive ? "active" : "inactive"} />
            </div>
          ),
        },
        {
          header: "Last Visit",
          cell: (patient) =>
            patient.lastVisit ? formatTime(patient.lastVisit) : "Never",
        },
        {
          header: "Actions",
          cell: (patient) => (
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(patient)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4 text-teal-600" />
                </Button>
              )}
              {onEditPatient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPatient(patient)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4 text-teal-600" />
                </Button>
              )}
            </div>
          ),
        },
      ]}
      data={patients}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    />
  );
}
