/**
 * FHIR-compliant vital signs codes based on LOINC terminology
 * These codes ensure interoperability and compliance with HL7 FHIR standards
 */
export enum VitalSignCode {
  // Cardiovascular
  HEART_RATE = '8867-4',
  SYSTOLIC_BLOOD_PRESSURE = '8480-6',
  DIASTOLIC_BLOOD_PRESSURE = '8462-4',
  MEAN_ARTERIAL_PRESSURE = '8478-0',
  
  // Respiratory
  RESPIRATORY_RATE = '9279-1',
  OXYGEN_SATURATION = '59408-5',
  OXYGEN_SATURATION_PULSE_OXIMETRY = '2708-6',
  
  // Temperature
  BODY_TEMPERATURE = '8310-5',
  BODY_TEMPERATURE_ORAL = '8331-1',
  BODY_TEMPERATURE_RECTAL = '8339-4',
  BODY_TEMPERATURE_AXILLARY = '8335-2',
  BODY_TEMPERATURE_TYMPANIC = '8332-9',
  
  // Anthropometric
  BODY_HEIGHT = '8302-2',
  BODY_WEIGHT = '29463-7',
  BODY_MASS_INDEX = '39156-5',
  HEAD_CIRCUMFERENCE = '9843-4',
  
  // Neurological
  GLASGOW_COMA_SCALE_EYE_OPENING = '9267-6',
  GLASGOW_COMA_SCALE_VERBAL_RESPONSE = '9268-4',
  GLASGOW_COMA_SCALE_MOTOR_RESPONSE = '9269-2',
  GLASGOW_COMA_SCALE_TOTAL = '9270-0',
  
  // Pain Assessment
  PAIN_SEVERITY_0_10_SCALE = '72514-3',
  
  // Additional Common Vital Signs
  BLOOD_PRESSURE_SYSTOLIC_AND_DIASTOLIC = '85354-9',
}

/**
 * Human-readable display names for vital signs codes
 */
export const VitalSignCodeDisplayNames: Record<VitalSignCode, string> = {
  [VitalSignCode.HEART_RATE]: 'Heart Rate',
  [VitalSignCode.SYSTOLIC_BLOOD_PRESSURE]: 'Systolic Blood Pressure',
  [VitalSignCode.DIASTOLIC_BLOOD_PRESSURE]: 'Diastolic Blood Pressure',
  [VitalSignCode.MEAN_ARTERIAL_PRESSURE]: 'Mean Arterial Pressure',
  [VitalSignCode.RESPIRATORY_RATE]: 'Respiratory Rate',
  [VitalSignCode.OXYGEN_SATURATION]: 'Oxygen Saturation',
  [VitalSignCode.OXYGEN_SATURATION_PULSE_OXIMETRY]: 'Oxygen Saturation by Pulse Oximetry',
  [VitalSignCode.BODY_TEMPERATURE]: 'Body Temperature',
  [VitalSignCode.BODY_TEMPERATURE_ORAL]: 'Body Temperature Oral',
  [VitalSignCode.BODY_TEMPERATURE_RECTAL]: 'Body Temperature Rectal',
  [VitalSignCode.BODY_TEMPERATURE_AXILLARY]: 'Body Temperature Axillary',
  [VitalSignCode.BODY_TEMPERATURE_TYMPANIC]: 'Body Temperature Tympanic',
  [VitalSignCode.BODY_HEIGHT]: 'Body Height',
  [VitalSignCode.BODY_WEIGHT]: 'Body Weight',
  [VitalSignCode.BODY_MASS_INDEX]: 'Body Mass Index',
  [VitalSignCode.HEAD_CIRCUMFERENCE]: 'Head Circumference',
  [VitalSignCode.GLASGOW_COMA_SCALE_EYE_OPENING]: 'Glasgow Coma Scale Eye Opening',
  [VitalSignCode.GLASGOW_COMA_SCALE_VERBAL_RESPONSE]: 'Glasgow Coma Scale Verbal Response',
  [VitalSignCode.GLASGOW_COMA_SCALE_MOTOR_RESPONSE]: 'Glasgow Coma Scale Motor Response',
  [VitalSignCode.GLASGOW_COMA_SCALE_TOTAL]: 'Glasgow Coma Scale Total',
  [VitalSignCode.PAIN_SEVERITY_0_10_SCALE]: 'Pain Severity 0-10 Scale',
  [VitalSignCode.BLOOD_PRESSURE_SYSTOLIC_AND_DIASTOLIC]: 'Blood Pressure Systolic and Diastolic',
};
