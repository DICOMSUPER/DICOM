"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
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
  segmentation,
  annotation,
} from "@cornerstonejs/tools";
import { resolveDicomImageUrl } from "@/utils/dicom/resolveDicomImageUrl";
import { useLazyGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { useLazyGetAnnotationsBySeriesIdQuery } from "@/store/annotationApi";
import { extractApiData } from "@/utils/api";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import type { Annotation } from "@cornerstonejs/tools/types";
import { AnnotationType } from "@/enums/image-dicom.enum";
import {
  createSegmentationHistoryHelpers,
  ensureViewportLabelmapSegmentation,
  captureSegmentationSnapshot,
  clearViewportLabelmapSegmentation,
  segmentationIdForViewport,
  restoreSegmentationSnapshot,
  clearSegmentationData,
  // saveSegmentationSnapshotToStorage,
  // loadSegmentationSnapshotFromStorage,
  type SegmentationHistoryEntry,
  SegmentationSnapshot,
  type SegmentationHistoryStacks,
} from "./viewer-context/segmentation-helper";
// Replace your current import for uuid with this:
import { v4 as uuidv4 } from "uuid"; // Rename v4 to uuidv4 for clarity

export type ToolType =
  | "WindowLevel"
  | "Zoom"
  | "Pan"
  | "StackScroll"
  | "Length"
  | "Height"
  | "Probe"
  | "RectangleROI"
  | "EllipticalROI"
  | "CircleROI"
  | "Bidirectional"
  | "Angle"
  | "CobbAngle"
  | "ArrowAnnotate"
  | "SplineROI"
  | "Magnify"
  | "PlanarRotate"
  | "ETDRSGrid"
  | "ReferenceLines"
  | "Reset"
  | "Invert"
  | "Rotate"
  | "FlipH"
  | "FlipV"
  // Additional tools
  | "TrackballRotate"
  | "MIPJumpToClick"
  | "SegmentBidirectional"
  | "ScaleOverlay"
  | "OrientationMarker"
  | "OverlayGrid"
  | "KeyImage"
  | "Label"
  | "DragProbe"
  | "PaintFill"
  | "Eraser"
  | "ClearSegmentation"
  | "UndoAnnotation";

export type GridLayout = "1x1" | "1x2" | "2x1" | "2x2" | "1x3" | "3x1";

export interface ViewportTransform {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  pan: { x: number; y: number };
}

export interface ViewportRuntimeState {
  seriesId?: string | null;
  studyId?: string | null;
  isLoading: boolean;
  loadingProgress: number;
  viewportReady: boolean;
  currentFrame: number;
  totalFrames: number;
}

export interface ViewerState {
  activeTool: ToolType;
  layout: GridLayout;
  activeViewport: number;
  isToolActive: boolean;
  showAnnotations: boolean;
  viewportSeries: Map<number, DicomSeries>;
  viewportTransforms: Map<number, ViewportTransform>;
  viewportIds: Map<number, string>;
  renderingEngineIds: Map<number, string>;
  viewportRuntimeStates: Map<number, ViewportRuntimeState>;
  history: ViewerState[];
  historyIndex: number;
  segmentationLayers: Map<string, SegmentationSnapshot[]>;
  segmentationLayerVisibility: Map<string, boolean>;
  selectedSegmentationLayer: string | null;
  isSegmentationControlModalOpen: boolean;
}

export interface AnnotationHistoryEntry {
  annotationUID: string;
  toolName: string;
  snapshot: Annotation;
  viewportId?: string;
}

interface AnnotationHistoryStacks {
  undoStack: AnnotationHistoryEntry[];
  redoStack: AnnotationHistoryEntry[];
}

export interface ViewerContextType {
  state: ViewerState;
  setActiveTool: (tool: ToolType) => void;
  setLayout: (layout: GridLayout) => void;
  setActiveViewport: (viewport: number) => void;
  resetView: () => void;
  rotateViewport: (degrees: number) => void;
  flipViewport: (direction: "horizontal" | "vertical") => void;
  invertViewport: () => void;
  clearAnnotations: () => void;
  clearViewportAnnotations: () => void;
  toggleAnnotations: () => void;
  undoAnnotation: () => void;
  redoAnnotation: () => void;
  undoSegmentation: () => void;
  redoSegmentation: () => void;
  recordAnnotationHistoryEntry: (
    viewport: number,
    entry: AnnotationHistoryEntry
  ) => void;
  updateAnnotationHistoryEntry: (
    viewport: number,
    annotationUID: string,
    snapshot: Annotation
  ) => void;
  removeAnnotationHistoryEntry: (
    viewport: number,
    annotationUID: string
  ) => void;
  setViewportSeries: (viewport: number, series: DicomSeries) => void;
  getViewportSeries: (viewport: number) => DicomSeries | undefined;
  getViewportTransform: (viewport: number) => ViewportTransform;
  setViewportId: (viewport: number, viewportId: string) => void;
  getViewportId: (viewport: number) => string | undefined;
  setRenderingEngineId: (viewport: number, renderingEngineId: string) => void;
  getRenderingEngineId: (viewport: number) => string | undefined;
  registerViewportElement: (
    viewport: number,
    element: HTMLDivElement | null
  ) => void;
  disposeViewport: (viewport: number) => void;
  loadSeriesIntoViewport: (
    viewport: number,
    series?: DicomSeries | null,
    options?: { studyId?: string | null; forceRebuild?: boolean }
  ) => Promise<void>;
  getViewportState: (viewport: number) => ViewportRuntimeState;
  getStackViewport: (viewport: number) => Types.IStackViewport | null;
  goToFrame: (viewport: number, frameIndex: number) => void;
  nextFrame: (viewport: number) => void;
  prevFrame: (viewport: number) => void;
  refreshViewport: (viewport: number) => Promise<void>;
  // AI Diagnosis methods
  diagnosisViewport: (
    viewport: number,
    options: { modelId: string; modelName: string; versionName: string }
  ) => Promise<void>;
  clearAIAnnotations: (viewport: number) => void;
  toggleSegmentationControlPanel: () => void;
  isSegmentationControlPanelOpen: () => boolean;
  addSegmentationLayer: () => void;
  deleteSegmentationLayer: (layerId: string) => void;
  selectSegmentationLayer: (layerId: string) => void;
  toggleSegmentationLayerVisibility: (layerId: string) => void;
  getSegmentationLayers: () => Array<{
    id: string;
    name: string;
    active: boolean;
    visible: boolean;
  }>;
  getCurrentSegmentationLayerIndex: () => number;
  getSelectedLayerCount: () => number;
  isSegmentationVisible: () => boolean;
  toggleSegmentationView: () => void;
  getSegmentationHistoryState: () => { canUndo: boolean; canRedo: boolean };
}

const defaultTransform: ViewportTransform = {
  rotation: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

const defaultViewportRuntimeState: ViewportRuntimeState = {
  seriesId: null,
  studyId: null,
  isLoading: false,
  loadingProgress: 0,
  viewportReady: false,
  currentFrame: 0,
  totalFrames: 0,
};

const INITIAL_SEGMENTATION_LAYER_ID = uuidv4();
const MAX_LAYER_SNAPSHOTS_PER_LAYER = 10;

const SEGMENTATION_HISTORY_IGNORED_REASONS = new Set([
  "layer-sync-restore",
  "layer-sync-clear",
  "segmentation-view-toggle-show",
  "segmentation-view-toggle-hide",
  "history-undo",
  "history-redo",
]);

const defaultState: ViewerState = {
  activeTool: "WindowLevel",
  layout: "1x1",
  activeViewport: 0,
  isToolActive: false,
  showAnnotations: true,
  viewportSeries: new Map(),
  viewportTransforms: new Map(),
  viewportIds: new Map(),
  renderingEngineIds: new Map(),
  viewportRuntimeStates: new Map(),
  history: [],
  historyIndex: -1,
  segmentationLayers: new Map([[INITIAL_SEGMENTATION_LAYER_ID, []]]),
  segmentationLayerVisibility: new Map([[INITIAL_SEGMENTATION_LAYER_ID, true]]),
  selectedSegmentationLayer: INITIAL_SEGMENTATION_LAYER_ID,
  isSegmentationControlModalOpen: false,
};

type ViewerAction =
  | { type: "SET_ACTIVE_TOOL"; tool: ToolType }
  | { type: "SET_LAYOUT"; layout: GridLayout; recordHistory?: boolean }
  | { type: "SET_ACTIVE_VIEWPORT"; viewport: number }
  | { type: "SET_VIEWPORT_ID"; viewport: number; viewportId?: string }
  | {
      type: "SET_RENDERING_ENGINE_ID";
      viewport: number;
      renderingEngineId?: string;
    }
  | { type: "SET_VIEWPORT_SERIES"; viewport: number; series?: DicomSeries }
  | { type: "RESET_VIEWPORT_RUNTIME"; viewport: number }
  | {
      type: "UPDATE_VIEWPORT_RUNTIME";
      viewport: number;
      updater: (prev: ViewportRuntimeState) => ViewportRuntimeState;
    }
  | {
      type: "SET_VIEWPORT_TRANSFORM";
      viewport: number;
      transform: ViewportTransform;
      recordHistory?: boolean;
    }
  | { type: "SET_TOOL_ACTIVE"; isActive: boolean }
  | { type: "TOGGLE_ANNOTATIONS" }
  | { type: "TOGGLE_SEGMENTATION_CONTROL_PANEL" }
  | {
      type: "SET_SEGMENTATION_LAYERS";
      layers: Map<string, SegmentationSnapshot[]>;
      selectedLayer: string | null;
    }
  | {
      type: "SET_SELECTED_SEGMENTATION_LAYER";
      layerId: string;
    }
  | {
      type: "ADD_SEGMENTATION_LAYER";
      layerId: string;
      snapshots: SegmentationSnapshot[];
    }
  | {
      type: "REMOVE_SEGMENTATION_LAYER";
      layerId: string;
    }
  | {
      type: "UPSERT_SEGMENTATION_LAYER_SNAPSHOT";
      layerId: string;
      snapshot: SegmentationSnapshot;
    }
  | {
      type: "CLEAR_SEGMENTATION_LAYER_SNAPSHOTS";
      layerId: string;
    }
  | {
      type: "SET_SEGMENTATION_LAYER_VISIBILITY";
      layerId: string;
      visible: boolean;
    }
  | {
      type: "POP_SEGMENTATION_LAYER_SNAPSHOT";
      layerId: string;
    };

const shallowEqualRuntime = (
  a: ViewportRuntimeState,
  b: ViewportRuntimeState
) => {
  if (a === b) {
    return true;
  }
  const keys: Array<keyof ViewportRuntimeState> = [
    "seriesId",
    "studyId",
    "isLoading",
    "loadingProgress",
    "viewportReady",
    "currentFrame",
    "totalFrames",
  ];
  return keys.every((key) => a[key] === b[key]);
};

const pushHistory = (
  prev: ViewerState,
  next: ViewerState,
  recordHistory?: boolean
) => {
  if (!recordHistory) {
    return next;
  }
  const history = prev.history.slice(0, prev.historyIndex + 1);
  history.push(next);
  return {
    ...next,
    history,
    historyIndex: history.length - 1,
  };
};

const setMapEntry = <K, V>(map: Map<K, V>, key: K, value: V | undefined) => {
  const hasKey = map.has(key);
  if (value === undefined) {
    if (!hasKey) {
      return map;
    }
    const updated = new Map(map);
    updated.delete(key);
    return updated;
  }
  if (hasKey && map.get(key) === value) {
    return map;
  }
  const updated = new Map(map);
  updated.set(key, value);
  return updated;
};

const viewerReducer = (
  state: ViewerState,
  action: ViewerAction
): ViewerState => {
  switch (action.type) {
    case "SET_ACTIVE_TOOL": {
      if (state.activeTool === action.tool && state.isToolActive) {
        return state;
      }
      return {
        ...state,
        activeTool: action.tool,
        isToolActive: true,
      };
    }
    case "SET_TOOL_ACTIVE": {
      if (state.isToolActive === action.isActive) {
        return state;
      }
      return {
        ...state,
        isToolActive: action.isActive,
      };
    }
    case "TOGGLE_ANNOTATIONS": {
      return {
        ...state,
        showAnnotations: !state.showAnnotations,
      };
    }
    case "SET_LAYOUT": {
      if (state.layout === action.layout) {
        return state;
      }
      const next = {
        ...state,
        layout: action.layout,
      };
      return pushHistory(state, next, action.recordHistory);
    }
    case "SET_ACTIVE_VIEWPORT": {
      if (state.activeViewport === action.viewport) {
        return state;
      }
      return {
        ...state,
        activeViewport: action.viewport,
      };
    }
    case "SET_VIEWPORT_ID": {
      const updatedIds = setMapEntry(
        state.viewportIds,
        action.viewport,
        action.viewportId
      );
      if (updatedIds === state.viewportIds) {
        return state;
      }
      return {
        ...state,
        viewportIds: updatedIds,
      };
    }
    case "SET_RENDERING_ENGINE_ID": {
      const updatedIds = setMapEntry(
        state.renderingEngineIds,
        action.viewport,
        action.renderingEngineId
      );
      if (updatedIds === state.renderingEngineIds) {
        return state;
      }
      return {
        ...state,
        renderingEngineIds: updatedIds,
      };
    }
    case "SET_VIEWPORT_SERIES": {
      const updatedSeries = setMapEntry(
        state.viewportSeries,
        action.viewport,
        action.series
      );
      if (updatedSeries === state.viewportSeries) {
        return state;
      }
      return {
        ...state,
        viewportSeries: updatedSeries,
      };
    }
    case "RESET_VIEWPORT_RUNTIME": {
      const nextValue = { ...defaultViewportRuntimeState };
      const current = state.viewportRuntimeStates.get(action.viewport);
      if (current && shallowEqualRuntime(current, nextValue)) {
        return state;
      }
      const nextRuntimeStates = new Map(state.viewportRuntimeStates);
      nextRuntimeStates.set(action.viewport, nextValue);
      return {
        ...state,
        viewportRuntimeStates: nextRuntimeStates,
      };
    }
    case "UPDATE_VIEWPORT_RUNTIME": {
      const current = state.viewportRuntimeStates.get(action.viewport) ?? {
        ...defaultViewportRuntimeState,
      };
      const nextRuntime = action.updater(current);
      if (shallowEqualRuntime(current, nextRuntime)) {
        return state;
      }
      const nextRuntimeStates = new Map(state.viewportRuntimeStates);
      nextRuntimeStates.set(action.viewport, nextRuntime);
      return {
        ...state,
        viewportRuntimeStates: nextRuntimeStates,
      };
    }
    case "SET_VIEWPORT_TRANSFORM": {
      const currentTransform = state.viewportTransforms.get(
        action.viewport
      ) ?? { ...defaultTransform };
      const nextTransform = action.transform;
      const same =
        currentTransform.rotation === nextTransform.rotation &&
        currentTransform.flipH === nextTransform.flipH &&
        currentTransform.flipV === nextTransform.flipV &&
        currentTransform.zoom === nextTransform.zoom &&
        currentTransform.pan.x === nextTransform.pan.x &&
        currentTransform.pan.y === nextTransform.pan.y;
      if (same) {
        return state;
      }
      const transforms = new Map(state.viewportTransforms);
      transforms.set(action.viewport, nextTransform);
      const nextState = {
        ...state,
        viewportTransforms: transforms,
      };
      return pushHistory(state, nextState, action.recordHistory);
    }

    case "SET_SEGMENTATION_LAYERS": {
      const nextVisibility = new Map<string, boolean>();
      action.layers.forEach((_snapshots, layerId) => {
        nextVisibility.set(
          layerId,
          state.segmentationLayerVisibility.get(layerId) ?? true
        );
      });
      return {
        ...state,
        segmentationLayers: action.layers,
        segmentationLayerVisibility: nextVisibility,
        selectedSegmentationLayer:
          action.selectedLayer ?? state.selectedSegmentationLayer,
      };
    }

    case "SET_SELECTED_SEGMENTATION_LAYER": {
      if (state.selectedSegmentationLayer === action.layerId) {
        return state;
      }
      return {
        ...state,
        selectedSegmentationLayer: action.layerId,
      };
    }

    case "ADD_SEGMENTATION_LAYER": {
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, action.snapshots);
      const nextVisibility = new Map(state.segmentationLayerVisibility);
      nextVisibility.set(action.layerId, true);
      return {
        ...state,
        segmentationLayers: nextLayers,
        segmentationLayerVisibility: nextVisibility,
        selectedSegmentationLayer: action.layerId,
      };
    }

    case "REMOVE_SEGMENTATION_LAYER": {
      if (!state.segmentationLayers.has(action.layerId)) {
        return state;
      }
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.delete(action.layerId);
      const nextVisibility = new Map(state.segmentationLayerVisibility);
      nextVisibility.delete(action.layerId);
      const nextSelected =
        state.selectedSegmentationLayer === action.layerId
          ? nextLayers.keys().next().value ?? null
          : state.selectedSegmentationLayer;
      return {
        ...state,
        segmentationLayers: nextLayers,
        segmentationLayerVisibility: nextVisibility,
        selectedSegmentationLayer: nextSelected,
      };
    }

    case "UPSERT_SEGMENTATION_LAYER_SNAPSHOT": {
      const existing = state.segmentationLayers.get(action.layerId) ?? [];
      const nextSnapshots = [...existing, action.snapshot];
      if (nextSnapshots.length > MAX_LAYER_SNAPSHOTS_PER_LAYER) {
        nextSnapshots.shift();
      }
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, nextSnapshots);
      return {
        ...state,
        segmentationLayers: nextLayers,
      };
    }

    case "CLEAR_SEGMENTATION_LAYER_SNAPSHOTS": {
      if (!state.segmentationLayers.has(action.layerId)) {
        return state;
      }
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, []);
      return {
        ...state,
        segmentationLayers: nextLayers,
      };
    }

    case "SET_SEGMENTATION_LAYER_VISIBILITY": {
      const current =
        state.segmentationLayerVisibility.get(action.layerId) ?? true;
      if (current === action.visible) {
        return state;
      }
      const nextVisibility = new Map(state.segmentationLayerVisibility);
      nextVisibility.set(action.layerId, action.visible);
      return {
        ...state,
        segmentationLayerVisibility: nextVisibility,
      };
    }

    case "POP_SEGMENTATION_LAYER_SNAPSHOT": {
      const existing = state.segmentationLayers.get(action.layerId);
      if (!existing?.length) {
        return state;
      }
      const nextSnapshots = existing.slice(0, existing.length - 1);
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, nextSnapshots);
      return {
        ...state,
        segmentationLayers: nextLayers,
      };
    }

    case "TOGGLE_SEGMENTATION_CONTROL_PANEL": {
      return {
        ...state,
        isSegmentationControlModalOpen: !state.isSegmentationControlModalOpen,
      };
    }
    default:
      return state;
  }
};

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

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

const hasRenderAsync = (
  viewport: Types.IStackViewport
): viewport is Types.IStackViewport & { renderAsync: () => Promise<void> } => {
  return (
    typeof (viewport as { renderAsync?: unknown }).renderAsync === "function"
  );
};

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

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(viewerReducer, defaultState);
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
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
  const dbAnnotationsRenderedRef = useRef<Map<number, Set<string>>>(new Map());
  const annotationHistoryRef = useRef<Map<number, AnnotationHistoryStacks>>(
    new Map()
  );

  const segmentationHistoryRef = useRef<
    Map<number, Map<string, SegmentationHistoryStacks>>
  >(new Map());

  const seriesInstancesCacheRef = useRef<
    LRUCache<string, Record<string, any[]>>
  >(new LRUCache(SERIES_CACHE_MAX_ENTRIES));
  const annotationsCacheRef = useRef<
    LRUCache<string, ImageAnnotation[]>
  >(new LRUCache(SERIES_CACHE_MAX_ENTRIES));
  const cornerstoneInitializedRef = useRef(false);
  const cornerstoneInitPromiseRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [segmentationHistoryVersion, setSegmentationHistoryVersion] =
    useState(0);

  const notifySegmentationHistoryChange = useCallback(() => {
    setSegmentationHistoryVersion((prev) => prev + 1);
  }, []);

  const selectedSegmentationLayerRef = useRef<string | null>(
    state.selectedSegmentationLayer
  );
  const segmentationLayersRef = useRef(state.segmentationLayers);
  const showAnnotationsRef = useRef(state.showAnnotations);

  useEffect(() => {
    selectedSegmentationLayerRef.current = state.selectedSegmentationLayer;
  }, [state.selectedSegmentationLayer]);

  useEffect(() => {
    segmentationLayersRef.current = state.segmentationLayers;
  }, [state.segmentationLayers]);

  useEffect(() => {
    showAnnotationsRef.current = state.showAnnotations;
  }, [state.showAnnotations]);

  const previousLayerSelectionRef = useRef<string | null>(
    state.selectedSegmentationLayer
  );
  const previousActiveViewportRef = useRef<number>(state.activeViewport);
  const previousViewportIdRef = useRef<string | undefined>(
    state.viewportIds.get(state.activeViewport)
  );

  useEffect(() => {
    const viewportIndex = state.activeViewport;
    const layerChanged =
      previousLayerSelectionRef.current !== state.selectedSegmentationLayer;
    const viewportChanged = previousActiveViewportRef.current !== viewportIndex;
    const currentViewportId = state.viewportIds.get(viewportIndex);
    const viewportIdChanged =
      previousViewportIdRef.current !== currentViewportId;

    previousLayerSelectionRef.current = state.selectedSegmentationLayer;
    previousActiveViewportRef.current = viewportIndex;
    previousViewportIdRef.current = currentViewportId;

    if (!layerChanged && !viewportChanged && !viewportIdChanged) {
      return;
    }

    const stackViewport = viewportRefs.current.get(viewportIndex);
    if (
      !stackViewport ||
      typeof stackViewport.getImageIds !== "function" ||
      !currentViewportId
    ) {
      return;
    }

    const imageIds = stackViewport.getImageIds() ?? [];
    if (!imageIds.length) {
      return;
    }

    let cancelled = false;
    const applySnapshot = async () => {
      await ensureViewportLabelmapSegmentation({
        viewportId: currentViewportId,
        imageIds,
      });

      if (cancelled) {
        return;
      }

      const segmentationId = segmentationIdForViewport(currentViewportId);
      const layerId = state.selectedSegmentationLayer;
      const layerSnapshots = layerId
        ? state.segmentationLayers.get(layerId) ?? []
        : [];
      const latestSnapshot = layerSnapshots[layerSnapshots.length - 1] ?? null;
      const layerVisible = layerId
        ? state.segmentationLayerVisibility.get(layerId) ?? true
        : true;

      if (layerId && latestSnapshot && layerVisible) {
        restoreSegmentationSnapshot(latestSnapshot, {
          reason: "layer-sync-restore",
        });
      } else {
        clearSegmentationData(segmentationId, {
          reason: "layer-sync-clear",
        });
      }
    };

    void applySnapshot();

    return () => {
      cancelled = true;
    };
  }, [
    state.activeViewport,
    state.selectedSegmentationLayer,
    state.viewportIds,
    state.segmentationLayers,
    state.segmentationLayerVisibility,
    ensureViewportLabelmapSegmentation,
  ]);

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

  // Segmentation history helpers (kept in a separate module for clarity)
  const {
    ensureLayerStacks: ensureSegmentationStacks,
    recordEntry: recordSegmentationEntry,
    updateEntry: updateSegmentationEntry,
    removeEntry: removeSegmentationEntry,
    clearLayerHistory,
    clearViewportHistory: clearSegmentationHistoryForViewport,
    consumeUndo: consumeSegmentationUndo,
    consumeRedo: consumeSegmentationRedo,
    getLayerStacks: getSegmentationLayerStacks,
  } = useMemo(
    () => createSegmentationHistoryHelpers(segmentationHistoryRef),
    []
  );

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
        } catch (addError) {
          console.error("Failed to render annotation", record.id, addError);
        }
      });
    },
    [ensureDbAnnotationTracker, fetchAnnotationsBySeries]
  );

  const persistLayerSnapshot = useCallback(
    (layerId: string, snapshot: SegmentationSnapshot | null) => {
      if (!layerId || !snapshot) {
        return;
      }
      dispatch({
        type: "UPSERT_SEGMENTATION_LAYER_SNAPSHOT",
        layerId,
        snapshot,
      });
    },
    [dispatch]
  );

  const removeLatestLayerSnapshot = useCallback(
    (layerId: string) => {
      if (!layerId) {
        return;
      }
      dispatch({
        type: "POP_SEGMENTATION_LAYER_SNAPSHOT",
        layerId,
      });
    },
    [dispatch]
  );

  const setLayerVisibility = useCallback(
    (layerId: string, visible: boolean) => {
      if (!layerId) {
        return;
      }
      dispatch({
        type: "SET_SEGMENTATION_LAYER_VISIBILITY",
        layerId,
        visible,
      });
    },
    [dispatch]
  );

  const clearLayerHistoryAcrossViewports = useCallback(
    (layerId: string) => {
      if (!layerId) {
        return;
      }
      segmentationHistoryRef.current.forEach((_layers, viewport) => {
        clearLayerHistory(viewport, layerId);
      });
      notifySegmentationHistoryChange();
    },
    [clearLayerHistory, notifySegmentationHistoryChange]
  );

  const resetSegmentationHistoryForViewport = useCallback(
    (viewport: number) => {
      clearSegmentationHistoryForViewport(viewport);
      notifySegmentationHistoryChange();
    },
    [clearSegmentationHistoryForViewport, notifySegmentationHistoryChange]
  );

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
      const imageIds = imageIdsArrays
        .flat()
        .filter((id: string): id is string => Boolean(id));

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
          // ignore batch failures; individual load errors already handled
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
      };

      const handleSegmentationModified = async (evt: Event) => {
        const customEvent = evt as CustomEvent<{
          segmentationId?: string;
          reason?: string;
        }>;
        const segmentationId = customEvent.detail?.segmentationId;
        if (!segmentationId) {
          return;
        }
        const reason = customEvent.detail?.reason;
        if (reason && SEGMENTATION_HISTORY_IGNORED_REASONS.has(reason)) {
          return;
        }

        const activeLayerId = selectedSegmentationLayerRef.current;
        if (!activeLayerId) {
          console.warn(
            "[Segmentation] No active layer selected, skipping snapshot"
          );
          return;
        }

        const layerSnapshots =
          segmentationLayersRef.current.get(activeLayerId) ?? [];
        const previousSnapshot =
          layerSnapshots[layerSnapshots.length - 1] ?? null;

        const snapshot = captureSegmentationSnapshot(segmentationId);
        if (!snapshot) {
          console.warn(
            "[Segmentation] Unable to capture snapshot for",
            segmentationId
          );
          return;
        }

        const entryId = `${segmentationId}-${snapshot.capturedAt}`;
        recordSegmentationEntry(viewport, activeLayerId, {
          id: entryId,
          label: "Brush",
          snapshot,
          layerId: activeLayerId,
          previousSnapshot,
        } satisfies SegmentationHistoryEntry);
        persistLayerSnapshot(activeLayerId, snapshot);
        notifySegmentationHistoryChange();

        // await saveSegmentationSnapshotToStorage(snapshot);

        console.log("[Segmentation] snapshot captured", {
          viewportIndex: viewport,
          viewportElementId: stackViewport.id,
          segmentationId,
          layerId: activeLayerId,
          slices: snapshot.imageData.length,
          capturedAt: snapshot.capturedAt,
          snapshot: snapshot,
        });
      };

      const element = viewportElementsRef.current.get(viewport);
      element?.addEventListener(
        Enums.Events.IMAGE_RENDERED as unknown as string,
        updateFrameIndex
      );
      eventTarget.addEventListener(
        ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
        handleSegmentationModified
      );

      viewportListenersRef.current.set(viewport, {
        imageRendered: updateFrameIndex,
        segmentationModified: handleSegmentationModified,
      });
    },
    [
      removeViewportListeners,
      setViewportRuntimeState,
      recordSegmentationEntry,
      persistLayerSnapshot,
      notifySegmentationHistoryChange,
    ]
  );

  const setActiveTool = useCallback(
    (tool: ToolType) => {
      dispatch({ type: "SET_ACTIVE_TOOL", tool });
      console.log("Tool activated:", tool);
    },
    [dispatch]
  );

  const setLayout = (layout: GridLayout) => {
    dispatch({ type: "SET_LAYOUT", layout, recordHistory: true });
    console.log("Layout changed:", layout);
  };

  const setActiveViewport = useCallback(
    (viewport: number) => {
      dispatch({ type: "SET_ACTIVE_VIEWPORT", viewport });
      console.log("Active viewport changed:", viewport);
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
        clearViewportLabelmapSegmentation(viewportId);
      }

      if (engineId) {
        try {
          const engine = getRenderingEngine(engineId);
          if (engine && viewportId) {
            try {
              engine.disableElement(viewportId);
            } catch (_error) {
              // ignore disable errors
            }
            const remainingViewports = engine.getViewports?.() ?? {};
            if (
              !remainingViewports ||
              Object.keys(remainingViewports).length === 0
            ) {
              engine.destroy();
            }
          } else if (engine && !viewportId) {
            engine.destroy();
          }
        } catch (_error) {
          // ignore cleanup errors
        }
      }

      setRenderingEngineId(viewport, "");
      setViewportId(viewport, "");
      clearAnnotationHistoryForViewport(viewport);
      clearDbAnnotationsForViewport(viewport);
      resetSegmentationHistoryForViewport(viewport);
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

  const getStackViewport = useCallback(
    (viewport: number): Types.IStackViewport | null => {
      return viewportRefs.current.get(viewport) ?? null;
    },
    []
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
          stackViewport.render();
          prefetchImages(imageIds, newIndex);
          setViewportRuntimeState(viewport, (prev) => ({
            ...prev,
            currentFrame: newIndex,
            totalFrames: imageIds.length,
          }));
        }
      } catch (_error) {
        // ignore navigation errors
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
      console.log(
        "Series assigned to viewport:",
        viewport,
        series.seriesDescription
      );
    },
    [dispatch]
  );

  const getViewportSeries = useCallback(
    (viewport: number): DicomSeries | undefined => {
      return state.viewportSeries.get(viewport);
    },
    [state.viewportSeries]
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

      // const restoreSegmentationFromLocalStorage = async (
      //   viewportKey: string
      // ) => {
      //   const segmentationId = segmentationIdForViewport(viewportKey);
      //   const storedSnapshot = await loadSegmentationSnapshotFromStorage(
      //     segmentationId
      //   );
      //   if (!storedSnapshot) {
      //     return false;
      //   }
      //   const restored = restoreSegmentationSnapshot(storedSnapshot);
      //   if (restored) {
      //     console.log("[Segmentation] Restored snapshot from localStorage", {
      //       viewportKey,
      //       segmentationId,
      //       capturedAt: storedSnapshot?.capturedAt || new Date(),
      //       slices: storedSnapshot?.imageData?.length,
      //     });
      //   } else {
      //     console.warn(
      //       "[Segmentation] Failed to restore stored snapshot",
      //       segmentationId
      //     );
      //   }
      //   return restored;
      // };

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
          loadingProgress: 5,
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
            // ignore destroy errors
          }
          renderingEngine = undefined;
          setRenderingEngineId(viewport, "");
          setViewportId(viewport, "");
          currentViewportId = `viewport-${viewport + 1}`;
          setViewportId(viewport, currentViewportId);
        }

        if (!renderingEngineId || !renderingEngine) {
          renderingEngineId = `renderingEngine_${currentViewportId}`;
          setRenderingEngineId(viewport, renderingEngineId);
          renderingEngine = new RenderingEngine(renderingEngineId);
        } else if (forceRebuild) {
          segmentation.removeAllSegmentationRepresentations();
          segmentation.removeAllSegmentations();
        }

        if (!renderingEngine) {
          throw new Error(
            `Failed to create rendering engine with ID: ${renderingEngineId}`
          );
        }

        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: 20,
        }));

        const instances = await loadSeriesInstances(studyId, seriesId);
        if (bailIfStale()) {
          return;
        }

        safeUpdateRuntime((prev) => ({
          ...prev,
          loadingProgress: 30,
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
          loadingProgress: 40,
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
            existingViewport.render();

            await ensureViewportLabelmapSegmentation({
              viewportId: currentViewportId,
              imageIds,
            });

            // restoreSegmentationFromLocalStorage(currentViewportId);

            addViewportListeners(viewport, existingViewport);
            prefetchImages(imageIds, 0);
            void loadDatabaseAnnotationsForViewport({
              viewport,
              seriesId,
              viewportId: currentViewportId,
              viewportElement:
                existingViewport.element as HTMLDivElement | null,
              bailIfStale,
            });

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
        readyViewport.render();

        await ensureViewportLabelmapSegmentation({
          viewportId: currentViewportId,
          imageIds,
        });

        // await restoreSegmentationFromLocalStorage(currentViewportId);
        // await restoreSegmentationFromLocalStorage(currentViewportId);

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
      } catch (error) {
        if (!bailIfStale() && (error as Error)?.name !== "AbortError") {
          console.error("Failed to load series into viewport", error);
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
    },
    [getViewportSeries, getViewportRuntimeState, loadSeriesIntoViewport]
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
    console.log("Reset view for viewport:", state.activeViewport);
    updateViewportTransform(state.activeViewport, defaultTransform);

    // Dispatch event to Cornerstone.js for actual viewport reset
    window.dispatchEvent(new CustomEvent("resetView"));
  };

  const rotateViewport = (degrees: number) => {
    console.log(
      "Rotate viewport:",
      state.activeViewport,
      "by",
      degrees,
      "degrees"
    );

    // Dispatch event to Cornerstone.js for actual viewport rotation
    // Use actual viewport ID from context state or fallback to Cornerstone.js standard ID
    const viewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    window.dispatchEvent(
      new CustomEvent("rotateViewport", {
        detail: { degrees, viewportId },
      })
    );

    // Note: Don't update context state here - let Cornerstone.js handle the actual rotation
    // The context state is just for UI tracking, not the actual viewport state
  };

  const flipViewport = (direction: "horizontal" | "vertical") => {
    console.log("Flip viewport:", state.activeViewport, direction);

    // Dispatch event to Cornerstone.js for actual viewport flip
    // Use actual viewport ID from context state or fallback to Cornerstone.js standard ID
    const viewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    window.dispatchEvent(
      new CustomEvent("flipViewport", {
        detail: { direction, viewportId },
      })
    );

    // Note: Don't update context state here - let Cornerstone.js handle the actual flip
    // The context state is just for UI tracking, not the actual viewport state
  };

  const invertViewport = () => {
    console.log("Invert viewport:", state.activeViewport);
    // Dispatch event to trigger color map inversion
    window.dispatchEvent(new CustomEvent("invertColorMap"));
  };

  const clearAnnotations = () => {
    console.log(
      "Clear annotations requested from context - clearing all viewports"
    );
    // Clear history for all viewports
    state.viewportSeries.forEach((_, viewportIndex) => {
      clearAnnotationHistoryForViewport(viewportIndex);
    });
    // Dispatch event without viewport ID filter so all viewports respond
    window.dispatchEvent(new CustomEvent("clearAnnotations"));
  };

  const clearViewportAnnotations = () => {
    console.log(
      "Clear viewport annotations requested from context - clearing active viewport only"
    );
    clearAnnotationHistoryForViewport(state.activeViewport);
    const activeViewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    window.dispatchEvent(
      new CustomEvent("clearViewportAnnotations", {
        detail: { activeViewportId },
      })
    );
  };

  const undoAnnotation = () => {
    console.log("Undo annotation requested from context");
    const viewportIndex = state.activeViewport;
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeUndoEntry(viewportIndex);
    window.dispatchEvent(
      new CustomEvent("undoAnnotation", {
        detail: {
          activeViewportId,
          entry: historyEntry ? cloneHistoryEntry(historyEntry) : undefined,
        },
      })
    );
  };

  const redoAnnotation = () => {
    console.log("Redo annotation requested from context");
    const viewportIndex = state.activeViewport;
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeRedoEntry(viewportIndex);
    if (!historyEntry) {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("redoAnnotation", {
        detail: {
          activeViewportId,
          entry: cloneHistoryEntry(historyEntry),
        },
      })
    );
  };

  const undoSegmentation = () => {
    const viewportIndex = state.activeViewport;
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
      console.warn("[Segmentation] Cannot undo without an active layer");
      return;
    }
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeSegmentationUndo(viewportIndex, layerId);
    if (!historyEntry) {
      return;
    }
    removeLatestLayerSnapshot(layerId);
    notifySegmentationHistoryChange();

    window.dispatchEvent(
      new CustomEvent("undoSegmentation", {
        detail: {
          activeViewportId,
          layerId,
          entry: historyEntry,
        },
      })
    );
  };

  const redoSegmentation = () => {
    const viewportIndex = state.activeViewport;
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
      console.warn("[Segmentation] Cannot redo without an active layer");
      return;
    }
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeSegmentationRedo(viewportIndex, layerId);

    if (!historyEntry) {
      return;
    }
    const snapshot = historyEntry.snapshot as SegmentationSnapshot | undefined;
    if (snapshot) {
      persistLayerSnapshot(layerId, snapshot);
    }
    notifySegmentationHistoryChange();

    window.dispatchEvent(
      new CustomEvent("redoSegmentation", {
        detail: {
          activeViewportId,
          layerId,
          entry: historyEntry,
        },
      })
    );
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

      console.log("🧠 Triggering AI diagnosis:", {
        viewport,
        viewportId,
        modelId: options?.modelId,
        modelName: options?.modelName,
        versionName: options?.versionName,
      });

      window.dispatchEvent(
        new CustomEvent("diagnoseViewport", {
          detail: {
            viewportId,
            viewportIndex: viewport,
            modelId: options?.modelId,
            modelName: options?.modelName,
            versionName: options?.versionName,
          },
        })
      );
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

      console.log("🗑️ Clearing AI annotations for viewport:", viewport);

      window.dispatchEvent(
        new CustomEvent("clearAIAnnotations", {
          detail: { viewportId },
        })
      );
    },
    [getViewportId]
  );

  const toggleAnnotations = useCallback(() => {
    const newShowAnnotations = !state.showAnnotations;
    
    // Update ref immediately for synchronous access
    showAnnotationsRef.current = newShowAnnotations;
    
    // Dispatch state update
    dispatch({ type: "TOGGLE_ANNOTATIONS" });

    // Load or unload annotations for all viewports
    // Use refs to get current values to avoid stale closures
    const currentViewportSeries = state.viewportSeries;
    const currentViewportIds = state.viewportIds;
    
    if (newShowAnnotations) {
      // Load annotations for all viewports that have series loaded
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
            checkShowAnnotations: false, // Bypass check since we know we're enabling
          });
        }
      });
    } else {
      // Unload annotations from all viewports
      currentViewportSeries.forEach((series, viewport) => {
        const viewportElement = viewportElementsRef.current.get(viewport);
        if (viewportElement) {
          unloadAnnotationsFromViewport(viewport, viewportElement);
        }
      });
    }

    // Dispatch event to all viewports to toggle annotation visibility
    window.dispatchEvent(
      new CustomEvent("toggleAnnotations", {
        detail: { showAnnotations: newShowAnnotations },
      })
    );

    console.log("👁️ Toggled annotation visibility:", newShowAnnotations);
  }, [state.showAnnotations, state.viewportSeries, state.viewportIds, loadDatabaseAnnotationsForViewport, unloadAnnotationsFromViewport]);

  const toggleSegmentationControlPanel = () => {
    dispatch({ type: "TOGGLE_SEGMENTATION_CONTROL_PANEL" });
  };

  const isSegmentationControlPanelOpen = () => {
    return state.isSegmentationControlModalOpen;
  };
  const addSegmentationLayer = useCallback(() => {
    const newLayerId = uuidv4();
    dispatch({
      type: "ADD_SEGMENTATION_LAYER",
      layerId: newLayerId,
      snapshots: [],
    });

    console.log("Added new segmentation layer:", newLayerId);
  }, [dispatch]);

  const deleteSegmentationLayer = useCallback(
    (layerId: string) => {
      if (state.segmentationLayers.size <= 1) {
        console.warn("Cannot delete the last segmentation layer");
        return;
      }
      dispatch({
        type: "REMOVE_SEGMENTATION_LAYER",
        layerId,
      });
      clearLayerHistoryAcrossViewports(layerId);

      console.log("Deleted segmentation layer:", layerId);
    },
    [state.segmentationLayers.size, clearLayerHistoryAcrossViewports]
  );

  const selectSegmentationLayer = useCallback(
    (layerId: string) => {
      if (state.selectedSegmentationLayer === layerId) return;

      dispatch({
        type: "SET_SELECTED_SEGMENTATION_LAYER",
        layerId,
      });

      console.log("Selected segmentation layer:", layerId);
    },
    [state.selectedSegmentationLayer]
  );

  const toggleSegmentationLayerVisibility = useCallback(
    (layerId: string) => {
      if (!layerId) {
        return;
      }
      const currentVisible =
        state.segmentationLayerVisibility.get(layerId) ?? true;
      setLayerVisibility(layerId, !currentVisible);
      console.log("Toggled visibility for layer:", layerId, !currentVisible);
    },
    [setLayerVisibility, state.segmentationLayerVisibility]
  );

  const getSegmentationLayers = useCallback(() => {
    return Array.from(state.segmentationLayers.keys()).map(
      (layerId, index) => ({
        id: layerId,
        name: `Layer ${index + 1}`,
        active: layerId === state.selectedSegmentationLayer,
        visible: state.segmentationLayerVisibility.get(layerId) ?? true,
      })
    );
  }, [
    state.segmentationLayers,
    state.selectedSegmentationLayer,
    state.segmentationLayerVisibility,
  ]);

  const getCurrentSegmentationLayerIndex = useCallback(() => {
    const layers = Array.from(state.segmentationLayers.keys());
    return layers.findIndex(
      (layerId) => layerId === state.selectedSegmentationLayer
    );
  }, [state.segmentationLayers, state.selectedSegmentationLayer]);

  const getSelectedLayerCount = useCallback(() => {
    return state.selectedSegmentationLayer ? 1 : 0;
  }, [state.selectedSegmentationLayer]);

  const isSegmentationVisible = useCallback(() => {
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
      return false;
    }
    return state.segmentationLayerVisibility.get(layerId) ?? true;
  }, [state.selectedSegmentationLayer, state.segmentationLayerVisibility]);

  const toggleSegmentationView = useCallback(() => {
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
      console.warn("[Segmentation] No active layer to toggle visibility");
      return;
    }
    toggleSegmentationLayerVisibility(layerId);
  }, [state.selectedSegmentationLayer, toggleSegmentationLayerVisibility]);

  const getSegmentationHistoryState = useCallback(() => {
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
      return { canUndo: false, canRedo: false };
    }
    const stacks = getSegmentationLayerStacks(state.activeViewport, layerId);
    return {
      canUndo: Boolean(stacks?.undoStack.length),
      canRedo: Boolean(stacks?.redoStack.length),
    };
  }, [
    state.selectedSegmentationLayer,
    state.activeViewport,
    getSegmentationLayerStacks,
    segmentationHistoryVersion,
  ]);

  const value: ViewerContextType = {
    state,
    setActiveTool,
    setLayout,
    setActiveViewport,
    resetView,
    rotateViewport,
    flipViewport,
    invertViewport,
    clearAnnotations,
    clearViewportAnnotations,
    toggleAnnotations,
    undoAnnotation,
    redoAnnotation,
    undoSegmentation,
    redoSegmentation,
    recordAnnotationHistoryEntry,
    updateAnnotationHistoryEntry,
    removeAnnotationHistoryEntry,
    setViewportSeries,
    getViewportSeries,
    getViewportTransform,
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
    diagnosisViewport,
    clearAIAnnotations,
    toggleSegmentationControlPanel,
    isSegmentationControlPanelOpen,
    addSegmentationLayer,
    deleteSegmentationLayer,
    selectSegmentationLayer,
    toggleSegmentationLayerVisibility,
    getSegmentationLayers,
    getCurrentSegmentationLayerIndex,
    getSelectedLayerCount,
    isSegmentationVisible,
    toggleSegmentationView,
    getSegmentationHistoryState,
  };

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
