"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VitalSignFormValues, vitalSignSchema } from "@/lib/validation/vital-sign-form";

interface VitalSignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<VitalSignFormValues> | null;
  onSubmit?: (values: VitalSignFormValues & { bmi: number }) => void;
  mode?: 'create' | 'update';
}

export function VitalSignForm({ 
  open,
  onOpenChange,
  initialData = null, 
  onSubmit, 
  mode = 'create' 
}: VitalSignFormProps) {
  const form = useForm<VitalSignFormValues>({
    resolver: zodResolver(vitalSignSchema),
    defaultValues: {
      temperature: undefined,
      heartRate: undefined,
      bpSystolic: undefined,
      bpDiastolic: undefined,
      respiratoryRate: undefined,
      spo2: undefined,
      weight: undefined,
      height: undefined,

    },
  });

  const [submittedData, setSubmittedData] = useState<VitalSignFormValues | null>(null);


  useEffect(() => {
    if (initialData && open) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 0) {
          form.setValue(key as keyof VitalSignFormValues, value);
        } else {
          form.setValue(key as keyof VitalSignFormValues, undefined);
        }
      });
    } else if (open) {
      // Reset form for create mode
      form.reset({
        temperature: undefined,
        heartRate: undefined,
        bpSystolic: undefined,
        bpDiastolic: undefined,
        respiratoryRate: undefined,
        spo2: undefined,
        weight: undefined,
        height: undefined,

      });
    }
  }, [initialData, open, form]);

  function handleSubmit(values: VitalSignFormValues) {
    // Filter out undefined values
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value !== undefined && value !== null)
    ) as VitalSignFormValues;

    const heightInM = (filteredValues.height || 0) / 100;
    const bmi = (filteredValues.weight || 0) / (heightInM * heightInM);
    const payload = { 
      ...filteredValues, 
      bmi: isNaN(bmi) || bmi === Infinity ? 0 : Number(bmi.toFixed(2))
    };
    
    setSubmittedData(payload);
    console.log(`Form ${mode}d:`, payload);
    
    if (onSubmit) {
      onSubmit(payload);
    }
    
    // Close modal after successful submit
    onOpenChange(false);
  }

  const handleCancel = () => {
    form.reset({
      temperature: undefined,
      heartRate: undefined,
      bpSystolic: undefined,
      bpDiastolic: undefined,
      respiratoryRate: undefined,
      spo2: undefined,
      weight: undefined,
      height: undefined,

    });
    onOpenChange(false);
  };

  const isUpdateMode = mode === 'update';
  const title = isUpdateMode ? 'Update Vital Signs' : 'Add Vital Signs';
  const description = isUpdateMode 
    ? 'Update the patient\'s vital signs measurements.'
    : 'Record the patient\'s vital signs measurements.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  ["temperature", "Temperature (°C)", "37.0"],
                  ["heartRate", "Heart Rate (bpm)", "72"],
                  ["bpSystolic", "BP Systolic (mmHg)", "120"],
                  ["bpDiastolic", "BP Diastolic (mmHg)", "80"],
                  ["respiratoryRate", "Respiratory Rate (/min)", "16"],
                  ["spo2", "SpO₂ (%)", "98"],
                  ["weight", "Weight (kg)", "70"],
                  ["height", "Height (cm)", "170"],

                ] as [keyof VitalSignFormValues, string, string][]
              ).map(([field, label, placeholder]) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={placeholder}
                          value={inputField.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            inputField.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                          onBlur={inputField.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isUpdateMode ? 'Update' : 'Save'} Vital Signs
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {submittedData && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="font-semibold">
              {isUpdateMode ? 'Updated' : 'Saved'} Data:
            </h3>
            <pre className="text-sm mt-2">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}