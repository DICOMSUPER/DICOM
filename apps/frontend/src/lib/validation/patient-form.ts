import { z } from 'zod';
import { Gender, BloodType } from '@/enums';

export const patientFormSchema = z.object({
  patientCode: z.string()
    .min(3, 'Patient code must be at least 3 characters')
    .max(20, 'Patient code must not exceed 20 characters'),
  
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      return parsedDate <= today;
    }, 'Date of birth cannot be in the future'),
  
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Please select a valid gender' })
  }),
  
  phoneNumber: z.string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s()]+$/.test(val), {
      message: 'Phone number contains invalid characters'
    }),
  
  address: z.string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  
  bloodType: z.nativeEnum(BloodType).optional(),
  
  insuranceNumber: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field
      const cleanValue = val.replace(/\D/g, ''); // Remove non-digits
      return cleanValue.length === 10 && /^\d{10}$/.test(cleanValue);
    }, {
      message: 'Insurance number must be exactly 10 digits'
    }),
  
  isActive: z.boolean().default(true),
  
  conditions: z.array(z.any()).default([])
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

// Helper function to format insurance number input
export const formatInsuranceNumber = (value: string): string => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  // Limit to 10 digits
  return cleanValue.slice(0, 10);
};

// Helper function to validate insurance number
export const validateInsuranceNumber = (value: string): boolean => {
  if (!value) return true; // Optional field
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.length === 10 && /^\d{10}$/.test(cleanValue);
};
