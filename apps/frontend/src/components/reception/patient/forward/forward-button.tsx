import { Button } from "@/components/ui/button";
import { EncounterPriorityLevel } from "@/common/enums/patient-workflow.enum";
import { CheckCircle } from "lucide-react";
import React from "react";

export default function ForwardButton({
  onSubmit,
  isFormValid,
  isSubmitting,
  encounterInfo,
}: {
  onSubmit: () => void;
  isFormValid: boolean;
  isSubmitting: boolean;
  encounterInfo: {
    patientId: string;
    encounterDate: Date | string;
    encounterType: string;
    priority: string;
    notes: string;
  };
}) {
  return (
    <Button
      className={`w-full text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed ${
        encounterInfo.priority === EncounterPriorityLevel.STAT
          ? "bg-red-600 hover:bg-red-700"
          : encounterInfo.priority === EncounterPriorityLevel.URGENT
          ? "bg-orange-600 hover:bg-orange-700"
          : "bg-primary hover:bg-primary/90"
      }`}
      onClick={onSubmit}
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
          Forwarding...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          Forward Patient
          {encounterInfo.priority === EncounterPriorityLevel.STAT && " - STAT"}
          {encounterInfo.priority === EncounterPriorityLevel.URGENT &&
            " - URGENT"}
        </>
      )}
    </Button>
  );
}
