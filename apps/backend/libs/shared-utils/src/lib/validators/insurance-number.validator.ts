import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsInsuranceNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isInsuranceNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Optional field
          
          // Check if value is a string
          if (typeof value !== 'string') return false;
          
          // Remove all non-digit characters
          const cleanValue = value.replace(/\D/g, '');
          
          // Check if it's exactly 10 digits
          return cleanValue.length === 10 && /^\d{10}$/.test(cleanValue);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Insurance number must be exactly 10 digits';
        }
      }
    });
  };
}
