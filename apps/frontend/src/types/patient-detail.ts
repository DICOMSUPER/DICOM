export interface PatientDetail {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  status: 'Active' | 'Inactive';
  avatar: string;
  personalInfo: {
    dateOfBirth: string;
    phone: string;
    email: string;
    address: string;
  };
  medicalInfo: {
    bloodType: string;
    allergies: string[];
    conditions: string[];
    primaryDoctor: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  registeredOn: string;
  lastUpdated: string;
}

export interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  doctor: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
}

export interface NextAppointment {
  date: string;
  time: string;
  type: string;
  doctor: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  status: 'Active' | 'Discontinued';
}

export interface LabResult {
  id: string;
  testName: string;
  date: string;
  status: 'Completed' | 'Pending';
  results?: string;
}

export interface MedicalProcedure {
  id: string;
  date: string;
  procedure: string;
  doctor: string;
  location: string;
  notes: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
}

export interface Diagnosis {
  id: string;
  date: string;
  condition: string;
  icd10Code: string;
  doctor: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

export interface Visit {
  id: string;
  date: string;
  time: string;
  type: string;
  doctor: string;
  chiefComplaint: string;
  diagnosis?: string;
  treatment?: string;
  followUp?: string;
  status: 'Completed' | 'No Show' | 'Cancelled';
}

export interface Immunization {
  id: string;
  vaccine: string;
  date: string;
  doseNumber: number;
  manufacturer: string;
  lotNumber: string;
  administeredBy: string;
  location: string;
  nextDueDate?: string;
}

export interface VitalSign {
  type: 'Blood Pressure' | 'Blood Glucose' | 'Weight' | 'Temperature' | 'Heart Rate';
  value: string;
  unit: string;
  date: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical';
  trend: number[]; // For chart data
}

export interface PatientSummary {
  nextAppointment: NextAppointment | null;
  activeMedications: {
    count: number;
    lastUpdated: string;
  };
  recentLabResults: {
    testName: string;
    date: string;
  };
  recentAppointments: Appointment[];
  vitalSigns: VitalSign[];
}