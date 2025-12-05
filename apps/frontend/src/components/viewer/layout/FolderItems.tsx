import React from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetDicomStudiesByOrderIdQuery } from "@/store/dicomStudyApi";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { StudyItem } from "./StudyItem";

interface FolderItemProps {
  orderId: string;
  folderName: string;
  procedureName?: string;
  orderStatus?: string;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSeries: string | null;
  viewMode: "grid" | "list";
  onSeriesClick: (series: DicomSeries) => void;
  urlStudyId?: string;
  urlSeriesId?: string;
}

export const FolderItem = ({
  orderId,
  folderName,
  procedureName,
  orderStatus,
  isExpanded,
  onToggle,
  selectedSeries,
  viewMode,
  onSeriesClick,
  urlStudyId,
  urlSeriesId,
}: FolderItemProps) => {
  const { data, isLoading, isError } = useGetDicomStudiesByOrderIdQuery(
    orderId,
    { 
      skip: !isExpanded,
      refetchOnMountOrArgChange: false,
    }
  );

  const studies = data?.data || [];

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };
  return (
    <div>
      {/* Folder Header */}
      <div
        className="flex justify-between items-center cursor-pointer px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FolderOpen className="h-4 w-4 text-teal-400 shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">
                #{folderName}
              </span>
              {orderStatus && (
                <Badge className={`text-[10px] px-1.5 py-0 border ${getStatusColor(orderStatus)}`}>
                  {orderStatus.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              )}
            </div>
            {procedureName && (
              <span className="text-xs text-slate-400 truncate">
                {procedureName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
        <div className="pt-1.5 space-y-1">
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
                onSeriesClick={onSeriesClick}
                urlStudyId={urlStudyId}
                urlSeriesId={urlSeriesId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
