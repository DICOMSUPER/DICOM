import { 
  VitalSignCode, 
  VitalSignUnit,
  VitalSignUnitDisplayNames 
} from '@backend/shared-enums';
import { 
  VitalSignMeasurement, 
  VitalSignsCollection,
  BloodPressureMeasurement,
  TemperatureMeasurement,
  GlasgowComaScaleMeasurement,
  PainAssessmentMeasurement 
} from '@backend/shared-interfaces';
import { 
  createVitalSignMeasurement,
  validateVitalSignMeasurement,
  validateVitalSignsCollection 
} from './vital-signs-validation.util';

/**
 * Example usage of the FHIR-compliant vital signs system
 * This file demonstrates how to properly create, validate, and work with vital signs data
 */

/**
 * Example: Creating a basic vital sign measurement
 */
export function createHeartRateExample(): VitalSignMeasurement {
  return createVitalSignMeasurement(
    VitalSignCode.HEART_RATE,
    72,
    VitalSignUnit.PER_MINUTE,
    {
      measuredAt: new Date(),
      notes: 'Resting heart rate measured after 5 minutes of rest'
    }
  );
}

/**
 * Example: Creating a blood pressure measurement
 */
export function createBloodPressureExample(): BloodPressureMeasurement {
  const systolic = createVitalSignMeasurement(
    VitalSignCode.SYSTOLIC_BLOOD_PRESSURE,
    120,
    VitalSignUnit.MILLIMETER_MERCURY,
    { measuredAt: new Date() }
  );

  const diastolic = createVitalSignMeasurement(
    VitalSignCode.DIASTOLIC_BLOOD_PRESSURE,
    80,
    VitalSignUnit.MILLIMETER_MERCURY,
    { measuredAt: new Date() }
  );

  return {
    systolic,
    diastolic,
    measuredAt: new Date(),
    position: 'sitting',
    method: 'automatic'
  };
}

/**
 * Example: Creating a temperature measurement
 */
export function createTemperatureExample(): TemperatureMeasurement {
  const baseMeasurement = createVitalSignMeasurement(
    VitalSignCode.BODY_TEMPERATURE_ORAL,
    37.0,
    VitalSignUnit.CELSIUS,
    { measuredAt: new Date() }
  );

  return {
    ...baseMeasurement,
    location: 'oral',
    method: 'digital'
  };
}

/**
 * Example: Creating a Glasgow Coma Scale measurement
 */
export function createGlasgowComaScaleExample(): GlasgowComaScaleMeasurement {
  const eyeOpening = createVitalSignMeasurement(
    VitalSignCode.GLASGOW_COMA_SCALE_EYE_OPENING,
    4,
    VitalSignUnit.COUNT,
    { measuredAt: new Date() }
  );

  const verbalResponse = createVitalSignMeasurement(
    VitalSignCode.GLASGOW_COMA_SCALE_VERBAL_RESPONSE,
    5,
    VitalSignUnit.COUNT,
    { measuredAt: new Date() }
  );

  const motorResponse = createVitalSignMeasurement(
    VitalSignCode.GLASGOW_COMA_SCALE_MOTOR_RESPONSE,
    6,
    VitalSignUnit.COUNT,
    { measuredAt: new Date() }
  );

  const total = createVitalSignMeasurement(
    VitalSignCode.GLASGOW_COMA_SCALE_TOTAL,
    15,
    VitalSignUnit.COUNT,
    { measuredAt: new Date() }
  );

  return {
    eyeOpening,
    verbalResponse,
    motorResponse,
    total,
    measuredAt: new Date(),
    notes: 'Patient fully alert and responsive'
  };
}

/**
 * Example: Creating a pain assessment measurement
 */
export function createPainAssessmentExample(): PainAssessmentMeasurement {
  const baseMeasurement = createVitalSignMeasurement(
    VitalSignCode.PAIN_SEVERITY_0_10_SCALE,
    3,
    VitalSignUnit.SCORE,
    { measuredAt: new Date() }
  );

  return {
    ...baseMeasurement,
    scale: '0-10',
    location: 'lower back',
    quality: 'dull, aching',
    notes: 'Patient reports moderate pain in lower back, worse with movement'
  };
}

/**
 * Example: Creating a complete vital signs collection
 */
export function createCompleteVitalSignsExample(): VitalSignsCollection {
  const vitalSigns: VitalSignsCollection = {};

  // Heart Rate
  vitalSigns[VitalSignCode.HEART_RATE] = createVitalSignMeasurement(
    VitalSignCode.HEART_RATE,
    72,
    VitalSignUnit.PER_MINUTE,
    { measuredAt: new Date() }
  );

  // Blood Pressure (Systolic)
  vitalSigns[VitalSignCode.SYSTOLIC_BLOOD_PRESSURE] = createVitalSignMeasurement(
    VitalSignCode.SYSTOLIC_BLOOD_PRESSURE,
    120,
    VitalSignUnit.MILLIMETER_MERCURY,
    { measuredAt: new Date() }
  );

  // Blood Pressure (Diastolic)
  vitalSigns[VitalSignCode.DIASTOLIC_BLOOD_PRESSURE] = createVitalSignMeasurement(
    VitalSignCode.DIASTOLIC_BLOOD_PRESSURE,
    80,
    VitalSignUnit.MILLIMETER_MERCURY,
    { measuredAt: new Date() }
  );

  // Respiratory Rate
  vitalSigns[VitalSignCode.RESPIRATORY_RATE] = createVitalSignMeasurement(
    VitalSignCode.RESPIRATORY_RATE,
    16,
    VitalSignUnit.PER_MINUTE,
    { measuredAt: new Date() }
  );

  // Oxygen Saturation
  vitalSigns[VitalSignCode.OXYGEN_SATURATION] = createVitalSignMeasurement(
    VitalSignCode.OXYGEN_SATURATION,
    98,
    VitalSignUnit.PERCENT,
    { measuredAt: new Date() }
  );

  // Body Temperature
  vitalSigns[VitalSignCode.BODY_TEMPERATURE] = createVitalSignMeasurement(
    VitalSignCode.BODY_TEMPERATURE,
    37.0,
    VitalSignUnit.CELSIUS,
    { measuredAt: new Date() }
  );

  // Body Weight
  vitalSigns[VitalSignCode.BODY_WEIGHT] = createVitalSignMeasurement(
    VitalSignCode.BODY_WEIGHT,
    70,
    VitalSignUnit.KILOGRAM,
    { measuredAt: new Date() }
  );

  // Body Height
  vitalSigns[VitalSignCode.BODY_HEIGHT] = createVitalSignMeasurement(
    VitalSignCode.BODY_HEIGHT,
    175,
    VitalSignUnit.CENTIMETER,
    { measuredAt: new Date() }
  );

  // BMI
  vitalSigns[VitalSignCode.BODY_MASS_INDEX] = createVitalSignMeasurement(
    VitalSignCode.BODY_MASS_INDEX,
    22.9,
    VitalSignUnit.KILOGRAM_PER_SQUARE_METER,
    { measuredAt: new Date() }
  );

  return vitalSigns;
}

/**
 * Example: Validating vital signs data
 */
export function validateVitalSignsExample(): void {
  const vitalSigns = createCompleteVitalSignsExample();
  
  // Validate the entire collection
  const collectionResult = validateVitalSignsCollection(vitalSigns);
  console.log('Collection validation result:', collectionResult);
  
  // Validate individual measurements
  Object.values(vitalSigns).forEach((measurement, index) => {
    const result = validateVitalSignMeasurement(measurement);
    console.log(`Measurement ${index + 1} validation:`, result);
  });
}

/**
 * Example: Working with different units
 */
export function unitConversionExample(): void {
  // Temperature conversion
  const tempCelsius = createVitalSignMeasurement(
    VitalSignCode.BODY_TEMPERATURE,
    37.0,
    VitalSignUnit.CELSIUS
  );
  
  console.log('Temperature in Celsius:', tempCelsius);
  
  // Convert to Fahrenheit
  const tempFahrenheit = {
    ...tempCelsius,
    unit: VitalSignUnit.FAHRENHEIT,
    value: (tempCelsius.value * 9/5) + 32
  };
  
  console.log('Temperature in Fahrenheit:', tempFahrenheit);
}

/**
 * Example: Creating vital signs with reference ranges
 */
export function createVitalSignsWithReferenceRanges(): VitalSignsCollection {
  const vitalSigns: VitalSignsCollection = {};

  // Heart Rate with reference range
  vitalSigns[VitalSignCode.HEART_RATE] = createVitalSignMeasurement(
    VitalSignCode.HEART_RATE,
    72,
    VitalSignUnit.PER_MINUTE,
    {
      measuredAt: new Date(),
      referenceRange: {
        low: 60,
        high: 100,
        text: 'Normal resting heart rate for adults'
      }
    }
  );

  // Blood Pressure with reference range
  vitalSigns[VitalSignCode.SYSTOLIC_BLOOD_PRESSURE] = createVitalSignMeasurement(
    VitalSignCode.SYSTOLIC_BLOOD_PRESSURE,
    120,
    VitalSignUnit.MILLIMETER_MERCURY,
    {
      measuredAt: new Date(),
      referenceRange: {
        low: 90,
        high: 120,
        text: 'Normal systolic blood pressure'
      }
    }
  );

  return vitalSigns;
}

/**
 * Example: Error handling for invalid data
 */
export function errorHandlingExample(): void {
  // This will create validation errors
  const invalidMeasurement: VitalSignMeasurement = {
    code: 'INVALID_CODE' as VitalSignCode,
    display: 'Invalid Vital Sign',
    value: -50, // Invalid negative value
    unit: 'INVALID_UNIT' as VitalSignUnit,
    measuredAt: new Date()
  };

  const result = validateVitalSignMeasurement(invalidMeasurement);
  console.log('Validation errors:', result.errors);
  console.log('Validation warnings:', result.warnings);
}

/**
 * Example: Querying vital signs data
 */
export function queryVitalSignsExample(vitalSigns: VitalSignsCollection): void {
  // Get specific vital sign
  const heartRate = vitalSigns[VitalSignCode.HEART_RATE];
  if (heartRate) {
    console.log(`Heart Rate: ${heartRate.value} ${VitalSignUnitDisplayNames[heartRate.unit]}`);
  }

  // Get all blood pressure related measurements
  const bloodPressureMeasurements = Object.entries(vitalSigns)
    .filter(([code]) => code.includes('8480-6') || code.includes('8462-4'))
    .map(([_, measurement]) => measurement);

  console.log('Blood Pressure Measurements:', bloodPressureMeasurements);

  // Get measurements outside normal range
  const abnormalMeasurements = Object.values(vitalSigns).filter(measurement => {
    const result = validateVitalSignMeasurement(measurement);
    return result.warnings.length > 0 || result.errors.length > 0;
  });

  console.log('Abnormal Measurements:', abnormalMeasurements);
}
