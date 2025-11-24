import React, { ChangeEvent } from "react";

export default function NoteInput({
  encounterInfo,
  onChangeEncounterInfo,
}: {
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
        Notes (Optional)
      </label>
      <textarea
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          onChangeEncounterInfo("notes", e.target.value);
        }}
        value={encounterInfo.notes}
        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        rows={3}
        placeholder="Add any symptoms, chief complaints, or intake notes..."
      />
    </div>
  );
}
