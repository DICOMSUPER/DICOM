"use client";

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
import { annotation, Enums as ToolEnums } from "@cornerstonejs/tools";
import {
  eventTarget,
  getRenderingEngine,
  type Types,
} from "@cornerstonejs/core";

import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import type { Annotation as MyAnnotation } from "@/types/Annotation";
import { useViewer } from "@/contexts/ViewerContext";
import { Annotation, Annotations } from "@cornerstonejs/tools/types";

type DraftAnnotationEntry = {
  id: string;
  annotation: MyAnnotation;
  instance?: DicomInstance;
  status: AnnotationStatus;
  annotationType: string;
  textContent?: string;
  colorCode?: string;
  metadata: {
    sliceIndex?: number;
    referencedImageId?: string;
    viewportIndex: number;
    viewportId: string;
  };
  timestamps: {
    annotationDate?: string;
    reviewDate?: string;
  };
  notes?: string;
};

interface DraftAnnotationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: DicomSeries | null;
}

const resolveColorCode = (color: unknown): string | undefined => {
  if (!color) return undefined;

  if (typeof color === "string") {
    return color;
  }

  if (Array.isArray(color) && color.length >= 3) {
    const [r, g, b, a] = color;
    if (
      typeof r === "number" &&
      typeof g === "number" &&
      typeof b === "number"
    ) {
      if (typeof a === "number") {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  if (typeof color === "object" && color !== null) {
    const candidate = color as Record<string, unknown>;
    const r = candidate.r ?? candidate.red;
    const g = candidate.g ?? candidate.green;
    const b = candidate.b ?? candidate.blue;
    const a = candidate.a ?? candidate.alpha;

    if (
      typeof r === "number" &&
      typeof g === "number" &&
      typeof b === "number"
    ) {
      if (typeof a === "number") {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return undefined;
};

export function DraftAnnotationsModal({
  open,
  onOpenChange,
  series,
}: DraftAnnotationsModalProps) {
  const { state } = useViewer();
  const [draftAnnotations, setDraftAnnotations] = useState<
    DraftAnnotationEntry[]
  >([]);
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsError, setAnnotationsError] = useState<string | null>(null);

  const collectDraftAnnotations = useCallback(() => {
    if (!series) {
      return {
        entries: [] as DraftAnnotationEntry[],
        matchedViewport: false,
      };
    }

    const entries: DraftAnnotationEntry[] = [];
    let matchedViewport = false;

    state.viewportIds.forEach((viewportId, viewportIndex) => {
      const viewportSeries = state.viewportSeries.get(viewportIndex);
      if (!viewportSeries || viewportSeries.id !== series.id) {
        return;
      }

      matchedViewport = true;

      const renderingEngineId = state.renderingEngineIds.get(viewportIndex);
      if (!renderingEngineId) {
        return;
      }

      const renderingEngine = getRenderingEngine(renderingEngineId);

      const viewport = renderingEngine?.getViewport(viewportId) as
        | Types.IStackViewport
        | undefined;

      const element =
        viewport?.element ??
        (typeof document !== "undefined"
          ? (document.querySelector(
              `[data-enabled-element="${viewportId}"]`
            ) as HTMLElement | null)
          : null);

      if (!element) {
        return;
      }
      console.log(element);

      const result: Annotations = annotation.state.getAnnotations(
        "Length",
        element
      );
      console.log(result);
      const result2 = annotation.state.getAllAnnotations();
      console.log(result2);
      result.forEach((annotationItem: Annotation) => {
        if (!annotationItem) return;

        const sliceIndex = annotationItem.metadata?.sliceIndex ?? 0;
        let matchedInstance: DicomInstance | undefined;

        if (
          typeof sliceIndex === "number" &&
          Array.isArray(series.instances) &&
          series.instances[sliceIndex]
        ) {
          matchedInstance = series.instances[sliceIndex];
        }

        const referencedImageId = annotationItem.metadata?.referencedImageId
          ? String(annotationItem.metadata.referencedImageId)
          : undefined;

        if (
          !matchedInstance &&
          referencedImageId &&
          Array.isArray(series.instances)
        ) {
          matchedInstance = series.instances.find((candidate) => {
            const candidateUid = candidate.sopInstanceUid;
            const candidateId = candidate.id;
            const candidateFile = candidate.fileName;
            return (
              (!!candidateUid && referencedImageId.includes(candidateUid)) ||
              (!!candidateId && referencedImageId.includes(candidateId)) ||
              (!!candidateFile && referencedImageId.includes(candidateFile))
            );
          });
        }

        const timestamps = {
          annotationDate:
            (annotationItem.metadata as any)?.annotationDate ??
            (annotationItem.metadata as any)?.createdAt ??
            undefined,
          reviewDate:
            (annotationItem.metadata as any)?.reviewDate ??
            (annotationItem.metadata as any)?.updatedAt ??
            undefined,
        };

        entries.push({
          id:
            annotationItem.annotationUID ??
            `${annotationItem.metadata?.toolName ?? "annotation"}-${
              viewportIndex + 1
            }-${entries.length + 1}`,
          annotation: annotationItem,
          instance: matchedInstance,
          status: AnnotationStatus.DRAFT,
          annotationType: annotationItem.metadata?.toolName ?? "Unknown",
          textContent: annotationItem.data?.label,
          colorCode: resolveColorCode(annotationItem.metadata?.segmentColor),
          metadata: {
            sliceIndex,
            referencedImageId,
            viewportIndex,
            viewportId,
          },
          timestamps,
          notes:
            (annotationItem.metadata as any)?.notes ??
            (annotationItem.metadata as any)?.comment ??
            undefined,
        });
      });
    });

    return { entries, matchedViewport };
  }, [
    series,
    state.viewportIds,
    state.viewportSeries,
    state.renderingEngineIds,
  ]);

  const refreshAnnotations = useCallback(() => {
    if (!open) {
      return;
    }

    setAnnotationsLoading(true);

    if (!series) {
      setDraftAnnotations([]);
      setAnnotationsError("No series selected.");
      setAnnotationsLoading(false);
      return;
    }

    const { entries, matchedViewport } = collectDraftAnnotations();

    setDraftAnnotations(entries);

    if (!matchedViewport) {
      setAnnotationsError(
        "Selected series is not currently loaded in any viewport."
      );
    } else {
      setAnnotationsError(null);
    }

    setAnnotationsLoading(false);
  }, [collectDraftAnnotations, open, series]);

  useEffect(() => {
    if (!open) {
      setDraftAnnotations([]);
      setAnnotationsError(null);
      return;
    }

    refreshAnnotations();

    const eventNames: string[] = [
      ToolEnums.Events.ANNOTATION_COMPLETED,
      ToolEnums.Events.ANNOTATION_MODIFIED,
      ToolEnums.Events.ANNOTATION_REMOVED,
    ];

    const handler = () => {
      refreshAnnotations();
    };

    eventNames.forEach((name) => {
      eventTarget.addEventListener(name, handler as EventListener);
    });

    return () => {
      eventNames.forEach((name) => {
        eventTarget.removeEventListener(name, handler as EventListener);
      });
    };
  }, [open, refreshAnnotations]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const modalTitle = useMemo(() => {
    if (!series) return "Draft Series Annotations";
    return series.seriesDescription
      ? `${series.seriesDescription} (Drafts)`
      : "Draft Series Annotations";
  }, [series]);

  const modalSubtitle = useMemo(() => {
    if (!series) return "No series selected";
    const parts: string[] = [];
    if (series.seriesInstanceUid) parts.push(series.seriesInstanceUid);
    if (series.seriesNumber) parts.push(`Series #${series.seriesNumber}`);
    if (series.bodyPartExamined)
      parts.push(`Body Part: ${series.bodyPartExamined}`);
    if (series.seriesDate) parts.push(`Date: ${series.seriesDate}`);
    if (series.seriesTime) parts.push(`Time: ${series.seriesTime}`);
    return parts.join(" • ") || "Series metadata unavailable";
  }, [series]);

  const annotationStatuses = useMemo(() => {
    const unique = new Set<string>();
    draftAnnotations.forEach((entry) => {
      unique.add(entry.status);
    });
    if (unique.size === 0) {
      unique.add(AnnotationStatus.DRAFT);
    }
    return Array.from(unique);
  }, [draftAnnotations]);

  const annotationSummary = useMemo(() => {
    const total = draftAnnotations.length;
    const statusCounts = annotationStatuses.reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {}
    );

    draftAnnotations.forEach((entry) => {
      statusCounts[entry.status] = (statusCounts[entry.status] ?? 0) + 1;
    });

    const instanceIds = new Set(
      draftAnnotations.map((entry) => entry.instance?.id).filter(Boolean)
    );

    return {
      total,
      statusCounts,
      instanceCount: instanceIds.size,
    };
  }, [draftAnnotations, annotationStatuses]);

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
          <div className="flex md:flex-row flex-col gap-5 justify-between items-stretch">
          <DialogHeader className="shrink-0 rounded-xl bg-slate-900/80 px-6 py-5 shadow-inner shadow-slate-950/40 flex-1">
            <DialogTitle className="text-2xl font-semibold text-white">
              {modalTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Overview of draft annotations available for the selected DICOM
              series.
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
          {!annotationsLoading && draftAnnotations.length > 0 && (
            <div className="flex md:flex-col flex-row gap-5">
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-slate-900/85 px-4 py-4 shadow-sm text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Total Drafts
                </p>
                <p className="text-2xl font-semibold text-white">
                  {annotationSummary.total}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-slate-900/85 px-4 py-4 shadow-sm text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Unique Instances
                </p>
                <p className="text-2xl font-semibold text-white">
                  {annotationSummary.instanceCount}
                </p>
              </div>
            </div>
          )}
          </div>

          {annotationsError && (
            <Alert className="shrink-0 border-yellow-500/40 bg-yellow-500/10 text-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
                <div>
                  <AlertTitle>Draft annotations unavailable</AlertTitle>
                  <AlertDescription>{annotationsError}</AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto rounded-xl bg-slate-900/40 px-4 py-4">
            {annotationsLoading ? (
              <div className="flex h-full items-center justify-center text-slate-300">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading draft annotations...
              </div>
            ) : draftAnnotations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Inbox className="h-10 w-10 text-slate-500" />
                <p className="text-sm">
                  No draft annotations found in Cornerstone state.
                </p>
                <p className="text-xs text-slate-500">
                  Create an annotation within the viewer to see it listed here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl font-semibold text-white">
                  Draft Annotations
                </p>
                {draftAnnotations.map((entry) => {
                  const { instance, metadata } = entry;
                  const sliceIndex = metadata.sliceIndex;
                  const referencedImageId = metadata.referencedImageId;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/25"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1.5">
                          <p className="text-base font-semibold text-white">
                            Annotation Type: {entry.annotationType}
                          </p>
                          <p className="text-xs text-slate-400">
                            Viewport #{metadata.viewportIndex + 1} · Instance #
                            {instance?.instanceNumber ??
                              (typeof sliceIndex === "number"
                                ? sliceIndex + 1
                                : "N/A")}{" "}
                            · UID:{" "}
                            {instance?.sopInstanceUid ??
                              referencedImageId ??
                              "Unknown"}
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
                                entry.status
                              )}`}
                            >
                              {formatStatusLabel(entry.status)}
                            </Badge>
                          </div>
                          {entry.colorCode && (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                                Color
                              </span>
                              <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-xs text-slate-200">
                                <span
                                  className="h-3 w-3 rounded-full border border-slate-800"
                                  style={{ backgroundColor: entry.colorCode }}
                                />
                                {entry.colorCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {entry.textContent && (
                        <div className="mt-3 rounded-lg border border-slate-800/60 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                          Annotation Text Content: {entry.textContent}
                        </div>
                      )}

                      <div className="mt-4 grid gap-4 text-xs text-slate-300 md:grid-cols-2">
                        {referencedImageId && (
                          <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3 col-span-2">
                            <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                              Referenced Image ID
                            </span>
                            <p className="mt-1 text-sm text-slate-200">
                              <p className="break-all text-xs text-slate-200 md:text-sm">
                                {referencedImageId}
                              </p>
                            </p>
                          </div>
                        )}
                        <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3">
                          <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                            Slice Index
                          </span>
                          <p className="mt-1 text-sm text-slate-200">
                            {sliceIndex !== undefined && <p>{sliceIndex}</p>}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-800/50 bg-slate-900/70 px-4 py-3">
                          <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                            Frame No
                          </span>
                          <p className="mt-1 text-sm text-slate-200">
                            {sliceIndex !== undefined && (
                              <p>{sliceIndex + 1}</p>
                            )}
                          </p>
                        </div>
                      </div>
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
