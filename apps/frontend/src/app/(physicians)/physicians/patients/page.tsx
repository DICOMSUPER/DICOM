"use client"
import { SearchFilters } from '@/components/physicians/paitient/patient-filter';
import { PatientsHeader } from '@/components/physicians/paitient/patient-header';
import { PatientsTable } from '@/components/physicians/paitient/patients-table';
import { usePatients } from '@/hooks/use-patients';
import { useRouter } from 'next/navigation';
import React from 'react'

const page = () => {
const {
    patients,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
  } = usePatients();
  const router = useRouter();

  const handleAddPatient = () => {
    console.log('Add patient clicked');
    
  };

  const handleViewPatient = (id: string) => {
    console.log('View patient:', id);
    router.push(`/physicians/patients/${id}`);

    
  };

  const handleEditPatient = (id: string) => {
    console.log('Edit patient:', id);
    // TODO: Open edit patient modal or navigate to edit page
  };

  const handleDeletePatient = (id: string) => {
    console.log('Delete patient:', id);
    // TODO: Show confirmation dialog and delete patient
  };

  const handleViewRecords = (id: string) => {
    console.log('View records for patient:', id);
    // TODO: Navigate to medical records page
  };

  const handleExport = () => {
    console.log('Export patients');
    // TODO: Implement export functionality
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl">
        <PatientsHeader onAddPatient={handleAddPatient} />
        
        <SearchFilters
          searchQuery={searchQuery}
          filters={filters}
          onSearchChange={setSearchQuery}
          onFiltersChange={setFilters}
          onExport={handleExport}
        />

        <PatientsTable
          patients={patients}
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
          onViewRecords={handleViewRecords}
        />
      </div>
    </div>
  );
}

export default page