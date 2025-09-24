'use client';

import React, { useState } from 'react';
import { DiagnosisList } from '@/components/diagnosis/DiagnosisList';
import { DiagnosisForm } from '@/components/diagnosis/DiagnosisForm';
import { DiagnosisReport, CreateDiagnosisReportDto, UpdateDiagnosisReportDto } from '@/interfaces/patient/patient-workflow.interface';
import {
  useGetDiagnosesQuery,
  useCreateDiagnosisMutation,
  useUpdateDiagnosisMutation,
  useDeleteDiagnosisMutation,
} from '@/store/diagnosisApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Stethoscope } from 'lucide-react';

export default function DiagnosesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<DiagnosisReport | undefined>();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: diagnoses = [], isLoading } = useGetDiagnosesQuery({});
  const [createDiagnosis, { isLoading: isCreating }] = useCreateDiagnosisMutation();
  const [updateDiagnosis, { isLoading: isUpdating }] = useUpdateDiagnosisMutation();
  const [deleteDiagnosis, { isLoading: isDeleting }] = useDeleteDiagnosisMutation();

  const handleCreate = () => {
    setEditingDiagnosis(undefined);
    setShowForm(true);
    setFormErrors({});
  };

  const handleEdit = (diagnosis: DiagnosisReport) => {
    setEditingDiagnosis(diagnosis);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this diagnosis?')) {
      try {
        await deleteDiagnosis(id).unwrap();
      } catch (error) {
        console.error('Failed to delete diagnosis:', error);
      }
    }
  };

  const handleView = (diagnosis: DiagnosisReport) => {
    // Implement view functionality
    console.log('View diagnosis:', diagnosis);
  };

  const handleSubmit = async (data: CreateDiagnosisReportDto | UpdateDiagnosisReportDto) => {
    try {
      setFormErrors({});
      
      if (editingDiagnosis) {
        await updateDiagnosis({
          id: editingDiagnosis.id,
          data: data as UpdateDiagnosisReportDto,
        }).unwrap();
      } else {
        await createDiagnosis(data as CreateDiagnosisReportDto).unwrap();
      }
      
      setShowForm(false);
      setEditingDiagnosis(undefined);
    } catch (error: any) {
      if (error.data?.message) {
        setFormErrors({ general: error.data.message });
      } else if (error.data?.errors) {
        setFormErrors(error.data.errors);
      } else {
        setFormErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDiagnosis(undefined);
    setFormErrors({});
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <DiagnosisForm
          diagnosis={editingDiagnosis}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isCreating || isUpdating}
          errors={formErrors}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Diagnoses</h1>
        <p className="text-foreground">
          Manage patient diagnoses and medical conditions
        </p>
      </div>

      <DiagnosisList
        diagnoses={diagnoses}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
      />
    </div>
  );
}
