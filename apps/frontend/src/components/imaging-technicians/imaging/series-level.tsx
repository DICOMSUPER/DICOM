import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { ChevronDown } from "lucide-react";
import React from "react";

export default function SeriesLevel({
  series,
  isExpanded,
  onToggle,
  name,
  instanceCount,
  isLast,
}: {
  series: DicomSeries;
  isExpanded: boolean;
  onToggle: (seriesId: string) => void;
  name: string;
  instanceCount: number;
  isLast: boolean;
}) {
  return (
    <button
      onClick={() => onToggle(series.id)}
      className={`w-full flex items-center justify-between px-6 py-3 hover:bg-gray-100 transition-colors pl-16 ${
        series.instances?.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
      }  ${isLast ? "rounded-e-lg hover:rounded-e-lg" : ""}`}
      disabled={series.instances?.length === 0}
    >
      <div className="flex items-center space-x-4 flex-1 text-left">
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <p className="text-sm text-gray-900" title={name}>
          Series {name.slice(0, 5)}...{name.slice(-5)}
        </p>
      </div>
      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
        {instanceCount} instances
      </span>
    </button>
  );
}
