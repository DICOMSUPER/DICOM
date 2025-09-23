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
import { 
  FileText, 
  Calendar, 
  User, 
  Stethoscope,
  Save,
  X
} from 'lucide-react';
import { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto } from '@/interfaces/patient/prescription.interface';

interface PrescriptionFormProps {
  prescription?: Prescription;
  encounterId?: string;
  onSubmit: (data: CreatePrescriptionDto | UpdatePrescriptionDto) => void;
  onCancel: () => void;
  loading?: boolean;
  errors?: Record<string, string>;
}

export function PrescriptionForm({
  prescription,
  encounterId,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState<CreatePrescriptionDto>({
    encounterId: encounterId || '',
    report_id: '',
    physicianId: '',
    notes: '',
  });

  useEffect(() => {
    if (prescription) {
      setFormData({
        encounterId: prescription.visit_id || '',
        report_id: prescription.report_id || '',
        physicianId: prescription.physician_id || '',
        notes: prescription.notes || '',
      });
    }
  }, [prescription, encounterId]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {prescription ? 'Edit Prescription' : 'Create Prescription'}
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
              <Label htmlFor="physicianId">Physician ID *</Label>
              <Input
                id="physicianId"
                name="physicianId"
                value={formData.physicianId}
                onChange={handleInputChange}
                placeholder="Enter physician ID"
                required
                disabled={loading}
              />
              {errors.physicianId && (
                <p className="text-sm text-red-500">{errors.physicianId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report_id">Diagnosis Report ID</Label>
            <Input
              id="report_id"
              name="report_id"
              value={formData.report_id}
              onChange={handleInputChange}
              placeholder="Enter diagnosis report ID (optional)"
              disabled={loading}
            />
            {errors.report_id && (
              <p className="text-sm text-red-500">{errors.report_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter prescription notes"
              rows={4}
              disabled={loading}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
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
              {loading ? 'Saving...' : prescription ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
