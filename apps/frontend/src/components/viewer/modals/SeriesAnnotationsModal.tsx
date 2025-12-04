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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Inbox,
  Loader2,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { extractApiData } from "@/utils/api";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import {
  useLazyGetAnnotationsBySeriesIdQuery,
  useUpdateAnnotationMutation,
} from "@/store/annotationApi";
import type { Annotation } from "@cornerstonejs/tools/types";
import { useViewer } from "@/contexts/ViewerContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Roles } from "@/enums/user.enum";

type SeriesAnnotationEntry = {
  annotation: ImageAnnotation;
  instance?: DicomInstance;
};

interface SeriesAnnotationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cachedSeriesList?: DicomSeries[];
}

export function SeriesAnnotationsModal({
  open,
  onOpenChange,
  cachedSeriesList,
}: SeriesAnnotationsModalProps) {
  const { state } = useViewer();
  const user = useSelector(
    (candidateState: RootState) => candidateState.auth.user
  );
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
  const [updateAnnotation] = useUpdateAnnotationMutation();

  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsError, setAnnotationsError] = useState<string | null>(null);
  const [seriesGroups, setSeriesGroups] = useState<
    Array<{ series: DicomSeries; entries: SeriesAnnotationEntry[] }>
  >([]);
  const [loadedSeriesList, setLoadedSeriesList] = useState<DicomSeries[]>([]);
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<Set<string>>(
    () => new Set()
  );
  const [finalizationConfirmations, setFinalizationConfirmations] = useState<
    Record<string, boolean>
  >({});
  const [reviewConfirmations, setReviewConfirmations] = useState<
    Record<string, boolean>
  >({});
  const [finalizingAnnotationId, setFinalizingAnnotationId] = useState<
    string | null
  >(null);
  const [reviewingAnnotationId, setReviewingAnnotationId] = useState<
    string | null
  >(null);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) {
      setAnnotationsLoading(false);
      setAnnotationsError(null);
      setSeriesGroups([]);
      setLoadedSeriesList([]);
      setExpandedSeriesIds(new Set());
      return;
    }

    const uniqueSeries = new Map<string, DicomSeries>();
    state.viewportSeries.forEach((seriesCandidate) => {
      if (seriesCandidate?.id) {
        uniqueSeries.set(seriesCandidate.id, seriesCandidate);
      }
    });

    if (uniqueSeries.size === 0 && cachedSeriesList?.length) {
      cachedSeriesList.forEach((seriesCandidate) => {
        if (seriesCandidate?.id) {
          uniqueSeries.set(seriesCandidate.id, seriesCandidate);
        }
      });
    }

    const resolvedSeriesList = Array.from(uniqueSeries.values());
    setLoadedSeriesList(resolvedSeriesList);
    setExpandedSeriesIds(
      new Set(resolvedSeriesList.map((series) => series.id))
    );

    if (resolvedSeriesList.length === 0) {
      setAnnotationsError(null);
      setAnnotationsLoading(false);
      setSeriesGroups([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setAnnotationsLoading(true);
      setAnnotationsError(null);

      const results = await Promise.allSettled(
        resolvedSeriesList.map(async (seriesItem) => {
          const response = await fetchAnnotationsBySeries(
            seriesItem.id
          ).unwrap();
          const annotations = extractApiData<ImageAnnotation>(response);
          const entries = annotations.map((annotation) => ({
            annotation,
            instance: annotation.instance as DicomInstance | undefined,
          }));
          return {
            series: seriesItem,
            entries,
          };
        })
      );

      if (cancelled) {
        return;
      }

      const nextGroups: Array<{
        series: DicomSeries;
        entries: SeriesAnnotationEntry[];
      }> = [];
      let hadError = false;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          nextGroups.push(result.value);
        } else {
          hadError = true;
          const seriesItem = resolvedSeriesList[index];
          console.error(
            "Failed to load annotations for series:",
            seriesItem?.id,
            result.reason
          );
        }
      });

      setSeriesGroups(nextGroups);

      if (hadError) {
        setAnnotationsError("Some series failed to load annotations.");
        toast.error("Some series failed to load annotations.");
      } else {
        setAnnotationsError(null);
      }

      setAnnotationsLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, state.viewportSeries, fetchAnnotationsBySeries, cachedSeriesList]);

  const annotationStatuses = useMemo(() => Object.values(AnnotationStatus), []);

  const flattenedAnnotations = useMemo(
    () => seriesGroups.flatMap((group) => group.entries),
    [seriesGroups]
  );

  const summary = useMemo(() => {
    const total = flattenedAnnotations.length;
    const statusCounts = annotationStatuses.reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {}
    );

    flattenedAnnotations.forEach((entry) => {
      const status =
        entry.annotation.annotationStatus || AnnotationStatus.DRAFT;
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
    });

    const instanceIds = new Set(
      flattenedAnnotations
        .map((entry) => entry.instance?.id || entry.annotation.instanceId)
        .filter(Boolean)
    );

    return {
      total,
      statusCounts,
      instanceCount: instanceIds.size,
    };
  }, [flattenedAnnotations, annotationStatuses]);

  const formatDate = useCallback((value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  }, []);

  const emptyStateMessage = useMemo(() => {
    if (loadedSeriesList.length === 0) {
      return "No annotations available yet.";
    }

    return "No annotations found for the loaded series.";
  }, [loadedSeriesList.length]);

  const statusBadgeStyle = useCallback((status: string | undefined) => {
    switch ((status || "").toLowerCase()) {
      case "final":
        return "border-emerald-500/50 bg-emerald-500/20 text-emerald-200";
      case "draft":
        return "border-amber-500/50 bg-amber-500/20 text-amber-200";
      case "reviewed":
        return "border-blue-500/30 bg-blue-500/15 text-blue-200";
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

  const modalSubtitle = useMemo(() => {
    if (loadedSeriesList.length === 0) {
      return "Review annotations across your workspace.";
    }
    const labels = loadedSeriesList
      .map(
        (seriesItem) =>
          seriesItem.seriesDescription ||
          seriesItem.seriesInstanceUid ||
          seriesItem.id
      )
      .filter(Boolean);
    const preview = labels.slice(0, 3).join(", ");
    const extra = labels.length > 3 ? `, +${labels.length - 3} more` : "";
    return `${labels.length} series loaded${
      preview ? `: ${preview}${extra}` : ""
    }`;
  }, [loadedSeriesList]);

  const handleFinalizeAnnotation = useCallback(
    async (annotationId: string) => {
      setFinalizingAnnotationId(annotationId);
      try {
        const annotation = seriesGroups
          .flatMap(group => group.entries)
          .find(entry => entry.annotation.id === annotationId)?.annotation;
        
        if (annotation?.annotationStatus === AnnotationStatus.REVIEWED) {
          toast.error("Reviewed annotations cannot be changed.");
          return;
        }

        await updateAnnotation({
          id: annotationId,
          data: { annotationStatus: AnnotationStatus.FINAL },
        }).unwrap();

        setSeriesGroups((prev) =>
          prev.map((group) => ({
            ...group,
            entries: group.entries.map((entry) =>
              entry.annotation.id === annotationId
                ? {
                    ...entry,
                    annotation: {
                      ...entry.annotation,
                      annotationStatus: AnnotationStatus.FINAL,
                    },
                  }
                : entry
            ),
          }))
        );

        setFinalizationConfirmations((prev) => ({
          ...prev,
          [annotationId]: false,
        }));

        toast.success("Annotation marked as final.");
      } catch (error) {
        console.error("Failed to finalize annotation", error);
        toast.error("Unable to finalize annotation. Please try again.");
      } finally {
        setFinalizingAnnotationId(null);
      }
    },
    [updateAnnotation, setSeriesGroups, setFinalizationConfirmations, seriesGroups]
  );

  const handleReviewAnnotation = useCallback(
    async (annotationId: string) => {
      // Only physicians can review annotations
      if (!user || user.role !== Roles.PHYSICIAN) {
        toast.error("Only physicians can review annotations.");
        return;
      }

      const annotation = seriesGroups
        .flatMap(group => group.entries)
        .find(entry => entry.annotation.id === annotationId)?.annotation;
      
      if (annotation?.annotationStatus === AnnotationStatus.REVIEWED) {
        toast.error("This annotation is already reviewed.");
        return;
      }

      setReviewingAnnotationId(annotationId);
      try {
        await updateAnnotation({
          id: annotationId,
          data: {
            annotationStatus: AnnotationStatus.REVIEWED,
            reviewDate: new Date(),
          },
        }).unwrap();

        setSeriesGroups((prev) =>
          prev.map((group) => ({
            ...group,
            entries: group.entries.map((entry) =>
              entry.annotation.id === annotationId
                ? {
                    ...entry,
                    annotation: {
                      ...entry.annotation,
                      annotationStatus: AnnotationStatus.REVIEWED,
                      reviewDate: new Date().toISOString(),
                    },
                  }
                : entry
            ),
          }))
        );

        setReviewConfirmations((prev) => ({
          ...prev,
          [annotationId]: false,
        }));

        toast.success("Annotation marked as reviewed.");
      } catch (error) {
        console.error("Failed to review annotation", error);
        toast.error("Unable to review annotation. Please try again.");
      } finally {
        setReviewingAnnotationId(null);
      }
    },
    [updateAnnotation, setSeriesGroups, user]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <TooltipProvider delayDuration={200}>
        <DialogContent className="max-w-[80vw] border border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl shadow-teal-500/10 backdrop-blur-md sm:max-w-[1200px]">
          <div className="flex h-[85vh] max-h-[85vh] flex-col gap-5">
            <DialogHeader className="shrink-0 rounded-xl bg-slate-900/95 px-6 py-5 shadow-inner shadow-slate-950/40">
              <DialogTitle className="text-2xl font-semibold text-white">
                Series Annotations
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed list of annotations stored across the loaded DICOM
                series.
              </DialogDescription>
              <div className="space-y-1 text-sm text-slate-300">
                <p>{modalSubtitle}</p>
                {loadedSeriesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    {loadedSeriesList.slice(0, 4).map((seriesItem) => (
                      <span
                        key={seriesItem.id}
                        className="rounded-md border border-slate-700/60 bg-slate-900/90 px-2 py-1"
                      >
                        {seriesItem.seriesDescription ||
                          seriesItem.seriesInstanceUid ||
                          seriesItem.id}
                      </span>
                    ))}
                    {loadedSeriesList.length > 4 && (
                      <span className="rounded-md border border-slate-700/60 bg-slate-900/90 px-2 py-1">
                        +{loadedSeriesList.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </DialogHeader>

            {annotationsError && (
              <Alert
                variant="destructive"
                className="shrink-0 border-red-500/40 bg-red-500/10 text-red-200"
              >
                <div className="flex items-center gap-4">
                  <AlertTriangle className="mt-1 h-8 w-8 shrink-0 text-red-300" />
                  <div>
                    <AlertTitle>Unable to load annotations</AlertTitle>
                    <AlertDescription>{annotationsError}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {!annotationsLoading &&
              !annotationsError &&
              flattenedAnnotations.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                  <div className="rounded-lg bg-slate-900/95 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Total Annotations
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {summary.total}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/95 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Unique Instances
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {summary.instanceCount}
                    </p>
                  </div>
                  {annotationStatuses.map((status) => (
                    <div
                      key={status}
                      className="rounded-lg bg-slate-900/95 px-4 py-3 shadow-sm"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {formatStatusLabel(status)}
                      </p>
                      <p className="text-2xl font-semibold text-white">
                        {summary.statusCounts[status] ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            <div className="flex-1 overflow-y-auto rounded-xl">
              {annotationsLoading ? (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading annotations...
                </div>
              ) : flattenedAnnotations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                  <Inbox className="h-10 w-10 text-slate-500" />
                  <p className="text-sm">{emptyStateMessage}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {seriesGroups.map(({ series, entries }) => {
                    const isExpanded = expandedSeriesIds.has(series.id);
                    const seriesMeta: string[] = [];
                    if (series.seriesInstanceUid) {
                      seriesMeta.push(series.seriesInstanceUid);
                    }
                    if (series.bodyPartExamined) {
                      seriesMeta.push(`Body Part: ${series.bodyPartExamined}`);
                    }
                    if (series.protocolName) {
                      seriesMeta.push(`Protocol: ${series.protocolName}`);
                    }
                    if (series.seriesDate) {
                      seriesMeta.push(`Date: ${series.seriesDate}`);
                    }
                    if (series.seriesTime) {
                      seriesMeta.push(`Time: ${series.seriesTime}`);
                    }

                    return (
                      <div
                        key={series.id}
                        className="group relative rounded-2xl border border-slate-800/80 bg-slate-900 shadow-lg shadow-slate-950/25 transition-all duration-200 ease-in-out hover:border-emerald-400/40 hover:shadow-emerald-500/10"
                      >
                        <div className="sticky top-0 left-0 right-0 z-10 flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-slate-900 px-5 py-4 transition-colors duration-200 group-hover:border-emerald-400/30 group-hover:bg-slate-900">
                          <div>
                            <p className="text-lg font-semibold text-white">
                              Series #{series?.seriesNumber}:{" "}
                              {series.seriesDescription || series.id}
                            </p>
                            <p className="text-xs text-slate-400">
                              {entries.length} annotation
                              {entries.length === 1 ? "" : "s"} ·{" "}
                              {seriesMeta.slice(0, 2).join(" · ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSeriesIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(series.id)) {
                                  next.delete(series.id);
                                } else {
                                  next.add(series.id);
                                }
                                return next;
                              })
                            }
                            aria-expanded={isExpanded}
                            data-expanded={isExpanded}
                            aria-label={`Toggle series ${
                              series.seriesDescription ?? series.id
                            }`}
                            className="rounded-md border border-slate-700/60 bg-slate-900/90 p-1 text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 data-[expanded=true]:border-emerald-400/40"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                            )}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="space-y-4 border-t border-slate-800/70 px-5 py-4">
                            {seriesMeta.length > 0 && (
                              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                {seriesMeta.map((meta, index) => (
                                  <span
                                    key={`${series.id}-meta-${index}`}
                                    className="rounded-md border border-slate-700/60 bg-slate-900/90 px-2 py-1"
                                  >
                                    {meta}
                                  </span>
                                ))}
                              </div>
                            )}

                            {entries.length === 0 ? (
                              <div className="rounded-xl border border-slate-800/60 bg-slate-900/90 px-4 py-4 text-sm text-slate-300">
                                No annotations stored for this series.
                              </div>
                            ) : (
                              entries.map(({ annotation, instance }) => {
                                const annotationData: Annotation =
                                  annotation.annotationData;
                                const metadata = annotationData.metadata;
                                const sliceIndex = metadata?.sliceIndex;
                                const referencedImageId =
                                  metadata?.referencedImageId || undefined;
                                const currentStatus =
                                  annotation.annotationStatus ||
                                  AnnotationStatus.DRAFT;
                                const isDraftStatus =
                                  currentStatus === AnnotationStatus.DRAFT;
                                const isFinalStatus =
                                  currentStatus === AnnotationStatus.FINAL;
                                const finalizationConfirmed =
                                  finalizationConfirmations[annotation.id] ??
                                  false;
                                const isFinalizing =
                                  finalizingAnnotationId === annotation.id;

                                return (
                                  <div
                                    key={annotation.id}
                                    className="group/annotation rounded-2xl border border-slate-700/70 bg-slate-900/95 p-5 shadow-md shadow-slate-950/20 transition-all duration-300 hover:border-emerald-400/50 hover:shadow-emerald-500/10"
                                  >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="space-y-1.5">
                                        <p className="text-base font-semibold text-white">
                                          Annotation Type:{" "}
                                          {annotation.annotationType}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          Instance #
                                          {instance?.instanceNumber ?? "N/A"} ·
                                          UID:{" "}
                                          {instance?.sopInstanceUid ??
                                            annotation.instanceId}
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap items-start gap-3 text-xs text-slate-300">
                                        <div className="flex flex-col items-end gap-1">
                                          <span className="text-[10px] uppercase tracking-wide text-slate-500">
                                            Status
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`px-3 py-1 text-xs capitalize transition-colors duration-200 ${statusBadgeStyle(
                                              annotation.annotationStatus
                                            )}`}
                                          >
                                            {formatStatusLabel(
                                              annotation.annotationStatus
                                            )}
                                          </Badge>
                                          {isFinalStatus && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-1 text-[11px] text-teal-200">
                                                  <Lock className="h-3.5 w-3.5" />
                                                  <span>Locked</span>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent
                                                side="bottom"
                                                className="!bg-slate-800 !border-teal-700 !text-white"
                                              >
                                                Final annotations are read-only.
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                        </div>
                                        {annotation.colorCode && (
                                          <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] uppercase tracking-wide text-slate-500">
                                              Color
                                            </span>
                                            <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-2 py-1 text-xs text-slate-200">
                                              <span
                                                className="h-3 w-3 rounded-full border border-slate-800"
                                                style={{
                                                  backgroundColor:
                                                    annotation.colorCode,
                                                }}
                                              />
                                              {annotation.colorCode}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {isDraftStatus && (
                                      <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 md:justify-between">
                                          <div className="flex-1 flex gap-3 items-center">
                                            <Checkbox
                                              id={`finalize-${annotation.id}`}
                                              checked={finalizationConfirmed}
                                              onCheckedChange={(checked) =>
                                                setFinalizationConfirmations(
                                                  (prev) => ({
                                                    ...prev,
                                                    [annotation.id]:
                                                      Boolean(checked),
                                                  })
                                                )
                                              }
                                              className="border-amber-400/60 text-amber-300 shrink-0 h-6 w-6"
                                            />
                                            <div className="flex flex-col gap-2">
                                              <label
                                                htmlFor={`finalize-${annotation.id}`}
                                                className="flex-1 text-sm leading-tight text-amber-100"
                                              >
                                                I confirm this annotation is
                                                complete and ready to be marked
                                                as final. This action cannot be
                                                reverted.
                                              </label>
                                              <p className="text-xs text-amber-200/80">
                                                Final annotations are locked for
                                                editing.
                                              </p>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-red-600! hover:border-red-600 hover:text-white shrink-0"
                                            disabled={
                                              !finalizationConfirmed ||
                                              isFinalizing
                                            }
                                            onClick={() =>
                                              handleFinalizeAnnotation(
                                                annotation.id
                                              )
                                            }
                                          >
                                            {isFinalizing && (
                                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                            )}
                                            Mark as Final
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {currentStatus === AnnotationStatus.FINAL &&
                                      user?.role === Roles.PHYSICIAN &&
                                      annotation.annotationStatus !==
                                        AnnotationStatus.REVIEWED && (
                                        <div className="mt-4 rounded-xl border border-blue-500/40 bg-blue-500/5 px-4 py-3 text-sm text-blue-100">
                                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 md:justify-between">
                                            <div className="flex-1 flex gap-3 items-center">
                                              <Checkbox
                                                id={`review-${annotation.id}`}
                                                checked={
                                                  reviewConfirmations[
                                                    annotation.id
                                                  ] ?? false
                                                }
                                                onCheckedChange={(checked) =>
                                                  setReviewConfirmations(
                                                    (prev) => ({
                                                      ...prev,
                                                      [annotation.id]:
                                                        Boolean(checked),
                                                    })
                                                  )
                                                }
                                                className="border-blue-400/60 text-blue-300 shrink-0 h-6 w-6"
                                              />
                                              <div className="flex flex-col gap-2">
                                                <label
                                                  htmlFor={`review-${annotation.id}`}
                                                  className="flex-1 text-sm leading-tight text-blue-100"
                                                >
                                                  I confirm I have reviewed this
                                                  annotation and it is ready to
                                                  be marked as reviewed.
                                                </label>
                                                <p className="text-xs text-blue-200/80">
                                                  Reviewed annotations confirm
                                                  completion of review.
                                                </p>
                                              </div>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-blue-400/60 bg-blue-500/10 text-blue-100 hover:bg-blue-600 hover:border-blue-600 hover:text-white shrink-0"
                                              disabled={
                                                !reviewConfirmations[
                                                  annotation.id
                                                ] ||
                                                reviewingAnnotationId ===
                                                  annotation.id
                                              }
                                              onClick={() =>
                                                handleReviewAnnotation(
                                                  annotation.id
                                                )
                                              }
                                            >
                                              {reviewingAnnotationId ===
                                                annotation.id && (
                                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                              )}
                                              Mark as Reviewed
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                    {annotation.textContent && (
                                      <div className="mt-3 rounded-lg border border-slate-800/60 bg-slate-900/90 px-4 py-3 text-sm text-slate-200">
                                        Annotation Text Content:{" "}
                                        {annotation.textContent}
                                      </div>
                                    )}

                                    <div className="mt-4 grid gap-4 text-xs text-slate-300 md:grid-cols-2">
                                      {(sliceIndex !== undefined ||
                                        referencedImageId) && (
                                        <div className="col-span-2 rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                          <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                            Frame Details
                                          </span>
                                          <div className="mt-1 space-y-1 text-sm text-slate-200">
                                            {sliceIndex !== undefined && (
                                              <>
                                                <p>Slice Index: {sliceIndex}</p>
                                                <p>
                                                  Frame No: {sliceIndex + 1}
                                                </p>
                                              </>
                                            )}
                                            {referencedImageId && (
                                              <p className="break-all text-xs text-slate-200 md:text-sm">
                                                Referenced Image ID:{" "}
                                                {referencedImageId}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                          Annotated
                                        </span>
                                        <p className="mt-1 text-sm text-slate-200">
                                          {formatDate(
                                            annotation.annotationDate
                                          )}
                                        </p>
                                      </div>
                                      <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                          Reviewed on
                                        </span>
                                        <p className="mt-1 text-sm text-slate-200">
                                          {formatDate(annotation.reviewDate)}
                                        </p>
                                      </div>
                                      <div className="col-span-2 rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                          Notes
                                        </span>
                                        <p className="mt-1 text-sm text-slate-200">
                                          {annotation.notes || "—"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </TooltipProvider>
    </Dialog>
  );
}
