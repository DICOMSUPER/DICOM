import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  segmentation,
  utilities as csToolsUtilities,
  Enums as ToolEnums,
  Enums as SegmentationEnums,
} from "@cornerstonejs/tools";
import { getRenderingEngine, eventTarget } from "@cornerstonejs/core";
import { toast } from "sonner";
import { useLazyGetImageSegmentationLayersBySeriesIdQuery } from "@/store/imageSegmentationLayerApi";
import { viewerEventService, ViewerEvents } from "@/services/ViewerEventService";
import { segmentationStyle } from "@cornerstonejs/tools/segmentation";
import {
  createSegmentationHistoryHelpers,
  ensureViewportLabelmapSegmentation,
  captureSegmentationSnapshot,
  segmentationIdForViewport,
  restoreSegmentationSnapshot,
  clearSegmentationData,
  isSegmentationValid,
  type SegmentationHistoryEntry,
  type SegmentationSnapshot,
  SegmentationHistoryStacks,
  decompressSnapshots,
  clearViewportLabelmapSegmentation,
} from "./segmentation-helper";
import { batchedRender } from "@/common/utils/renderBatcher";
import {
  ViewerState,
  ViewerAction,
  SegmentationLayerData,
  ToolType,
} from "./viewer-reducer";
import { ImageSegmentationLayer } from "@/common/interfaces/image-dicom/image-segmentation-layer.interface";
import type { Types } from "@cornerstonejs/core";

const SEGMENTATION_HISTORY_IGNORED_REASONS = new Set([
  "layer-sync-restore",
  "layer-sync-clear",
  "segmentation-view-toggle-show",
  "segmentation-view-toggle-hide",
  "history-undo",
  "history-redo",
]);

interface UseSegmentationManagementProps {
  state: ViewerState;
  dispatch: React.Dispatch<ViewerAction>;
  viewportRefs: React.MutableRefObject<Map<number, Types.IStackViewport>>;
  imageIdInstanceMapRef: React.MutableRefObject<Map<number, Record<string, string>>>;
  renderingEngineIdsRef: React.MutableRefObject<Map<number, string>>;
  viewportElementsRef: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
  getViewportSeries: (viewport: number) => any; // Using any for series to avoid circular dep for now
}

export const useSegmentationManagement = ({
  state,
  dispatch,
  viewportRefs,
  imageIdInstanceMapRef,
  renderingEngineIdsRef,
  viewportElementsRef,
  getViewportSeries,
}: UseSegmentationManagementProps) => {
  const [fetchSegmentationLayersBySeries] =
    useLazyGetImageSegmentationLayersBySeriesIdQuery();

  // Internal refs to track state for async operations
  const segmentationLayersRef = useRef(state.segmentationLayers);
  const viewportIdsRef = useRef(state.viewportIds);
  const selectedSegmentationLayerRef = useRef(state.selectedSegmentationLayer);
  const segmentationLayerVisibilityRef = useRef(state.segmentationLayerVisibility);
  
  // Track dirty state to avoid duplicate snapshots on layer switch
  const isSegmentationDirtyRef = useRef(false);
  const isRestoringSnapshotRef = useRef(false);
  // Mutex to prevent concurrent layer switch operations
  const layerSwitchInProgressRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    segmentationLayersRef.current = state.segmentationLayers;
  }, [state.segmentationLayers]);

  useEffect(() => {
    viewportIdsRef.current = state.viewportIds;
  }, [state.viewportIds]);

  useEffect(() => {
    selectedSegmentationLayerRef.current = state.selectedSegmentationLayer;
  }, [state.selectedSegmentationLayer]);

  useEffect(() => {
    segmentationLayerVisibilityRef.current = state.segmentationLayerVisibility;
  }, [state.segmentationLayerVisibility]);

  const segmentationHistoryRef = useRef<
    Map<number, Map<string, SegmentationHistoryStacks>>
  >(new Map());

  const [segmentationHistoryVersion, setSegmentationHistoryVersion] =
    useState(0);

  const notifySegmentationHistoryChange = useCallback(() => {
    setSegmentationHistoryVersion((prev) => prev + 1);
  }, []);

  // History helpers
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

  // Track dirty state
  useEffect(() => {
    const handleSegmentationModified = (evt: Event) => {
      // Ignore if we are currently restoring a snapshot
      if (isRestoringSnapshotRef.current) return;
      
      // Mark as dirty
      isSegmentationDirtyRef.current = true;
    };

    eventTarget.addEventListener(SegmentationEnums.Events.SEGMENTATION_DATA_MODIFIED, handleSegmentationModified as EventListener);
    
    return () => {
      eventTarget.removeEventListener(SegmentationEnums.Events.SEGMENTATION_DATA_MODIFIED, handleSegmentationModified as EventListener);
    };
  }, []);

  // Sync Logic Refs
  const previousLayerSelectionRef = useRef<string | null>(
    state.selectedSegmentationLayer
  );
  const previousActiveViewportRef = useRef<number>(state.activeViewport);
  const previousViewportIdRef = useRef<string | undefined>(
    state.viewportIds.get(state.activeViewport)
  );
  const previousLayerVisibilityRef = useRef<boolean | undefined>(undefined);

  // Helper to get current viewport data - reduces repeated code patterns
  const getViewportData = useCallback((viewportIndex: number) => {
    const stackViewport = viewportRefs.current.get(viewportIndex);
    const viewportId = state.viewportIds.get(viewportIndex);
    const imageIds = stackViewport?.getImageIds?.() ?? [];
    const imageIdToInstanceMap = imageIdInstanceMapRef.current.get(viewportIndex);
    const renderingEngineId = renderingEngineIdsRef.current.get(viewportIndex);
    
    return {
      stackViewport,
      viewportId,
      imageIds,
      imageIdToInstanceMap,
      renderingEngineId,
      isValid: !!stackViewport && typeof stackViewport.getImageIds === "function" && !!viewportId && imageIds.length > 0,
    };
  }, [viewportRefs, state.viewportIds, imageIdInstanceMapRef, renderingEngineIdsRef]);

  // Extract only the data needed for the selected layer to narrow dependencies
  const selectedLayerData = useMemo(() => {
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) return null;
    const layerData = state.segmentationLayers.get(layerId);
    if (!layerData) return null;
    return {
      layerId,
      snapshots: layerData.snapshots,
      latestSnapshot: layerData.snapshots[layerData.snapshots.length - 1] ?? null,
    };
  }, [state.selectedSegmentationLayer, state.segmentationLayers]);

  const selectedLayerVisibility = useMemo(() => {
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) return true;
    return state.segmentationLayerVisibility.get(layerId) ?? true;
  }, [state.selectedSegmentationLayer, state.segmentationLayerVisibility]);

  // Effect 1: Handle visibility-only changes (non-destructive style updates)
  useEffect(() => {
    const currentLayerId = state.selectedSegmentationLayer;
    const currentVisibility = selectedLayerVisibility;
    const visibilityChanged = previousLayerVisibilityRef.current !== currentVisibility;
    
    // Update ref
    previousLayerVisibilityRef.current = currentVisibility;
    
    // Only handle pure visibility changes here
    if (!visibilityChanged || !currentLayerId) {
      return;
    }

    // Skip if layer or viewport also changed - let the data restoration effect handle it
    const layerChanged = previousLayerSelectionRef.current !== state.selectedSegmentationLayer;
    const viewportChanged = previousActiveViewportRef.current !== state.activeViewport;
    const currentViewportId = state.viewportIds.get(state.activeViewport);
    const viewportIdChanged = previousViewportIdRef.current !== currentViewportId;
    
    if (layerChanged || viewportChanged || viewportIdChanged) {
      return;
    }

    // Apply visibility via style API
    if (!currentViewportId) return;
    
    const segmentationId = segmentationIdForViewport(currentViewportId);
    
    try {
      const styleToApply = currentVisibility
        ? {
            fillAlpha: 0.5,
            outlineOpacity: 1,
            renderFill: true,
            renderOutline: true,
          }
        : {
            fillAlpha: 0,
            outlineOpacity: 0,
            renderFill: false,
            renderOutline: false,
          };

      const segStyleApi = segmentationStyle;
      if (typeof segStyleApi?.setStyle === 'function') {
        segStyleApi.setStyle(
          { 
            segmentationId,
            type: ToolEnums.SegmentationRepresentations.Labelmap,
          },
          styleToApply
        );
      }
    } catch (e) {
      console.warn("[Segmentation] Failed to set segmentation visibility:", e);
    }
  }, [selectedLayerVisibility, state.selectedSegmentationLayer, state.activeViewport, state.viewportIds]);

  // Effect 2: Handle layer/viewport changes (data restoration)
  useEffect(() => {
    const viewportIndex = state.activeViewport;
    const layerChanged = previousLayerSelectionRef.current !== state.selectedSegmentationLayer;
    const viewportChanged = previousActiveViewportRef.current !== viewportIndex;
    const currentViewportId = state.viewportIds.get(viewportIndex);
    const viewportIdChanged = previousViewportIdRef.current !== currentViewportId;

    // Capture previous layer ID before updating the ref
    const prevLayerId = previousLayerSelectionRef.current;

    // Update refs
    previousLayerSelectionRef.current = state.selectedSegmentationLayer;
    previousActiveViewportRef.current = viewportIndex;
    previousViewportIdRef.current = currentViewportId;

    // Only proceed if layer or viewport changed
    if (!layerChanged && !viewportChanged && !viewportIdChanged) {
      return;
    }

    const { stackViewport, viewportId, imageIds, imageIdToInstanceMap, renderingEngineId, isValid } = getViewportData(viewportIndex);
    
    if (!isValid || !viewportId) {
      return;
    }

    let cancelled = false;
    const applySnapshot = async () => {
      // Prevent concurrent layer switch operations
      if (layerSwitchInProgressRef.current) {
        return;
      }
      
      layerSwitchInProgressRef.current = true;
      
      try {
        await ensureViewportLabelmapSegmentation({
          viewportId,
          imageIds,
          imageIdToInstanceMap,
        });
      } catch (error) {
        console.warn("[Segmentation] Failed to ensure labelmap segmentation:", error);
        layerSwitchInProgressRef.current = false;
        return;
      }

      if (cancelled) {
        layerSwitchInProgressRef.current = false;
        return;
      }

      // Wait a frame to ensure labelmap is fully initialized
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      
      if (cancelled) {
        layerSwitchInProgressRef.current = false;
        return;
      }

      const segmentationId = segmentationIdForViewport(viewportId);

      // Auto-save previous layer state before switching logic overwrites it
      if (layerChanged && prevLayerId && isSegmentationValid(segmentationId)) {
        if (isSegmentationDirtyRef.current) {
          try {
            const snapshot = captureSegmentationSnapshot(
              segmentationId,
              viewportId,
              imageIdToInstanceMap
            );
            if (snapshot) {
              dispatch({
                type: "UPSERT_SEGMENTATION_LAYER_SNAPSHOT",
                layerId: prevLayerId,
                snapshot,
              });
              isSegmentationDirtyRef.current = false;
            }
          } catch (saveError) {
            console.warn("[Segmentation] Failed to auto-save previous layer:", saveError);
          }
        }
      }

      const layerId = selectedLayerData?.layerId;
      const latestSnapshot = selectedLayerData?.latestSnapshot ?? null;

      // Handle Data Restoration
      if (isSegmentationValid(segmentationId)) {
        isRestoringSnapshotRef.current = true;
        try {
          if (layerId && latestSnapshot) {
            restoreSegmentationSnapshot(latestSnapshot, {
              reason: "layer-sync-restore",
              viewportId,
            });
            isSegmentationDirtyRef.current = false;
          } else {
            clearSegmentationData(segmentationId, {
              reason: "layer-sync-clear",
            });
            isSegmentationDirtyRef.current = false;
          }
        } finally {
          isRestoringSnapshotRef.current = false;
        }
      }

      // Force viewport render
      if (!cancelled && stackViewport) {
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
        
        if (cancelled) return;
        
        try {
          batchedRender(stackViewport);

          if (renderingEngineId) {
            const engine = getRenderingEngine(renderingEngineId);
            if (engine) {
              engine.renderViewports([viewportId]);
            }
          }
          
          requestAnimationFrame(() => {
            if (!cancelled) {
              try {
                batchedRender(stackViewport);
              } catch {
                // ignore
              }
            }
          });
        } catch {
          // ignore render errors
        }
      }
      
      layerSwitchInProgressRef.current = false;
    };

    void applySnapshot();

    return () => {
      cancelled = true;
    };
  }, [
    state.activeViewport,
    state.selectedSegmentationLayer,
    state.viewportIds,
    selectedLayerData,
    getViewportData,
    dispatch,
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
    viewportRefs,
    imageIdInstanceMapRef,
    dispatch
  ]);

  // Actions
  const addSegmentationLayer = useCallback(() => {
    const newLayerId = uuidv4();
    const viewport = state.activeViewport;
    const stackViewport = viewportRefs.current.get(viewport);
    let instanceId: string | undefined;

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
      }
    }

    dispatch({
      type: "ADD_SEGMENTATION_LAYER",
      layerId: newLayerId,
      instanceId,
    });

  }, [state.activeViewport, viewportRefs, imageIdInstanceMapRef, dispatch]);

  const deleteSegmentationLayer = useCallback(
    (layerId: string) => {
      dispatch({
        type: "REMOVE_SEGMENTATION_LAYER",
        layerId,
      });
      clearLayerHistoryAcrossViewports(layerId);
    },
    [clearLayerHistoryAcrossViewports, dispatch]
  );

  const selectSegmentationLayer = useCallback(
    (layerId: string) => {
      if (state.selectedSegmentationLayer === layerId) return;

      dispatch({
        type: "SET_SELECTED_SEGMENTATION_LAYER",
        layerId,
      });

    },
    [state.selectedSegmentationLayer, dispatch]
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
    [state.segmentationLayers, dispatch]
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
      return;
    }
    toggleSegmentationLayerVisibility(layerId);
  }, [state.selectedSegmentationLayer, toggleSegmentationLayerVisibility]);

  const getSegmentationHistoryState = useCallback(() => {
    // segmentationHistoryVersion is used to trigger recalculation when history changes
    // (the ref-based history doesn't trigger re-renders on its own)
    void segmentationHistoryVersion;
    
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

  const getCurrentSegmentationSnapshot = useCallback(() => {
      const viewport = state.activeViewport;
      const { viewportId, imageIdToInstanceMap } = getViewportData(viewport);

      if (!viewportId) {
        return null;
      }

      const segmentationId = segmentationIdForViewport(viewportId);

      if (!isSegmentationValid(segmentationId)) {
        return null;
      }

      return captureSegmentationSnapshot(
        segmentationId,
        viewportId,
        imageIdToInstanceMap
      );
    },
    [state.activeViewport, getViewportData]
  );

  const getCurrentLayerSnapshot = useCallback(() => {
      return selectedLayerData?.latestSnapshot ?? null;
    },
    [selectedLayerData]
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

  const refetchSegmentationLayers = useCallback(
    async (excludeLayerIds: string[] = []) => {
      const viewport = state.activeViewport;
      const series = getViewportSeries(viewport);
      const seriesId = series?.id;

      if (!seriesId) {
        return;
      }

      try {
        const segmentationResult = await fetchSegmentationLayersBySeries(
          seriesId
        ).unwrap();

        const mergedLayers = new Map<string, SegmentationLayerData>();

        state.segmentationLayers.forEach((layer, layerId) => {
          if (
            layer.metadata.origin === "local" &&
            !excludeLayerIds.includes(layerId)
          ) {
            mergedLayers.set(layerId, layer);
          }
        });

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
                frame: layer.frame ?? null,
                segmentationStatus: layer.segmentationStatus,
                colorCode: layer.colorCode,
                segmentationDate: layer.segmentationDate,
                reviewerId: layer.reviewerId,
                reviewDate: layer.reviewDate,
                origin: "database",
              },
              snapshots: decompressedSnapshots as SegmentationSnapshot[],
            });
          });
        }

        let selectedLayer = state.selectedSegmentationLayer;

        if (selectedLayer && !mergedLayers.has(selectedLayer)) {
          selectedLayer =
            mergedLayers.size > 0 ? (mergedLayers.keys().next().value ?? null) : null;
        }

        if (!selectedLayer && mergedLayers.size > 0) {
          selectedLayer = mergedLayers.keys().next().value ?? null;
        }

        dispatch({
          type: "SET_SEGMENTATION_LAYERS",
          layers: mergedLayers,
          selectedLayer: selectedLayer ?? null,
        });

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
      dispatch
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
            const decompressedSnapshots = decompressSnapshots(
              layer.snapshots || []
            );

            layers.set(layer.id, {
              metadata: {
                id: layer.id,
                name: layer.layerName,
                notes: layer.notes || undefined,
                instanceId: layer.instanceId,
                createdAt: Date.now(),
                createdBy: layer.segmentatorId,
                frame: layer.frame ?? null,
                segmentationStatus: (layer as any).segmentationStatus,
                colorCode: (layer as any).colorCode,
                segmentationDate: (layer as any).segmentationDate,
                reviewerId: (layer as any).reviewerId,
                reviewDate: (layer as any).reviewDate,
                origin: "database",
              },
              snapshots: decompressedSnapshots as SegmentationSnapshot[],
            });
          });

          const firstLayerId =
            layers.size > 0 ? layers.keys().next().value : null;
          dispatch({
            type: "SET_SEGMENTATION_LAYERS",
            layers,
            selectedLayer: firstLayerId ?? null,
          });
        }
      } catch (error) {
        console.error("Failed to load segmentation layers", error);
      }
    },
    [fetchSegmentationLayersBySeries, dispatch]
  );

  const setSegmentationBrushSize = useCallback(
    (radius: number, isInMM: boolean = true) => {
      const viewportId = state.viewportIds.get(state.activeViewport);
      const toolGroupId = viewportId ? `toolGroup_${viewportId}` : null;

      const segUtilities = (csToolsUtilities as any)?.segmentation;
      let success = false;

      if (toolGroupId && typeof segUtilities?.setBrushSizeForToolGroup === "function") {
        try {
          segUtilities.setBrushSizeForToolGroup(toolGroupId, radius);
          success = true;
        } catch (_err) {
          console.debug("[Segmentation] setBrushSizeForToolGroup failed, trying fallback");
        }
      }

      if (!success) {
        const element = viewportElementsRef.current.get(state.activeViewport);
        const configAny = segmentation.config as any;
        if (element && typeof configAny?.setBrushSizeForElement === "function") {
          try {
            configAny.setBrushSizeForElement(element, {
              radius,
              isInMM,
            });
            success = true;
          } catch (_err) {
            // ignore per-element config errors
          }
        }

        if (!success && typeof configAny?.setGlobalConfig === "function") {
          try {
            configAny.setGlobalConfig({
              brushSize: radius,
              brushSizeInMM: isInMM,
            });
            success = true;
          } catch (_err) {
            // ignore global config errors
          }
        }
      }

      if (success && toolGroupId && typeof segUtilities?.invalidateBrushCursor === "function") {
        try {
          segUtilities.invalidateBrushCursor(toolGroupId);
        } catch (_err) {
          // ignore cursor invalidation errors
        }
      }
    },
    [state.activeViewport, state.viewportIds, viewportElementsRef]
  );

  const undoSegmentation = useCallback(() => {
    const viewportIndex = state.activeViewport;
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
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
  }, [state.activeViewport, state.selectedSegmentationLayer, consumeSegmentationUndo, removeLatestLayerSnapshot, notifySegmentationHistoryChange, state.viewportIds]);

  const redoSegmentation = useCallback(() => {
    const viewportIndex = state.activeViewport;
    const layerId = state.selectedSegmentationLayer;
    if (!layerId) {
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
  }, [state.activeViewport, state.selectedSegmentationLayer, consumeSegmentationRedo, persistLayerSnapshot, notifySegmentationHistoryChange, state.viewportIds]);
  
  // Event Handlers
  const handleSegmentationModified = useCallback(
    (viewportIndex: number, evt: Event) => {
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
        return;
      }

      const layerData = segmentationLayersRef.current.get(activeLayerId);
      const layerSnapshots = layerData?.snapshots ?? [];
      const previousSnapshot =
        layerSnapshots[layerSnapshots.length - 1] ?? null;

      const currentViewportId = viewportIdsRef.current.get(viewportIndex);
      const imageIdToInstanceMap =
        imageIdInstanceMapRef.current.get(viewportIndex);

      if (!currentViewportId) {
        return;
      }

      const snapshot = captureSegmentationSnapshot(
        segmentationId,
        currentViewportId,
        imageIdToInstanceMap
      );
      if (!snapshot) {
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
      recordSegmentationEntry(viewportIndex, activeLayerId, {
        id: entryId,
        label: "Brush",
        snapshot,
        layerId: activeLayerId,
        previousSnapshot,
      } satisfies SegmentationHistoryEntry);
      persistLayerSnapshot(activeLayerId, snapshot);
      notifySegmentationHistoryChange();

      // Force a re-render so new segmentation strokes appear without needing frame change
      try {
        const currentViewport = viewportRefs.current.get(viewportIndex);
        const viewportId = viewportIdsRef.current.get(viewportIndex);
        const renderingEngineId = renderingEngineIdsRef.current.get(viewportIndex);

        if (currentViewport) {
          // Direct viewport render for immediate feedback
          currentViewport.render?.();
        }

        // Also trigger via rendering engine for complete render pipeline
        if (renderingEngineId && viewportId) {
          const engine = getRenderingEngine(renderingEngineId);
          if (engine) {
            engine.renderViewports([viewportId]);
          }
        }
      } catch {
        // ignore render errors
      }
    },
    [
      viewportIdsRef,
      selectedSegmentationLayerRef,
      segmentationLayersRef,
      imageIdInstanceMapRef,
      dispatch,
      renderingEngineIdsRef,
      viewportRefs,
      recordSegmentationEntry,
      persistLayerSnapshot,
      notifySegmentationHistoryChange,
    ]
  );

  // Public Helpers
  const recordSegmentationEntryPublic = useCallback(
    (viewport: number, layerId: string, entry: SegmentationHistoryEntry) => {
        recordSegmentationEntry(viewport, layerId, entry);
        notifySegmentationHistoryChange();
  }, [recordSegmentationEntry, notifySegmentationHistoryChange]);

  const persistLayerSnapshotPublic = useCallback((layerId: string, snapshot: SegmentationSnapshot | null)=> {
      persistLayerSnapshot(layerId, snapshot);
  }, [persistLayerSnapshot]);

  return {
    segmentationHistoryRef,
    segmentationLayersRef, 
    selectedSegmentationLayerRef,
    segmentationLayerVisibilityRef,
    viewportIdsRef,
    notifySegmentationHistoryChange,
    recordSegmentationEntry: recordSegmentationEntryPublic,
    persistLayerSnapshot: persistLayerSnapshotPublic,
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
    handleSegmentationModified
  };
};
