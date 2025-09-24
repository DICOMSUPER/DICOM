'use client';

import React, { useState } from 'react';
import { PrescriptionList } from '@/components/prescription/PrescriptionList';
import { PrescriptionForm } from '@/components/prescription/PrescriptionForm';
import { Prescription } from '@/interfaces/patient/prescription.interface';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from '@/interfaces/patient/prescription.interface';
import {
  useGetPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} from '@/store/prescriptionApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';

export default function PrescriptionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | undefined>();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: prescriptions = [], isLoading } = useGetPrescriptionsQuery();
  const [createPrescription, { isLoading: isCreating }] = useCreatePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] = useUpdatePrescriptionMutation();
  const [deletePrescription, { isLoading: isDeleting }] = useDeletePrescriptionMutation();

  const handleCreate = () => {
    setEditingPrescription(undefined);
    setShowForm(true);
    setFormErrors({});
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await deletePrescription(id).unwrap();
      } catch (error) {
        console.error('Failed to delete prescription:', error);
      }
    }
  };

  const handleView = (prescription: Prescription) => {
    // Implement view functionality
    console.log('View prescription:', prescription);
  };

  const handleSubmit = async (data: CreatePrescriptionDto | UpdatePrescriptionDto) => {
    try {
      setFormErrors({});
      
      if (editingPrescription) {
        await updatePrescription({
          id: editingPrescription.prescription_id,
          data: data as UpdatePrescriptionDto,
        }).unwrap();
      } else {
        await createPrescription(data as CreatePrescriptionDto).unwrap();
      }
      
      setShowForm(false);
      setEditingPrescription(undefined);
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
    setEditingPrescription(undefined);
    setFormErrors({});
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <PrescriptionForm
          prescription={editingPrescription}
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
        <h1 className="text-3xl font-bold">Prescriptions</h1>
        <p className="text-foreground">
          Manage patient prescriptions and medication orders
        </p>
      </div>

      <PrescriptionList
        prescriptions={prescriptions}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
      />
    </div>
  );
}
