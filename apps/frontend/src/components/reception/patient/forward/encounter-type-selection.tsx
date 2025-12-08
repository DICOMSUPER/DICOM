import { Button } from "@/components/ui/button";
import { EncounterType } from "@/enums/patient-workflow.enum";

import React from "react";

export default function EncounterTypeSelection({
  EncounterTypeArray,
  encounterInfo,
  onChangeEncounterInfo,
  formatEncounterType,
  hasFollowUp,
}: {
  EncounterTypeArray: string[];
  encounterInfo: {
    patientId: string;
    encounterDate: Date | string;
    encounterType: string;
    priority: string;
    notes: string;
  };
  hasFollowUp: boolean;
  onChangeEncounterInfo: (
    field:
      | "patientId"
      | "encounterDate"
      | "assignedPhysicianId"
      | "notes"
      | "encounterType"
      | "priority",
    value: string
  ) => void;
  formatEncounterType: (type: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Encounter Type
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        {EncounterTypeArray &&
          EncounterTypeArray.map((type) => {
            // Hide follow-up option if patient doesn't have follow-up
            if (!hasFollowUp && type === EncounterType.FOLLOW_UP) {
              return null;
            }

            return (
              <Button
                key={type}
                type="button"
                aria-pressed={encounterInfo.encounterType === type}
                size="sm"
                className={`${
                  encounterInfo.encounterType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                variant={
                  encounterInfo.encounterType === type ? "default" : "outline"
                }
                onClick={() => {
                  onChangeEncounterInfo("encounterType", type);
                }}
              >
                {formatEncounterType(type)}
              </Button>
            );
          })}
      </div>
    </div>
  );
}
