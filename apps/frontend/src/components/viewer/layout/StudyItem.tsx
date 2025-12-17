import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import SeriesCard from "../sidebar/SeriesCard";
import { DicomSeries } from "@/common/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/common/interfaces/image-dicom/dicom-instances.interface";
import { resolveDicomImageUrl } from "@/common/utils/dicom/resolveDicomImageUrl";
import { useLazyGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { extractApiData } from "@/common/utils/api";

export const StudyItem = React.memo(({
  study,
  selectedSeries,
  onSeriesClick,
  viewMode,
  urlStudyId,
}: {
  study: any;
  selectedSeries: string | null;
  onSeriesClick: (series: DicomSeries) => void;
  viewMode: "grid" | "list";
  urlStudyId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [localThumbnailPaths, setLocalThumbnailPaths] = useState<Record<string, string>>({});
  const [localLoadingInstances, setLocalLoadingInstances] = useState<Set<string>>(new Set());
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();
  const loadedSeriesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (urlStudyId && study.id === urlStudyId && !open) {
      setOpen(true);
    }
  }, [urlStudyId, study.id, open]);

  const filteredSeries = study.series || [];

  useEffect(() => {
    if (!open || !study.series || study.series.length === 0) return;

    const loadThumbnails = async () => {
      const updatedThumbnails: Record<string, string> = {};
      const seriesToLoad = study.series.filter((s: DicomSeries) =>
        s && s.id && !loadedSeriesRef.current.has(s.id) && !localThumbnailPaths[s.id]
      );

      if (seriesToLoad.length === 0) return;

      for (const series of seriesToLoad) {
        loadedSeriesRef.current.add(series.id);
        setLocalLoadingInstances((prev) => new Set(prev).add(series.id));

        try {
          const response = await fetchInstancesByReference({
            id: series.id,
            type: "series",
            params: { page: 1, limit: 1 },
          }).unwrap();

          const instances = extractApiData<DicomInstance>(response);
          const firstWithFile = instances.find((inst: DicomInstance) =>
            resolveDicomImageUrl(inst.filePath, inst.fileName)
          );

          if (firstWithFile) {
            const resolved = resolveDicomImageUrl(
              firstWithFile.filePath,
              firstWithFile.fileName
            );
            if (resolved) {
              updatedThumbnails[series.id] = resolved;
            }
          }
        } catch (error) {
          console.warn("Failed to load thumbnail:", error);
        } finally {
          setLocalLoadingInstances((prev) => {
            const newSet = new Set(prev);
            newSet.delete(series.id);
            return newSet;
          });
        }
      }

      if (Object.keys(updatedThumbnails).length > 0) {
        setLocalThumbnailPaths((prev) => ({ ...prev, ...updatedThumbnails }));
      }
    };

    void loadThumbnails();
  }, [open, study.id, fetchInstancesByReference]);

  return (
    <div>
      {/* Study Header - Compact */}
      <div
        className="flex items-center justify-between cursor-pointer px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-1.5 text-white">
          <FolderOpen className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span className="text-xs font-medium truncate">{study.studyDescription || "Study"}</span>
        </div>

        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-teal-300 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-teal-300 shrink-0" />
        )}
      </div>

      {/* Series */}
      {open && (
        <div className="mt-1.5 space-y-1">
          {filteredSeries.length > 0 ? (
            filteredSeries.map((series: DicomSeries) => {
              const thumbnailPath = localThumbnailPaths[series.id];
              const isLoadingThumbnail =
                localLoadingInstances.has(series.id) &&
                !thumbnailPath &&
                (series.numberOfInstances ?? 0) > 0;

              return (
                <SeriesCard
                  key={series.id}
                  series={series}
                  isSelected={selectedSeries === series.id}
                  viewMode={viewMode}
                  onSeriesClick={onSeriesClick}
                  thumbnailPath={thumbnailPath}
                  loadingThumbnail={isLoadingThumbnail}
                />
              );
            })
          ) : (
            <div className="text-slate-500 text-sm py-2">No series found</div>
          )}
        </div>
      )}
    </div>
  );
});
