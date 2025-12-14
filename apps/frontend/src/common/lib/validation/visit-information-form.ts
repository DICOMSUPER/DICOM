import {z} from "zod"

export const visitInformationFormSchema = z.object({
    chiefComplaint: z.string().max(500).optional(),
    symptoms: z.string().max(1000).optional(),
})

export type VisitInformationFormValues =  z.infer<typeof visitInformationFormSchema>;