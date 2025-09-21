/**
 * UCUM-compliant units for vital signs measurements
 * Based on the Unified Code for Units of Measure (UCUM) standard
 * Ensures interoperability and compliance with HL7 FHIR standards
 */
export enum VitalSignUnit {
  // Time-based units
  PER_MINUTE = '/min',
  PER_SECOND = '/s',
  PER_HOUR = '/h',
  
  // Pressure units
  MILLIMETER_MERCURY = 'mm[Hg]',
  KILOPASCAL = 'kPa',
  PASCAL = 'Pa',
  
  // Temperature units
  CELSIUS = 'Cel',
  FAHRENHEIT = '[degF]',
  KELVIN = 'K',
  
  // Length units
  CENTIMETER = 'cm',
  METER = 'm',
  INCH = '[in_i]',
  FOOT = '[ft_i]',
  
  // Mass units
  KILOGRAM = 'kg',
  GRAM = 'g',
  POUND = '[lb_av]',
  OUNCE = '[oz_av]',
  
  // Percentage
  PERCENT = '%',
  
  // Count/Number
  COUNT = '{count}',
  SCORE = '{score}',
  
  // Area (for BMI)
  KILOGRAM_PER_SQUARE_METER = 'kg/m2',
  
  // Volume
  LITER = 'L',
  MILLILITER = 'mL',
  
  // Flow
  LITER_PER_MINUTE = 'L/min',
  MILLILITER_PER_MINUTE = 'mL/min',
}

/**
 * Human-readable display names for vital signs units
 */
export const VitalSignUnitDisplayNames: Record<VitalSignUnit, string> = {
  [VitalSignUnit.PER_MINUTE]: 'beats/min',
  [VitalSignUnit.PER_SECOND]: 'per second',
  [VitalSignUnit.PER_HOUR]: 'per hour',
  [VitalSignUnit.MILLIMETER_MERCURY]: 'mmHg',
  [VitalSignUnit.KILOPASCAL]: 'kPa',
  [VitalSignUnit.PASCAL]: 'Pa',
  [VitalSignUnit.CELSIUS]: '°C',
  [VitalSignUnit.FAHRENHEIT]: '°F',
  [VitalSignUnit.KELVIN]: 'K',
  [VitalSignUnit.CENTIMETER]: 'cm',
  [VitalSignUnit.METER]: 'm',
  [VitalSignUnit.INCH]: 'in',
  [VitalSignUnit.FOOT]: 'ft',
  [VitalSignUnit.KILOGRAM]: 'kg',
  [VitalSignUnit.GRAM]: 'g',
  [VitalSignUnit.POUND]: 'lb',
  [VitalSignUnit.OUNCE]: 'oz',
  [VitalSignUnit.PERCENT]: '%',
  [VitalSignUnit.COUNT]: 'count',
  [VitalSignUnit.SCORE]: 'score',
  [VitalSignUnit.KILOGRAM_PER_SQUARE_METER]: 'kg/m²',
  [VitalSignUnit.LITER]: 'L',
  [VitalSignUnit.MILLILITER]: 'mL',
  [VitalSignUnit.LITER_PER_MINUTE]: 'L/min',
  [VitalSignUnit.MILLILITER_PER_MINUTE]: 'mL/min',
};

/**
 * Valid unit combinations for each vital sign code
 * This ensures that only appropriate units are used with specific vital signs
 */
export const VitalSignCodeUnitMapping: Record<string, VitalSignUnit[]> = {
  // Heart Rate / Pulse Rate
  '8867-4': [VitalSignUnit.PER_MINUTE],
  
  // Blood Pressure
  '8480-6': [VitalSignUnit.MILLIMETER_MERCURY, VitalSignUnit.KILOPASCAL], // Systolic
  '8462-4': [VitalSignUnit.MILLIMETER_MERCURY, VitalSignUnit.KILOPASCAL], // Diastolic
  '8478-0': [VitalSignUnit.MILLIMETER_MERCURY, VitalSignUnit.KILOPASCAL], // Mean Arterial Pressure
  '85354-9': [VitalSignUnit.MILLIMETER_MERCURY, VitalSignUnit.KILOPASCAL], // Combined BP
  
  // Respiratory Rate
  '9279-1': [VitalSignUnit.PER_MINUTE],
  
  // Oxygen Saturation
  '59408-5': [VitalSignUnit.PERCENT],
  '2708-6': [VitalSignUnit.PERCENT],
  
  // Temperature
  '8310-5': [VitalSignUnit.CELSIUS, VitalSignUnit.FAHRENHEIT],
  '8331-1': [VitalSignUnit.CELSIUS, VitalSignUnit.FAHRENHEIT], // Oral
  '8339-4': [VitalSignUnit.CELSIUS, VitalSignUnit.FAHRENHEIT], // Rectal
  '8335-2': [VitalSignUnit.CELSIUS, VitalSignUnit.FAHRENHEIT], // Axillary
  '8332-9': [VitalSignUnit.CELSIUS, VitalSignUnit.FAHRENHEIT], // Tympanic
  
  // Height
  '8302-2': [VitalSignUnit.CENTIMETER, VitalSignUnit.METER, VitalSignUnit.INCH, VitalSignUnit.FOOT],
  
  // Weight
  '29463-7': [VitalSignUnit.KILOGRAM, VitalSignUnit.GRAM, VitalSignUnit.POUND, VitalSignUnit.OUNCE],
  
  // BMI
  '39156-5': [VitalSignUnit.KILOGRAM_PER_SQUARE_METER],
  
  // Head Circumference
  '9843-4': [VitalSignUnit.CENTIMETER, VitalSignUnit.METER, VitalSignUnit.INCH],
  
  // Glasgow Coma Scale
  '9267-6': [VitalSignUnit.COUNT], // Eye Opening
  '9268-4': [VitalSignUnit.COUNT], // Verbal Response
  '9269-2': [VitalSignUnit.COUNT], // Motor Response
  '9270-0': [VitalSignUnit.COUNT], // Total
  
  // Pain Scale
  '72514-3': [VitalSignUnit.SCORE],
};
