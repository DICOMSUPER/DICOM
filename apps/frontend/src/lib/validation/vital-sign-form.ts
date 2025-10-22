import { z } from "zod";

export const vitalSignSchema = z.object({
  temperature: z.number().min(30).max(45).optional(),
  heartRate: z.number().min(20).max(250).optional(),
  bpSystolic: z.number().min(50).max(250).optional(),
  bpDiastolic: z.number().min(30).max(150).optional(),
  respiratoryRate: z.number().min(5).max(60).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  weight: z.number().min(1).max(500).optional(),
  height: z.number().min(30).max(250).optional(),
  // bmi: z.number().min(5).max(60).optional(),
  // glucose: z.number().min(20).max(600).optional(),
  // painScore: z.number().min(0).max(10).optional(),
});

export type VitalSignFormValues = z.infer<typeof vitalSignSchema>;
