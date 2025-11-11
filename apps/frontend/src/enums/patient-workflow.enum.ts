/**
 * Patient workflow related enums
 */

export enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}


export enum EncounterType {
  OUTPATIENT = "outpatient",
  INPATIENT = "inpatient",
  EMERGENCY = "emergency",
}

export enum DiagnosisType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  DIFFERENTIAL = "differential",
  RULE_OUT = "rule_out",
  PROVISIONAL = "provisional",
}

export enum DiagnosisStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  RESOLVED = "resolved",
  RULED_OUT = "ruled_out",
}

export enum Severity {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum Gender {
  FEMALE = "female",
  MALE = "male",
  OTHER = "other",
  UNKNOWN = "unknown",
}

export enum BloodType {
  A_Positive = "A+",
  A_Negative = "A-",
  B_Positive = "B+",
  B_Negative = "B-",
  AB_Positive = "AB+",
  AB_Negative = "AB-",
  O_Positive = "O+",
  O_Negative = "O-",
  Unknown = "unknown",
}

export enum VitalSignCode {
  // Cardiovascular
  HEART_RATE = "8867-4",
  SYSTOLIC_BLOOD_PRESSURE = "8480-6",
  DIASTOLIC_BLOOD_PRESSURE = "8462-4",
  MEAN_ARTERIAL_PRESSURE = "8478-0",

  // Respiratory
  RESPIRATORY_RATE = "9279-1",
  OXYGEN_SATURATION = "59408-5",
  OXYGEN_SATURATION_PULSE_OXIMETRY = "2708-6",

  // Temperature
  BODY_TEMPERATURE = "8310-5",
  BODY_TEMPERATURE_ORAL = "8331-1",
  BODY_TEMPERATURE_RECTAL = "8339-4",
  BODY_TEMPERATURE_AXILLARY = "8335-2",
  BODY_TEMPERATURE_TYMPANIC = "8332-9",

  // Anthropometric
  BODY_HEIGHT = "8302-2",
  BODY_WEIGHT = "29463-7",
  BODY_MASS_INDEX = "39156-5",
  HEAD_CIRCUMFERENCE = "9843-4",

  // Neurological
  GLASGOW_COMA_SCALE_EYE_OPENING = "9267-6",
  GLASGOW_COMA_SCALE_VERBAL_RESPONSE = "9268-4",
  GLASGOW_COMA_SCALE_MOTOR_RESPONSE = "9269-2",
  GLASGOW_COMA_SCALE_TOTAL = "9270-0",

  // Pain Assessment
  PAIN_SEVERITY_0_10_SCALE = "72514-3",

  // Additional Common Vital Signs
  BLOOD_PRESSURE_SYSTOLIC_AND_DIASTOLIC = "85354-9",
}

export enum VitalSignUnit {
  // Time-based units
  PER_MINUTE = "/min",
  PER_SECOND = "/s",
  PER_HOUR = "/h",

  // Pressure units
  MILLIMETER_MERCURY = "mm[Hg]",
  KILOPASCAL = "kPa",
  PASCAL = "Pa",

  // Temperature units
  CELSIUS = "Cel",
  FAHRENHEIT = "[degF]",
  KELVIN = "K",

  // Length units
  CENTIMETER = "cm",
  METER = "m",
  INCH = "[in_i]",
  FOOT = "[ft_i]",

  // Mass units
  KILOGRAM = "kg",
  GRAM = "g",
  POUND = "[lb_av]",
  OUNCE = "[oz_av]",

  // Percentage
  PERCENT = "%",

  // Count/Number
  COUNT = "{count}",
  SCORE = "{score}",

  // Area (for BMI)
  KILOGRAM_PER_SQUARE_METER = "kg/m2",

  // Volume
  LITER = "L",
  MILLILITER = "mL",

  // Flow
  LITER_PER_MINUTE = "L/min",
  MILLILITER_PER_MINUTE = "mL/min",
}

export enum PatientWorkflowStep {
  REGISTRATION = "REGISTRATION",
  ENCOUNTER = "ENCOUNTER",
  VITAL_SIGNS = "VITAL_SIGNS",
  DIAGNOSIS = "DIAGNOSIS",
  TREATMENT = "TREATMENT",
  DISCHARGE = "DISCHARGE",
}

export enum PatientViewMode {
  LIST = "LIST",
  GRID = "GRID",
  CARD = "CARD",
}

export enum PatientSortBy {
  NAME = "NAME",
  PATIENT_CODE = "PATIENT_CODE",
  DATE_OF_BIRTH = "DATE_OF_BIRTH",
  CREATED_AT = "CREATED_AT",
  LAST_ENCOUNTER = "LAST_ENCOUNTER",
}

export enum PatientFilterType {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  RECENT = "RECENT",
  WITH_ENCOUNTERS = "WITH_ENCOUNTERS",
  WITHOUT_ENCOUNTERS = "WITHOUT_ENCOUNTERS",
}

export enum ClinicalStatus {
  ACTIVE = "active",
  RECURRENCE = "recurrence",
  RELAPSE = "relapse",
  INACTIVE = "inactive",
  REMISSION = "remission",
  RESOLVED = "resolved",
}

export enum ConditionVerificationStatus {
  UNCONFIRMED = "unconfirmed",
  PROVISIONAL = "provisional",
  DIFFERENTIAL = "differential",
  CONFIRMED = "confirmed",
  REFUTED = "refuted",
  ENTERED_IN_ERROR = "entered-in-error",
}

export enum EncounterStatus {
  WAITING = "waiting",
  ARRIVED = "arrived",
  // TRIAGED = "triaged",
  // IN_PROGRESS = "in-progress",
  FINISHED = "finished",
}
export enum EncounterPriorityLevel {
  ROUTINE = "Routine",     
  URGENT = "Urgent",   
  STAT = "Stat",      
}