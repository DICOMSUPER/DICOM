'use client';

import { mockPatients } from '@/data/mock-patient';
import { Patient, PatientFilters } from '@/interfaces/patient/patient.interface';
import { useState, useMemo } from 'react';

export function usePatients() {
  const [patients] = useState<Patient[]>(mockPatients); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'All',
    gender: 'All',
  });

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();

      // Search filter (search theo tên hoặc mã bệnh nhân)
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        patient.patient_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Status filter (dùng is_active để map)
      const matchesStatus =
        filters.status === 'All' ||
        (filters.status === 'Active' && patient.is_active) ||
        (filters.status === 'Inactive' && !patient.is_active);

      // Gender filter
      const matchesGender =
        filters.gender === 'All' ||
        patient.gender === filters.gender;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [patients, searchQuery, filters]);

  return {
    patients: filteredPatients,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
  };
}
