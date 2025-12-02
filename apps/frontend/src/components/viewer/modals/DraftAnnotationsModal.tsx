"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Inbox,
  Loader2,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { annotation, Enums as ToolEnums } from "@cornerstonejs/tools";
import {
  eventTarget,
  getRenderingEngine,
  type Types,
} from "@cornerstonejs/core";

import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { AnnotationStatus, AnnotationType } from "@/enums/image-dicom.enum";
import { useViewer } from "@/contexts/ViewerContext";
import type { Annotation } from "@cornerstonejs/tools/types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useCreateAnnotationMutation } from "@/store/annotationApi";
import { toast } from "sonner";
import { Roles } from "@/enums/user.enum";

type DraftAnnotationEntry = {
  id: string;
  annotation: Annotation;
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
    seriesId: string;
  };
};

type SeriesDraftGroup = {
  series: DicomSeries;
  entries: DraftAnnotationEntry[];
  matchedViewport: boolean;
};

interface DraftAnnotationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cachedSeriesList?: DicomSeries[];
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

const toSerializable = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return undefined;
  }
};

export function DraftAnnotationsModal({
  open,
  onOpenChange,
  cachedSeriesList,
}: DraftAnnotationsModalProps) {
  const { state } = useViewer();
  const user = useSelector(
    (candidateState: RootState) => candidateState.auth.user
  );
  const [draftAnnotations, setDraftAnnotations] = useState<
    DraftAnnotationEntry[]
  >([]);
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsError, setAnnotationsError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AnnotationStatus>(
    AnnotationStatus.DRAFT
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAnnotation, { isLoading: isCreatingAnnotation }] =
    useCreateAnnotationMutation();

  const [seriesDraftGroups, setSeriesDraftGroups] = useState<
    SeriesDraftGroup[]
  >([]);
  const [loadedSeriesList, setLoadedSeriesList] = useState<DicomSeries[]>([]);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(
    () => new Set()
  );
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<Set<string>>(
    () => new Set()
  );
  const [confirmSubmission, setConfirmSubmission] = useState(false);
  const loadedSeriesRef = useRef<DicomSeries[]>([]);

  const toggleSeriesSelection = useCallback(
    (seriesId: string, checked?: boolean) => {
      setSelectedSeriesIds((prev) => {
        const next = new Set(prev);
        const shouldSelect =
          typeof checked === "boolean" ? checked : !next.has(seriesId);
        if (shouldSelect) {
          next.add(seriesId);
        } else {
          next.delete(seriesId);
        }
        return next;
      });
      setConfirmSubmission(false);
    },
    []
  );

  const toggleSeriesExpansion = useCallback((seriesId: string) => {
    setExpandedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) {
        next.delete(seriesId);
      } else {
        next.add(seriesId);
      }
      return next;
    });
  }, []);

  const resolveViewportElement = useCallback(
    (viewportId: string, viewportIndex: number, expectedSeriesId?: string) => {
      const viewportSeries = state.viewportSeries.get(viewportIndex);
      if (expectedSeriesId && viewportSeries?.id !== expectedSeriesId) {
        return null;
      }

      const renderingEngineId = state.renderingEngineIds.get(viewportIndex);
      if (!renderingEngineId) {
        return null;
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
            ) as HTMLDivElement | null)
          : null);

      return element ?? null;
    },
    [state.renderingEngineIds, state.viewportSeries]
  );

  const collectDraftAnnotations = useCallback(() => {
    const groupsMap = new Map<string, SeriesDraftGroup>();

    state.viewportIds.forEach((viewportId, viewportIndex) => {
      const viewportSeries = state.viewportSeries.get(viewportIndex);
      if (!viewportSeries || !viewportSeries.id) {
        return;
      }

      const seriesId = viewportSeries.id;

      let group = groupsMap.get(seriesId);
      if (!group) {
        group = {
          series: viewportSeries,
          entries: [],
          matchedViewport: false,
        };
        groupsMap.set(seriesId, group);
      }

      group.matchedViewport = true;

      const element = resolveViewportElement(
        viewportId,
        viewportIndex,
        seriesId
      );
      if (!element) {
        return;
      }

      Object.values(AnnotationType).forEach((type) => {
        const annotationsForType = annotation.state.getAnnotations(
          type,
          element
        );
        if (!annotationsForType || annotationsForType.length === 0) {
          return;
        }

        annotationsForType.forEach((annotationItem: Annotation) => {
          if (!annotationItem) return;
          const metadataRecord = annotationItem.metadata as
            | Record<string, unknown>
            | undefined;
          const sourceValue =
            typeof metadataRecord?.["source"] === "string"
              ? (metadataRecord["source"] as string).toLowerCase()
              : undefined;
          if (sourceValue === "db") {
            return;
          }

          const sliceIndex = annotationItem.metadata?.sliceIndex ?? 0;
          let matchedInstance: DicomInstance | undefined;

          if (
            typeof sliceIndex === "number" &&
            Array.isArray(viewportSeries.instances) &&
            viewportSeries.instances[sliceIndex]
          ) {
            matchedInstance = viewportSeries.instances[sliceIndex];
          }

          const referencedImageId = annotationItem.metadata?.referencedImageId
            ? String(annotationItem.metadata.referencedImageId)
            : undefined;

          if (
            !matchedInstance &&
            referencedImageId &&
            Array.isArray(viewportSeries.instances)
          ) {
            matchedInstance = viewportSeries.instances.find((candidate) => {
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

          group.entries.push({
            id:
              annotationItem.annotationUID ??
              `${type ?? "annotation"}-${viewportIndex + 1}-${
                group.entries.length + 1
              }`,
            annotation: annotationItem,
            instance: matchedInstance,
            status: AnnotationStatus.DRAFT,
            annotationType: type,
            textContent: annotationItem.data?.label,
            colorCode: resolveColorCode(annotationItem.metadata?.segmentColor),
            metadata: {
              sliceIndex,
              referencedImageId,
              viewportIndex,
              viewportId,
              seriesId,
            },
          });
        });
      });
    });

    const groups = Array.from(groupsMap.values());
    const entries = groups.flatMap((group) => group.entries);
    return { groups, entries };
  }, [state.viewportIds, state.viewportSeries, resolveViewportElement]);

  const refreshAnnotations = useCallback(() => {
    if (!open) {
      return;
    }

    setAnnotationsLoading(true);

    const { groups, entries } = collectDraftAnnotations();
    const newSeriesList = groups.map((group) => group.series);
    const effectiveSeriesList =
      newSeriesList.length > 0
        ? newSeriesList
        : cachedSeriesList?.filter((series) => series?.id) ?? [];
    const newSeriesIdSet = new Set(
      effectiveSeriesList.map((series) => series.id)
    );
    const previouslyLoadedIds = new Set(
      loadedSeriesRef.current.map((series) => series.id)
    );

    setSelectedSeriesIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (newSeriesIdSet.has(id)) {
          next.add(id);
        }
      });
      return next;
    });

    setExpandedSeriesIds((prev) => {
      const next = new Set<string>(prev);
      next.forEach((id) => {
        if (!newSeriesIdSet.has(id)) {
          next.delete(id);
        }
      });
      effectiveSeriesList.forEach((series) => {
        if (!prev.has(series.id)) {
          next.add(series.id);
        }
      });
      if (prev.size === 0 && next.size === 0) {
        newSeriesList.forEach((series) => next.add(series.id));
      }
      return next;
    });

    setLoadedSeriesList(effectiveSeriesList);
    loadedSeriesRef.current = effectiveSeriesList;

    const groupsWithEntries = groups.filter(
      (group) => group.entries.length > 0
    );
    setSeriesDraftGroups(groupsWithEntries);
    setDraftAnnotations(entries);

    if (groupsWithEntries.length === 0) {
      if (effectiveSeriesList.length === 0) {
        setAnnotationsError("No series are currently loaded in any viewport.");
      } else {
        setAnnotationsError(
          "No draft annotations found for the cached series."
        );
      }
    } else {
      setAnnotationsError(null);
    }

    setAnnotationsLoading(false);
  }, [collectDraftAnnotations, open, cachedSeriesList]);

  useEffect(() => {
    if (!open) {
      setDraftAnnotations([]);
      setLoadedSeriesList([]);
      loadedSeriesRef.current = [];
      setSeriesDraftGroups([]);
      setSelectedSeriesIds(new Set());
      setExpandedSeriesIds(new Set());
      setConfirmSubmission(false);
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

  useEffect(() => {
    if (!open) {
      setSelectedStatus(AnnotationStatus.DRAFT);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const modalTitle = useMemo(() => "Draft Series Annotations", []);

  const modalSubtitle = useMemo(() => {
    if (loadedSeriesList.length === 0) {
      return "Load a series in any viewport to collect draft annotations.";
    }
    const labels = loadedSeriesList
      .map(
        (series) =>
          series.seriesDescription || series.seriesInstanceUid || series.id
      )
      .filter(Boolean);
    const preview = labels.slice(0, 3).join(", ");
    const extra = labels.length > 3 ? `, +${labels.length - 3} more` : "";
    return `${labels.length} series loaded${
      preview ? `: ${preview}${extra}` : ""
    }`;
  }, [loadedSeriesList]);

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

  const validAnnotationTypes = useMemo(
    () => new Set<string>(Object.values(AnnotationType)),
    []
  );

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

  const selectedDraftAnnotations = useMemo(
    () =>
      draftAnnotations.filter((entry) =>
        selectedSeriesIds.has(entry.metadata.seriesId)
      ),
    [draftAnnotations, selectedSeriesIds]
  );

  const selectedDraftCount = selectedDraftAnnotations.length;

  const draftSeriesCount = seriesDraftGroups.length;

  const selectedSeriesCount = useMemo(() => {
    let count = 0;
    seriesDraftGroups.forEach((group) => {
      if (selectedSeriesIds.has(group.series.id)) {
        count += 1;
      }
    });
    return count;
  }, [seriesDraftGroups, selectedSeriesIds]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setConfirmSubmission(false);
  }, [selectedSeriesIds, selectedStatus, open]);

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

  const handleStatusToggle = useCallback((checked: boolean) => {
    setSelectedStatus(
      checked ? AnnotationStatus.FINAL : AnnotationStatus.DRAFT
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    console.log(user);
    if (!user?.id) {
      toast.error("You must be signed in to submit annotations.");
      return;
    }

    // Only radiologists can submit annotations
    if (user.role !== Roles.RADIOLOGIST) {
      toast.error("Only radiologists can submit annotations.");
      return;
    }

    if (selectedDraftAnnotations.length === 0) {
      toast.info(
        "Select at least one series with draft annotations to submit."
      );
      return;
    }

    const uniqueSeriesIds = Array.from(
      new Set(selectedDraftAnnotations.map((entry) => entry.metadata.seriesId))
    );

    console.log("[DraftAnnotationsModal] Submitting draft annotations", {
      seriesCount: uniqueSeriesIds.length,
      seriesIds: uniqueSeriesIds,
      selectedStatus,
      totalDrafts: selectedDraftAnnotations.length,
      draftIds: selectedDraftAnnotations.map((entry) => entry.id),
      draftInstances: selectedDraftAnnotations.map(
        (entry) => entry.instance?.id ?? null
      ),
    });

    setIsSubmitting(true);

    const submissionJobs: {
      entry: DraftAnnotationEntry;
      promise: Promise<unknown>;
    }[] = [];
    const submissionGroups = new Map<
      string,
      { total: number; success: number; entries: DraftAnnotationEntry[] }
    >();
    let skippedCount = 0;

    const buildGroupKey = (entry: DraftAnnotationEntry) =>
      `${entry.annotationType}::${entry.metadata.viewportId}::${entry.metadata.viewportIndex}`;

    selectedDraftAnnotations.forEach((entry) => {
      const instanceId = entry.instance?.id;

      if (!instanceId) {
        skippedCount += 1;
        console.warn(
          "[DraftAnnotationsModal] Skipping draft without instance",
          {
            draftId: entry.id,
            annotationType: entry.annotationType,
            viewportId: entry.metadata.viewportId,
            viewportIndex: entry.metadata.viewportIndex,
          }
        );
        return;
      }

      const candidateType = entry.annotationType as AnnotationType;
      const annotationType = validAnnotationTypes.has(candidateType)
        ? candidateType
        : AnnotationType.LABEL;

      const annotationPayload =
        (toSerializable({
          annotationUID: entry.annotation?.annotationUID ?? entry.id,
          metadata: entry.annotation?.metadata ?? entry.metadata,
          data: entry.annotation?.data ?? {},
        }) as Record<string, unknown>) ?? {};
      console.log("annotation payload", annotationPayload);

      const dataRecord =
        (entry.annotation?.data as Record<string, unknown> | undefined) ?? {};

      console.log("data record", dataRecord);

      const coordinatePayload =
        toSerializable(dataRecord["handles"]) ?? undefined;
      console.log("coordinate payload", coordinatePayload);

      const measurementValueCandidate = dataRecord["measurementValue"];
      const measurementUnitCandidate = dataRecord["measurementUnit"];
      const measurementValue =
        typeof measurementValueCandidate === "number"
          ? (measurementValueCandidate as number)
          : undefined;
      const measurementUnit =
        typeof measurementUnitCandidate === "string"
          ? (measurementUnitCandidate as string)
          : undefined;

      const promise = createAnnotation({
        instanceId,
        annotationType,
        annotationData: annotationPayload,
        coordinates: coordinatePayload,
        measurementValue,
        measurementUnit,
        textContent: entry.textContent,
        colorCode: entry.colorCode,
        annotationStatus: selectedStatus,
        annotatorId: user.id,
      })
        .unwrap()
        .then((result) => {
          console.log(
            "[DraftAnnotationsModal] Annotation submission succeeded",
            {
              draftId: entry.id,
              annotationType,
              instanceId,
              result,
            }
          );
          return result;
        })
        .catch((error) => {
          console.error(
            "[DraftAnnotationsModal] Annotation submission failed",
            {
              draftId: entry.id,
              annotationType,
              instanceId,
              error,
            }
          );
          throw error;
        });

      submissionJobs.push({ entry, promise });

      const groupKey = buildGroupKey(entry);
      const existingGroup = submissionGroups.get(groupKey) ?? {
        total: 0,
        success: 0,
        entries: [] as DraftAnnotationEntry[],
      };

      existingGroup.total += 1;
      existingGroup.entries.push(entry);

      submissionGroups.set(groupKey, existingGroup);
    });

    if (submissionJobs.length === 0) {
      setIsSubmitting(false);
      toast.error(
        skippedCount > 0
          ? "Unable to submit drafts because the associated DICOM instances were not found."
          : "No drafts are eligible for submission."
      );
      return;
    }

    try {
      const results = await Promise.allSettled(
        submissionJobs.map((job) => job.promise)
      );

      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failureCount = results.length - successCount;

      results.forEach((result, index) => {
        const job = submissionJobs[index];
        if (!job) return;

        const groupKey = buildGroupKey(job.entry);
        const group = submissionGroups.get(groupKey);
        if (!group) return;

        if (result.status === "fulfilled") {
          group.success += 1;
        }
      });

      submissionGroups.forEach((group) => {
        if (group.success === group.total && group.success > 0) {
          const sampleEntry = group.entries[0];
          if (!sampleEntry) {
            return;
          }

          const { viewportId, viewportIndex } = sampleEntry.metadata;
          if (viewportId === undefined || viewportIndex === undefined) {
            return;
          }

          const element = resolveViewportElement(
            viewportId,
            viewportIndex,
            sampleEntry.metadata.seriesId
          );
          if (!element) {
            return;
          }

          try {
            annotation.state.removeAnnotations(
              sampleEntry.annotationType,
              element
            );
          } catch (removeError) {
            console.error(
              "Failed to remove submitted draft annotations from viewport:",
              {
                error: removeError,
                tool: sampleEntry.annotationType,
                viewportId,
                viewportIndex,
              }
            );
          }
        }
      });

      if (successCount > 0) {
        toast.success(
          `Submitted ${successCount} annotation${
            successCount > 1 ? "s" : ""
          } as ${selectedStatus}.`
        );
        refreshAnnotations();
      }

      if (failureCount > 0) {
        toast.error(
          `Failed to submit ${failureCount} annotation${
            failureCount > 1 ? "s" : ""
          }.`
        );
      }

      if (skippedCount > 0) {
        toast.warning(
          `Skipped ${skippedCount} draft${
            skippedCount > 1 ? "s" : ""
          } without linked DICOM instances.`
        );
      }
    } catch (error) {
      console.error("Failed to submit annotations:", error);
      toast.error("An unexpected error occurred while submitting annotations.");
    } finally {
      setIsSubmitting(false);
      setConfirmSubmission(false);
      console.log("[DraftAnnotationsModal] Submission run completed");
    }
  }, [
    user?.id,
    selectedDraftAnnotations,
    validAnnotationTypes,
    createAnnotation,
    selectedStatus,
    refreshAnnotations,
    resolveViewportElement,
  ]);

  const submissionDisabled =
    isSubmitting ||
    isCreatingAnnotation ||
    selectedDraftCount === 0 ||
    !confirmSubmission;
  const isFinalSelection = selectedStatus === AnnotationStatus.FINAL;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[80vw] border border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl shadow-teal-500/10 backdrop-blur-md sm:max-w-[1200px] flex h-[85vh] max-h-[85vh] flex-col overflow-hidden p-0 gap-0">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex h-full flex-1 flex-col gap-5">
            <div className="flex flex-col items-stretch gap-5 md:flex-row md:justify-between">
              <DialogHeader className="flex-1 rounded-xl bg-slate-900/95 px-6 py-5 shadow-inner shadow-slate-950/40">
                <DialogTitle className="text-2xl font-semibold text-white">
                  {modalTitle}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Overview of draft annotations available across loaded DICOM
                  series.
                </DialogDescription>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>{modalSubtitle}</p>
                  {(() => {
                    const chipSeries =
                      seriesDraftGroups.length > 0
                        ? seriesDraftGroups.map((group) => group.series)
                        : loadedSeriesList;
                    if (chipSeries.length === 0) {
                      return null;
                    }
                    return (
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        {chipSeries.slice(0, 4).map((series) => (
                          <span
                            key={series.id}
                            className="rounded-md border border-slate-700/60 bg-slate-900/90 px-2 py-1"
                          >
                            {series.seriesDescription ||
                              series.seriesInstanceUid ||
                              series.id}
                          </span>
                        ))}
                        {chipSeries.length > 4 && (
                          <span className="rounded-md border border-slate-700/60 bg-slate-900/90 px-2 py-1">
                            +{chipSeries.length - 4} more
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </DialogHeader>
              {!annotationsLoading && draftAnnotations.length > 0 && (
                <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-slate-900/95 px-4 py-4 text-center shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Total Drafts
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {annotationSummary.total}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-slate-900/95 px-4 py-4 text-center shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Selected Drafts
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {selectedDraftCount}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-slate-900/95 px-4 py-4 text-center shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Series in Drafts
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {draftSeriesCount}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-slate-900/95 px-4 py-4 text-center shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Series Selected
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {selectedSeriesCount}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {annotationsError && (
              <Alert className="border-yellow-500/40 bg-yellow-500/10 text-yellow-200">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="mt-1 h-8 w-8 shrink-0 text-yellow-300" />
                  <div>
                    <AlertTitle>Draft annotations unavailable</AlertTitle>
                    <AlertDescription>{annotationsError}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {!annotationsError &&
              !annotationsLoading &&
              draftAnnotations.length > 0 &&
              selectedDraftCount === 0 && (
                <Alert className="border-emerald-500/60 bg-emerald-500/10 text-emerald-100">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-emerald-500/20 p-2 text-emerald-300">
                        <Info className="h-4 w-4" />
                      </span>
                      <div className="space-y-1">
                        <AlertTitle className="text-sm font-semibold text-emerald-100">
                          Select series to submit
                        </AlertTitle>
                        <AlertDescription className="text-xs text-emerald-50/80">
                          Check at least one series from the list below to mark
                          its draft annotations for submission.
                        </AlertDescription>
                      </div>
                    </div>
                  </div>
                </Alert>
              )}

            <div className="flex-1 h-full overflow-y-auto rounded-xl ">
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
                    Create an annotation within the viewer to see it listed
                    here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {seriesDraftGroups.map(({ series, entries }) => {
                    const seriesMeta: string[] = [];
                    if (series.seriesInstanceUid)
                      seriesMeta.push(series.seriesInstanceUid);
                    if (series.bodyPartExamined)
                      seriesMeta.push(`Body Part: ${series.bodyPartExamined}`);
                    if (series.protocolName)
                      seriesMeta.push(`Protocol: ${series.protocolName}`);
                    if (series.seriesDate)
                      seriesMeta.push(`Date: ${series.seriesDate}`);
                    if (series.seriesTime)
                      seriesMeta.push(`Time: ${series.seriesTime}`);

                    const entryInstanceCount = new Set(
                      entries
                        .map((entry) => entry.instance?.id)
                        .filter((id): id is string => Boolean(id))
                    ).size;

                    const isSeriesSelected = selectedSeriesIds.has(series.id);
                    const isSeriesExpanded = expandedSeriesIds.has(series.id);
                    const draftsLabel = `${entries.length} draft${
                      entries.length === 1 ? "" : "s"
                    }`;
                    const instancesLabel = `${entryInstanceCount} instance${
                      entryInstanceCount === 1 ? "" : "s"
                    }`;

                    return (
                      <div
                        key={series.id}
                        className={`group relative rounded-2xl border bg-slate-900 shadow-lg shadow-slate-950/25 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-emerald-500/10 ${
                          isSeriesSelected
                            ? "border-emerald-500/40 shadow-emerald-500/10"
                            : "border-slate-800/70"
                        }`}
                      >
                        <div className="sticky top-0 left-0 right-0 z-10 flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-slate-900 px-5 py-4 transition-colors duration-200 group-hover:border-emerald-400/30 group-hover:bg-slate-900">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={isSeriesSelected}
                              onCheckedChange={(checked) =>
                                toggleSeriesSelection(
                                  series.id,
                                  checked === true
                                )
                              }
                              aria-label={`Select series ${
                                series.seriesDescription ?? series.id
                              }`}
                              className="h-8 w-8 transition-transform duration-200 data-[state=checked]:scale-110 data-[state=checked]:border-emerald-400 data-[state=checked]:shadow-[0_0_12px_rgba(16,185,129,0.35)] data-[state=checked]:ring-emerald-400/40"
                            />
                            <div>
                              <p className="text-lg font-semibold text-white">
                                Series #{series?.seriesNumber}:{" "}
                                {series.seriesDescription || series.id}
                              </p>
                              <p className="text-xs text-slate-400">
                                {draftsLabel} · {instancesLabel}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center  gap-3">
                            {!isSeriesSelected && (
                              <span className="rounded-full border border-slate-700/70 bg-slate-900/90 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                                Not selected
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleSeriesExpansion(series.id)}
                              aria-expanded={isSeriesExpanded}
                              data-expanded={isSeriesExpanded}
                              aria-label={`Toggle series ${
                                series.seriesDescription ?? series.id
                              }`}
                              className="rounded-md border border-slate-700/60 bg-slate-900/90 p-1 text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 data-[expanded=true]:border-emerald-400/40"
                            >
                              {isSeriesExpanded ? (
                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                              )}
                            </button>
                          </div>
                        </div>
                        {isSeriesExpanded && (
                          <div
                            className={`space-y-4 border-t border-slate-800/70 px-5 py-4 ${
                              !isSeriesSelected ? "opacity-70" : "opacity-100"
                            }`}
                          >
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
                            {(series.createdAt ||
                              typeof series.numberOfInstances === "number") && (
                              <div className="text-xs text-slate-500">
                                {series.createdAt && (
                                  <span>
                                    Created:{" "}
                                    {formatDate(
                                      typeof series.createdAt === "string"
                                        ? series.createdAt
                                        : series.createdAt?.toString()
                                    )}
                                  </span>
                                )}
                                {typeof series.numberOfInstances ===
                                  "number" && (
                                  <span className="ml-3">
                                    Instances: {series.numberOfInstances}
                                  </span>
                                )}
                              </div>
                            )}
                            {entries.map((entry) => {
                              const { instance, metadata } = entry;
                              const sliceIndex = metadata.sliceIndex;
                              const referencedImageId =
                                metadata.referencedImageId;

                              return (
                                <div
                                  key={entry.id}
                                  className="group/draft rounded-2xl border border-slate-700/70 bg-slate-900/95 p-5 shadow-md shadow-slate-950/20 transition-all duration-300 hover:border-emerald-400/50 hover:shadow-emerald-500/10"
                                >
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1.5">
                                      <p className="text-base font-semibold text-white">
                                        Annotation Type: {entry.annotationType}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        Viewport #{metadata.viewportIndex + 1} ·
                                        Instance #
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
                                          className={`px-3 py-1 text-xs capitalize transition-colors duration-200 ${statusBadgeStyle(
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
                                          <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-2 py-1 text-xs text-slate-200">
                                            <span
                                              className="h-3 w-3 rounded-full border border-slate-800"
                                              style={{
                                                backgroundColor:
                                                  entry.colorCode,
                                              }}
                                            />
                                            {entry.colorCode}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {entry.textContent && (
                                    <div className="mt-3 rounded-lg border border-slate-800/60 bg-slate-900/90 px-4 py-3 text-sm text-slate-200">
                                      Annotation Text Content:{" "}
                                      {entry.textContent}
                                    </div>
                                  )}

                                  <div className="mt-4 grid gap-4 text-xs text-slate-300 md:grid-cols-2">
                                    {referencedImageId && (
                                      <div className="col-span-2 rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                        <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                          Referenced Image ID
                                        </span>
                                        <p className="mt-1 text-sm text-slate-200">
                                          {referencedImageId}
                                        </p>
                                      </div>
                                    )}
                                    <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                      <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                        Slice Index
                                      </span>
                                      <p className="mt-1 text-sm text-slate-200">
                                        {sliceIndex !== undefined && sliceIndex}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-4 py-3">
                                      <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                        Frame No
                                      </span>
                                      <p className="mt-1 text-sm text-slate-200">
                                        {sliceIndex !== undefined &&
                                          sliceIndex + 1}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 left-0 right-0 border-t border-slate-800/70 bg-slate-950 px-6 py-4">
          <div className="flex w-full flex-row gap-4 justify-end items-center">
            {isFinalSelection && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
                <span>
                  Final annotations become read-only after submission.
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Draft
                </span>
                <Switch
                  checked={isFinalSelection}
                  onCheckedChange={handleStatusToggle}
                  aria-label="Toggle annotation submission status"
                  className="data-[state=unchecked]:bg-emerald-500 data-[state=unchecked]:hover:bg-emerald-400 data-[state=checked]:bg-red-500 data-[state=checked]:hover:bg-red-600"
                />
                <span className="text-xs font-bold uppercase text-slate-200">
                  Final
                </span>
              </div>
            </div>
            <label
              className={`flex items-center gap-2 text-sm ${
                selectedDraftCount === 0 ? "text-slate-500" : "text-slate-200"
              }`}
            >
              <Checkbox
                checked={confirmSubmission}
                onCheckedChange={(checked) =>
                  setConfirmSubmission(checked === true)
                }
                disabled={selectedDraftCount === 0}
                aria-label="Confirm submission of selected series"
                className="h-5 w-5"
              />
              <span>Confirm submission of selected series</span>
            </label>
            <Button
              onClick={handleSubmit}
              disabled={submissionDisabled}
              className={`w-full sm:w-auto flex items-center gap-2 whitespace-nowrap ${
                isFinalSelection
                  ? "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400"
              }`}
            >
              {(isSubmitting || isCreatingAnnotation) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Submit {selectedDraftCount} Draft
              {selectedDraftCount === 1 ? "" : "s"} as{" "}
              {formatStatusLabel(selectedStatus)}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
