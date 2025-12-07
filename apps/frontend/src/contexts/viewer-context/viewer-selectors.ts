/**
 * Optimized selector functions for ViewerContext
 * These reduce unnecessary re-renders by providing memoized selectors
 */

import { ViewerState, ViewportRuntimeState, ViewportTransform } from "../ViewerContext";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";

// Selector utilities
export const selectViewportSeries = (state: ViewerState, viewport: number): DicomSeries | undefined => {
  return state.viewportSeries.get(viewport);
};

export const selectViewportTransform = (state: ViewerState, viewport: number): ViewportTransform => {
  return state.viewportTransforms.get(viewport) || {
    rotation: 0,
    flipH: false,
    flipV: false,
    zoom: 1,
    pan: { x: 0, y: 0 },
  };
};

export const selectViewportId = (state: ViewerState, viewport: number): string | undefined => {
  return state.viewportIds.get(viewport);
};

export const selectRenderingEngineId = (state: ViewerState, viewport: number): string | undefined => {
  return state.renderingEngineIds.get(viewport);
};

export const selectViewportRuntimeState = (state: ViewerState, viewport: number): ViewportRuntimeState => {
  return state.viewportRuntimeStates.get(viewport) || {
    seriesId: null,
    studyId: null,
    isLoading: false,
    loadingProgress: 0,
    viewportReady: false,
    currentFrame: 0,
    totalFrames: 0,
  };
};

export const selectActiveTool = (state: ViewerState) => state.activeTool;
export const selectLayout = (state: ViewerState) => state.layout;
export const selectActiveViewport = (state: ViewerState) => state.activeViewport;
export const selectIsToolActive = (state: ViewerState) => state.isToolActive;
export const selectShowAnnotations = (state: ViewerState) => state.showAnnotations;

// Segmentation selectors
export const selectSegmentationLayers = (state: ViewerState) => state.segmentationLayers;
export const selectSegmentationLayerVisibility = (state: ViewerState) => state.segmentationLayerVisibility;
export const selectSelectedSegmentationLayer = (state: ViewerState) => state.selectedSegmentationLayer;
export const selectIsSegmentationControlModalOpen = (state: ViewerState) => state.isSegmentationControlModalOpen;

// Derived selectors
export const selectSegmentationLayersArray = (state: ViewerState) => {
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
};

export const selectCurrentSegmentationLayerIndex = (state: ViewerState) => {
  const layers = Array.from(state.segmentationLayers.keys());
  return layers.findIndex(
    (layerId) => layerId === state.selectedSegmentationLayer
  );
};

export const selectIsSegmentationLayerVisible = (state: ViewerState, layerId: string) => {
  return state.segmentationLayerVisibility.get(layerId) ?? true;
};

export const selectIsCurrentSegmentationVisible = (state: ViewerState) => {
  const layerId = state.selectedSegmentationLayer;
  if (!layerId) return false;
  return state.segmentationLayerVisibility.get(layerId) ?? true;
};

// Performance-optimized selectors with shallow comparison
export const selectViewportSeriesIds = (state: ViewerState): Map<number, string | null> => {
  const seriesIds = new Map<number, string | null>();
  state.viewportSeries.forEach((series, viewport) => {
    seriesIds.set(viewport, series?.id || null);
  });
  return seriesIds;
};

export const selectAllViewportsReady = (state: ViewerState): boolean => {
  const viewportCount = getViewportCountFromLayout(state.layout);
  for (let i = 0; i < viewportCount; i++) {
    const runtime = state.viewportRuntimeStates.get(i);
    if (!runtime?.viewportReady) return false;
  }
  return true;
};

export const selectAnyViewportLoading = (state: ViewerState): boolean => {
  for (const runtime of state.viewportRuntimeStates.values()) {
    if (runtime.isLoading) return true;
  }
  return false;
};

// Helper function
function getViewportCountFromLayout(layout: string): number {
  switch (layout) {
    case "1x1":
      return 1;
    case "1x2":
    case "2x1":
      return 2;
    case "1x3":
    case "3x1":
      return 3;
    case "2x2":
      return 4;
    default:
      return 1;
  }
}

