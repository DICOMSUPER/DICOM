'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  FileText,
  Save,
  X
} from 'lucide-react';
import { 
  PatientEncounter, 
  CreatePatientEncounterDto, 
  UpdatePatientEncounterDto,
  VitalSignsCollection 
} from '@/interfaces/patient/patient-workflow.interface';
import { EncounterType } from '@/enums/patient-workflow.enum';
import { VitalSignsForm } from './VitalSignsForm';

interface EncounterFormProps {
  encounter?: PatientEncounter;
  patientId?: string;
  onSubmit: (data: CreatePatientEncounterDto | UpdatePatientEncounterDto) => void;
  onCancel: () => void;
  loading?: boolean;
  errors?: Record<string, string>;
}

export function EncounterForm({
  encounter,
  patientId,
  onSubmit,
  onCancel,
  loading = false,
  errors = {}
}: EncounterFormProps) {
  const [formData, setFormData] = useState<CreatePatientEncounterDto>({
    patientId: patientId || '',
    encounterDate: new Date().toISOString().slice(0, 16),
    encounterType: EncounterType.OUTPATIENT,
    chiefComplaint: '',
    symptoms: '',
    vitalSigns: {},
    assignedPhysicianId: '',
    notes: ''
  });

  const [showVitalSigns, setShowVitalSigns] = useState(false);

  useEffect(() => {
    if (encounter) {
      setFormData({
        patientId: encounter.patientId,
        encounterDate: new Date(encounter.encounterDate).toISOString().slice(0, 16),
        encounterType: encounter.encounterType,
        chiefComplaint: encounter.chiefComplaint || '',
        symptoms: encounter.symptoms || '',
        vitalSigns: encounter.vitalSigns || {},
        assignedPhysicianId: encounter.assignedPhysicianId || '',
        notes: encounter.notes || ''
      });
    }
  }, [encounter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalSignsChange = (vitalSigns: VitalSignsCollection) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {encounter ? 'Edit Encounter' : 'New Encounter'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="encounterDate">Encounter Date & Time</Label>
                <Input
                  id="encounterDate"
                  name="encounterDate"
                  type="datetime-local"
                  value={formData.encounterDate}
                  onChange={handleInputChange}
                  className={errors.encounterDate ? 'border-red-500' : ''}
                  required
                />
                {errors.encounterDate && (
                  <p className="text-sm text-red-500">{errors.encounterDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="encounterType">Encounter Type</Label>
                <Select
                  value={formData.encounterType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, encounterType: value as EncounterType }))}
                >
                  <SelectTrigger className={errors.encounterType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select encounter type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EncounterType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.encounterType && (
                  <p className="text-sm text-red-500">{errors.encounterType}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Input
                id="chiefComplaint"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                placeholder="Primary reason for visit"
                className={errors.chiefComplaint ? 'border-red-500' : ''}
              />
              {errors.chiefComplaint && (
                <p className="text-sm text-red-500">{errors.chiefComplaint}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="Detailed description of symptoms"
                rows={3}
                className={errors.symptoms ? 'border-red-500' : ''}
              />
              {errors.symptoms && (
                <p className="text-sm text-red-500">{errors.symptoms}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedPhysicianId">Assigned Physician</Label>
              <Input
                id="assignedPhysicianId"
                name="assignedPhysicianId"
                value={formData.assignedPhysicianId}
                onChange={handleInputChange}
                placeholder="Physician ID"
                className={errors.assignedPhysicianId ? 'border-red-500' : ''}
              />
              {errors.assignedPhysicianId && (
                <p className="text-sm text-red-500">{errors.assignedPhysicianId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
                rows={3}
                className={errors.notes ? 'border-red-500' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            <LoadingButton 
              type="submit" 
              loading={loading}
              loadingText={encounter ? 'Updating...' : 'Creating...'}
            >
              <Save className="h-4 w-4 mr-2" />
              {encounter ? 'Update Encounter' : 'Create Encounter'}
            </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vital Signs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vital Signs
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowVitalSigns(!showVitalSigns)}
            >
              {showVitalSigns ? 'Hide' : 'Show'} Vital Signs
            </Button>
          </CardTitle>
        </CardHeader>
        {showVitalSigns && (
          <CardContent>
            <VitalSignsForm
              vitalSigns={formData.vitalSigns}
              onSubmit={handleVitalSignsChange}
              onCancel={() => setShowVitalSigns(false)}
              loading={loading}
              errors={errors}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
