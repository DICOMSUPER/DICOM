import React from "react";

export default function SpecialInstructions({
  instructions,
  note,
}: {
  instructions: string;
  note: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Special Instructions
      </h3>
      <p className="text-sm text-gray-900">{instructions}</p>
      <p className="text-sm text-gray-900">{note}</p>
    </div>
  );
}
