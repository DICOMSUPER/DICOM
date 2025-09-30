"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceptionTable } from "@/components/reception/reception-table";
import { TableRowEnhanced, TableCellEnhanced } from "@/components/ui/table-enhanced";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  User,
  Calendar,
  Phone,
  MapPin
} from "lucide-react";

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
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const headers = [
    "Patient",
    "Patient Code", 
    "Age/Gender",
    "Contact",
    "Status",
    "Last Visit",
    "Actions"
  ];

  return (
    <ReceptionTable
      headers={headers}
      isLoading={isLoading}
      isEmpty={patients.length === 0}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    >
      {patients.map((patient) => (
        <TableRowEnhanced key={patient.id}>
          <TableCellEnhanced>
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
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {patient.patientCode}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {formatAge(patient.dateOfBirth)} years • {patient.gender}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {patient.phoneNumber ? (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {patient.phoneNumber}
                </div>
              ) : (
                <span className="text-muted-foreground">No phone</span>
              )}
              {patient.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  {patient.address}
                </div>
              )}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <StatusBadge status={patient.isActive ? 'active' : 'inactive'} />
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {patient.lastVisit ? formatTime(patient.lastVisit) : 'Never'}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced isLast>
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(patient)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEditPatient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPatient(patient)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDeletePatient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeletePatient(patient)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCellEnhanced>
        </TableRowEnhanced>
      ))}
    </ReceptionTable>
  );
}
