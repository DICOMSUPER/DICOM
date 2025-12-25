"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VitalSignFormValues } from "@/common/lib/validation/vital-sign-form";
import { toast } from "sonner";

interface VitalSignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<VitalSignFormValues> | null;
  onSubmit?: (values: VitalSignFormValues) => void;
  mode?: "create" | "update";
  isLoading?: boolean;
}

export function VitalSignForm({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  mode = "create",
  isLoading = false,
}: VitalSignFormProps) {
  // Individual states initialized from initialData
  const [temperature, setTemperature] = useState<number | undefined>(
    initialData?.temperature ?? undefined
  );
  const [heartRate, setHeartRate] = useState<number | undefined>(
    initialData?.heartRate ?? undefined
  );
  const [bpSystolic, setBpSystolic] = useState<number | undefined>(
    initialData?.bpSystolic ?? undefined
  );
  const [bpDiastolic, setBpDiastolic] = useState<number | undefined>(
    initialData?.bpDiastolic ?? undefined
  );
  const [respiratoryRate, setRespiratoryRate] = useState<number | undefined>(
    initialData?.respiratoryRate ?? undefined
  );
  const [oxygenSaturation, setOxygenSaturation] = useState<number | undefined>(
    initialData?.oxygenSaturation ?? undefined
  );
  const [weight, setWeight] = useState<number | undefined>(
    initialData?.weight ?? undefined
  );
  const [height, setHeight] = useState<number | undefined>(
    initialData?.height ?? undefined
  );

  // Reset states when dialog closes (so next open uses fresh initialData)
  useEffect(() => {
    console.log(initialData);
    if (!open) {
      setTemperature(initialData?.temperature ?? undefined);
      setHeartRate(initialData?.heartRate ?? undefined);
      setBpSystolic(initialData?.bpSystolic ?? undefined);
      setBpDiastolic(initialData?.bpDiastolic ?? undefined);
      setRespiratoryRate(initialData?.respiratoryRate ?? undefined);
      setOxygenSaturation(initialData?.oxygenSaturation ?? undefined);
      setWeight(initialData?.weight ?? undefined);
      setHeight(initialData?.height ?? undefined);
    }
  }, [open, initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (temperature !== undefined && (temperature < 30 || temperature > 45)) {
      toast.warning("Temperature must be between 30 and 45 °C");
      return;
    }

    if (heartRate !== undefined && (heartRate < 30 || heartRate > 200)) {
      toast.warning("Heart Rate must be between 30 and 200 bpm");
      return;
    }

    if (bpSystolic !== undefined && (bpSystolic < 50 || bpSystolic > 250)) {
      toast.warning("BP Systolic must be between 50 and 250 mmHg");
      return;
    }

    if (bpDiastolic !== undefined && (bpDiastolic < 30 || bpDiastolic > 150)) {
      toast.warning("BP Diastolic must be between 30 and 150 mmHg");
      return;
    }

    if (
      respiratoryRate !== undefined &&
      (respiratoryRate < 12 || respiratoryRate > 60)
    ) {
      toast.warning("Respiratory Rate must be between 12 and 60 /min");
      return;
    }

    if (
      oxygenSaturation !== undefined &&
      (oxygenSaturation < 70 || oxygenSaturation > 100)
    ) {
      toast.warning("SpO₂ must be between 70 and 100 %");
      return;
    }

    if (weight !== undefined && (weight < 2 || weight > 500)) {
      toast.warning("Weight must be between 2 and 500 kg");
      return;
    }

    if (height !== undefined && (height < 30 || height > 300)) {
      toast.warning("Height must be between 30 and 300 cm");
      return;
    }

    const values: VitalSignFormValues = {
      temperature,
      heartRate,
      bpSystolic,
      bpDiastolic,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
    };

    // Filter out undefined values
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    ) as VitalSignFormValues;

    if (onSubmit) {
      onSubmit(filteredValues);
    }
    onOpenChange(false);
  }

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isUpdateMode = mode === "update";
  const title = isUpdateMode ? "Update Vital Signs" : "Add Vital Signs";
  const description = isUpdateMode
    ? "Update the patient's vital signs measurements."
    : "Record the patient's vital signs measurements.";

  const fields = [
    {
      key: "temperature",
      label: "Temperature (°C)",
      value: temperature,
      setter: setTemperature,
    },
    {
      key: "heartRate",
      label: "Heart Rate (bpm)",
      value: heartRate,
      setter: setHeartRate,
    },
    {
      key: "bpSystolic",
      label: "BP Systolic (mmHg)",
      value: bpSystolic,
      setter: setBpSystolic,
    },
    {
      key: "bpDiastolic",
      label: "BP Diastolic (mmHg)",
      value: bpDiastolic,
      setter: setBpDiastolic,
    },
    {
      key: "respiratoryRate",
      label: "Respiratory Rate (/min)",
      value: respiratoryRate,
      setter: setRespiratoryRate,
    },
    {
      key: "oxygenSaturation",
      label: "SpO₂ (%)",
      value: oxygenSaturation,
      setter: setOxygenSaturation,
    },
    {
      key: "weight",
      label: "Weight (kg)",
      value: weight,
      setter: setWeight,
    },
    {
      key: "height",
      label: "Height (cm)",
      value: height,
      setter: setHeight,
    },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ key, label, value, setter }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  step="0.1"
                  value={value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setter(val === "" ? undefined : Number(val));
                  }}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isUpdateMode ? "Update" : "Save"} Vital Signs
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
