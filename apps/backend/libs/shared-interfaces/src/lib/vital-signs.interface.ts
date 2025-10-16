import { VitalSignCode, VitalSignUnit } from '@backend/shared-enums';

/**
 * FHIR-compliant vital sign measurement interface
 * Ensures data integrity and interoperability with HL7 FHIR standards
 */
export interface VitalSignMeasurement {
  /** LOINC code identifying the type of vital sign */
  code: VitalSignCode;
  
  /** Human-readable display name for the vital sign */
  display: string;
  
  /** The actual measurement value (numeric for most vital signs) */
  value: number;
  
  /** UCUM-compliant unit of measurement */
  unit: VitalSignUnit;
  
  /** Optional timestamp when the measurement was taken */
  measuredAt?: Date;
  
  /** Optional notes or comments about the measurement */
  notes?: string;
  
  /** Optional reference range for the measurement */
  referenceRange?: {
    low?: number;
    high?: number;
    text?: string;
  };
}

/**
 * Collection of vital signs for a patient encounter
 * Uses the LOINC code as the key for efficient lookup and validation
 */
export interface VitalSignsCollection {
  [code: string]: VitalSignMeasurement;
}

/**
 * Validation result for vital signs data
 */
export interface VitalSignValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface VitalSignsSimplified {
  bpSystolic?: number;        // Blood Pressure Systolic (mmHg)
  bpDiastolic?: number;       // Blood Pressure Diastolic (mmHg)
  heartRate?: number;         // Heart Rate (bpm)
  respiratoryRate?: number;   // Respiratory Rate (breaths/min)
  temperature?: number;       // Body Temperature (°C or °F)
  oxygenSaturation?: number;  // Oxygen Saturation (%)
  weight?: number;            // Weight (kg or lbs)
  height?: number;            // Height (cm or inches)
  bmi?: number;               // Body Mass Index
  glucose?: number;           // Blood Glucose (mg/dL)
  painScale?: number;         // Pain Scale (0-10)
}

/**
 * Clinical ranges for common vital signs
 * Used for validation and clinical decision support
 */
export interface ClinicalRange {
  code: VitalSignCode;
  unit: VitalSignUnit;
  normal: { low: number; high: number };
  critical: { low: number; high: number };
  description: string;
}

/**
 * Blood pressure measurement combining systolic and diastolic values
 */
export interface BloodPressureMeasurement {
  systolic: VitalSignMeasurement;
  diastolic: VitalSignMeasurement;
  measuredAt?: Date;
  position?: 'sitting' | 'standing' | 'lying' | 'supine' | 'prone';
  method?: 'manual' | 'automatic' | 'continuous';
}

/**
 * Temperature measurement with location context
 */
export interface TemperatureMeasurement extends VitalSignMeasurement {
  location: 'oral' | 'rectal' | 'axillary' | 'tympanic' | 'temporal' | 'core';
  method?: 'digital' | 'mercury' | 'infrared' | 'continuous';
}

/**
 * Glasgow Coma Scale measurement
 */
export interface GlasgowComaScaleMeasurement {
  eyeOpening: VitalSignMeasurement;
  verbalResponse: VitalSignMeasurement;
  motorResponse: VitalSignMeasurement;
  total: VitalSignMeasurement;
  measuredAt?: Date;
  notes?: string;
}

/**
 * Pain assessment measurement
 */
export interface PainAssessmentMeasurement extends VitalSignMeasurement {
  scale: '0-10' | '0-5' | 'faces' | 'visual_analog';
  location?: string;
  quality?: string;
  notes?: string;
}
