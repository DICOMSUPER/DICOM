"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  eventTarget,
  imageLoader,
  metaData,
  getRenderingEngine,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  init as csToolsInit,
  Enums as ToolEnums,
  utilities as csToolsUtilities,
} from "@cornerstonejs/tools";
import { resolveDicomImageUrl } from "@/common/utils/dicom/resolveDicomImageUrl";
import { useLazyGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { extractApiData } from "@/common/utils/api";
import { DicomSeries } from "@/common/interfaces/image-dicom/dicom-series.interface";
import { viewerEventService, ViewerEvents } from "@/services/ViewerEventService";
import viewportStateManager from "@/common/utils/viewportStateManager";
import { ViewportStatus } from "@/common/types/viewport-state";
import {
  ensureViewportLabelmapSegmentation,
  segmentationIdForViewport,
  clearViewportLabelmapSegmentation,
} from "./viewer-context/segmentation-helper";
import { toast } from "sonner";
import { batchedRender } from "@/common/utils/renderBatcher";

import {
  viewerReducer,
  defaultState,
  ToolType,
  GridLayout,
  ViewportTransform,
  ViewportRuntimeState,
  SegmentationLayerMetadata,
  SegmentationLayerData,
  ViewerState,
  AnnotationHistoryEntry,
  ViewerAction,
} from "./viewer-context/viewer-reducer";

import { useAnnotationManagement } from "./viewer-context/useAnnotationManagement";
import { useSegmentationManagement } from "./viewer-context/useSegmentationManagement";

export type {
  ToolType,
  GridLayout,
  ViewportTransform,
  ViewportRuntimeState,
  SegmentationLayerMetadata,
  SegmentationLayerData,
  ViewerState,
  AnnotationHistoryEntry,
};

import type { Annotation } from "@cornerstonejs/tools/types";
import type { SegmentationSnapshot } from "./viewer-context/segmentation-helper";

interface ViewerContextType {
  state: ViewerState;
  setActiveTool: (tool: ToolType) => void;
  setLayout: (layout: GridLayout) => void;
  setActiveViewport: (viewport: number) => void;
  resetView: () => void;
  rotateViewport: (degrees: number) => void;
  invertViewport: () => void;
  clearAnnotations: () => void;
  clearViewportAnnotations: () => void;
  toggleAnnotations: () => void;
  undoAnnotation: () => void;
  redoAnnotation: () => void;
  undoSegmentation: () => void;
  redoSegmentation: () => void;
  recordAnnotationHistoryEntry: (viewport: number, entry: AnnotationHistoryEntry) => void;
  updateAnnotationHistoryEntry: (viewport: number, annotationUID: string, snapshot: Annotation) => void;
  removeAnnotationHistoryEntry: (viewport: number, annotationUID: string) => void;
  setViewportSeries: (viewport: number, series: DicomSeries) => void;
  getViewportSeries: (viewport: number) => DicomSeries | undefined;
  getViewportTransform: (viewport: number) => ViewportTransform;
  setViewportId: (viewport: number, viewportId: string) => void;
  getViewportId: (viewport: number) => string | undefined;
  setRenderingEngineId: (viewport: number, renderingEngineId: string) => void;
  getRenderingEngineId: (viewport: number) => string | undefined;
  registerViewportElement: (viewport: number, element: HTMLDivElement | null) => void;
  disposeViewport: (viewport: number) => void;
  loadSeriesIntoViewport: (viewport: number, series?: DicomSeries | null, options?: { studyId?: string | null; forceRebuild?: boolean }) => Promise<void>;
  getViewportState: (viewport: number) => ViewportRuntimeState;
  getStackViewport: (viewport: number) => Types.IStackViewport | null;
  goToFrame: (viewport: number, frameIndex: number) => void;
  nextFrame: (viewport: number) => void;
  prevFrame: (viewport: number) => void;
  refreshViewport: (viewport: number) => Promise<void>;
  reloadAnnotationsForSeries: (seriesId: string) => Promise<void>;
  diagnosisViewport: (viewport: number, options?: { modelId: string; modelName: string; versionName: string }) => Promise<void>;
  clearAIAnnotations: (viewport: number) => void;
  toggleSegmentationControlPanel: () => void;
  isSegmentationControlPanelOpen: () => boolean;
  addSegmentationLayer: () => void;
  deleteSegmentationLayer: (layerId: string) => void;
  selectSegmentationLayer: (layerId: string) => void;
  updateSegmentationLayerMetadata: (layerId: string, updates: { name?: string; notes?: string }) => void;
  toggleSegmentationLayerVisibility: (layerId: string) => void;
  getSegmentationLayers: () => Array<{
    id: string;
    name: string;
    notes?: string;
    instanceId?: string;
    createdAt: number;
    active: boolean;
    visible: boolean;
    origin: "local" | "database";
    snapshots: SegmentationSnapshot[];
  }>;
  getCurrentSegmentationLayerIndex: () => number;
  getSelectedLayerCount: () => number;
  isSegmentationVisible: () => boolean;
  toggleSegmentationView: () => void;
  getSegmentationHistoryState: () => { canUndo: boolean; canRedo: boolean };
  getCurrentSegmentationSnapshot: (layerIndex?: number) => SegmentationSnapshot | null;
  getCurrentLayerSnapshot: (layerIndex?: number) => SegmentationSnapshot | null;
  getAllLayerSnapshots: (layerId: string) => SegmentationSnapshot[];
  getAllCurrentLayerSnapshots: () => SegmentationSnapshot[];
  refetchSegmentationLayers: (excludeLayerIds?: string[]) => Promise<void>;
  setSegmentationBrushSize: (radius: number, isInMM?: boolean) => void;
  getImageIdToInstanceMap: (viewport: number) => Record<string, string>;
  saveSegmentationSnapshot: (layerId: string, snapshot: SegmentationSnapshot) => void;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

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

const SERIES_CACHE_MAX_ENTRIES = 50;

const canReuseViewportStack = (
  existingViewport: Types.IStackViewport | undefined,
  newImageIds: string[],
  forceRebuild: boolean
) => {
  if (!existingViewport || forceRebuild) {
    return false;
  }
  if (!existingViewport.getImageIds) {
    return false;
  }
  const currentIds = existingViewport.getImageIds() ?? [];
  if (currentIds.length === 0 || newImageIds.length === 0) {
    return false;
  }
  if (currentIds.length !== newImageIds.length) {
    return false;
  }
  const firstMatches = currentIds[0] === newImageIds[0];
  const lastMatches =
    currentIds[currentIds.length - 1] === newImageIds[newImageIds.length - 1];
  return firstMatches && lastMatches;
};


// Default objects for initial state safety
const defaultTransform: ViewportTransform = {
  rotation: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

const defaultViewportRuntimeState: ViewportRuntimeState = {
  isLoading: false,
  loadingProgress: 0,
  currentFrame: 0,

  totalFrames: 1,
  viewportReady: false,
  seriesId: undefined,
  studyId: undefined,
};

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(viewerReducer, defaultState);
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();

  const viewportElementsRef = useRef<Map<number, HTMLDivElement | null>>(
    new Map()
  );
  const viewportRefs = useRef<Map<number, Types.IStackViewport>>(new Map());
  const viewportListenersRef = useRef<
    Map<
      number,
      {
        imageRendered?: (event: Event) => void;
        segmentationModified?: (event: Event) => void;
      }
    >
  >(new Map());
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
  const currentInstancesRef = useRef<Map<number, any[]>>(new Map());
  const imageIdInstanceMapRef = useRef<Map<number, Record<string, string>>>(
    new Map()
  );

  const seriesInstancesCacheRef = useRef<
    LRUCache<string, Record<string, any[]>>
  >(new LRUCache(SERIES_CACHE_MAX_ENTRIES));

  const cornerstoneInitializedRef = useRef(false);
  const cornerstoneInitPromiseRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);
  const renderingEngineIdsRef = useRef<Map<number, string>>(new Map());
  const showAnnotationsRef = useRef(state.showAnnotations);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    showAnnotationsRef.current = state.showAnnotations;
  }, [state.showAnnotations]);

  // --- Helpers to avoid circular deps with hooks ---
  // We define these getters here so we can pass them to hooks if needed, 
  // or use them in ViewerContext functions that hooks call (if any).
  // Actually hook calls mostly depend on internal logic or simple state.

  const getViewportSeries = useCallback(
    (viewport: number): DicomSeries | undefined => {
      return state.viewportSeries.get(viewport);
    },
    [state.viewportSeries]
  );

  // --- Hooks Initialization ---

  const {
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
  } = useAnnotationManagement({
    state,
    dispatch,
    viewportElementsRef,
    showAnnotationsRef,
  });

  const {
    resetSegmentationHistoryForViewport,
    clearLayerHistoryAcrossViewports,
    addSegmentationLayer,
    deleteSegmentationLayer,
    selectSegmentationLayer,
    updateSegmentationLayerMetadata,
    toggleSegmentationLayerVisibility,
    getSegmentationLayers,
    getCurrentSegmentationLayerIndex,
    getSelectedLayerCount,
    isSegmentationVisible,
    toggleSegmentationView,
    getSegmentationHistoryState,
    getCurrentSegmentationSnapshot,
    getCurrentLayerSnapshot,
    getAllLayerSnapshots,
    getAllCurrentLayerSnapshots,
    refetchSegmentationLayers,
    loadDatabaseSegmentationForViewports,
    setSegmentationBrushSize,
    undoSegmentation,
    redoSegmentation,
    handleSegmentationModified,
  } = useSegmentationManagement({
    state,
    dispatch,
    viewportRefs,
    imageIdInstanceMapRef,
    renderingEngineIdsRef,
    viewportElementsRef,
    getViewportSeries,
  });

  // --- Common Viewport Logic ---

  const getViewportRuntimeState = useCallback(
    (viewport: number): ViewportRuntimeState => {
      return (
        state.viewportRuntimeStates.get(viewport) ?? {
          ...defaultViewportRuntimeState,
        }
      );
    },
    [state.viewportRuntimeStates]
  );

  const setViewportRuntimeState = useCallback(
    (
      viewport: number,
      updater:
        | Partial<ViewportRuntimeState>
        | ((prev: ViewportRuntimeState) => ViewportRuntimeState)
    ) => {
      const runtimeUpdater =
        typeof updater === "function"
          ? (updater as (prev: ViewportRuntimeState) => ViewportRuntimeState)
          : (prev: ViewportRuntimeState) => ({ ...prev, ...updater });
      dispatch({
        type: "UPDATE_VIEWPORT_RUNTIME",
        viewport,
        updater: runtimeUpdater,
      });
    },
    []
  );

  const getStackViewport = useCallback(
    (viewport: number): Types.IStackViewport | null => {
      return viewportRefs.current.get(viewport) ?? null;
    },
    []
  );

  const removeViewportListeners = useCallback((viewport: number) => {
    const listeners = viewportListenersRef.current.get(viewport);
    const element = viewportElementsRef.current.get(viewport);
    if (listeners?.imageRendered && element) {
      element.removeEventListener(
        Enums.Events.IMAGE_RENDERED as unknown as string,
        listeners.imageRendered
      );
    }
    if (listeners?.segmentationModified) {
      eventTarget.removeEventListener(
        ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
        listeners.segmentationModified
      );
    }
    viewportListenersRef.current.delete(viewport);
  }, []);

  const addViewportListeners = useCallback(
    (viewport: number, stackViewport: Types.IStackViewport) => {
      removeViewportListeners(viewport);

      const updateFrameIndex = () => {
        const currentImageIdIndex = stackViewport.getCurrentImageIdIndex();
        const total = stackViewport.getImageIds()?.length ?? 0;
        const validIndex = Math.max(0, currentImageIdIndex);
        setViewportRuntimeState(viewport, (prev) => ({
          ...prev,
          currentFrame: validIndex,
          totalFrames: total,
        }));

        // Ensure segmentation is rendered on the current frame
        try {
          const currentViewport = getStackViewport(viewport);
          if (currentViewport === stackViewport) {
            batchedRender(stackViewport);
          }
        } catch (error) {
        }
      };

      const onSegmentationModified = (evt: Event) => {
        handleSegmentationModified(viewport, evt);
      };

      const element = viewportElementsRef.current.get(viewport);
      element?.addEventListener(
        Enums.Events.IMAGE_RENDERED as unknown as string,
        updateFrameIndex
      );
      eventTarget.addEventListener(
        ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
        onSegmentationModified
      );

      viewportListenersRef.current.set(viewport, {
        imageRendered: updateFrameIndex,
        segmentationModified: onSegmentationModified,
      });
    },
    [
      removeViewportListeners,
      setViewportRuntimeState,
      handleSegmentationModified,
      getStackViewport
    ]
  );

  const getTotalFrames = useCallback(async (imageId: string) => {
    try {
      await imageLoader.loadImage(imageId);
      const multiFrameModule = metaData.get("multiframeModule", imageId);
      const numberOfFrames = multiFrameModule?.NumberOfFrames;
      if (
        numberOfFrames &&
        typeof numberOfFrames === "number" &&
        numberOfFrames > 0
      ) {
        return numberOfFrames;
      }
      return 1;
    } catch (_error) {
      return 1;
    }
  }, []);

  const buildImageIdsFromInstances = useCallback(
    async (instances: any[]) => {
      if (!Array.isArray(instances) || instances.length === 0) {
        return {
          imageIds: [] as string[],
          imageIdToInstance: {} as Record<string, string>,
        };
      }

      const imageIdToInstance: Record<string, string> = {};
      const imageIdsPromises = instances.map(async (instance: any) => {
        if (!instance?.filePath) {
          return [];
        }

        const resolvedUrl = resolveDicomImageUrl(
          instance.filePath,
          instance.fileName
        );
        if (!resolvedUrl) {
          return [];
        }

        const instanceBaseId = `wadouri:${resolvedUrl}`;

        try {
          const numberOfFrames = await getTotalFrames(instanceBaseId);
          const totalFrames =
            typeof numberOfFrames === "number" && numberOfFrames > 0
              ? numberOfFrames
              : 1;

          return Array.from({ length: totalFrames }, (_, index) => {
            const frameId = `${instanceBaseId}?frame=${index + 1}`;
            imageIdToInstance[frameId] = instance.id;
            return frameId;
          });
        } catch (_error) {
          const fallbackId = `${instanceBaseId}?frame=1`;
          imageIdToInstance[fallbackId] = instance.id;
          return [fallbackId];
        }
      });

      const imageIdsArrays = await Promise.all(imageIdsPromises);
      const rawImageIds = imageIdsArrays
        .flat()
        .filter((id: string): id is string => Boolean(id));

      // Ensure every frame has a unique imageId (some sources might reuse ids across frames)
      const seen = new Map<string, number>();
      const imageIds: string[] = [];
      rawImageIds.forEach((id) => {
        if (!id) return;
        const count = seen.get(id) ?? 0;
        if (count === 0) {
          seen.set(id, 1);
          imageIds.push(id);
        } else {
          const uniqueId = `${id}&dup=${count + 1}`;
          seen.set(id, count + 1);
          imageIds.push(uniqueId);
          // keep instance mapping aligned
          const instanceId = imageIdToInstance[id] || imageIdToInstance[`${id}?frame=1`] || imageIdToInstance[id.split("?")[0]];
          if (instanceId) {
            imageIdToInstance[uniqueId] = instanceId;
          }
        }
      });

      return { imageIds, imageIdToInstance };
    },
    [getTotalFrames]
  );

  const prefetchImages = useCallback(
    async (
      imageIds: string[],
      startIndex: number,
      countAhead = 5,
      concurrency = 3
    ) => {
      if (
        !Array.isArray(imageIds) ||
        imageIds.length === 0 ||
        concurrency <= 0
      ) {
        return;
      }

      const endIndex = Math.min(startIndex + countAhead + 1, imageIds.length);
      const queue: string[] = [];

      for (let i = startIndex + 1; i < endIndex; i += 1) {
        const imageId = imageIds[i];
        if (imageId) {
          queue.push(imageId);
        }
      }

      const processBatch = async (batch: string[]) => {
        await Promise.all(
          batch.map((imageId) =>
            imageLoader.loadAndCacheImage(imageId).catch(() => undefined)
          )
        );
      };

      for (let i = 0; i < queue.length; i += concurrency) {
        if (!mountedRef.current) {
          break;
        }
        const batch = queue.slice(i, i + concurrency);
        if (batch.length === 0) {
          continue;
        }
        try {
          await processBatch(batch);
        } catch {
        }
      }
    },
    []
  );

  const loadSeriesInstances = useCallback(
    async (studyId: string | null | undefined, seriesId: string) => {
      const cacheKey = studyId ?? "__global__";
      const studyCache = seriesInstancesCacheRef.current.get(cacheKey) ?? {};
      if (studyCache[seriesId]) {
        return studyCache[seriesId];
      }

      try {
        const instancesResponse = await fetchInstancesByReference({
          id: seriesId,
          type: "series",
          params: { page: 1, limit: 9999 },
        }).unwrap();

        const instances = extractApiData<any>(instancesResponse);
        const nextCache = { ...studyCache, [seriesId]: instances };
        seriesInstancesCacheRef.current.set(cacheKey, nextCache);
        return instances;
      } catch (_error) {
        return [];
      }
    },
    [fetchInstancesByReference]
  );

  const setActiveTool = useCallback(
    (tool: ToolType) => {
      const activeViewportId = state.viewportIds.get(state.activeViewport);
      const toolGroupId = activeViewportId ? `toolGroup_${activeViewportId}` : null;

      if (activeViewportId) {
        const viewportState = viewportStateManager.getState(activeViewportId);

        if (viewportState) {
          if (viewportState.status === ViewportStatus.INITIALIZING) {
            toast.info("Viewport is initializing, please wait...");
            return;
          }

          if (viewportState.status === ViewportStatus.LOADING) {
            toast.info("Viewport is loading images, please wait...");
            return;
          }

          if (viewportState.status !== ViewportStatus.READY) {
            toast.warning(`Viewport is not ready, please wait...`);
          }
        }
      }

      const segmentationTools: ToolType[] = [
        "Brush",
        "CircleScissors",
        "RectangleScissors",
        "SphereScissors",
        "Eraser",
      ];

      if (
        segmentationTools.includes(tool) &&
        state.segmentationLayers.size === 0
      ) {
        toast.warning(
          "Cannot activate segmentation tool: No layers available. Please create a layer first."
        );
        return;
      }

      if (
        segmentationTools.includes(tool) &&
        !state.selectedSegmentationLayer
      ) {
        toast.warning(
          "Cannot activate segmentation tool: No layer selected. Please select a layer first."
        );
        return;
      }

      if (segmentationTools.includes(tool)) {
        // Ensure the tool group has the active segmentation/segment registered so Eraser/Brush work
        const segUtilsAny = (csToolsUtilities as any)?.segmentation;
        const segmentationId = activeViewportId
          ? segmentationIdForViewport(activeViewportId)
          : undefined;
        const isEraser = tool === "Eraser";
        try {
          if (toolGroupId && segmentationId) {
            if (
              typeof segUtilsAny?.addSegmentationRepresentations === "function"
            ) {
              segUtilsAny.addSegmentationRepresentations(toolGroupId, [
                {
                  segmentationId,
                  type: ToolEnums.SegmentationRepresentations.Labelmap,
                },
              ]);
            }
            if (
              typeof segUtilsAny?.setActiveSegmentationRepresentation === "function"
            ) {
              segUtilsAny.setActiveSegmentationRepresentation(
                toolGroupId,
                segmentationId
              );
            }
            if (typeof segUtilsAny?.setActiveSegmentation === "function") {
              segUtilsAny.setActiveSegmentation(toolGroupId, segmentationId);
            }
            if (
              typeof segUtilsAny?.setActiveSegmentationForViewport === "function" &&
              activeViewportId
            ) {
              segUtilsAny.setActiveSegmentationForViewport(
                activeViewportId,
                segmentationId
              );
            }
            if (
              typeof segUtilsAny?.setActiveSegmentationForToolGroup === "function"
            ) {
              segUtilsAny.setActiveSegmentationForToolGroup(
                toolGroupId,
                segmentationId
              );
            }
            if (typeof segUtilsAny?.setActiveSegmentIndex === "function") {
              // Use segment 0 for eraser (background), otherwise default to 1
              segUtilsAny.setActiveSegmentIndex(toolGroupId, isEraser ? 0 : 1);
            }
            if (
              typeof segUtilsAny?.setActiveSegmentIndexForViewport === "function" &&
              activeViewportId
            ) {
              segUtilsAny.setActiveSegmentIndexForViewport(
                activeViewportId,
                isEraser ? 0 : 1
              );
            }
          }
        } catch (err) {
          console.debug("[Segmentation] Failed to set active segmentation for tool group", err);
        }
      }

      dispatch({ type: "SET_ACTIVE_TOOL", tool });
    },
    [dispatch, state.selectedSegmentationLayer, state.segmentationLayers, state.activeViewport, state.viewportIds]
  );

  const setLayout = useCallback((layout: GridLayout) => {
    dispatch({ type: "SET_LAYOUT", layout, recordHistory: true });
  }, [dispatch]);

  const setActiveViewport = useCallback(
    (viewport: number) => {
      dispatch({ type: "SET_ACTIVE_VIEWPORT", viewport });
    },
    [dispatch]
  );

  const getViewportTransform = useCallback(
    (viewport: number): ViewportTransform => {
      return state.viewportTransforms.get(viewport) || defaultTransform;
    },
    [state.viewportTransforms]
  );

  const setViewportId = useCallback(
    (viewport: number, viewportId: string) => {
      dispatch({
        type: "SET_VIEWPORT_ID",
        viewport,
        viewportId: viewportId || undefined,
      });
    },
    [dispatch]
  );

  const getViewportId = useCallback(
    (viewport: number): string | undefined => {
      return state.viewportIds.get(viewport);
    },
    [state.viewportIds]
  );

  const setRenderingEngineId = useCallback(
    (viewport: number, renderingEngineId: string) => {
      if (renderingEngineId) {
        renderingEngineIdsRef.current.set(viewport, renderingEngineId);
      } else {
        renderingEngineIdsRef.current.delete(viewport);
      }
      dispatch({
        type: "SET_RENDERING_ENGINE_ID",
        viewport,
        renderingEngineId: renderingEngineId || undefined,
      });
    },
    [dispatch]
  );

  const getRenderingEngineId = useCallback(
    (viewport: number): string | undefined => {
      return state.renderingEngineIds.get(viewport);
    },
    [state.renderingEngineIds]
  );

  const registerViewportElement = useCallback(
    (viewport: number, element: HTMLDivElement | null) => {
      if (element) {
        viewportElementsRef.current.set(viewport, element);
      } else {
        removeViewportListeners(viewport);
        viewportElementsRef.current.delete(viewport);
        viewportRefs.current.delete(viewport);
        imageIdInstanceMapRef.current.delete(viewport);
        currentInstancesRef.current.delete(viewport);
      }
    },
    [removeViewportListeners]
  );

  const ensureCornerstoneInitialized = useCallback(async () => {
    if (cornerstoneInitializedRef.current) {
      return;
    }

    if (!cornerstoneInitPromiseRef.current) {
      cornerstoneInitPromiseRef.current = (async () => {
        await csRenderInit();
        await csToolsInit();
        const { init: dicomImageLoaderInit } = await import(
          "@cornerstonejs/dicom-image-loader"
        );
        const maxWorkers =
          typeof navigator !== "undefined" &&
            typeof navigator.hardwareConcurrency === "number"
            ? Math.min(Math.max(navigator.hardwareConcurrency - 1, 1), 6)
            : 4;
        dicomImageLoaderInit({ maxWebWorkers: maxWorkers });
        cornerstoneInitializedRef.current = true;
      })().catch((error) => {
        cornerstoneInitializedRef.current = false;
        cornerstoneInitPromiseRef.current = null;
        throw error;
      });
    }

    await cornerstoneInitPromiseRef.current;
  }, []);

  const disposeViewport = useCallback(
    (viewport: number) => {
      removeViewportListeners(viewport);
      viewportRefs.current.delete(viewport);
      imageIdInstanceMapRef.current.delete(viewport);
      currentInstancesRef.current.delete(viewport);
      const controller = abortControllersRef.current.get(viewport);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(viewport);
      }

      dispatch({ type: "RESET_VIEWPORT_RUNTIME", viewport });

      const element = viewportElementsRef.current.get(viewport);
      if (element) {
        element.removeAttribute("data-enabled-element");
      }

      const engineId = getRenderingEngineId(viewport);
      const viewportId = getViewportId(viewport);

      if (viewportId) {
        // Transition viewport to disposing state
        try {
          viewportStateManager.transition(viewportId, ViewportStatus.DISPOSING);
        } catch (error) {
          console.debug('Could not transition viewport to disposing');
        }

        clearViewportLabelmapSegmentation(viewportId);
      }

      if (engineId) {
        try {
          const engine = getRenderingEngine(engineId);
          if (engine && viewportId) {
            try {
              // Check if the viewport actually exists before disabling
              const viewport = engine.getViewport(viewportId);
              if (viewport) {
                engine.disableElement(viewportId);
              }
            } catch (_error) {
              console.debug(`Skipping disableElement for ${viewportId}:`, _error);
            }
            // Check if any other viewports are using this engine
            // Use ref to avoid stale closure issues
            let engineInUse = false;
            for (const [otherViewport, otherEngineId] of renderingEngineIdsRef.current.entries()) {
              if (otherViewport !== viewport && otherEngineId === engineId) {
                engineInUse = true;
                break;
              }
            }

            // Only destroy if no other viewports are using this engine
            if (!engineInUse) {
              try {
                engine.destroy();
              } catch (destroyError) {
                console.warn("Error destroying rendering engine:", destroyError);
              }
            }
          } else if (engine && !viewportId) {
            // No viewport ID means we should destroy the engine
            try {
              engine.destroy();
            } catch (destroyError) {
              console.warn("Error destroying rendering engine:", destroyError);
            }
          }
        } catch (_error) {
        }
      }

      setRenderingEngineId(viewport, "");
      setViewportId(viewport, "");
      clearAnnotationHistoryForViewport(viewport);
      clearDbAnnotationsForViewport(viewport);
      resetSegmentationHistoryForViewport(viewport);

      // Final disposal of viewport state
      if (viewportId) {
        try {
          viewportStateManager.dispose(viewportId);
        } catch (error) {
          console.debug('Could not dispose viewport state');
        }
      }
    },
    [
      getRenderingEngineId,
      getViewportId,
      removeViewportListeners,
      setRenderingEngineId,
      setViewportId,
      clearAnnotationHistoryForViewport,
      clearDbAnnotationsForViewport,
      resetSegmentationHistoryForViewport,
    ]
  );

  const goToFrame = useCallback(
    (viewport: number, frameIndex: number) => {
      const stackViewport = viewportRefs.current.get(viewport);
      if (!stackViewport || typeof stackViewport.getImageIds !== "function") {
        return;
      }

      const imageIds = stackViewport.getImageIds();
      const maxIndex = imageIds.length - 1;
      if (maxIndex < 0) {
        return;
      }

      let newIndex = frameIndex;
      if (newIndex > maxIndex) newIndex = maxIndex;
      if (newIndex < 0) newIndex = 0;

      try {
        if (
          typeof stackViewport.setImageIdIndex === "function" &&
          typeof stackViewport.render === "function"
        ) {
          stackViewport.setImageIdIndex(newIndex);
          batchedRender(stackViewport);
          prefetchImages(imageIds, newIndex);
          setViewportRuntimeState(viewport, (prev) => ({
            ...prev,
            currentFrame: newIndex,
            totalFrames: imageIds.length,
          }));
        }
      } catch (_error) {
      }
    },
    [prefetchImages, setViewportRuntimeState]
  );

  const nextFrame = useCallback(
    (viewport: number) => {
      const stackViewport = viewportRefs.current.get(viewport);
      if (!stackViewport || typeof stackViewport.getImageIds !== "function") {
        return;
      }

      const imageIds = stackViewport.getImageIds();
      if (imageIds.length <= 1) {
        return;
      }

      const currentIndex =
        typeof stackViewport.getCurrentImageIdIndex === "function"
          ? stackViewport.getCurrentImageIdIndex()
          : getViewportRuntimeState(viewport).currentFrame;

      const nextIndex =
        currentIndex >= imageIds.length - 1 ? 0 : currentIndex + 1;
      goToFrame(viewport, nextIndex);
    },
    [getViewportRuntimeState, goToFrame]
  );

  const prevFrame = useCallback(
    (viewport: number) => {
      const stackViewport = viewportRefs.current.get(viewport);
      if (!stackViewport || typeof stackViewport.getImageIds !== "function") {
        return;
      }

      const imageIds = stackViewport.getImageIds();
      if (imageIds.length <= 1) {
        return;
      }

      const currentIndex =
        typeof stackViewport.getCurrentImageIdIndex === "function"
          ? stackViewport.getCurrentImageIdIndex()
          : getViewportRuntimeState(viewport).currentFrame;

      const prevIndex =
        currentIndex <= 0 ? imageIds.length - 1 : currentIndex - 1;
      goToFrame(viewport, prevIndex);
    },
    [getViewportRuntimeState, goToFrame]
  );

  const setViewportSeries = useCallback(
    (viewport: number, series: DicomSeries) => {
      dispatch({ type: "SET_VIEWPORT_SERIES", viewport, series });
    },
    [dispatch]
  );

  const loadSeriesIntoViewport = useCallback(
    async (
      viewport: number,
      series?: DicomSeries | null,
      options?: { studyId?: string | null; forceRebuild?: boolean }
    ) => {
      const studyId = options?.studyId ?? null;
      const forceRebuild = options?.forceRebuild ?? false;
      const seriesId = series?.id;

      if (!seriesId) {
        clearAnnotationHistoryForViewport(viewport);
        clearDbAnnotationsForViewport(viewport);
        disposeViewport(viewport);
        return;
      }

      clearDbAnnotationsForViewport(viewport);

      const element = viewportElementsRef.current.get(viewport);
      if (!element) {
        return;
      }

      setViewportSeries(viewport, series);
      clearAnnotationHistoryForViewport(viewport);

      const currentRuntime = getViewportRuntimeState(viewport);
      if (
        studyId &&
        currentRuntime.studyId &&
        currentRuntime.studyId !== studyId
      ) {
        currentInstancesRef.current.delete(viewport);
        imageIdInstanceMapRef.current.delete(viewport);
      }

      const previousController = abortControllersRef.current.get(viewport);
      if (previousController) {
        previousController.abort();
      }

      const controller = new AbortController();
      abortControllersRef.current.set(viewport, controller);
      const { signal } = controller;

      const bailIfStale = () => signal.aborted || !mountedRef.current;

      const safeUpdateRuntime = (
        updater:
          | Partial<ViewportRuntimeState>
          | ((prev: ViewportRuntimeState) => ViewportRuntimeState)
      ) => {
        if (bailIfStale()) {
          return;
        }
        setViewportRuntimeState(viewport, updater);
      };

      // Initialize or get viewport ID for state management
      const viewportId = getViewportId(viewport) || `viewport-${viewport}`;

      try {
        const currentState = viewportStateManager.getState(viewportId);
        if (!currentState || currentState.status === ViewportStatus.DISPOSED) {
          viewportStateManager.initialize(viewportId);
        }
        viewportStateManager.startLoading(viewportId);
      } catch (error) {
        console.debug('Viewport state manager not ready, continuing without state tracking');
      }

      const jitter = () => Math.min(99, Math.max(1, Math.floor(Math.random() * 12)));

      safeUpdateRuntime((prev) => ({
        ...prev,
        seriesId,
        studyId,
        isLoading: true,
        loadingProgress: 0,
        viewportReady: false,
      }));

      try {
        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: jitter(),
        }));
        await ensureCornerstoneInitialized();
        if (bailIfStale()) {
          return;
        }

        let currentViewportId: string = getViewportId(viewport) ?? "";
        if (!currentViewportId) {
          currentViewportId = `viewport-${viewport + 1}`;
          setViewportId(viewport, currentViewportId);
        }

        if (!currentViewportId) {
          throw new Error("Unable to resolve viewport id.");
        }

        let renderingEngineId = getRenderingEngineId(viewport);
        let renderingEngine = renderingEngineId
          ? getRenderingEngine(renderingEngineId)
          : undefined;

        if (forceRebuild && renderingEngine) {
          try {
            renderingEngine.destroy();
          } catch (_error) {
          }
          renderingEngine = undefined;
          setRenderingEngineId(viewport, "");
          setViewportId(viewport, "");
          currentViewportId = `viewport-${viewport + 1}`;
          setViewportId(viewport, currentViewportId);
        }

        if (!renderingEngineId || !renderingEngine) {
          renderingEngineId = `renderingEngine_${currentViewportId}`;
          const existingEngine = getRenderingEngine(renderingEngineId);
          if (existingEngine) {
            renderingEngine = existingEngine;
          } else {
            setRenderingEngineId(viewport, renderingEngineId);
            renderingEngine = new RenderingEngine(renderingEngineId);
          }
        } else if (forceRebuild) {
          // Typically we would remove representations here if we were handling segmentation locally
          // logic for clearing segmentation is handled via disposeViewport call if rebuild was triggered by component unmount
          // or manually here if needed:
          // segmentation.removeAllSegmentationRepresentations();
        }

        if (!renderingEngine) {
          throw new Error(
            `Failed to create rendering engine with ID: ${renderingEngineId}`
          );
        }

        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: Math.min(35, 15 + jitter()),
        }));

        const instances = await loadSeriesInstances(studyId, seriesId);
        if (bailIfStale()) {
          return;
        }

        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: Math.min(50, 25 + jitter()),
        }));

        const { imageIds, imageIdToInstance } =
          await buildImageIdsFromInstances(instances);
        if (bailIfStale()) {
          return;
        }

        imageIdInstanceMapRef.current.set(viewport, imageIdToInstance);
        currentInstancesRef.current.set(viewport, instances);

        if (!imageIds.length) {
          safeUpdateRuntime((prev) => ({
            ...prev,
            isLoading: false,
            loadingProgress: 0,
            viewportReady: false,
            totalFrames: 0,
            currentFrame: 0,
          }));
          return;
        }

        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: Math.min(65, 35 + jitter()),
          totalFrames: imageIds.length,
        }));

        const existingRenderingEngineId = getRenderingEngineId(viewport);
        if (existingRenderingEngineId && !forceRebuild) {
          const existingRenderingEngine = getRenderingEngine(
            existingRenderingEngineId
          );
          const existingViewport = existingRenderingEngine?.getViewport(
            currentViewportId
          ) as Types.IStackViewport | undefined;

          if (existingViewport) {
            viewportRefs.current.set(viewport, existingViewport);
            const reuseExistingStack = canReuseViewportStack(
              existingViewport,
              imageIds,
              forceRebuild
            );

            if (reuseExistingStack) {
              addViewportListeners(viewport, existingViewport);
              const currentIndex =
                typeof existingViewport.getCurrentImageIdIndex === "function"
                  ? existingViewport.getCurrentImageIdIndex()
                  : 0;
              prefetchImages(imageIds, currentIndex);
              void loadDatabaseAnnotationsForViewport({
                viewport,
                seriesId,
                viewportId: currentViewportId,
                viewportElement:
                  existingViewport.element as HTMLDivElement | null,
                bailIfStale,
                forceReload: true,
              });
              await ensureViewportLabelmapSegmentation({
                viewportId: currentViewportId,
                imageIds,
                imageIdToInstanceMap: imageIdToInstance,
              });
              safeUpdateRuntime((prev) => ({
                ...prev,
                seriesId,
                studyId,
                isLoading: false,
                loadingProgress: 100,
                viewportReady: true,
                currentFrame: currentIndex,
                totalFrames: imageIds.length,
              }));

              try {
                const imageData = existingViewport.getImageData?.();
                if (imageData) {
                  viewportStateManager.setImageData(viewportId, imageData);
                }
              } catch (error) {
                console.debug('Could not update viewport state');
              }

              return;
            }

            safeUpdateRuntime((prev) => ({
              ...prev,
              viewportReady: true,
            }));

            await existingViewport.setStack(imageIds, 0);
            if (bailIfStale()) {
              return;
            }

            existingViewport.resize?.();
            existingViewport.resetCamera();
            batchedRender(existingViewport);

            await ensureViewportLabelmapSegmentation({
              viewportId: currentViewportId,
              imageIds,
              imageIdToInstanceMap: imageIdToInstance,
            });

            addViewportListeners(viewport, existingViewport);
            prefetchImages(imageIds, 0);
            void loadDatabaseAnnotationsForViewport({
              viewport,
              seriesId,
              viewportId: currentViewportId,
              viewportElement:
                existingViewport.element as HTMLDivElement | null,
              bailIfStale,
              forceReload: true,
            });
            await loadDatabaseSegmentationForViewports(seriesId);

            safeUpdateRuntime((prev) => ({
              ...prev,
              isLoading: false,
              loadingProgress: 100,
              currentFrame: 0,
              totalFrames: imageIds.length,
            }));
            return;
          }
        }

        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: 50,
        }));

        const viewportInput: Types.PublicViewportInput = {
          viewportId: currentViewportId,
          type: Enums.ViewportType.STACK,
          element,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        };

        try {
          renderingEngine.enableElement(viewportInput);
        } catch (error) {
          throw error;
        }

        const readyViewport = await new Promise<Types.IStackViewport | null>(
          (resolve) => {
            requestAnimationFrame(() => {
              const engine = renderingEngineId
                ? getRenderingEngine(renderingEngineId)
                : undefined;
              if (!engine) {
                resolve(null);
                return;
              }

              const candidate = engine.getViewport(currentViewportId);
              resolve(candidate as Types.IStackViewport | null);
            });
          }
        );

        if (bailIfStale()) {
          return;
        }

        if (!readyViewport) {
          throw new Error(
            `Failed to create viewport for id: ${currentViewportId}`
          );
        }

        viewportRefs.current.set(viewport, readyViewport);
        element.setAttribute("data-enabled-element", currentViewportId);

        safeUpdateRuntime((prev) => ({
          ...prev,
          viewportReady: true,
        }));

        await readyViewport.setStack(imageIds, 0);
        if (bailIfStale()) {
          return;
        }

        readyViewport.resize?.();
        readyViewport.resetCamera();
        batchedRender(readyViewport);

        await ensureViewportLabelmapSegmentation({
          viewportId: currentViewportId,
          imageIds,
          imageIdToInstanceMap: imageIdToInstance,
        });

        await loadDatabaseSegmentationForViewports(seriesId);

        addViewportListeners(viewport, readyViewport);
        prefetchImages(imageIds, 0);
        void loadDatabaseAnnotationsForViewport({
          viewport,
          seriesId,
          viewportId: currentViewportId,
          viewportElement: readyViewport.element as HTMLDivElement | null,
          bailIfStale,
        });

        safeUpdateRuntime((prev) => ({
          ...prev,
          isLoading: false,
          loadingProgress: 100,
          viewportReady: true,
          currentFrame: 0,
          totalFrames: imageIds.length,
        }));

        try {
          const imageData = readyViewport.getImageData?.();
          if (imageData) {
            viewportStateManager.setImageData(viewportId, imageData);
          }
        } catch (stateError) {
          console.debug('Could not update viewport state');
        }
      } catch (error) {
        if (!bailIfStale() && (error as Error)?.name !== "AbortError") {
          console.error("Failed to load series into viewport", error);

          try {
            viewportStateManager.setError(viewportId, error as Error);
          } catch (stateError) {
            console.debug('Could not update viewport error state');
          }

          safeUpdateRuntime((prev) => ({
            ...prev,
            isLoading: false,
            loadingProgress: 0,
            viewportReady: false,
          }));
        }
      } finally {
        const activeController = abortControllersRef.current.get(viewport);
        if (activeController === controller) {
          abortControllersRef.current.delete(viewport);
        }
      }
    },
    [
      addViewportListeners,
      buildImageIdsFromInstances,
      disposeViewport,
      ensureCornerstoneInitialized,
      getRenderingEngineId,
      getViewportId,
      getViewportRuntimeState,
      loadSeriesInstances,
      prefetchImages,
      setRenderingEngineId,
      setViewportId,
      setViewportRuntimeState,
      setViewportSeries,
      clearAnnotationHistoryForViewport,
      clearDbAnnotationsForViewport,
      loadDatabaseAnnotationsForViewport,
      loadDatabaseSegmentationForViewports,
      ensureViewportLabelmapSegmentation,
    ]
  );

  const refreshViewport = useCallback(
    async (viewport: number) => {
      const series = getViewportSeries(viewport);
      const runtime = getViewportRuntimeState(viewport);
      if (!series) {
        return;
      }
      await loadSeriesIntoViewport(viewport, series, {
        studyId: runtime.studyId,
        forceRebuild: true,
      });

      const vp = getStackViewport(viewport);
      if (vp) {
        vp.resize?.();
        vp.resetCamera();
        batchedRender(vp);
      }
    },
    [getViewportSeries, getViewportRuntimeState, loadSeriesIntoViewport, getStackViewport]
  );


  const updateViewportTransform = useCallback(
    (viewport: number, transform: Partial<ViewportTransform>) => {
      const current = getViewportTransform(viewport);
      const updated = { ...current, ...transform };
      dispatch({
        type: "SET_VIEWPORT_TRANSFORM",
        viewport,
        transform: updated,
        recordHistory: true,
      });
    },
    [dispatch, getViewportTransform]
  );

  const resetView = () => {
    updateViewportTransform(state.activeViewport, defaultTransform);
    viewerEventService.publish(ViewerEvents.RESET_VIEW);
  };

  const rotateViewport = (degrees: number) => {
    console.log(
      "Rotate viewport:",
      state.activeViewport,
      "by",
      degrees,
      "degrees"
    );

    const viewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    viewerEventService.publish(ViewerEvents.ROTATE_VIEWPORT, { degrees, viewportId });
  };


  const invertViewport = () => {
    viewerEventService.publish(ViewerEvents.INVERT_COLORMAP);
  };

  // AI Diagnosis - dispatch event to ViewPortMain
  const diagnosisViewport = useCallback(
    async (
      viewport: number,
      options?: { modelId: string; modelName: string; versionName: string }
    ) => {
      const viewportId = getViewportId(viewport);

      if (!viewportId) {
        console.error(
          "❌ Cannot diagnose: viewport ID not found for viewport",
          viewport
        );
        return;
      }

      const eventData = {
        viewportId,
        viewportIndex: viewport,
        modelId: options?.modelId,
        modelName: options?.modelName,
        versionName: options?.versionName,
      };

      console.log("Publishing DIAGNOSE_VIEWPORT event:", eventData);

      viewerEventService.publish(ViewerEvents.DIAGNOSE_VIEWPORT, eventData);

    },
    [getViewportId]
  );

  const clearAIAnnotations = useCallback(
    (viewport: number) => {
      const viewportId = getViewportId(viewport);

      if (!viewportId) {
        console.error("❌ Cannot clear AI annotations: viewport ID not found");
        return;
      }

      viewerEventService.publish(ViewerEvents.CLEAR_AI_ANNOTATIONS, { viewportId });
    },
    [getViewportId]
  );

  const toggleSegmentationControlPanel = () => {
    dispatch({ type: "TOGGLE_SEGMENTATION_CONTROL_PANEL" });
  };

  const isSegmentationControlPanelOpen = () => {
    return state.isSegmentationControlModalOpen;
  };

  // --- Context Value ---

  // Helper to get imageIdToInstanceMap for a viewport
  const getImageIdToInstanceMap = useCallback(
    (viewport: number): Record<string, string> => {
      return imageIdInstanceMapRef.current.get(viewport) ?? {};
    },
    []
  );

  // Group related actions into memoized sub-objects for better performance
  const viewportActions = useMemo(
    () => ({
      setViewportSeries,
      getViewportSeries,
      setViewportId,
      getViewportId,
      setRenderingEngineId,
      getRenderingEngineId,
      registerViewportElement,
      disposeViewport,
      loadSeriesIntoViewport,
      getViewportState: getViewportRuntimeState,
      getStackViewport,
      goToFrame,
      nextFrame,
      prevFrame,
      refreshViewport,
      getImageIdToInstanceMap,
    }),
    [
      setViewportSeries,
      getViewportSeries,
      setViewportId,
      getViewportId,
      setRenderingEngineId,
      getRenderingEngineId,
      registerViewportElement,
      disposeViewport,
      loadSeriesIntoViewport,
      getViewportRuntimeState,
      getStackViewport,
      goToFrame,
      nextFrame,
      prevFrame,
      refreshViewport,
      getImageIdToInstanceMap,
    ]
  );

  const annotationActions = useMemo(
    () => ({
      clearAnnotations,
      clearViewportAnnotations,
      toggleAnnotations,
      undoAnnotation,
      redoAnnotation,
      recordAnnotationHistoryEntry,
      updateAnnotationHistoryEntry,
      removeAnnotationHistoryEntry,
      reloadAnnotationsForSeries,
      clearAIAnnotations,
    }),
    [
      clearAnnotations,
      clearViewportAnnotations,
      toggleAnnotations,
      undoAnnotation,
      redoAnnotation,
      recordAnnotationHistoryEntry,
      updateAnnotationHistoryEntry,
      removeAnnotationHistoryEntry,
      reloadAnnotationsForSeries,
      clearAIAnnotations,
    ]
  );

  // Helper to save a segmentation snapshot to a layer
  const saveSegmentationSnapshot = useCallback(
    (layerId: string, snapshot: SegmentationSnapshot) => {
      dispatch({
        type: "UPSERT_SEGMENTATION_LAYER_SNAPSHOT",
        layerId,
        snapshot,
      });
      console.log("[ViewerContext] Saved segmentation snapshot to layer:", layerId);
    },
    []
  );

  const segmentationActions = useMemo(
    () => ({
      toggleSegmentationControlPanel,
      isSegmentationControlPanelOpen,
      addSegmentationLayer,
      deleteSegmentationLayer,
      selectSegmentationLayer,
      updateSegmentationLayerMetadata,
      toggleSegmentationLayerVisibility,
      getSegmentationLayers,
      getCurrentSegmentationLayerIndex,
      getSelectedLayerCount,
      isSegmentationVisible,
      toggleSegmentationView,
      getSegmentationHistoryState,
      getCurrentSegmentationSnapshot,
      getCurrentLayerSnapshot,
      getAllLayerSnapshots,
      getAllCurrentLayerSnapshots,
      refetchSegmentationLayers,
      setSegmentationBrushSize,
      undoSegmentation,
      redoSegmentation,
      saveSegmentationSnapshot,
    }),
    [
      toggleSegmentationControlPanel,
      isSegmentationControlPanelOpen,
      addSegmentationLayer,
      deleteSegmentationLayer,
      selectSegmentationLayer,
      updateSegmentationLayerMetadata,
      toggleSegmentationLayerVisibility,
      getSegmentationLayers,
      getCurrentSegmentationLayerIndex,
      getSelectedLayerCount,
      isSegmentationVisible,
      toggleSegmentationView,
      getSegmentationHistoryState,
      getCurrentSegmentationSnapshot,
      getCurrentLayerSnapshot,
      getAllLayerSnapshots,
      getAllCurrentLayerSnapshots,
      refetchSegmentationLayers,
      setSegmentationBrushSize,
      undoSegmentation,
      redoSegmentation,
      saveSegmentationSnapshot,
    ]
  );

  const toolActions = useMemo(
    () => ({
      setActiveTool,
      setLayout,
      setActiveViewport,
      resetView,
      rotateViewport,
      invertViewport,
      getViewportTransform,
    }),
    [
      setActiveTool,
      setLayout,
      setActiveViewport,
      resetView,
      rotateViewport,
      invertViewport,
      getViewportTransform,
    ]
  );

  const diagnosticActions = useMemo(
    () => ({
      diagnosisViewport,
    }),
    [diagnosisViewport]
  );

  // Main context value with grouped sub-objects
  const value: ViewerContextType = useMemo(
    () => ({
      state,
      ...viewportActions,
      ...annotationActions,
      ...segmentationActions,
      ...toolActions,
      ...diagnosticActions,
    }),
    [
      state,
      viewportActions,
      annotationActions,
      segmentationActions,
      toolActions,
      diagnosticActions,
    ]
  );


  return (
    <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
  );
};

export const useViewer = () => {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
};
