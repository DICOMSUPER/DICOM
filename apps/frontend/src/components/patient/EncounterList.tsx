'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  Clock,
  FileText,
  Edit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';
import { PatientEncounter } from '@/interfaces/patient/patient-workflow.interface';

interface EncounterListProps {
  encounters: PatientEncounter[];
  loading?: boolean;
  onEdit?: (encounter: PatientEncounter) => void;
  onDelete?: (encounterId: string) => void;
  onView?: (encounter: PatientEncounter) => void;
  onCreate?: () => void;
}

export function EncounterList({
  encounters,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate
}: EncounterListProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEncounterTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'emergency':
        return 'destructive';
      case 'inpatient':
        return 'default';
      case 'outpatient':
        return 'secondary';
      case 'virtual':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-foreground">Loading encounters...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (encounters.length === 0) {
    return (
      <EmptyState
        icon={<Stethoscope className="h-12 w-12 text-foreground" />}
        title="No Encounters Found"
        description="No patient encounters match your current filters. Try adjusting your search criteria."
      />
    );
  }

    return (
      <div className="space-y-4">
        {encounters.map((encounter) => (
          <Card key={encounter.id} className="border-border hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  {encounter.patient ? 
                    `${encounter.patient.firstName} ${encounter.patient.lastName}` : 
                    'Unknown Patient'
                  }
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(encounter.encounterDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(encounter.encounterDate).toLocaleTimeString()}
                  </span>
                  {encounter.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {encounter.duration}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(encounter.status || '')}>
                  {encounter.status || 'Unknown'}
                </Badge>
                <Badge variant={getEncounterTypeColor(encounter.encounterType || '')}>
                  {encounter.encounterType || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Chief Complaint */}
              {encounter.chiefComplaint && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Chief Complaint</h4>
                  <p className="text-sm">{encounter.chiefComplaint}</p>
                </div>
              )}

              {/* Symptoms */}
              {encounter.symptoms && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Symptoms</h4>
                  <p className="text-sm">{encounter.symptoms}</p>
                </div>
              )}

              {/* Notes */}
              {encounter.notes && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Notes</h4>
                  <p className="text-sm">{encounter.notes}</p>
                </div>
              )}

              {/* Patient Info */}
              {encounter.patient && (
                <div className="flex items-center gap-4 text-sm text-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    ID: {encounter.patient.patientCode}
                  </span>
                  <span>
                    DOB: {new Date(encounter.patient.dateOfBirth).toLocaleDateString()}
                  </span>
                  <span>
                    Gender: {encounter.patient.gender}
                  </span>
                </div>
              )}

              {/* Assigned Physician */}
              {encounter.assignedPhysicianId && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Assigned Physician</h4>
                  <p className="text-sm">{encounter.assignedPhysicianId}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(encounter)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(encounter)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(encounter.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}