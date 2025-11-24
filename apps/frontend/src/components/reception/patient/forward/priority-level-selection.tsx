import { Button } from "@/components/ui/button";
import React from "react";

export default function PriorityLevelSelection({
  PriorityLevelArray,
  encounterInfo,
  onChangeEncounterInfo,
}: {
  PriorityLevelArray: string[];
  encounterInfo: {
    patientId: string;
    encounterDate: Date | string;
    encounterType: string;
    priority: string;
    notes: string;
  };
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
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Priority Level
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        {PriorityLevelArray.map((priority) => {
          const isSelected = encounterInfo.priority === priority;

          return (
            <Button
              key={priority}
              type="button"
              aria-pressed={isSelected}
              size="sm"
              className={`${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
              variant={isSelected ? "default" : "outline"}
              onClick={() => {
                onChangeEncounterInfo("priority", priority);
              }}
            >
              {priority}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
