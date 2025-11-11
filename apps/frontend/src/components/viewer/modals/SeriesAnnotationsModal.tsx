import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { extractApiData } from "@/utils/api";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import { useLazyGetAnnotationsBySeriesIdQuery } from "@/store/annotationApi";
import { Annotation } from "@/types/Annotation";

type SeriesAnnotationEntry = {
  annotation: ImageAnnotation;
  instance?: DicomInstance;
};

interface SeriesAnnotationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: DicomSeries | null;
}

export function SeriesAnnotationsModal({
  open,
  onOpenChange,
  series,
}: SeriesAnnotationsModalProps) {
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();

  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsError, setAnnotationsError] = useState<string | null>(null);
  const [seriesAnnotations, setSeriesAnnotations] = useState<SeriesAnnotationEntry[]>([]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const resetState = useCallback(() => {
    setAnnotationsLoading(false);
    setAnnotationsError(null);
    setSeriesAnnotations([]);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    if (!series) {
      setAnnotationsError("No series selected.");
      return;
    }

    let isCancelled = false;

    const loadAnnotations = async () => {
      setAnnotationsLoading(true);
      setAnnotationsError(null);
      setSeriesAnnotations([]);

      try {
        const response = await fetchAnnotationsBySeries(series.id).unwrap();

        if (isCancelled) return;

        const annotations = extractApiData<ImageAnnotation>(response);

        if (annotations.length === 0) {
          setSeriesAnnotations([]);
          return;
        }

        const entries = annotations.map((annotation) => ({
          annotation,
          instance: annotation.instance as DicomInstance | undefined,
        }));

        setSeriesAnnotations(entries);
      } catch (error) {
        if (isCancelled) return;
        setAnnotationsError("Failed to load annotations for this series.");
        toast.error("Failed to load annotations for this series.");
      } finally {
        if (!isCancelled) {
          setAnnotationsLoading(false);
        }
      }
    };

    void loadAnnotations();

    return () => {
      isCancelled = true;
    };
  }, [open, series, fetchAnnotationsBySeries, resetState]);

  const modalTitle = useMemo(() => {
    if (!series) return "Series Annotations";
    return series.seriesDescription
      ? `${series.seriesDescription}`
      : "Series Annotations";
  }, [series]);

  const modalSubtitle = useMemo(() => {
    if (!series) return "No series selected";
    const parts: string[] = [];
    if (series.seriesInstanceUid) parts.push(series.seriesInstanceUid);
    if (series.seriesNumber) parts.push(`Series #${series.seriesNumber}`);
    if (series.bodyPartExamined) parts.push(`Body Part: ${series.bodyPartExamined}`);
    if (series.seriesDate) parts.push(`Date: ${series.seriesDate}`);
    if (series.seriesTime) parts.push(`Time: ${series.seriesTime}`);
    return parts.join(" • ") || "Series metadata unavailable";
  }, [series]);

  const annotationStatuses = useMemo(() => Object.values(AnnotationStatus), []);

  const annotationSummary = useMemo(() => {
    const total = seriesAnnotations.length;
    const statusCounts = annotationStatuses.reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {}
    );

    seriesAnnotations.forEach((entry) => {
      const status = entry.annotation.annotationStatus || AnnotationStatus.DRAFT;
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
    });

    const instanceIds = new Set(
      seriesAnnotations
        .map((entry) => entry.instance?.id || entry.annotation.instanceId)
        .filter(Boolean)
    );

    return {
      total,
      statusCounts,
      instanceCount: instanceIds.size,
    };
  }, [seriesAnnotations, annotationStatuses]);

  const formatDate = useCallback((value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  }, []);

  const statusBadgeStyle = useCallback((status: string | undefined) => {
    switch ((status || "").toLowerCase()) {
      case "final":
        return "border-emerald-500/30 bg-emerald-500/15 text-emerald-200";
      case "reviewed":
        return "border-blue-500/30 bg-blue-500/15 text-blue-200";
      case "archived":
        return "border-slate-500/30 bg-slate-500/15 text-slate-200";
      default:
        return "border-slate-600/60 bg-slate-800 text-slate-200";
    }
  }, []);

  const formatStatusLabel = useCallback((status?: string) => {
    if (!status) return "Unknown";
    return status
      .split(/[_\s]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[80vw] border border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl shadow-teal-500/10 backdrop-blur-md sm:max-w-[1200px]">
        <div className="flex h-[85vh] max-h-[85vh] flex-col gap-5">
          <DialogHeader className="shrink-0 rounded-xl bg-slate-900/80 px-6 py-5 shadow-inner shadow-slate-950/40">
            <DialogTitle className="text-2xl font-semibold text-white">
              {modalTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed list of annotations stored for the selected DICOM series.
            </DialogDescription>
            <div className="space-y-1 text-sm text-slate-300">
              <p>{modalSubtitle}</p>
              {series && (
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  {series.protocolName && (
                    <span className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2 py-1">
                      Protocol: {series.protocolName}
                    </span>
                  )}
                  {series.seriesDescription && (
                    <span className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2 py-1">
                      Description: {series.seriesDescription}
                    </span>
                  )}
                  {series.createdAt && (
                    <span className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2 py-1">
                      Created:{" "}
                      {formatDate(
                        typeof series.createdAt === "string"
                          ? series.createdAt
                          : series.createdAt?.toString()
                      )}
                    </span>
                  )}
                  {typeof series.numberOfInstances === "number" && (
                    <span className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2 py-1">
                      Instances: {series.numberOfInstances}
                    </span>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {annotationsError && (
            <Alert variant="destructive" className="shrink-0 border-red-500/40 bg-red-500/10 text-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-300" />
                <div>
                  <AlertTitle>Unable to load annotations</AlertTitle>
                  <AlertDescription>{annotationsError}</AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {!annotationsLoading && !annotationsError && seriesAnnotations.length > 0 && (
           
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="rounded-lg bg-slate-900/85 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Total Annotations
                  </p>
                  <p className="text-2xl font-semibold text-white">{annotationSummary.total}</p>
                </div>
                <div className="rounded-lg bg-slate-900/85 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Unique Instances
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {annotationSummary.instanceCount}
                  </p>
                </div>
                {annotationStatuses.map((status) => (
                  <div
                    key={status}
                    className="rounded-lg bg-slate-900/85 px-4 py-3 shadow-sm"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      {formatStatusLabel(status)}
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {annotationSummary.statusCounts[status] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            
          )}

          <div className="flex-1 overflow-y-auto rounded-xl bg-slate-900/40 px-4 py-4">
            {annotationsLoading ? (
              <div className="flex h-full items-center justify-center text-slate-300">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading annotations...
              </div>
            ) : seriesAnnotations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Inbox className="h-10 w-10 text-slate-500" />
                <p className="text-sm">No annotations found for this series.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl font-semibold text-white">
                  Series Annotations
                </p>
                {seriesAnnotations.map(({ annotation, instance }) => {
                  const annotationData: Annotation = annotation.annotationData;
                  const metadata = annotationData.metadata;
                  const sliceIndex = metadata?.sliceIndex;
                  const referencedImageId = metadata?.referencedImageId || undefined;

                  return (
                  <div
                    key={annotation.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold text-white">
                          Annotation Type: {annotation.annotationType}
                        </p>
                        <p className="text-xs text-slate-400">
                          Instance #{instance?.instanceNumber ?? "N/A"} · UID:{" "}
                          {instance?.sopInstanceUid ?? annotation.instanceId}
                        </p>
                      </div>
                    <div className="flex flex-wrap items-start gap-3 text-xs text-slate-300">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] uppercase tracking-wide text-slate-500">
                            Status
                          </span>
                          <Badge
                            variant="outline"
                            className={`px-3 py-1 text-xs capitalize ${statusBadgeStyle(
                              annotation.annotationStatus
                            )}`}
                          >
                            {formatStatusLabel(annotation.annotationStatus)}
                          </Badge>
                        </div>
                        {annotation.colorCode && (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">
                              Color
                            </span>
                            <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-xs text-slate-200">
                              <span
                                className="h-3 w-3 rounded-full border border-slate-800"
                                style={{ backgroundColor: annotation.colorCode }}
                              />
                              {annotation.colorCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {annotation.textContent && (
                      <div className="mt-3 rounded-lg border border-slate-800/60 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                        Annotation Text Content: {annotation.textContent}
                      </div>
                    )}

                    <div className="mt-4 grid gap-4 text-xs text-slate-300 md:grid-cols-2">
                      {(sliceIndex !== undefined || referencedImageId) && (
                        <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3 col-span-2">
                          <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                            Frame Details
                          </span>
                          <div className="mt-1 space-y-1 text-sm text-slate-200">
                            {sliceIndex !== undefined && <p>Slice Index: {sliceIndex}</p>}
                            {sliceIndex !== undefined && <p>Frame No: {sliceIndex + 1}</p>}
                            {referencedImageId && (
                              <p className="break-all text-xs text-slate-200 md:text-sm">
                                Referenced Image ID: {referencedImageId}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3">
                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                          Annotated
                        </span>
                        <p className="mt-1 text-sm text-slate-200">
                          {formatDate(annotation.annotationDate)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3">
                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                          Reviewed on
                        </span>
                        <p className="mt-1 text-sm text-slate-200">
                          {formatDate(annotation.reviewDate)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3 col-span-2">
                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                          Notes
                        </span>
                        <p className="mt-1 text-sm text-slate-200">
                          {annotation.notes || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Additional technical metadata intentionally omitted for clarity */}
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

