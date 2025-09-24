import { 
  VitalSignCode, 
  VitalSignUnit, 
  VitalSignCodeDisplayNames,
  VitalSignUnitDisplayNames,
  VitalSignCodeUnitMapping 
} from '@backend/shared-enums';
import { 
  VitalSignMeasurement, 
  VitalSignValidationResult, 
  ClinicalRange 
} from '@backend/shared-interfaces';

/**
 * Clinical ranges for vital signs validation
 * Based on standard medical reference ranges
 */
export const CLINICAL_RANGES: ClinicalRange[] = [
  // Heart Rate
  {
    code: VitalSignCode.HEART_RATE,
    unit: VitalSignUnit.PER_MINUTE,
    normal: { low: 60, high: 100 },
    critical: { low: 40, high: 150 },
    description: 'Resting heart rate for adults'
  },
  
  // Blood Pressure - Systolic
  {
    code: VitalSignCode.SYSTOLIC_BLOOD_PRESSURE,
    unit: VitalSignUnit.MILLIMETER_MERCURY,
    normal: { low: 90, high: 120 },
    critical: { low: 70, high: 180 },
    description: 'Systolic blood pressure for adults'
  },
  
  // Blood Pressure - Diastolic
  {
    code: VitalSignCode.DIASTOLIC_BLOOD_PRESSURE,
    unit: VitalSignUnit.MILLIMETER_MERCURY,
    normal: { low: 60, high: 80 },
    critical: { low: 40, high: 110 },
    description: 'Diastolic blood pressure for adults'
  },
  
  // Respiratory Rate
  {
    code: VitalSignCode.RESPIRATORY_RATE,
    unit: VitalSignUnit.PER_MINUTE,
    normal: { low: 12, high: 20 },
    critical: { low: 8, high: 30 },
    description: 'Respiratory rate for adults'
  },
  
  // Oxygen Saturation
  {
    code: VitalSignCode.OXYGEN_SATURATION,
    unit: VitalSignUnit.PERCENT,
    normal: { low: 95, high: 100 },
    critical: { low: 90, high: 100 },
    description: 'Oxygen saturation for adults'
  },
  
  // Body Temperature
  {
    code: VitalSignCode.BODY_TEMPERATURE,
    unit: VitalSignUnit.CELSIUS,
    normal: { low: 36.1, high: 37.2 },
    critical: { low: 35.0, high: 40.0 },
    description: 'Body temperature for adults'
  },
  
  // Body Weight
  {
    code: VitalSignCode.BODY_WEIGHT,
    unit: VitalSignUnit.KILOGRAM,
    normal: { low: 40, high: 150 },
    critical: { low: 20, high: 300 },
    description: 'Body weight range for adults'
  },
  
  // Body Height
  {
    code: VitalSignCode.BODY_HEIGHT,
    unit: VitalSignUnit.CENTIMETER,
    normal: { low: 140, high: 200 },
    critical: { low: 100, high: 250 },
    description: 'Body height range for adults'
  },
  
  // BMI
  {
    code: VitalSignCode.BODY_MASS_INDEX,
    unit: VitalSignUnit.KILOGRAM_PER_SQUARE_METER,
    normal: { low: 18.5, high: 24.9 },
    critical: { low: 10, high: 60 },
    description: 'Body Mass Index for adults'
  },
  
  // Glasgow Coma Scale
  {
    code: VitalSignCode.GLASGOW_COMA_SCALE_TOTAL,
    unit: VitalSignUnit.COUNT,
    normal: { low: 13, high: 15 },
    critical: { low: 3, high: 15 },
    description: 'Glasgow Coma Scale total score'
  },
  
  // Pain Scale
  {
    code: VitalSignCode.PAIN_SEVERITY_0_10_SCALE,
    unit: VitalSignUnit.SCORE,
    normal: { low: 0, high: 3 },
    critical: { low: 0, high: 10 },
    description: 'Pain severity 0-10 scale'
  }
];

/**
 * Validates a single vital sign measurement
 */
export function validateVitalSignMeasurement(measurement: VitalSignMeasurement): VitalSignValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate code
  if (!Object.values(VitalSignCode).includes(measurement.code)) {
    errors.push(`Invalid vital sign code: ${measurement.code}`);
  }

  // Validate unit
  if (!Object.values(VitalSignUnit).includes(measurement.unit)) {
    errors.push(`Invalid unit: ${measurement.unit}`);
  }

  // Validate code-unit combination
  if (measurement.code && measurement.unit) {
    const validUnits = VitalSignCodeUnitMapping[measurement.code];
    if (validUnits && !validUnits.includes(measurement.unit)) {
      errors.push(`Unit ${measurement.unit} is not valid for vital sign code ${measurement.code}`);
    }
  }

  // Validate value type
  if (typeof measurement.value !== 'number' || isNaN(measurement.value)) {
    errors.push('Value must be a valid number');
  }

  // Validate value range based on clinical ranges
  if (typeof measurement.value === 'number' && !isNaN(measurement.value)) {
    const clinicalRange = CLINICAL_RANGES.find(
      range => range.code === measurement.code && range.unit === measurement.unit
    );

    if (clinicalRange) {
      if (measurement.value < clinicalRange.critical.low || measurement.value > clinicalRange.critical.high) {
        errors.push(
          `Value ${measurement.value} is outside critical range (${clinicalRange.critical.low}-${clinicalRange.critical.high}) for ${clinicalRange.description}`
        );
      } else if (measurement.value < clinicalRange.normal.low || measurement.value > clinicalRange.normal.high) {
        warnings.push(
          `Value ${measurement.value} is outside normal range (${clinicalRange.normal.low}-${clinicalRange.normal.high}) for ${clinicalRange.description}`
        );
      }
    }
  }

  // Validate display name
  if (!measurement.display || measurement.display.trim() === '') {
    warnings.push('Display name is missing or empty');
  } else if (measurement.code && VitalSignCodeDisplayNames[measurement.code] !== measurement.display) {
    warnings.push(
      `Display name "${measurement.display}" does not match standard display name "${VitalSignCodeDisplayNames[measurement.code]}"`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a collection of vital signs
 */
export function validateVitalSignsCollection(vitalSigns: Record<string, VitalSignMeasurement>): VitalSignValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate codes
  const codes = Object.values(vitalSigns).map(vs => vs.code);
  const uniqueCodes = new Set(codes);
  if (codes.length !== uniqueCodes.size) {
    errors.push('Duplicate vital sign codes found in collection');
  }

  // Validate each measurement
  Object.values(vitalSigns).forEach((measurement, index) => {
    const result = validateVitalSignMeasurement(measurement);
    if (!result.isValid) {
      errors.push(`Measurement ${index + 1}: ${result.errors.join(', ')}`);
    }
    warnings.push(...result.warnings.map(w => `Measurement ${index + 1}: ${w}`));
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Creates a standardized vital sign measurement
 */
export function createVitalSignMeasurement(
  code: VitalSignCode,
  value: number,
  unit: VitalSignUnit,
  options?: {
    measuredAt?: Date;
    notes?: string;
    referenceRange?: { low?: number; high?: number; text?: string };
  }
): VitalSignMeasurement {
  return {
    code,
    display: VitalSignCodeDisplayNames[code],
    value,
    unit,
    measuredAt: options?.measuredAt || new Date(),
    notes: options?.notes,
    referenceRange: options?.referenceRange
  };
}

/**
 * Converts temperature between Celsius and Fahrenheit
 */
export function convertTemperature(value: number, fromUnit: VitalSignUnit, toUnit: VitalSignUnit): number {
  if (fromUnit === toUnit) return value;

  if (fromUnit === VitalSignUnit.CELSIUS && toUnit === VitalSignUnit.FAHRENHEIT) {
    return (value * 9/5) + 32;
  }
  
  if (fromUnit === VitalSignUnit.FAHRENHEIT && toUnit === VitalSignUnit.CELSIUS) {
    return (value - 32) * 5/9;
  }

  throw new Error(`Temperature conversion not supported from ${fromUnit} to ${toUnit}`);
}

/**
 * Converts length between different units
 */
export function convertLength(value: number, fromUnit: VitalSignUnit, toUnit: VitalSignUnit): number {
  if (fromUnit === toUnit) return value;

  // Convert to meters first
  let meters: number;
  switch (fromUnit) {
    case VitalSignUnit.METER:
      meters = value;
      break;
    case VitalSignUnit.CENTIMETER:
      meters = value / 100;
      break;
    case VitalSignUnit.INCH:
      meters = value * 0.0254;
      break;
    case VitalSignUnit.FOOT:
      meters = value * 0.3048;
      break;
    default:
      throw new Error(`Length conversion not supported from ${fromUnit}`);
  }

  // Convert from meters to target unit
  switch (toUnit) {
    case VitalSignUnit.METER:
      return meters;
    case VitalSignUnit.CENTIMETER:
      return meters * 100;
    case VitalSignUnit.INCH:
      return meters / 0.0254;
    case VitalSignUnit.FOOT:
      return meters / 0.3048;
    default:
      throw new Error(`Length conversion not supported to ${toUnit}`);
  }
}

/**
 * Converts weight between different units
 */
export function convertWeight(value: number, fromUnit: VitalSignUnit, toUnit: VitalSignUnit): number {
  if (fromUnit === toUnit) return value;

  // Convert to kilograms first
  let kilograms: number;
  switch (fromUnit) {
    case VitalSignUnit.KILOGRAM:
      kilograms = value;
      break;
    case VitalSignUnit.GRAM:
      kilograms = value / 1000;
      break;
    case VitalSignUnit.POUND:
      kilograms = value * 0.453592;
      break;
    case VitalSignUnit.OUNCE:
      kilograms = value * 0.0283495;
      break;
    default:
      throw new Error(`Weight conversion not supported from ${fromUnit}`);
  }

  // Convert from kilograms to target unit
  switch (toUnit) {
    case VitalSignUnit.KILOGRAM:
      return kilograms;
    case VitalSignUnit.GRAM:
      return kilograms * 1000;
    case VitalSignUnit.POUND:
      return kilograms / 0.453592;
    case VitalSignUnit.OUNCE:
      return kilograms / 0.0283495;
    default:
      throw new Error(`Weight conversion not supported to ${toUnit}`);
  }
}

/**
 * Gets the appropriate unit for a given vital sign code
 */
export function getDefaultUnitForCode(code: VitalSignCode): VitalSignUnit {
  const validUnits = VitalSignCodeUnitMapping[code];
  if (!validUnits || validUnits.length === 0) {
    throw new Error(`No valid units found for vital sign code: ${code}`);
  }
  return validUnits[0]; // Return the first (most common) unit
}

/**
 * Checks if a unit is valid for a given vital sign code
 */
export function isValidUnitForCode(code: VitalSignCode, unit: VitalSignUnit): boolean {
  const validUnits = VitalSignCodeUnitMapping[code];
  return validUnits ? validUnits.includes(unit) : false;
}
