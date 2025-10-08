import { PatientDetail, PatientSummary, Appointment, Medication, LabResult, MedicalProcedure, Diagnosis, Immunization, Visit } from '@/types/patient-detail';

export const mockPatientDetail: PatientDetail = {
  id: '1',
  patientId: 'PT2345',
  name: 'John Smith',
  age: 45,
  gender: 'Male',
  status: 'Active',
  avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  personalInfo: {
    dateOfBirth: '1978-05-15',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main Street, Apt 4B, New York, NY 10001'
  },
  medicalInfo: {
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    primaryDoctor: 'Dr. Sarah Johnson'
  },
  insuranceInfo: {
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'BC85123456789'
  },
  emergencyContact: {
    name: 'Mary Smith',
    relationship: 'Wife',
    phone: '+1 (555) 987-6543'
  },
  registeredOn: '2020-01-30',
  lastUpdated: '2024-01-15'
};

export const mockPatientSummary: PatientSummary = {
  nextAppointment: {
    date: 'April 20, 2024',
    time: '1:30 PM',
    type: 'Check-up',
    doctor: 'Dr. Sarah Johnson'
  },
  activeMedications: {
    count: 3,
    lastUpdated: 'Feb. 4, 2024'
  },
  recentLabResults: {
    testName: 'Comprehensive Metabolic Panel',
    date: 'January 20, 2024'
  },
  recentAppointments: [
    {
      id: '1',
      type: 'Check-up',
      date: '2023-07-15',
      time: '8:00 AM',
      doctor: 'Dr. Sarah Johnson',
      status: 'Completed'
    },
    {
      id: '2',
      type: 'Follow-up',
      date: '2023-08-22',
      time: '2:30 PM',
      doctor: 'Dr. Michael Chen',
      status: 'Completed'
    },
    {
      id: '3',
      type: 'Check-up',
      date: '2023-10-05',
      time: '9:15 AM',
      doctor: 'Dr. Sarah Johnson',
      status: 'Completed'
    }
  ],
  vitalSigns: [
    {
      type: 'Blood Pressure',
      value: '135/85',
      unit: 'mmHg',
      date: 'Apr 5, 2024',
      status: 'High',
      trend: [120, 125, 130, 135, 132, 135]
    },
    {
      type: 'Blood Glucose',
      value: '125',
      unit: 'mg/dL',
      date: 'Apr 2, 2024',
      status: 'High',
      trend: [110, 115, 120, 125, 122, 125]
    },
    {
      type: 'Weight',
      value: '82',
      unit: 'kg',
      date: 'Apr 5, 2024',
      status: 'Normal',
      trend: [85, 84, 83, 82, 82, 82]
    }
  ]
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    type: 'Annual Physical',
    date: '2024-04-20',
    time: '1:30 PM',
    doctor: 'Dr. Sarah Johnson',
    status: 'Scheduled'
  },
  {
    id: '2',
    type: 'Follow-up',
    date: '2024-03-15',
    time: '10:00 AM',
    doctor: 'Dr. Michael Chen',
    status: 'Completed'
  },
  {
    id: '3',
    type: 'Lab Work',
    date: '2024-02-28',
    time: '8:30 AM',
    doctor: 'Dr. Sarah Johnson',
    status: 'Completed'
  }
];

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedDate: '2024-01-15',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    prescribedDate: '2024-01-15',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    prescribedDate: '2024-02-01',
    status: 'Active'
  }
];

export const mockLabResults: LabResult[] = [
  {
    id: '1',
    testName: 'Comprehensive Metabolic Panel',
    date: '2024-01-20',
    status: 'Completed',
    results: 'Normal ranges'
  },
  {
    id: '2',
    testName: 'Lipid Panel',
    date: '2024-01-20',
    status: 'Completed',
    results: 'Elevated cholesterol'
  },
  {
    id: '3',
    testName: 'HbA1c',
    date: '2024-02-15',
    status: 'Pending'
  }
];

export const mockMedicalProcedures: MedicalProcedure[] = [
  {
    id: '1',
    date: '2022-09-12',
    procedure: 'Colonoscopy',
    doctor: 'Dr. Jennifer Lee',
    location: 'Gastroenterology Center',
    notes: 'Routine screening. No polyps found.',
    status: 'Completed'
  },
  {
    id: '2',
    date: '2021-11-05',
    procedure: 'Wisdom Teeth Extraction',
    doctor: 'Dr. David Brown',
    location: 'Dental Surgery Center',
    notes: 'All four wisdom teeth removed successfully.',
    status: 'Completed'
  },
  {
    id: '3',
    date: '2020-06-20',
    procedure: 'Knee Arthroscopy',
    doctor: 'Dr. Thomas Garcia',
    location: 'Orthopedic Surgery Center',
    notes: 'Meniscus repair. Successful outcome.',
    status: 'Completed'
  }
];

export const mockDiagnoses: Diagnosis[] = [
  {
    id: '1',
    date: '2023-01-15',
    condition: 'Hypertension',
    icd10Code: 'I10',
    doctor: 'Dr. Sarah Johnson',
    status: 'Active',
    notes: 'Essential hypertension, well controlled with medication'
  },
  {
    id: '2',
    date: '2023-02-20',
    condition: 'Type 2 Diabetes Mellitus',
    icd10Code: 'E11.9',
    doctor: 'Dr. Sarah Johnson',
    status: 'Active',
    notes: 'Managed with metformin and lifestyle modifications'
  },
  {
    id: '3',
    date: '2022-08-10',
    condition: 'Acute Bronchitis',
    icd10Code: 'J20.9',
    doctor: 'Dr. Michael Chen',
    status: 'Resolved',
    notes: 'Treated with antibiotics, fully recovered'
  }
];

export const mockVisits: Visit[] = [
  {
    id: '1',
    date: '2024-03-15',
    time: '10:00 AM',
    type: 'Follow-up',
    doctor: 'Dr. Sarah Johnson',
    chiefComplaint: 'Routine diabetes check-up',
    diagnosis: 'Type 2 Diabetes - stable',
    treatment: 'Continue current medications',
    followUp: '3 months',
    status: 'Completed'
  },
  {
    id: '2',
    date: '2024-02-28',
    time: '2:30 PM',
    type: 'Lab Work',
    doctor: 'Dr. Sarah Johnson',
    chiefComplaint: 'Blood work for diabetes monitoring',
    diagnosis: 'Lab results pending',
    treatment: 'Awaiting results',
    status: 'Completed'
  },
  {
    id: '3',
    date: '2024-01-20',
    time: '9:15 AM',
    type: 'Annual Physical',
    doctor: 'Dr. Sarah Johnson',
    chiefComplaint: 'Annual wellness exam',
    diagnosis: 'Overall good health',
    treatment: 'Continue preventive care',
    followUp: '1 year',
    status: 'Completed'
  }
];

export const mockImmunizations: Immunization[] = [
  {
    id: '1',
    vaccine: 'COVID-19 (Pfizer-BioNTech)',
    date: '2023-10-15',
    doseNumber: 3,
    manufacturer: 'Pfizer-BioNTech',
    lotNumber: 'FL8094',
    administeredBy: 'Nurse Johnson',
    location: 'Main Clinic',
    nextDueDate: '2024-10-15'
  },
  {
    id: '2',
    vaccine: 'Influenza (Quadrivalent)',
    date: '2023-09-20',
    doseNumber: 1,
    manufacturer: 'Sanofi Pasteur',
    lotNumber: 'U3847A',
    administeredBy: 'Dr. Sarah Johnson',
    location: 'Main Clinic',
    nextDueDate: '2024-09-20'
  },
  {
    id: '3',
    vaccine: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    date: '2021-05-10',
    doseNumber: 1,
    manufacturer: 'GlaxoSmithKline',
    lotNumber: 'AHPVA029BB',
    administeredBy: 'Nurse Williams',
    location: 'Main Clinic',
    nextDueDate: '2031-05-10'
  }
]