'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  FileText,
  Edit,
  Trash2,
  Eye,
  Activity
} from 'lucide-react';
import { PatientEncounter, EncounterType } from '@/interfaces/patient/patient-workflow.interface';

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
  const getEncounterTypeColor = (type: EncounterType) => {
    switch (type) {
      case EncounterType.EMERGENCY:
        return 'bg-red-100 text-red-800';
      case EncounterType.INPATIENT:
        return 'bg-blue-100 text-blue-800';
      case EncounterType.OUTPATIENT:
        return 'bg-green-100 text-green-800';
      case EncounterType.CONSULTATION:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasVitalSigns = (encounter: PatientEncounter) => {
    return encounter.vitalSigns && Object.keys(encounter.vitalSigns).length > 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-foreground">
            Loading encounters...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (encounters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Medical Encounters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Stethoscope className="mx-auto h-12 w-12 text-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No encounters found</h3>
            <p className="text-foreground mb-4">
              This patient hasn't had any medical encounters yet.
            </p>
            {onCreate && (
              <Button onClick={onCreate}>
                <Stethoscope className="h-4 w-4 mr-2" />
                Create First Encounter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Medical Encounters ({encounters.length})
          </CardTitle>
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Stethoscope className="h-4 w-4 mr-2" />
              New Encounter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {encounters.map((encounter) => (
            <div
              key={encounter.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getEncounterTypeColor(encounter.encounterType)}>
                      {encounter.encounterType.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-foreground">
                      {formatDate(encounter.encounterDate)}
                    </span>
                    {hasVitalSigns(encounter) && (
                      <Badge variant="outline" className="text-green-600">
                        <Activity className="h-3 w-3 mr-1" />
                        Vital Signs
                      </Badge>
                    )}
                  </div>

                  {encounter.chiefComplaint && (
                    <div>
                      <h4 className="font-medium text-foreground">Chief Complaint</h4>
                      <p className="text-sm text-foreground">{encounter.chiefComplaint}</p>
                    </div>
                  )}

                  {encounter.symptoms && (
                    <div>
                      <h4 className="font-medium text-foreground">Symptoms</h4>
                      <p className="text-sm text-foreground line-clamp-2">
                        {encounter.symptoms}
                      </p>
                    </div>
                  )}

                  {encounter.assignedPhysicianId && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <User className="h-4 w-4" />
                      <span>Physician: {encounter.assignedPhysicianId}</span>
                    </div>
                  )}

                  {encounter.notes && (
                    <div>
                      <h4 className="font-medium text-foreground">Notes</h4>
                      <p className="text-sm text-foreground line-clamp-2">
                        {encounter.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-foreground">
                    <span>Created: {formatDate(encounter.createdAt)}</span>
                    {encounter.updatedAt && encounter.updatedAt !== encounter.createdAt && (
                      <span>Updated: {formatDate(encounter.updatedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(encounter)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(encounter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(encounter.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
