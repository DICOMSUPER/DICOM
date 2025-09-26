'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  FileText,
  Save,
  X
} from 'lucide-react';
import { DiagnosisReport, CreateDiagnosisReportDto, UpdateDiagnosisReportDto } from '@/interfaces/patient/patient-workflow.interface';
import { DiagnosisType, DiagnosisStatus, Severity } from '@/enums/patient-workflow.enum';

interface DiagnosisFormProps {
  diagnosis?: DiagnosisReport;
  encounterId?: string;
  onSubmit: (data: CreateDiagnosisReportDto | UpdateDiagnosisReportDto) => void;
  onCancel: () => void;
  loading?: boolean;
  errors?: Record<string, string>;
}

export function DiagnosisForm({
  diagnosis,
  encounterId,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
}: DiagnosisFormProps) {
  const [formData, setFormData] = useState<CreateDiagnosisReportDto>({
    encounterId: encounterId || '',
    studyId: '',
    diagnosisName: '',
    description: '',
    diagnosisType: DiagnosisType.PRIMARY,
    diagnosisStatus: DiagnosisStatus.ACTIVE,
    severity: Severity.MILD,
    diagnosisDate: new Date().toISOString().split('T')[0],
    diagnosedBy: '',
    notes: '',
    followupRequired: false,
    followUpInstructions: false,
  });

  useEffect(() => {
    if (diagnosis) {
      setFormData({
        encounterId: diagnosis.encounterId,
        studyId: diagnosis.studyId,
        diagnosisName: diagnosis.diagnosisName,
        description: diagnosis.description || '',
        diagnosisType: diagnosis.diagnosisType,
        diagnosisStatus: diagnosis.diagnosisStatus,
        severity: diagnosis.severity || Severity.MILD,
        diagnosisDate: diagnosis.diagnosisDate ? new Date(diagnosis.diagnosisDate).toISOString().split('T')[0] : '',
        diagnosedBy: diagnosis.diagnosedBy,
        notes: diagnosis.notes || '',
        followupRequired: diagnosis.followupRequired,
        followUpInstructions: diagnosis.followUpInstructions,
      });
    }
  }, [diagnosis, encounterId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          {diagnosis ? 'Edit Diagnosis' : 'Create Diagnosis'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="encounterId">Encounter ID *</Label>
              <Input
                id="encounterId"
                name="encounterId"
                value={formData.encounterId}
                onChange={handleInputChange}
                placeholder="Enter encounter ID"
                required
                disabled={loading}
              />
              {errors.encounterId && (
                <p className="text-sm text-red-500">{errors.encounterId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyId">Study ID *</Label>
              <Input
                id="studyId"
                name="studyId"
                value={formData.studyId}
                onChange={handleInputChange}
                placeholder="Enter study ID"
                required
                disabled={loading}
              />
              {errors.studyId && (
                <p className="text-sm text-red-500">{errors.studyId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosisName">Diagnosis Name *</Label>
            <Input
              id="diagnosisName"
              name="diagnosisName"
              value={formData.diagnosisName}
              onChange={handleInputChange}
              placeholder="Enter diagnosis name"
              required
              disabled={loading}
            />
            {errors.diagnosisName && (
              <p className="text-sm text-red-500">{errors.diagnosisName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter diagnosis description"
              rows={3}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosisType">Diagnosis Type *</Label>
              <Select
                value={formData.diagnosisType}
                onValueChange={(value) => handleSelectChange('diagnosisType', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  <SelectItem value={DiagnosisType.PRIMARY}>Primary</SelectItem>
                  <SelectItem value={DiagnosisType.SECONDARY}>Secondary</SelectItem>
                  <SelectItem value={DiagnosisType.DIFFERENTIAL}>Differential</SelectItem>
                </SelectContent>
              </Select>
              {errors.diagnosisType && (
                <p className="text-sm text-red-500">{errors.diagnosisType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosisStatus">Status *</Label>
              <Select
                value={formData.diagnosisStatus}
                onValueChange={(value) => handleSelectChange('diagnosisStatus', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  <SelectItem value={DiagnosisStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={DiagnosisStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={DiagnosisStatus.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.diagnosisStatus && (
                <p className="text-sm text-red-500">{errors.diagnosisStatus}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => handleSelectChange('severity', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  <SelectItem value={Severity.MILD}>Mild</SelectItem>
                  <SelectItem value={Severity.MODERATE}>Moderate</SelectItem>
                  <SelectItem value={Severity.SEVERE}>Severe</SelectItem>
                  <SelectItem value={Severity.CRITICAL}>Critical</SelectItem>
                </SelectContent>
              </Select>
              {errors.severity && (
                <p className="text-sm text-red-500">{errors.severity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosisDate">Diagnosis Date *</Label>
              <Input
                id="diagnosisDate"
                name="diagnosisDate"
                type="date"
                value={formData.diagnosisDate}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              {errors.diagnosisDate && (
                <p className="text-sm text-red-500">{errors.diagnosisDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosedBy">Diagnosed By *</Label>
              <Input
                id="diagnosedBy"
                name="diagnosedBy"
                value={formData.diagnosedBy}
                onChange={handleInputChange}
                placeholder="Enter physician ID"
                required
                disabled={loading}
              />
              {errors.diagnosedBy && (
                <p className="text-sm text-red-500">{errors.diagnosedBy}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter additional notes"
              rows={3}
              disabled={loading}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followupRequired"
                checked={formData.followupRequired}
                onCheckedChange={(checked) => handleCheckboxChange('followupRequired', checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="followupRequired">Follow-up Required</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpInstructions"
                checked={formData.followUpInstructions}
                onCheckedChange={(checked) => handleCheckboxChange('followUpInstructions', checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : diagnosis ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
