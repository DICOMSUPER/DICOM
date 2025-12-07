import React, { useMemo } from "react";
import { FolderOpen, Loader2, Calendar, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetDicomStudiesByOrderIdQuery } from "@/store/dicomStudyApi";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { StudyItem } from "./StudyItem";
import { format } from "date-fns";

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

  // Get study status color
  const getStudyStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'technician_verified': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending_approval': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'scanned': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'result_printed': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  // Get summary info from first study
  const studySummary = useMemo(() => {
    if (!studies || studies.length === 0) return null;
    
    const firstStudy = studies[0];
    return {
      studyDate: firstStudy.studyDate,
      studyTime: firstStudy.studyTime,
      studyStatus: firstStudy.studyStatus,
      studyDescription: firstStudy.studyDescription,
      modalityName: firstStudy.modalityMachine?.name,
      seriesCount: firstStudy.numberOfSeries || firstStudy.series?.length || 0,
    };
  }, [studies]);
  return (
    <div>
      {/* Folder Header */}
      <div
        className="flex justify-between items-center cursor-pointer px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FolderOpen className="h-4 w-4 text-teal-400 shrink-0" />
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {/* Order number and status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">
                #{folderName}
              </span>
              {orderStatus && (
                <Badge className={`text-[10px] px-1.5 py-0 border ${getStatusColor(orderStatus)}`}>
                  {orderStatus.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              )}
              {studySummary?.studyStatus && (
                <Badge className={`text-[10px] px-1.5 py-0 border ${getStudyStatusColor(studySummary.studyStatus)}`}>
                  <Activity className="h-2.5 w-2.5 mr-0.5" />
                  {studySummary.studyStatus.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              )}
            </div>
            
            {/* Procedure name */}
            {procedureName && (
              <span className="text-xs text-slate-400 truncate">
                {procedureName}
              </span>
            )}
            
            {/* Study info - date, time, series count */}
            {studySummary && (
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                {studySummary.studyDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{format(new Date(studySummary.studyDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {studySummary.studyTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{studySummary.studyTime}</span>
                  </div>
                )}
                {studySummary.seriesCount > 0 && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-600 text-slate-400">
                    {studySummary.seriesCount} series
                  </Badge>
                )}
              </div>
            )}
            
            {/* Modality machine name */}
            {studySummary?.modalityName && (
              <span className="text-[10px] text-slate-500 truncate">
                {studySummary.modalityName}
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
