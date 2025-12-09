import React from "react";
import { ClipboardList, FileText } from "lucide-react";

export default function SpecialInstructions({
  instructions,
  note,
}: {
  instructions: string;
  note: string;
}) {
  const showInstructions = instructions && instructions.trim() && instructions.trim().toUpperCase() !== "N/A";
  const showNote = note && note.trim() && note.trim().toUpperCase() !== "N/A";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Special Instructions
      </h3>
      {!showInstructions && !showNote ? (
        <p className="text-sm text-gray-500 italic">No additional instructions</p>
      ) : (
        <div className="space-y-2 text-sm text-gray-900">
          {showInstructions && (
            <div className="flex items-start gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600 mt-0.5" />
              <span>{instructions}</span>
            </div>
          )}
          {showNote ? (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
              <span>{note}</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-gray-500">
              <FileText className="h-4 w-4 mt-0.5" />
              <span className="italic">No notes</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
