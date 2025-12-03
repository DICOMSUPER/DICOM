import React from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { useGetDicomStudiesByOrderIdQuery } from "@/store/dicomStudyApi";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { StudyItem } from "./StudyItem";

interface FolderItemProps {
  orderId: string;
  folderName: string;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSeries: string | null;
  viewMode: "grid" | "list";
  searchQuery: string;
  onSeriesClick: (series: DicomSeries) => void;
}

export const FolderItem = ({
  orderId,
  folderName,
  isExpanded,
  onToggle,
  selectedSeries,
  viewMode,
  searchQuery,
  onSeriesClick,
}: FolderItemProps) => {
  const { data, isLoading, isError } = useGetDicomStudiesByOrderIdQuery(
    orderId,
    { skip: !isExpanded }
  );

  const studies = data?.data || [];

  console.log(studies);
  return (
    <div>
      {/* Folder Header */}
      <div
        className="flex justify-between items-center cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-teal-400" />
          <span className="text-white font-medium">
            {folderName || "Folder"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
          )}
          <span className="text-teal-400 font-bold text-lg">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
      </div>

      {/* Studies */}
      {isExpanded && (
        <div className="pl-4 pt-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
              <span className="ml-2 text-slate-400 text-sm">
                Loading studies...
              </span>
            </div>
          ) : isError ? (
            <div className="text-center text-red-400 py-4 text-sm">
              Failed to load studies
            </div>
          ) : studies.length === 0 ? (
            <div className="text-center text-slate-500 py-4 text-sm">
              No studies found
            </div>
          ) : (
            studies.map((study) => (
              <StudyItem
                key={study.id}
                study={study}
                selectedSeries={selectedSeries}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onSeriesClick={onSeriesClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
