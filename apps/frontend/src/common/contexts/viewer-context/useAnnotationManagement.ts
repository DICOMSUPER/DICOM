import { useCallback, useRef, useMemo } from "react";
import { annotation } from "@cornerstonejs/tools";
import type { Annotation } from "@cornerstonejs/tools/types";
import { AnnotationType } from "@/common/enums/image-dicom.enum";
import { viewerEventService, ViewerEvents } from "@/services/ViewerEventService";
import { useLazyGetAnnotationsBySeriesIdQuery } from "@/store/annotationApi";
import { extractApiData } from "@/common/utils/api";
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import { AnnotationHistoryEntry, ViewerState, ViewerAction } from "./viewer-reducer";

const SERIES_CACHE_MAX_ENTRIES = 50;

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = Math.max(1, maxSize);
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const [firstKey] = this.cache.keys();
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const globalClone = (
  globalThis as unknown as { structuredClone?: <T>(value: T) => T }
).structuredClone;

const cloneSnapshot = <T,>(value: T): T => {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof globalClone === "function") {
    return globalClone(value);
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const cloneHistoryEntry = (
  entry: AnnotationHistoryEntry
): AnnotationHistoryEntry => ({
  ...entry,
  snapshot: cloneSnapshot(entry.snapshot),
});

const buildDatabaseAnnotationPayload = (
  record: ImageAnnotation,
  seriesId: string,
  viewportId?: string
): Annotation | null => {
  if (!record?.annotationData) {
    return null;
  }
  const baseAnnotation = cloneSnapshot(record.annotationData) as
    | Annotation
    | undefined;
  if (!baseAnnotation) {
    return null;
  }
  const metadata = {
    ...(baseAnnotation.metadata ?? {}),
    toolName: baseAnnotation.metadata?.toolName ?? "Unknown",
    source: "db",
    dbAnnotationId: record.id,
    annotationId: record.annotationId ?? record.id,
    instanceId: record.instanceId,
    seriesId,
    viewportId: viewportId ?? undefined,
  };
  baseAnnotation.metadata = metadata;
  const metadataRecord = baseAnnotation.metadata as unknown as
    | Record<string, unknown>
    | undefined;
  baseAnnotation.annotationUID =
    baseAnnotation.annotationUID ||
    (typeof metadataRecord?.annotationUID === "string"
      ? metadataRecord.annotationUID
      : undefined) ||
    record.annotationData?.annotationUID ||
    record.id;
  if (typeof baseAnnotation.isLocked !== "boolean") {
    baseAnnotation.isLocked = true;
  }
  return baseAnnotation;
};

interface AnnotationHistoryStacks {
  undoStack: AnnotationHistoryEntry[];
  redoStack: AnnotationHistoryEntry[];
}

interface UseAnnotationManagementProps {
  state: ViewerState;
  dispatch: React.Dispatch<ViewerAction>;
  viewportElementsRef: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
  showAnnotationsRef: React.MutableRefObject<boolean>;
}

export const useAnnotationManagement = ({
  state,
  dispatch,
  viewportElementsRef,
  showAnnotationsRef,
}: UseAnnotationManagementProps) => {
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
  
  const dbAnnotationsRenderedRef = useRef<Map<number, Set<string>>>(new Map());
  const annotationHistoryRef = useRef<Map<number, AnnotationHistoryStacks>>(
    new Map()
  );
  const annotationsCacheRef = useRef<
    LRUCache<string, ImageAnnotation[]>
  >(new LRUCache(SERIES_CACHE_MAX_ENTRIES));

  const ensureDbAnnotationTracker = useCallback(
    (viewport: number): Set<string> => {
      if (!dbAnnotationsRenderedRef.current.has(viewport)) {
        dbAnnotationsRenderedRef.current.set(viewport, new Set());
      }
      return dbAnnotationsRenderedRef.current.get(viewport)!;
    },
    []
  );

  const clearDbAnnotationsForViewport = useCallback((viewport: number) => {
    dbAnnotationsRenderedRef.current.delete(viewport);
  }, []);

  const unloadAnnotationsFromViewport = useCallback(
    (viewport: number, viewportElement: HTMLDivElement | null) => {
      if (!viewportElement) {
        return;
      }

      const tracker = dbAnnotationsRenderedRef.current.get(viewport);
      if (!tracker || tracker.size === 0) {
        return;
      }

      const annotationUIDs = Array.from(tracker);
      annotationUIDs.forEach((annotationId) => {
        try {
          // Get all annotations for all tool types
          const toolNames = Object.values(AnnotationType);
          for (const toolName of toolNames) {
            const annotations = annotation.state.getAnnotations(
              toolName,
              viewportElement
            );
            if (!annotations || annotations.length === 0) continue;

            annotations.forEach((ann) => {
              const metadata = ann.metadata as Record<string, unknown> | undefined;
              const dbAnnotationId = metadata?.dbAnnotationId as string | undefined;
              if (dbAnnotationId === annotationId && ann.annotationUID) {
                try {
                  annotation.state.removeAnnotation(ann.annotationUID);
                } catch (error) {
                  console.error("Failed to remove annotation", ann.annotationUID, error);
                }
              }
            });
          }
        } catch (error) {
          console.error("Error unloading annotation", annotationId, error);
        }
      });

      tracker.clear();
    },
    []
  );

  const ensureAnnotationHistoryStacks = useCallback(
    (viewport: number): AnnotationHistoryStacks => {
      if (!annotationHistoryRef.current.has(viewport)) {
        annotationHistoryRef.current.set(viewport, {
          undoStack: [],
          redoStack: [],
        });
      }
      return annotationHistoryRef.current.get(viewport)!;
    },
    []
  );

  const recordAnnotationHistoryEntry = useCallback(
    (viewport: number, entry: AnnotationHistoryEntry) => {
      if (!entry.annotationUID) {
        return;
      }
      const stacks = ensureAnnotationHistoryStacks(viewport);
      const sanitizedEntry = cloneHistoryEntry(entry);
      const existingIndex = stacks.undoStack.findIndex(
        (candidate) => candidate.annotationUID === sanitizedEntry.annotationUID
      );
      if (existingIndex !== -1) {
        stacks.undoStack.splice(existingIndex, 1);
      }
      stacks.undoStack.push(sanitizedEntry);
      stacks.redoStack = [];
    },
    [ensureAnnotationHistoryStacks]
  );

  const updateAnnotationHistoryEntry = useCallback(
    (viewport: number, annotationUID: string, snapshot: Annotation) => {
      if (!annotationUID) {
        return;
      }
      const stacks = ensureAnnotationHistoryStacks(viewport);
      const applyUpdate = (stack: AnnotationHistoryEntry[]) => {
        const index = stack.findIndex(
          (candidate) => candidate.annotationUID === annotationUID
        );
        if (index !== -1) {
          stack[index] = {
            ...stack[index],
            snapshot: cloneSnapshot(snapshot),
          };
        }
      };
      applyUpdate(stacks.undoStack);
      applyUpdate(stacks.redoStack);
    },
    [ensureAnnotationHistoryStacks]
  );

  const removeAnnotationHistoryEntry = useCallback(
    (viewport: number, annotationUID: string) => {
      if (!annotationUID) {
        return;
      }
      const stacks = ensureAnnotationHistoryStacks(viewport);
      const removeFromStack = (stack: AnnotationHistoryEntry[]) => {
        const index = stack.findIndex(
          (candidate) => candidate.annotationUID === annotationUID
        );
        if (index !== -1) {
          stack.splice(index, 1);
        }
      };
      removeFromStack(stacks.undoStack);
      removeFromStack(stacks.redoStack);
    },
    [ensureAnnotationHistoryStacks]
  );

  const clearAnnotationHistoryForViewport = useCallback((viewport: number) => {
    annotationHistoryRef.current.delete(viewport);
  }, []);

  const consumeUndoEntry = useCallback(
    (viewport: number): AnnotationHistoryEntry | null => {
      const stacks = annotationHistoryRef.current.get(viewport);
      if (!stacks || stacks.undoStack.length === 0) {
        return null;
      }
      const entry = stacks.undoStack.pop() ?? null;
      if (entry) {
        stacks.redoStack.push(entry);
        return entry;
      }
      return null;
    },
    []
  );

  const consumeRedoEntry = useCallback(
    (viewport: number): AnnotationHistoryEntry | null => {
      const stacks = annotationHistoryRef.current.get(viewport);
      if (!stacks || stacks.redoStack.length === 0) {
        return null;
      }
      const entry = stacks.redoStack.pop() ?? null;
      if (entry) {
        stacks.undoStack.push(entry);
        return entry;
      }
      return null;
    },
    []
  );

  const loadDatabaseAnnotationsForViewport = useCallback(
    async ({
      viewport,
      seriesId,
      viewportId,
      viewportElement,
      bailIfStale,
      forceReload = false,
      checkShowAnnotations = true,
    }: {
      viewport: number;
      seriesId: string;
      viewportId?: string;
      viewportElement: HTMLDivElement | null;
      bailIfStale?: () => boolean;
      forceReload?: boolean;
      checkShowAnnotations?: boolean;
    }) => {
      if (!viewportElement || !seriesId) {
        return;
      }

      // Only load if annotations are enabled (unless explicitly bypassed)
      if (checkShowAnnotations && !showAnnotationsRef.current) {
        return;
      }

      if (bailIfStale?.()) {
        return;
      }

      // Check cache first
      let annotations: ImageAnnotation[] | undefined;
      if (!forceReload) {
        annotations = annotationsCacheRef.current.get(seriesId);
      }

      // If not in cache, fetch from API
      if (!annotations) {
        try {
          const response = await fetchAnnotationsBySeries(seriesId).unwrap();
          if (bailIfStale?.()) {
            return;
          }
          annotations = extractApiData<ImageAnnotation>(response);
          if (!Array.isArray(annotations) || annotations.length === 0) {
            // Cache empty array to avoid re-fetching
            annotationsCacheRef.current.set(seriesId, []);
            return;
          }
          // Cache the annotations
          annotationsCacheRef.current.set(seriesId, annotations);
        } catch (error) {
          if (!bailIfStale?.()) {
            console.error(
              "Failed to load annotations for series",
              seriesId,
              error
            );
          }
          return;
        }
      }

      if (bailIfStale?.()) {
        return;
      }

      const addAnnotationApi = (
        annotation.state as unknown as {
          addAnnotation?: (
            annotation: Annotation,
            element: HTMLDivElement
          ) => void;
        }
      ).addAnnotation;

      if (typeof addAnnotationApi !== "function") {
        return;
      }

      const tracker = ensureDbAnnotationTracker(viewport);

      annotations.forEach((record) => {
        if (!record?.id || tracker.has(record.id)) {
          return;
        }
        const payload = buildDatabaseAnnotationPayload(
          record,
          seriesId,
          viewportId
        );
        if (!payload || bailIfStale?.()) {
          return;
        }
        try {
          addAnnotationApi(payload, viewportElement);
          tracker.add(record.id);

          // Apply settings (color and lock state) after annotation is added
          if (payload.annotationUID) {
            const annotationUID = payload.annotationUID; // Store for closure

            // Retry mechanism: annotation might not be immediately available
            const applySettings = (retries = 3) => {
              requestAnimationFrame(() => {
                try {
                  // Verify annotation exists before applying settings
                  const allAnnotations = annotation.state.getAllAnnotations();
                  const exists = allAnnotations.some(a => a.annotationUID === annotationUID);

                  if (exists) {
                    // Apply color if available
                    if (record.colorCode) {
                      annotation.config.style.setAnnotationStyles(annotationUID, {
                        color: record.colorCode,
                      });
                    }

                    // Ensure database annotations are locked by default
                    try {
                      annotation.locking.setAnnotationLocked(annotationUID, true);
                    } catch (lockError) {
                      console.warn(`Failed to lock annotation ${record.id}:`, lockError);
                    }
                  } else if (retries > 0) {
                    // Retry if annotation not found yet
                    setTimeout(() => applySettings(retries - 1), 50);
                  } else {
                    console.warn(`Failed to apply settings to annotation ${record.id}: annotation not found after retries`);
                  }
                } catch (error) {
                  if (retries > 0) {
                    setTimeout(() => applySettings(retries - 1), 50);
                  } else {
                    console.warn(`Failed to apply settings to annotation ${record.id}:`, error);
                  }
                }
              });
            };
            applySettings();
          }
        } catch (addError) {
          console.error("Failed to render annotation", record.id, addError);
        }
      });
    },
    [ensureDbAnnotationTracker, fetchAnnotationsBySeries, showAnnotationsRef]
  );

  const reloadAnnotationsForSeries = useCallback(
    async (seriesId: string) => {
      if (!seriesId) return;

      annotationsCacheRef.current.set(seriesId, []);

      state.viewportIds.forEach((viewportId, viewportIndex) => {
        const viewportSeries = state.viewportSeries.get(viewportIndex);
        if (viewportSeries?.id === seriesId) {
          const element = viewportElementsRef.current.get(viewportIndex);
          if (element && viewportId) {
            const allAnnotations = annotation.state.getAllAnnotations();

            allAnnotations.forEach((ann) => {
              const metadata = ann.metadata as any;
              if (metadata?.source === "db" && metadata?.seriesId === seriesId) {
                try {
                  if (ann.annotationUID) {
                    annotation.state.removeAnnotation(ann.annotationUID);
                  }
                } catch (error) {
                  console.error('Error removing db annotation:', error);
                }
              }
            });

            dbAnnotationsRenderedRef.current.delete(viewportIndex);

            loadDatabaseAnnotationsForViewport({
              viewport: viewportIndex,
              seriesId,
              viewportId,
              viewportElement: element,
              forceReload: true,
              checkShowAnnotations: false,
            });

            const renderingEngineId = state.renderingEngineIds.get(viewportIndex);
            if (renderingEngineId) {
              try {
                // We'd need to get the engine here, but importing it might be circular or messy. 
                // However, viewerContext usually handles rendering. 
                // For now, we'll assume the caller (ViewerContext) handles the render update or we trigger it via event.
              } catch (error) {
                console.error('Error re-rendering viewport:', error);
              }
            }
          }
        }
      });
    },
    [state.viewportIds, state.viewportSeries, state.renderingEngineIds, loadDatabaseAnnotationsForViewport, viewportElementsRef]
  );

  const clearAnnotations = useCallback(() => {
    console.log(
      "Clear annotations requested from context - clearing all viewports"
    );
    // Clear history for all viewports
    state.viewportSeries.forEach((_, viewportIndex) => {
      clearAnnotationHistoryForViewport(viewportIndex);
    });
    // Publish event via pub/sub service
    viewerEventService.publish(ViewerEvents.CLEAR_ANNOTATIONS);
  }, [state.viewportSeries, clearAnnotationHistoryForViewport]);

  const clearViewportAnnotations = useCallback(() => {
    console.log(
      "Clear viewport annotations requested from context - clearing active viewport only"
    );
    clearAnnotationHistoryForViewport(state.activeViewport);
    const activeViewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    viewerEventService.publish(ViewerEvents.CLEAR_VIEWPORT_ANNOTATIONS, {
      activeViewportId,
    });
  }, [state.activeViewport, state.viewportIds, clearAnnotationHistoryForViewport]);

  const undoAnnotation = useCallback(() => {
    const viewportIndex = state.activeViewport;
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeUndoEntry(viewportIndex);
    viewerEventService.publish(ViewerEvents.UNDO_ANNOTATION, {
      activeViewportId,
      entry: historyEntry ? cloneHistoryEntry(historyEntry) : undefined,
    });
  }, [state.activeViewport, state.viewportIds, consumeUndoEntry]);

  const redoAnnotation = useCallback(() => {
    const viewportIndex = state.activeViewport;
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeRedoEntry(viewportIndex);
    if (!historyEntry) {
      return;
    }
    viewerEventService.publish(ViewerEvents.REDO_ANNOTATION, {
      activeViewportId,
      entry: cloneHistoryEntry(historyEntry),
    });
  }, [state.activeViewport, state.viewportIds, consumeRedoEntry]);

  const toggleAnnotations = useCallback(() => {
    const newShowAnnotations = !state.showAnnotations;

    showAnnotationsRef.current = newShowAnnotations;
    dispatch({ type: "TOGGLE_ANNOTATIONS" });

    const currentViewportSeries = state.viewportSeries;
    const currentViewportIds = state.viewportIds;

    if (newShowAnnotations) {
      currentViewportSeries.forEach((series, viewport) => {
        const viewportElement = viewportElementsRef.current.get(viewport);
        const viewportId = currentViewportIds.get(viewport);
        if (viewportElement && series?.id) {
          void loadDatabaseAnnotationsForViewport({
            viewport,
            seriesId: series.id,
            viewportId,
            viewportElement,
            forceReload: false,
            checkShowAnnotations: false,
          });
        }
      });
    } else {
      currentViewportSeries.forEach((series, viewport) => {
        const viewportElement = viewportElementsRef.current.get(viewport);
        if (viewportElement) {
          unloadAnnotationsFromViewport(viewport, viewportElement);
        }
      });
    }

    viewerEventService.publish(ViewerEvents.TOGGLE_ANNOTATIONS, {
      showAnnotations: newShowAnnotations,
    });

  }, [state.showAnnotations, state.viewportSeries, state.viewportIds, loadDatabaseAnnotationsForViewport, unloadAnnotationsFromViewport, dispatch, showAnnotationsRef, viewportElementsRef]);

  return {
    ensureDbAnnotationTracker,
    clearDbAnnotationsForViewport,
    unloadAnnotationsFromViewport,
    recordAnnotationHistoryEntry,
    updateAnnotationHistoryEntry,
    removeAnnotationHistoryEntry,
    clearAnnotationHistoryForViewport,
    loadDatabaseAnnotationsForViewport,
    reloadAnnotationsForSeries,
    clearAnnotations,
    clearViewportAnnotations,
    undoAnnotation,
    redoAnnotation,
    toggleAnnotations,
  };
};
