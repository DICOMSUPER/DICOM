import { v4 as uuidv4 } from "uuid";
import { DicomSeries } from "@/common/interfaces/image-dicom/dicom-series.interface";
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import type { Annotation } from "@cornerstonejs/tools/types";
import { SegmentationSnapshot } from "./segmentation-helper";

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
  // Additional tools
  | "TrackballRotate"
  | "MIPJumpToClick"
  | "SegmentBidirectional"
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
  frame?: number | null;
  segmentationStatus?: string;
  colorCode?: string;
  segmentatorId?: string;
  segmentationDate?: Date;
  reviewerId?: string;
  reviewDate?: Date;
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

export const defaultTransform: ViewportTransform = {
  rotation: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

export const defaultViewportRuntimeState: ViewportRuntimeState = {
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

export const defaultState: ViewerState = {
  activeTool: "Pan",
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

export type ViewerAction =
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

export const viewerReducer = (
  state: ViewerState,
  action: ViewerAction
): ViewerState => {
  switch (action.type) {
    case "SET_ACTIVE_TOOL": {
      if (state.activeTool === action.tool) {
        return state;
      }
      return {
        ...state,
        activeTool: action.tool,
        // Don't auto-activate - let the tool remain in its current active state
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
