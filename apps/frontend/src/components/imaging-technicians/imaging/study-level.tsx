import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { ChevronDown } from "lucide-react";
import React from "react";

export default function StudyLevel({
  study,
  isExpanded,
  onToggle,
  name,
  date,
  seriesCount,
  isLast,
}: {
  study: DicomStudy;
  isExpanded: boolean;
  onToggle: (studyId: string) => void;
  name: string;
  date: string | undefined;
  seriesCount: number;
  isLast: boolean;
}) {
  return (
    <button
      onClick={() => onToggle(study.id)}
      disabled={study.series?.length === 0}
      className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
        study.series?.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
      } ${isLast ? "rounded-e-lg hover:rounded-e-lg" : ""}`}
    >
      <div className={`flex items-center space-x-4 flex-1 text-left`}>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <div>
          <p className="text-sm font-medium text-gray-900" title={name}>
            Study {name.slice(0, 5)}...{name.slice(-5)}
          </p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
        {seriesCount} series
      </span>
    </button>
  );
}
