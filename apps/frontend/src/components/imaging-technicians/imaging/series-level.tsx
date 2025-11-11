import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { Folder } from "lucide-react";
import React from "react";

export default function SeriesLevel({
  series,
  handleSeriesClick,
}: {
  series: DicomSeries[];
  handleSeriesClick: (series: DicomSeries) => void;
}) {
  return (
    <div className="space-y-2">
      {series && series.length > 0 ? (
        series.map((s) => (
          <div
            key={s.id}
            className="group flex items-center cursor-pointer p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 ease-in-out"
            onClick={() => handleSeriesClick(s)}
          >
            <div className="text-[var(--primary)] group-hover:text-[var(--primary)] transition-colors duration-200">
              <Folder className="w-5 h-5 text-blue-500" />
            </div>
            <span className="ml-2 font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-200">
              {s.seriesDescription || `Series ${s.id}`}
            </span>
            <span className="ml-auto text-sm text-[var(--neutral)] group-hover:text-[var(--secondary)] transition-colors duration-200">
              {s.instances?.length || 0} instances
            </span>
          </div>
        ))
      ) : (
        <div className="bg-[var(--surface)] rounded-lg shadow p-6 border border-[var(--border)] cursor-not-allowed border-dashed">
          <h6 className="italic text-center font-semibold text-[var(--neutral)]">
            No series found for this study
          </h6>
        </div>
      )}
    </div>
  );
}
