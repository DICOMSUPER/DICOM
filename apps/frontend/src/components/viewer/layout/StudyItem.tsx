import React, { useState } from "react";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import SeriesCard from "../sidebar/SeriesCard";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";

export const StudyItem = ({
  study,
  selectedSeries,
  onSeriesClick,
  searchQuery,
  viewMode,
}: {
  study: any;
  selectedSeries: string | null;
  onSeriesClick: (series: DicomSeries) => void;
  searchQuery: string;
  viewMode: "grid" | "list";
}) => {
  const [open, setOpen] = useState(false);

  const filteredSeries = study.series.filter((s: DicomSeries) =>
    (s.seriesDescription || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Study Header */}
      <div
        className="flex items-center justify-between cursor-pointer px-2 py-1 bg-slate-700 rounded"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 text-white">
          <FolderOpen className="w-4 h-4 text-teal-300" />
          <span>{study.studyDescription || "Study"}</span>
        </div>

        {open ? (
          <ChevronDown className="w-4 h-4 text-teal-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-teal-300" />
        )}
      </div>

      {/* Series */}
      {open && (
        <div className="pl-4 mt-2 space-y-1">
          {filteredSeries.length > 0 ? (
            filteredSeries.map((series: DicomSeries) => (
              <SeriesCard
                onClick={() => onSeriesClick(series)}
                key={series.id}
                series={series}
                isSelected={selectedSeries === series.id}
                viewMode={viewMode}
                onSeriesClick={onSeriesClick}
                loadingThumbnail={false}
              />
            ))
          ) : (
            <div className="text-slate-500 text-sm py-2">No series found</div>
          )}
        </div>
      )}
    </div>
  );
};
