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
import {
  useGetImageSegmentationLayersBySeriesIdQuery,
  useLazyGetImageSegmentationLayersBySeriesIdQuery,
} from "@/store/imageSegmentationLayerApi";
import { extractApiData } from "@/utils/api";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import type { Annotation } from "@cornerstonejs/tools/types";
import { AnnotationType } from "@/enums/image-dicom.enum";
import { viewerEventService, ViewerEvents } from "@/services/ViewerEventService";
import viewportStateManager from "@/utils/viewportStateManager";
import { ViewportStatus } from "@/types/viewport-state";
import {
  createSegmentationHistoryHelpers,
  ensureViewportLabelmapSegmentation,
  captureSegmentationSnapshot,
  getCurrentSegmentationSnapshot,
  clearViewportLabelmapSegmentation,
  segmentationIdForViewport,
  restoreSegmentationSnapshot,
  clearSegmentationData,
  type SegmentationHistoryEntry,
  SegmentationSnapshot,
  type SegmentationHistoryStacks,
  decompressSnapshots,
} from "./viewer-context/segmentation-helper";
import { v4 as uuidv4 } from "uuid";
import { ImageSegmentationLayer } from "@/interfaces/image-dicom/image-segmentation-layer.interface";
import { toast } from "sonner";
import { batchedRender } from "@/utils/renderBatcher";

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
  | "KeyImage"
  | "Label"
  | "DragProbe"
  | "PaintFill"
  | "Eraser"
  | "ClearSegmentation"
  | "UndoAnnotation"
  // Segmentation tools
  | "Brush"
  | "CircleScissors"
  | "RectangleScissors"
  | "SphereScissors";

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

export interface SegmentationLayerMetadata {
  id: string;
  name: string;
  notes?: string;
  instanceId?: string;
  createdAt: number;
  createdBy?: string;
  origin: "local" | "database";
}

export interface SegmentationLayerData {
  metadata: SegmentationLayerMetadata;
  snapshots: SegmentationSnapshot[];
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
  segmentationLayers: Map<string, SegmentationLayerData>;
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
  reloadAnnotationsForSeries: (seriesId: string) => Promise<void>;
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
  updateSegmentationLayerMetadata: (
    layerId: string,
    updates: { name?: string; notes?: string }
  ) => void;
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
    snapshots: object[];
  }>;
  getCurrentSegmentationLayerIndex: () => number;
  getSelectedLayerCount: () => number;
  isSegmentationVisible: () => boolean;
  toggleSegmentationView: () => void;
  getSegmentationHistoryState: () => { canUndo: boolean; canRedo: boolean };
  getCurrentSegmentationSnapshot: (
    layerIndex?: number
  ) => SegmentationSnapshot | null;
  getCurrentLayerSnapshot: (layerIndex?: number) => SegmentationSnapshot | null;
  getAllLayerSnapshots: (layerId: string) => SegmentationSnapshot[];
  getAllCurrentLayerSnapshots: () => SegmentationSnapshot[];
  refetchSegmentationLayers: (excludeLayerIds?: string[]) => Promise<void>;
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
  segmentationLayers: new Map([
    [
      INITIAL_SEGMENTATION_LAYER_ID,
      {
        metadata: {
          id: INITIAL_SEGMENTATION_LAYER_ID,
          name: "Layer 1",
          createdAt: Date.now(),
          origin: "local",
        },
        snapshots: [],
      },
    ],
  ]),
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
      layers: Map<string, SegmentationLayerData>;
      selectedLayer: string | null;
    }
  | {
      type: "SET_SELECTED_SEGMENTATION_LAYER";
      layerId: string;
    }
  | {
      type: "ADD_SEGMENTATION_LAYER";
      layerId: string;
      name?: string;
      notes?: string;
      instanceId?: string;
      createdBy?: string;
    }
  | {
      type: "REMOVE_SEGMENTATION_LAYER";
      layerId: string;
    }
  | {
      type: "UPDATE_SEGMENTATION_LAYER_METADATA";
      layerId: string;
      updates: Partial<Omit<SegmentationLayerMetadata, "id" | "createdAt">>;
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
      const layerCount = nextLayers.size;
      nextLayers.set(action.layerId, {
        metadata: {
          id: action.layerId,
          name: action.name ?? `Layer ${layerCount + 1}`,
          notes: action.notes,
          instanceId: action.instanceId,
          createdAt: Date.now(),
          createdBy: action.createdBy,
          origin: "local",
        },
        snapshots: [],
      });
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

    case "UPDATE_SEGMENTATION_LAYER_METADATA": {
      const existing = state.segmentationLayers.get(action.layerId);
      if (!existing) {
        return state;
      }
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, {
        ...existing,
        metadata: {
          ...existing.metadata,
          ...action.updates,
        },
      });
      return {
        ...state,
        segmentationLayers: nextLayers,
      };
    }

    case "UPSERT_SEGMENTATION_LAYER_SNAPSHOT": {
      const existing = state.segmentationLayers.get(action.layerId);
      if (!existing) {
        return state;
      }
      const nextSnapshots = [...existing.snapshots, action.snapshot];
      if (nextSnapshots.length > MAX_LAYER_SNAPSHOTS_PER_LAYER) {
        nextSnapshots.shift();
      }
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, {
        ...existing,
        snapshots: nextSnapshots,
      });
      return {
        ...state,
        segmentationLayers: nextLayers,
      };
    }

    case "CLEAR_SEGMENTATION_LAYER_SNAPSHOTS": {
      const existing = state.segmentationLayers.get(action.layerId);
      if (!existing) {
        return state;
      }
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, {
        ...existing,
        snapshots: [],
      });
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
      if (!existing || !existing.snapshots.length) {
        return state;
      }
      const nextSnapshots = existing.snapshots.slice(
        0,
        existing.snapshots.length - 1
      );
      const nextLayers = new Map(state.segmentationLayers);
      nextLayers.set(action.layerId, {
        ...existing,
        snapshots: nextSnapshots,
      });
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

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(viewerReducer, defaultState);
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
  const [fetchSegmentationLayersBySeries] =
    useLazyGetImageSegmentationLayersBySeriesIdQuery();
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
  // Ref to track rendering engine IDs for cleanup (avoids stale closures)
  const renderingEngineIdsRef = useRef<Map<number, string>>(new Map());

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
  const viewportIdsRef = useRef(state.viewportIds);
  const showAnnotationsRef = useRef(state.showAnnotations);

  useEffect(() => {
    selectedSegmentationLayerRef.current = state.selectedSegmentationLayer;
  }, [state.selectedSegmentationLayer]);

  useEffect(() => {
    segmentationLayersRef.current = state.segmentationLayers;
  }, [state.segmentationLayers]);

  useEffect(() => {
    viewportIdsRef.current = state.viewportIds;
  }, [state.viewportIds]);

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

    const imageIdToInstanceMap =
      imageIdInstanceMapRef.current.get(viewportIndex);

    let cancelled = false;
    const applySnapshot = async () => {

      await ensureViewportLabelmapSegmentation({
        viewportId: currentViewportId,
        imageIds,
        imageIdToInstanceMap,
      });

      if (cancelled) {
        return;
      }

      const segmentationId = segmentationIdForViewport(currentViewportId);
      const layerId = state.selectedSegmentationLayer;
      const layerData = layerId
        ? state.segmentationLayers.get(layerId)
        : undefined;
      const layerSnapshots: SegmentationSnapshot[] = layerData?.snapshots ?? [];
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

  // Auto-update selected layer instanceId if missing
  useEffect(() => {
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) return;

    const layer = state.segmentationLayers.get(layerId);
    if (!layer || layer.metadata.instanceId) return;

    const viewport = state.activeViewport;
    const stackViewport = viewportRefs.current.get(viewport);

    if (
      stackViewport &&
      typeof stackViewport.getCurrentImageIdIndex === "function"
    ) {
      const currentIndex = stackViewport.getCurrentImageIdIndex();
      const imageIds = stackViewport.getImageIds?.() ?? [];
      const currentImageId = imageIds[currentIndex];

      if (currentImageId) {
        const imageIdToInstanceMap =
          imageIdInstanceMapRef.current.get(viewport);
        const instanceId = imageIdToInstanceMap?.[currentImageId];

        if (instanceId) {
          dispatch({
            type: "UPDATE_SEGMENTATION_LAYER_METADATA",
            layerId,
            updates: { instanceId },
          });
        }
      }
    }
  }, [
    state.selectedSegmentationLayer,
    state.activeViewport,
    state.viewportRuntimeStates,
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

        // Ensure segmentation is rendered on the current frame
        // This helps when switching between frames in a multi-frame series
        // Use batched render directly - no need for additional RAF wrapper
        try {
          const currentViewport = getStackViewport(viewport);
          if (currentViewport === stackViewport) {
            batchedRender(stackViewport);
          }
        } catch (error) {
          console.warn(
            "[Segmentation] Failed to re-render after frame change:",
            error
          );
        }
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

        const layerData = segmentationLayersRef.current.get(activeLayerId);
        const layerSnapshots = layerData?.snapshots ?? [];
        const previousSnapshot =
          layerSnapshots[layerSnapshots.length - 1] ?? null;

        const currentViewportId = viewportIdsRef.current.get(viewport);
        const imageIdToInstanceMap =
          imageIdInstanceMapRef.current.get(viewport);

        if (!currentViewportId) {
          console.warn(
            "[Segmentation] No viewport ID found for viewport",
            viewport
          );
          return;
        }

        const snapshot = captureSegmentationSnapshot(
          segmentationId,
          currentViewportId,
          imageIdToInstanceMap
        );
        if (!snapshot) {
          console.warn(
            "[Segmentation] Unable to capture snapshot for",
            segmentationId
          );
          return;
        }

        // Auto-update layer instanceId if missing
        if (layerData && !layerData.metadata.instanceId) {
          const firstInstanceId = snapshot.imageData.find(
            (d) => d.instanceId
          )?.instanceId;

          if (firstInstanceId) {
            dispatch({
              type: "UPDATE_SEGMENTATION_LAYER_METADATA",
              layerId: activeLayerId,
              updates: { instanceId: firstInstanceId },
            });
          }
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
      const activeViewportId = state.viewportIds.get(state.activeViewport);
      
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
            console.warn(`Viewport ${activeViewportId} not ready (status: ${viewportState.status})`);
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

      if (segmentationTools.includes(tool) && state.selectedSegmentationLayer) {
        const selectedLayer = state.segmentationLayers.get(
          state.selectedSegmentationLayer
        );
        if (selectedLayer?.metadata.origin === "database") {
          toast.warning(
            "Cannot edit this layer: It's saved in the database. Please create a new local layer to draw."
          );
          return;
        }
      }

      dispatch({ type: "SET_ACTIVE_TOOL", tool });
    },
    [dispatch, state.selectedSegmentationLayer, state.segmentationLayers, state.activeViewport, state.viewportIds]
  );

  const setLayout = (layout: GridLayout) => {
    dispatch({ type: "SET_LAYOUT", layout, recordHistory: true });
  };

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
          // State manager not ready, continue without state tracking
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
              // Silently ignore disable errors - viewport may already be disabled or in invalid state
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
          // ignore cleanup errors
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
          // State manager not ready, continue without state tracking
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
          batchedRender(stackViewport);
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
      
      // Initialize viewport state if needed (gracefully handle if state manager isn't ready)
      try {
        const currentState = viewportStateManager.getState(viewportId);
        if (!currentState || currentState.status === ViewportStatus.DISPOSED) {
          viewportStateManager.initialize(viewportId);
        }
        
        // Transition to LOADING state
        viewportStateManager.startLoading(viewportId);
      } catch (error) {
        // State manager initialization failed, continue without it
        console.debug('Viewport state manager not ready, continuing without state tracking');
      }

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
          
          // Check if engine with this ID already exists (prevent duplicates)
          const existingEngine = getRenderingEngine(renderingEngineId);
          if (existingEngine) {
            // Engine already exists, use it instead of creating new one
            renderingEngine = existingEngine;
          } else {
            // Create new engine only if it doesn't exist
            setRenderingEngineId(viewport, renderingEngineId);
            renderingEngine = new RenderingEngine(renderingEngineId);
          }
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
              
              // Transition viewport to READY state with image data
              try {
                const imageData = existingViewport.getImageData?.();
                if (imageData) {
                  viewportStateManager.setImageData(viewportId, imageData);
                }
              } catch (error) {
                // State manager not ready, continue without state tracking
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

            // Diagnostics: verify per-viewport imageId->instanceId mapping
            if (imageIdToInstance) {
              const keys = Object.keys(imageIdToInstance);
              console.log(
                `[Segmentation] SetStack(existing): viewport=${viewport} mapSize=${keys.length} sample=`,
                keys.slice(0, 3).map((k) => ({
                  imageId: k,
                  instanceId: imageIdToInstance[k],
                }))
              );
            } else {
              console.log(
                `[Segmentation] SetStack(existing): viewport=${viewport} has no imageIdToInstanceMap`
              );
            }

            await ensureViewportLabelmapSegmentation({
              viewportId: currentViewportId,
              imageIds,
              imageIdToInstanceMap: imageIdToInstance,
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
        batchedRender(readyViewport);

        // Diagnostics: verify per-viewport imageId->instanceId mapping
        if (imageIdToInstance) {
          const keys = Object.keys(imageIdToInstance);
          console.log(
            `[Segmentation] SetStack(new): viewport=${viewport} mapSize=${keys.length} sample=`,
            keys
              .slice(0, 3)
              .map((k) => ({ imageId: k, instanceId: imageIdToInstance[k] }))
          );
        } else {
          console.log(
            `[Segmentation] SetStack(new): viewport=${viewport} has no imageIdToInstanceMap`
          );
        }

        await ensureViewportLabelmapSegmentation({
          viewportId: currentViewportId,
          imageIds,
          imageIdToInstanceMap: imageIdToInstance,
        });

        // await restoreSegmentationFromLocalStorage(currentViewportId);
        // await restoreSegmentationFromLocalStorage(currentViewportId);

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
        
        // Transition viewport to READY state with image data
        try {
          const imageData = readyViewport.getImageData?.();
          if (imageData) {
            viewportStateManager.setImageData(viewportId, imageData);
          }
        } catch (stateError) {
          // State manager not ready, continue without state tracking
          console.debug('Could not update viewport state');
        }
      } catch (error) {
        if (!bailIfStale() && (error as Error)?.name !== "AbortError") {
          console.error("Failed to load series into viewport", error);
          
          // Transition viewport to ERROR state
          try {
            viewportStateManager.setError(viewportId, error as Error);
          } catch (stateError) {
            // State manager not ready, continue without state tracking
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
    ]
  );

  const loadDatabaseSegmentationForViewports = useCallback(
    async (seriesId: string) => {
      try {
        const segmentationResult = await fetchSegmentationLayersBySeries(
          seriesId
        ).unwrap();

        if (segmentationResult.data && Array.isArray(segmentationResult.data)) {
          const layers = new Map<string, SegmentationLayerData>();

          segmentationResult.data.forEach((layer: ImageSegmentationLayer) => {
            // Decompress snapshots
            const decompressedSnapshots = decompressSnapshots(
              layer.snapshots || []
            );

            layers.set(layer.id, {
              metadata: {
                id: layer.id,
                name: layer.layerName,
                notes: layer.notes || undefined,
                instanceId: layer.instanceId,
                createdAt: Date.now(), // Fallback - ideally from backend
                createdBy: layer.segmentatorId,
                origin: "database",
              },
              snapshots: decompressedSnapshots as SegmentationSnapshot[],
            });
          });

          // Dispatch to update state with loaded layers
          const firstLayerId =
            layers.size > 0 ? layers.keys().next().value : null;
          dispatch({
            type: "SET_SEGMENTATION_LAYERS",
            layers,
            selectedLayer: firstLayerId ?? null,
          });

          console.log(
            `[Segmentation] Loaded ${layers.size} layer(s) from database for series ${seriesId}`
          );
        }
      } catch (error) {
        console.error("Failed to load segmentation layers", error);
      }
    },
    [fetchSegmentationLayersBySeries]
  );

  const refetchSegmentationLayers = useCallback(
    async (excludeLayerIds: string[] = []) => {
      const viewport = state.activeViewport;
      const series = getViewportSeries(viewport);
      const seriesId = series?.id;

      if (!seriesId) {
        console.warn("[Segmentation] No series loaded, cannot refetch layers");
        return;
      }

      try {
        // Fetch database layers
        const segmentationResult = await fetchSegmentationLayersBySeries(
          seriesId
        ).unwrap();

        const mergedLayers = new Map<string, SegmentationLayerData>();

        // First, preserve existing local layers, excluding specified ones
        state.segmentationLayers.forEach((layer, layerId) => {
          if (
            layer.metadata.origin === "local" &&
            !excludeLayerIds.includes(layerId)
          ) {
            mergedLayers.set(layerId, layer);
          }
        });

        // Then add/update database layers
        if (segmentationResult.data && Array.isArray(segmentationResult.data)) {
          segmentationResult.data.forEach((layer: ImageSegmentationLayer) => {
            const decompressedSnapshots = decompressSnapshots(
              layer.snapshots || []
            );

            mergedLayers.set(layer.id, {
              metadata: {
                id: layer.id,
                name: layer.layerName,
                notes: layer.notes || undefined,
                instanceId: layer.instanceId,
                createdAt: Date.now(),
                createdBy: layer.segmentatorId,
                origin: "database",
              },
              snapshots: decompressedSnapshots as SegmentationSnapshot[],
            });
          });
        }

        // Determine selected layer
        let selectedLayer = state.selectedSegmentationLayer;

        // If current selected layer was deleted, select first available
        if (selectedLayer && !mergedLayers.has(selectedLayer)) {
          selectedLayer =
            mergedLayers.size > 0 ? (mergedLayers.keys().next().value ?? null) : null;
        }

        // If no layer selected but layers exist, select first
        if (!selectedLayer && mergedLayers.size > 0) {
          selectedLayer = mergedLayers.keys().next().value ?? null;
        }

        dispatch({
          type: "SET_SEGMENTATION_LAYERS",
          layers: mergedLayers,
          selectedLayer: selectedLayer ?? null,
        });

        console.log(
          `[Segmentation] Refetched layers - Local: ${
            Array.from(mergedLayers.values()).filter(
              (l) => l.metadata.origin === "local"
            ).length
          }, Database: ${
            Array.from(mergedLayers.values()).filter(
              (l) => l.metadata.origin === "database"
            ).length
          }`
        );
      } catch (error) {
        console.error("Failed to refetch segmentation layers", error);
      }
    },
    [
      state.activeViewport,
      state.segmentationLayers,
      state.selectedSegmentationLayer,
      getViewportSeries,
      fetchSegmentationLayersBySeries,
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
                const engine = getRenderingEngine(renderingEngineId);
                const viewport = engine?.getViewport(viewportId);
                viewport?.render();
              } catch (error) {
                console.error('Error re-rendering viewport:', error);
              }
            }
          }
        }
      });
    },
    [state.viewportIds, state.viewportSeries, state.renderingEngineIds, loadDatabaseAnnotationsForViewport]
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

    // Publish event via pub/sub service
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

    // Publish event via pub/sub service
    const viewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    viewerEventService.publish(ViewerEvents.ROTATE_VIEWPORT, { degrees, viewportId });

    // Note: Don't update context state here - let Cornerstone.js handle the actual rotation
    // The context state is just for UI tracking, not the actual viewport state
  };

  const flipViewport = (direction: "horizontal" | "vertical") => {

    // Publish event via pub/sub service
    const viewportId =
      state.viewportIds.get(state.activeViewport) ||
      state.activeViewport.toString();
    viewerEventService.publish(ViewerEvents.FLIP_VIEWPORT, { direction, viewportId });

    // Note: Don't update context state here - let Cornerstone.js handle the actual flip
    // The context state is just for UI tracking, not the actual viewport state
  };

  const invertViewport = () => {
    viewerEventService.publish(ViewerEvents.INVERT_COLORMAP);
  };

  const clearAnnotations = () => {
    console.log(
      "Clear annotations requested from context - clearing all viewports"
    );
    // Clear history for all viewports
    state.viewportSeries.forEach((_, viewportIndex) => {
      clearAnnotationHistoryForViewport(viewportIndex);
    });
    // Publish event via pub/sub service
    viewerEventService.publish(ViewerEvents.CLEAR_ANNOTATIONS);
  };

  const clearViewportAnnotations = () => {
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
  };

  const undoAnnotation = () => {
    const viewportIndex = state.activeViewport;
    const activeViewportId =
      state.viewportIds.get(viewportIndex) || viewportIndex.toString();
    const historyEntry = consumeUndoEntry(viewportIndex);
    viewerEventService.publish(ViewerEvents.UNDO_ANNOTATION, {
      activeViewportId,
      entry: historyEntry ? cloneHistoryEntry(historyEntry) : undefined,
    });
  };

  const redoAnnotation = () => {
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

    viewerEventService.publish(ViewerEvents.UNDO_SEGMENTATION, {
      activeViewportId,
      layerId,
      entry: historyEntry,
    });
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

    viewerEventService.publish(ViewerEvents.REDO_SEGMENTATION, {
      activeViewportId,
      layerId,
      entry: historyEntry,
    });
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

  }, [state.showAnnotations, state.viewportSeries, state.viewportIds, loadDatabaseAnnotationsForViewport, unloadAnnotationsFromViewport]);

  const toggleSegmentationControlPanel = () => {
    dispatch({ type: "TOGGLE_SEGMENTATION_CONTROL_PANEL" });
  };

  const isSegmentationControlPanelOpen = () => {
    return state.isSegmentationControlModalOpen;
  };
  const addSegmentationLayer = useCallback(() => {
    const newLayerId = uuidv4();

    // Get the current viewport's active instance ID (similar to annotation flow)
    const viewport = state.activeViewport;
    const stackViewport = viewportRefs.current.get(viewport);
    let instanceId: string | undefined;

    console.log("[addSegmentationLayer] Starting layer creation:", {
      viewport,
      hasStackViewport: !!stackViewport,
      hasGetCurrentImageIdIndex: !!(
        stackViewport &&
        typeof stackViewport.getCurrentImageIdIndex === "function"
      ),
    });

    if (
      stackViewport &&
      typeof stackViewport.getCurrentImageIdIndex === "function"
    ) {
      const currentIndex = stackViewport.getCurrentImageIdIndex();
      const imageIds = stackViewport.getImageIds?.() ?? [];
      const currentImageId = imageIds[currentIndex];


      if (currentImageId) {
        const imageIdToInstanceMap =
          imageIdInstanceMapRef.current.get(viewport);
        instanceId = imageIdToInstanceMap?.[currentImageId];

        console.log("[addSegmentationLayer] Instance mapping:", {
          hasMapping: !!imageIdToInstanceMap,
          mappingSize: imageIdToInstanceMap
            ? Object.keys(imageIdToInstanceMap).length
            : 0,
          instanceId,
        });
      }
    }

    dispatch({
      type: "ADD_SEGMENTATION_LAYER",
      layerId: newLayerId,
      instanceId,
    });

  }, [state.activeViewport]);

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

    },
    [state.selectedSegmentationLayer]
  );

  const updateSegmentationLayerMetadata = useCallback(
    (layerId: string, updates: { name?: string; notes?: string }) => {
      if (!state.segmentationLayers.has(layerId)) {
        console.warn("Cannot update metadata for non-existent layer:", layerId);
        return;
      }

      dispatch({
        type: "UPDATE_SEGMENTATION_LAYER_METADATA",
        layerId,
        updates,
      });

    },
    [state.segmentationLayers]
  );

  const toggleSegmentationLayerVisibility = useCallback(
    (layerId: string) => {
      if (!layerId) {
        return;
      }
      const currentVisible =
        state.segmentationLayerVisibility.get(layerId) ?? true;
      setLayerVisibility(layerId, !currentVisible);
    },
    [setLayerVisibility, state.segmentationLayerVisibility]
  );

  // Memoize segmentation layers to avoid recreating array on every call
  const memoizedSegmentationLayers = useMemo(() => {
    return Array.from(state.segmentationLayers.entries()).map(
      ([layerId, layerData]) => ({
        id: layerId,
        name: layerData.metadata.name,
        notes: layerData.metadata.notes,
        instanceId: layerData.metadata.instanceId,
        createdAt: layerData.metadata.createdAt,
        active: layerId === state.selectedSegmentationLayer,
        visible: state.segmentationLayerVisibility.get(layerId) ?? true,
        origin: layerData.metadata.origin,
        snapshots: layerData.snapshots,
      })
    );
  }, [
    state.segmentationLayers,
    state.selectedSegmentationLayer,
    state.segmentationLayerVisibility,
  ]);

  const getSegmentationLayers = useCallback(() => {
    return memoizedSegmentationLayers;
  }, [memoizedSegmentationLayers]);

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

  const getCurrentSegmentationSnapshot = useCallback(
    (layerIndex?: number) => {
      const viewport = state.activeViewport;
      const currentViewportId = state.viewportIds.get(viewport);
      const imageIdToInstanceMap = imageIdInstanceMapRef.current.get(viewport);

      console.log("[Debug] getCurrentSegmentationSnapshot called:", {
        viewport,
        currentViewportId,
        hasImageIdToInstanceMap: !!imageIdToInstanceMap,
        layerIndex,
      });

      if (!currentViewportId) {
        console.warn(
          "[Segmentation] No viewport ID found for viewport",
          viewport
        );
        return null;
      }

      const segmentationId = segmentationIdForViewport(currentViewportId);

      // Check if segmentation exists
      const segState = segmentation.state.getSegmentation(segmentationId);

      if (!segState) {
        console.warn(
          "[Segmentation] No segmentation found with ID:",
          segmentationId
        );
        return null;
      }

      // Get the current segmentation state (not history) - using the helper function
      const snapshot = captureSegmentationSnapshot(
        segmentationId,
        currentViewportId,
        imageIdToInstanceMap
      );


      return snapshot;
    },
    [state.activeViewport, state.viewportIds]
  );

  const getCurrentLayerSnapshot = useCallback(
    (layerIndex?: number) => {
      const layerId = state.selectedSegmentationLayer;

      if (!layerId) {
        console.warn("[Segmentation] No layer selected");
        return null;
      }

      const layerData = state.segmentationLayers.get(layerId);
      const layerSnapshots = layerData?.snapshots ?? [];
      const latestSnapshot = layerSnapshots[layerSnapshots.length - 1] ?? null;


      return latestSnapshot;
    },
    [state.selectedSegmentationLayer, state.segmentationLayers]
  );

  const getAllLayerSnapshots = useCallback(
    (layerId: string): SegmentationSnapshot[] => {
      const layerData = state.segmentationLayers.get(layerId);
      if (!layerData) {
        console.warn(
          `[getAllLayerSnapshots] No snapshots found for layer ${layerId}`
        );
        return [];
      }
      return layerData.snapshots;
    },
    [state.segmentationLayers]
  );

  const getAllCurrentLayerSnapshots =
    useCallback((): SegmentationSnapshot[] => {
      const selectedLayerId = state.selectedSegmentationLayer;
      if (!selectedLayerId) {
        console.warn("[getAllCurrentLayerSnapshots] No layer selected");
        return [];
      }
      return getAllLayerSnapshots(selectedLayerId);
    }, [state.selectedSegmentationLayer, getAllLayerSnapshots]);

  const value: ViewerContextType = useMemo(
    () => ({
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
      reloadAnnotationsForSeries,
      diagnosisViewport,
      clearAIAnnotations,
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
    }),
    [
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
      getViewportRuntimeState,
      getStackViewport,
      goToFrame,
      nextFrame,
      prevFrame,
      refreshViewport,
      reloadAnnotationsForSeries,
      diagnosisViewport,
      clearAIAnnotations,
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
