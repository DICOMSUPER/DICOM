'use client';

import { useState, useEffect } from 'react';
import { 
  PatientDetail, 
  PatientSummary, 
  Appointment, 
  Medication, 
  LabResult,
  MedicalProcedure,
  Diagnosis,
  Visit,
  Immunization
} from '@/types/patient-detail';
import { 
  mockPatientDetail, 
  mockPatientSummary, 
  mockAppointments, 
  mockMedications, 
  mockLabResults,
  mockMedicalProcedures,
  mockDiagnoses,
  mockVisits,
  mockImmunizations
} from '@/data/mock-patient-detail';

export function usePatientDetail(patientId: string) {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [procedures, setProcedures] = useState<MedicalProcedure[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchPatientData = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would fetch data based on patientId
      setPatient(mockPatientDetail);
      setSummary(mockPatientSummary);
      setAppointments(mockAppointments);
      setMedications(mockMedications);
      setLabResults(mockLabResults);
      setProcedures(mockMedicalProcedures);
      setDiagnoses(mockDiagnoses);
      setVisits(mockVisits);
      setImmunizations(mockImmunizations);
      
      setLoading(false);
    };

    fetchPatientData();
  }, [patientId]);

  return {
    patient,
    summary,
    appointments,
    medications,
    labResults,
    procedures,
    diagnoses,
    visits,
    immunizations,
    loading,
  };
}