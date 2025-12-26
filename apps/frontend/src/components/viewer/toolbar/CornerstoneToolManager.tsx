"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import {
  addTool,
  ToolGroupManager,
  Enums as ToolEnums,
  PlanarFreehandROITool,
  StackScrollTool,
  PlanarRotateTool,
  annotation,
  segmentation,
  Enums as SegmentationEnums,
  utilities as csToolsUtilities,
  ScaleOverlayTool,
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";
import {
  eventTarget,
  getRenderingEngine,
  type Types,
  Enums as CoreEnums,
} from "@cornerstonejs/core";
import { AnnotationType } from "@/common/enums/image-dicom.enum";
import viewportStateManager from "@/common/utils/viewportStateManager";
import { ViewportStatus } from "@/common/types/viewport-state";
import {
  useViewer,
  type AnnotationHistoryEntry,
} from "@/common/contexts/ViewerContext";
import {
  restoreSegmentationSnapshot,
  clearSegmentationData,
  type SegmentationHistoryEntry,
  type SegmentationSnapshot,
} from "@/common/contexts/viewer-context/segmentation-helper";
import type { Annotation } from "@cornerstonejs/tools/types";
import { batchedRender } from "@/common/utils/renderBatcher";
import { extractMeasurementFromAnnotation, formatMeasurement } from "@/common/utils/dicom/extractCornerstoneMeasurement";
// Import tool constants from separate file for better tree-shaking
import {
  TOOL_MAPPINGS,
  getToolName,
  isCustomTool,
  getToolByKeyboardShortcut,
  getAllToolNames,
  getNonCustomMappings,
  type ToolType,
} from "./tool-constants";
import { segmentationIdForViewport } from "@/common/contexts/viewer-context/segmentation-helper";

// Tool mappings and constants imported from separate file for better code splitting

const annotationToolNames = Object.values(AnnotationType);

const structuredCloneAdapter = (
  globalThis as unknown as { structuredClone?: <T>(value: T) => T }
).structuredClone;

const cloneAnnotationPayload = <T,>(value: T): T => {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof structuredCloneAdapter === "function") {
    return structuredCloneAdapter(value);
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const resolveToolNameFromAnnotation = (
  annotationPayload?: Annotation | Record<string, unknown>
): string | undefined => {
  if (!annotationPayload) {
    return undefined;
  }
  const payloadWithMetadata = annotationPayload as Annotation & {
    metadata?: Record<string, unknown>;
  };
  const metadata = payloadWithMetadata.metadata as
    | Record<string, unknown>
    | undefined;
  return (
    (metadata?.toolName as string | undefined) ??
    (metadata?.annotationType as string | undefined) ??
    (annotationPayload as { toolName?: string }).toolName
  );
};

const isDatabaseAnnotation = (annotationCandidate?: Annotation | null) => {
  const metadataRecord = annotationCandidate?.metadata as
    | Record<string, unknown>
    | undefined;
  if (!metadataRecord) {
    return false;
  }
  const sourceValue =
    typeof metadataRecord["source"] === "string"
      ? (metadataRecord["source"] as string).toLowerCase()
      : undefined;
  return sourceValue === "db";
};

// const removeDraftAnnotationsFromElement = (element: HTMLDivElement | null) => {
//   if (!element) {
//     return;
//   }

//   annotationToolNames.forEach((toolName) => {
//     try {
//       const annotationsForTool = annotation.state.getAnnotations(
//         toolName,
//         element
//       ) as Annotation[] | undefined;
//       if (!annotationsForTool?.length) {
//         return;
//       }
//       annotationsForTool.forEach((annotationItem) => {
//         if (isDatabaseAnnotation(annotationItem)) {
//           return;
//         }
//         if (annotationItem?.annotationUID) {
//           annotation.state.removeAnnotation(annotationItem.annotationUID);
//         }
//       });
//     } catch (error) {
//       console.warn(`Failed to remove annotations for tool ${toolName}:`, error);
//     }
//   });
// };

// Keyboard shortcut helpers are imported from tool-constants

interface CornerstoneToolManagerProps {
  toolGroupId?: string;
  renderingEngineId?: string;
  viewportId?: string;
  selectedTool: string;
  onToolChange?: (toolName: string) => void;
  // Add viewport reference for custom operations
  viewport?: any;
  viewportReady?: boolean;
  viewportIndex?: number;
}

const CornerstoneToolManager = forwardRef<any, CornerstoneToolManagerProps>(
  (
    {
      toolGroupId,
      renderingEngineId,
      viewportId,
      selectedTool,
      onToolChange,
      viewport,
      viewportReady,
      viewportIndex,
    },
    ref
  ) => {
    const toolGroupRef = useRef<any>(null);
    const pendingUndoAnnotationsRef = useRef<Set<string>>(new Set());
    const imageRenderedHandlerRef = useRef<((evt: any) => void) | null>(null);
    const viewportRef = useRef(viewport);
    const selectedToolRef = useRef(selectedTool);
    const viewportReadyRef = useRef(viewportReady);
    const viewportRegisteredRef = useRef<boolean>(false);
    const pendingToolActivationRef = useRef<string | null>(null);

    const {
      recordAnnotationHistoryEntry,
      updateAnnotationHistoryEntry,
      removeAnnotationHistoryEntry,
      getStackViewport,
    } = useViewer();
    const safeViewportIndex = useMemo(() => viewportIndex ?? 0, [viewportIndex]);

    // Use pre-computed constants instead of recalculating
    const nonCustomMappings = useMemo(() => getNonCustomMappings(), []);
    const allToolNames = useMemo(() => getAllToolNames(), []);

    useEffect(() => {
      viewportRef.current = viewport;
      selectedToolRef.current = selectedTool;
      viewportReadyRef.current = viewportReady;
    }, [viewport, selectedTool, viewportReady]);

    const updateViewportCamera = useCallback((updateFn: (camera: any) => any, action: string) => {
      if (!viewport || !viewportReady) return;

      try {
        const camera = viewport.getCamera();
        viewport.setCamera(updateFn(camera));
        batchedRender(viewport);
      } catch (error) {
        console.error(`Error ${action.toLowerCase()} viewport:`, error);
      }
    }, [viewport, viewportReady, viewportId]);

    const handleResetView = useCallback(() => {
      // Get viewport directly from context to ensure we have the latest reference
      const currentViewport = getStackViewport(safeViewportIndex);
      const isReady = viewportReadyRef.current;
      if (!currentViewport || !isReady) return;

      try {
        currentViewport.resetCamera();
        batchedRender(currentViewport);
      } catch (error) {
        console.error("Error resetting view:", error);
      }
    }, [viewportId, getStackViewport, safeViewportIndex]);

    const handleInvertColorMap = useCallback(() => {
      // Get viewport directly from context to ensure we have the latest reference
      const currentViewport = getStackViewport(safeViewportIndex);
      const isReady = viewportReadyRef.current;
      if (!currentViewport || !isReady) return;

      try {
        if (typeof currentViewport.setProperties === "function") {
          const currentProperties = currentViewport.getProperties();
          currentViewport.setProperties({ ...currentProperties, invert: !currentProperties.invert });
          batchedRender(currentViewport);
        }
      } catch (error) {
        console.error("Error inverting color map:", error);
      }
    }, [viewportId, getStackViewport, safeViewportIndex]);


    const handleClearAnnotations = useCallback(() => {
      try {
        const allAnnotations = annotation.state.getAllAnnotations() as Annotation[];

        // Collect all annotation UIDs to remove (prevents skipping due to array mutation)
        const annotationUIDsToRemove: string[] = [];
        allAnnotations.forEach((annotationItem) => {
          if (annotationItem?.annotationUID && !isDatabaseAnnotation(annotationItem)) {
            // Skip ScaleOverlay annotations as they are persistent UI elements
            const toolName = resolveToolNameFromAnnotation(annotationItem);
            if (toolName !== "ScaleOverlay") {
              annotationUIDsToRemove.push(annotationItem.annotationUID);
            }
          }
        });

        // Remove all collected annotations
        let removedCount = 0;
        annotationUIDsToRemove.forEach((uid) => {
          try {
            annotation.state.removeAnnotation(uid);
            removedCount++;
          } catch (error) {
            console.warn(`Failed to remove annotation ${uid}:`, error);
          }
        });
      } catch (error) {
        console.error("Error clearing annotations:", error);
      }
    }, []);

    const handleClearViewportAnnotations = useCallback(() => {
      if (!viewport || !viewportReady || !viewportId) return;

      const element = viewport.element as HTMLDivElement | null;
      if (!element) return;

      try {
        // Collect all annotation UIDs to remove (prevents skipping due to array mutation)
        const annotationUIDsToRemove: string[] = [];

        annotationToolNames.forEach((toolName) => {
          try {
            const annotations = annotation.state.getAnnotations(toolName, element) as Annotation[] | undefined;
            annotations?.forEach((annotationItem) => {
              if (annotationItem?.annotationUID && !isDatabaseAnnotation(annotationItem)) {
                annotationUIDsToRemove.push(annotationItem.annotationUID);
              }
            });
          } catch (error) {
            console.warn(`Failed to get annotations for tool ${toolName}:`, error);
          }
        });

        // Remove all collected annotations
        let removedCount = 0;
        annotationUIDsToRemove.forEach((uid) => {
          try {
            annotation.state.removeAnnotation(uid);
            removedCount++;
          } catch (error) {
            console.warn(`Failed to remove annotation ${uid}:`, error);
          }
        });

        if (removedCount > 0) {
          batchedRender(viewport);
        }
      } catch (error) {
        console.error("Error clearing viewport annotations:", error);
      }
    }, [viewport, viewportReady, viewportId]);

    const handleClearSegmentation = useCallback(() => {
      if (!viewport || !viewportReady) return;

      try {
        const segmentationRepresentations = segmentation.state.getSegmentationRepresentations(viewport.element);

        segmentationRepresentations?.forEach((representation) => {
          try {
            segmentation.state.removeSegmentationRepresentation(viewport.element, {
              segmentationId: representation.segmentationId,
              type: representation.type,
            });
          } catch (error) {
            console.warn(`Failed to remove segmentation ${representation.segmentationId}:`, error);
          }
        });

        setTimeout(() => batchedRender(viewport), 100);
      } catch (error) {
        console.error("Error clearing segmentation:", error);
      }
    }, [viewport, viewportReady, viewportId]);

    const getAnnotationByUID = useCallback((
      element: HTMLDivElement | null,
      toolName?: string | null,
      annotationUID?: string | null
    ): Annotation | null => {
      if (!element || !toolName || !annotationUID) return null;

      try {
        const annotations = annotation.state.getAnnotations(toolName, element) as Annotation[] | undefined;
        return annotations?.find((item) => item.annotationUID === annotationUID) ?? null;
      } catch (error) {
        console.warn(`Failed to get annotations for ${toolName}:`, error);
        return null;
      }
    }, []);

    const handleUndoAnnotation = useCallback(async (historyEntry?: AnnotationHistoryEntry) => {
      if (!viewport || !viewportReady || !historyEntry?.annotationUID) return;

      const element = viewport.element as HTMLDivElement | null;
      if (!element) return;

      try {
        const lastAnnotation = getAnnotationByUID(element, historyEntry.toolName ?? null, historyEntry.annotationUID);

        if (!lastAnnotation?.annotationUID) return;
        if (isDatabaseAnnotation(lastAnnotation)) return;

        pendingUndoAnnotationsRef.current.add(historyEntry.annotationUID);
        annotation.state.removeAnnotation(lastAnnotation.annotationUID);

        setTimeout(() => batchedRender(viewport), 100);
      } catch (error) {
        console.error("Error undoing annotation:", error);
      }
    }, [viewport, viewportReady, viewportId, getAnnotationByUID]);

    const handleRedoAnnotation = useCallback((historyEntry?: AnnotationHistoryEntry) => {
      if (!viewport || !viewportReady || !historyEntry) return;

      const element = viewport.element as HTMLDivElement | null;
      if (!element) return;

      const addAnnotationApi = (annotation.state as any).addAnnotation;
      if (typeof addAnnotationApi !== "function") return;

      const existing = getAnnotationByUID(element, historyEntry.toolName ?? null, historyEntry.annotationUID ?? null);
      if (existing) return;

      try {
        addAnnotationApi(cloneAnnotationPayload(historyEntry.snapshot), element);
        setTimeout(() => batchedRender(viewport), 100);
      } catch (error) {
        console.error("Error redoing annotation:", error);
      }
    }, [viewport, viewportReady, viewportId, getAnnotationByUID]);

    const applySegmentationSnapshot = useCallback((
      snapshot: SegmentationSnapshot | null | undefined,
      action: "undo" | "redo"
    ) => {
      if (!snapshot) return;

      const restored = restoreSegmentationSnapshot(snapshot, {
        reason: action === "undo" ? "history-undo" : "history-redo",
        viewportId,
      });
      if (restored) {
        viewport?.render?.();
      }
    }, [viewport, viewportId]);

    // Helper to get fresh viewport - tries props first, then ref, then rendering engine
    const getFreshViewport = useCallback(() => {
      // Try prop first
      if (viewport) return viewport;
      // Try ref
      if (viewportRef.current) return viewportRef.current;
      // Fall back to rendering engine
      if (renderingEngineId && viewportId) {
        try {
          const renderingEngine = getRenderingEngine(renderingEngineId);
          return renderingEngine?.getViewport(viewportId) ?? null;
        } catch {
          return null;
        }
      }
      return null;
    }, [viewport, renderingEngineId, viewportId]);

    const handleUndoSegmentation = useCallback((historyEntry?: SegmentationHistoryEntry) => {
      const currentViewport = getFreshViewport();
      if (!currentViewport || !viewportReady || !historyEntry) return;

      const previousSnapshot = historyEntry.previousSnapshot as SegmentationSnapshot | undefined;
      if (previousSnapshot) {
        applySegmentationSnapshot(previousSnapshot, "undo");
        return;
      }

      const segmentationId = (historyEntry.snapshot as SegmentationSnapshot | undefined)?.segmentationId;
      if (segmentationId) {
        try {
          if (clearSegmentationData(segmentationId, { reason: "history-undo" })) {
            currentViewport.render?.();
          }
        } catch (error) {
          console.error("Failed to clear segmentation during undo", error);
        }
      }
    }, [getFreshViewport, viewportReady, applySegmentationSnapshot]);

    const handleRedoSegmentation = useCallback((historyEntry?: SegmentationHistoryEntry) => {
      const currentViewport = getFreshViewport();
      if (!currentViewport || !viewportReady) return;

      const snapshot = historyEntry?.snapshot as SegmentationSnapshot | undefined;
      if (snapshot) {
        applySegmentationSnapshot(snapshot, "redo");
      }
    }, [getFreshViewport, viewportReady, applySegmentationSnapshot]);

    const handleCustomTool = useCallback((toolName: string) => {
      console.log("[ToolManager] handleCustomTool triggered for:", toolName);
      if (!viewport || !viewportReady) {
        console.warn("[ToolManager] Custom tool skipped - viewport not ready");
        return;
      }

      switch (toolName) {
        case "Invert":
          handleInvertColorMap();
          break;
        case "ClearAnnotations":
          handleClearAnnotations();
          break;
        case "ClearViewportAnnotations":
          handleClearViewportAnnotations();
          break;
        case "ClearSegmentation":
          handleClearSegmentation();
          break;
        case "UndoAnnotation":
          handleUndoAnnotation();
          break;
        case "Reset":
          handleResetView();
          break;
      }
    }, [viewport, viewportReady, handleInvertColorMap,
      handleClearAnnotations, handleClearViewportAnnotations, handleClearSegmentation,
      handleUndoAnnotation, handleResetView]);

    // Helper function to activate a tool with default bindings
    const activateTool = useCallback((toolGroup: any, toolName: string, viewportId?: string, toolGroupId?: string) => {
      if (!toolGroup || !toolName) return false;

      try {
        // Set all tools to passive first
        if (typeof toolGroup.setToolPassive === "function") {
          allToolNames.forEach((name) => {
            // Explicitly handle complex tools that might need extra cleanup/state reset
            if (name === "SplineROI" || name === "PlanarFreehandROI") {
              // Ensure it's fully deactivated
              try {
                toolGroup.setToolPassive(name);
                // For some tools, we might need to verify they are not active
              } catch (e) { console.warn(`Error deactivating ${name}`, e); }
            } else {
              toolGroup.setToolPassive(name);
            }
          });
        }

        // Determine if this is a segmentation tool
        const toolCategory = TOOL_MAPPINGS[toolName as ToolType]?.category;
        const isSegmentationTool = toolCategory === "segmentation";

        // For segmentation tools, ensure segmentation is active
        if (isSegmentationTool && viewportId && toolGroupId) {
          const segUtilsAny = (csToolsUtilities as any)?.segmentation;
          const segmentationId = segmentationIdForViewport(viewportId);
          if (segmentationId) {
            try {
              if (typeof segUtilsAny?.setActiveSegmentationRepresentation === "function") {
                segUtilsAny.setActiveSegmentationRepresentation(toolGroupId, segmentationId);
              }
              if (typeof segUtilsAny?.setActiveSegmentIndex === "function") {
                const isEraser = toolName === TOOL_MAPPINGS.Eraser?.toolName;
                segUtilsAny.setActiveSegmentIndex(toolGroupId, isEraser ? 0 : 1);
              }
            } catch { }
          }
        }

        // Activate the selected tool
        if (typeof toolGroup.setToolActive === "function") {
          toolGroup.setToolActive(toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });

          // Bind Pan to Middle Click (Auxiliary) if it's not the primary tool
          const panToolName = TOOL_MAPPINGS.Pan.toolName;
          if (toolName !== panToolName) {
            toolGroup.setToolActive(panToolName, { bindings: [{ mouseButton: MouseBindings.Auxiliary }] });
          }

          // Bind Zoom to Right Click (Secondary) if it's not the primary tool
          const zoomToolName = TOOL_MAPPINGS.Zoom.toolName;
          if (toolName !== zoomToolName) {
            toolGroup.setToolActive(zoomToolName, { bindings: [{ mouseButton: MouseBindings.Secondary }] });
          }

          toolGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: MouseBindings.Wheel }] });
          toolGroup.setToolActive(PlanarRotateTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Wheel, modifierKey: ToolEnums.KeyboardBindings.Ctrl }]
          });
          return true;
        }

      } catch (error) {
        console.warn(`Failed to activate tool ${toolName}:`, error);
      }
      return false;
    }, [allToolNames]);

    const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const toolName = getToolByKeyboardShortcut(key);

      if (toolName && onToolChange) {
        event.preventDefault();

        const toolType = Object.keys(TOOL_MAPPINGS).find(
          (toolType) => getToolName(toolType as ToolType) === toolName
        ) as ToolType;

        if (toolType) {
          if (isCustomTool(toolType)) {
            handleCustomTool(toolType);
          } else {
            onToolChange(toolType);
          }
        }
      }
    }, [onToolChange, handleCustomTool]);

    useEffect(() => {
      if (!viewportReady || !viewportId) return;

      const handleViewportChange = (event: CustomEvent) => {
        const eventViewportId = event.detail?.viewportId;
        const currentViewport = viewportRef.current;
        if (currentViewport && (!eventViewportId || eventViewportId === viewportId)) {
          batchedRender(currentViewport);
        }
      };

      const events = [
        CoreEnums.Events.CAMERA_MODIFIED,
        SegmentationEnums.Events.SEGMENTATION_DATA_MODIFIED,
      ];

      events.forEach(eventName => {
        eventTarget.addEventListener(eventName, handleViewportChange as EventListener);
      });

      return () => {
        events.forEach(eventName => {
          eventTarget.removeEventListener(eventName, handleViewportChange as EventListener);
        });
      };
    }, [viewportReady, viewportId]);

    useEffect(() => {
      if (!viewportReady) return;

      const relevantEvents = [
        ToolEnums.Events.ANNOTATION_COMPLETED,
        ToolEnums.Events.ANNOTATION_MODIFIED,
        ToolEnums.Events.ANNOTATION_REMOVED,
      ];

      const handleAnnotationEvent = (event: Event) => {
        const customEvent = event as CustomEvent<{
          viewportId?: string;
          annotation?: Annotation;
        }>;

        const eventViewportId =
          customEvent.detail?.viewportId ??
          ((
            customEvent.detail?.annotation?.metadata as
            | Record<string, unknown>
            | undefined
          )?.viewportId as string | undefined);

        if (viewportId && eventViewportId && eventViewportId !== viewportId) {
          return;
        }

        const annotationPayload = customEvent.detail?.annotation;
        const annotationUID = annotationPayload?.annotationUID;
        const metadataRecord = annotationPayload?.metadata as
          | Record<string, unknown>
          | undefined;
        const annotationSource =
          typeof metadataRecord?.source === "string"
            ? (metadataRecord.source as string).toLowerCase()
            : undefined;
        const databaseAnnotation = annotationSource === "db";

        if (annotationPayload && (event.type === ToolEnums.Events.ANNOTATION_COMPLETED || event.type === ToolEnums.Events.ANNOTATION_MODIFIED)) {
          try {
            const measurement = extractMeasurementFromAnnotation(annotationPayload);
            if (measurement) {
              const formatted = formatMeasurement(measurement.value, measurement.unit);
              const metadata = (annotationPayload.metadata || {}) as Record<string, any>;
              metadata.measurementValue = formatted.value;
              metadata.measurementUnit = formatted.unit;
            }
          } catch (error) {
            console.warn("Failed to extract annotation measurement:", error);
          }
        }

        if (
          event.type === ToolEnums.Events.ANNOTATION_COMPLETED &&
          annotationPayload &&
          annotationUID &&
          !databaseAnnotation
        ) {
          const toolName = resolveToolNameFromAnnotation(annotationPayload) ?? AnnotationType.LABEL;
          // Ignore persistent tools like ScaleOverlay from history
          if (toolName !== "ScaleOverlay") {
            recordAnnotationHistoryEntry(safeViewportIndex, {
              annotationUID,
              toolName,
              snapshot: cloneAnnotationPayload(annotationPayload) as Annotation,
              viewportId,
            });
          }
        } else if (
          event.type === ToolEnums.Events.ANNOTATION_MODIFIED &&
          annotationPayload &&
          annotationUID &&
          !databaseAnnotation
        ) {
          updateAnnotationHistoryEntry(
            safeViewportIndex,
            annotationUID,
            cloneAnnotationPayload(annotationPayload) as Annotation
          );
        } else if (
          event.type === ToolEnums.Events.ANNOTATION_REMOVED &&
          annotationUID
        ) {
          if (pendingUndoAnnotationsRef.current.has(annotationUID)) {
            pendingUndoAnnotationsRef.current.delete(annotationUID);
          } else if (!databaseAnnotation) {
            removeAnnotationHistoryEntry(safeViewportIndex, annotationUID);
          }
        }

        const currentViewport = viewportRef.current;
        if (currentViewport && typeof currentViewport.render === "function") {
          try {
            batchedRender(currentViewport);
          } catch (renderError) {
            console.error(
              "Error rendering viewport after annotation event:",
              renderError
            );
          }
        }
      };

      relevantEvents.forEach((eventName) => {
        eventTarget.addEventListener(
          eventName,
          handleAnnotationEvent as EventListener
        );
      });

      return () => {
        relevantEvents.forEach((eventName) => {
          eventTarget.removeEventListener(
            eventName,
            handleAnnotationEvent as EventListener
          );
        });
      };
    }, [
      viewportReady,
      viewportId,
      recordAnnotationHistoryEntry,
      removeAnnotationHistoryEntry,
      safeViewportIndex,
      updateAnnotationHistoryEntry,
    ]);

    useEffect(() => {
      console.log("[ToolManager:Init] Starting tool initialization", {
        toolGroupId,
        renderingEngineId,
        viewportId,
        viewportReady,
      });

      if (!toolGroupId || !renderingEngineId || !viewportId || !viewportReady) {
        console.log("[ToolManager:Init] Skipping - missing dependencies", {
          hasToolGroupId: !!toolGroupId,
          hasRenderingEngineId: !!renderingEngineId,
          hasViewportId: !!viewportId,
          viewportReady,
        });
        return;
      }

      let initialized = false;
      let unsubscribeViewportState: (() => void) | null = null;

      try {
        nonCustomMappings.forEach(({ toolClass }) => addTool(toolClass));
      } catch (error) {
        // Tools already initialized, this is fine
      }

      let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
      if (!toolGroup) {
        toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      }

      if (!toolGroup) {
        console.error("Failed to create or get tool group:", toolGroupId);
        return;
      }

      toolGroupRef.current = toolGroup;

      nonCustomMappings.forEach(({ toolName }) => {
        if (toolGroup && !toolGroup.hasTool(toolName)) {
          try {
            toolGroup.addTool(toolName);
          } catch (error) {
            console.warn(`Failed to add tool ${toolName}:`, error);
          }
        }
      });

      // NOTE: Do NOT enable ScaleOverlayTool here - it needs the viewport to be added first
      // We'll enable it after adding the viewport below

      if (toolGroup && typeof toolGroup.addViewport === "function") {
        try {
          // Get viewport from rendering engine instead of relying on prop
          const renderingEngine = getRenderingEngine(renderingEngineId);
          const currentViewport = renderingEngine?.getViewport(viewportId) as Types.IStackViewport;

          if (!currentViewport) {
            console.debug(`[ToolManager] Viewport not available for ${viewportId}, deferring`);
          } else {
            const imageData = (currentViewport as any).getImageData?.();
            const stateData = viewportStateManager.getState(viewportId);
            const resolvedImageData = imageData?.imageData || stateData?.imageData;

            // Register viewport even if image data is not fully confirmed yet to ensure tools are bound
            // This fixes the race condition where IMAGE_RENDERED fires before this component mounts
            if (currentViewport) {
              try {
                // Check if already added to avoid warning
                const viewportsInfo = (toolGroup.getViewportsInfo?.() as Types.IViewportId[]) ?? [];
                const isAlreadyAdded = viewportsInfo.some(v => v.viewportId === viewportId);

                if (!isAlreadyAdded) {
                  toolGroup.addViewport(viewportId, renderingEngineId);

                  // Enable persistent tools AFTER viewport is added (they need the viewport)
                  try {
                    toolGroup.setToolEnabled(PlanarFreehandROITool.toolName);
                    toolGroup.setToolEnabled(ScaleOverlayTool.toolName);
                  } catch (enableError) {
                    console.warn("[ToolManager] Error enabling persistent tools:", enableError);
                  }
                }

                initialized = true;
                viewportRegisteredRef.current = true;

                // Sync existing segmentation if available (handles race condition)
                const segmentationId = segmentationIdForViewport(viewportId);
                const segmentationExists = segmentation.state.getSegmentation(segmentationId);

                if (segmentationExists) {
                  try {
                    const addSegReps =
                      (segmentation as any).addSegmentationRepresentations ||
                      (csToolsUtilities as any)?.segmentation?.addSegmentationRepresentations;

                    if (typeof addSegReps === "function") {
                      const segUtilsAny = (csToolsUtilities as any)?.segmentation;
                      const getSegReps = segUtilsAny?.getSegmentationRepresentations;

                      let hasRep = false;
                      if (typeof getSegReps === "function") {
                        const reps = getSegReps(toolGroupId) || [];
                        hasRep = reps.some((r: any) => r.segmentationId === segmentationId);
                      } else {
                        try {
                          const reps = segmentation.state.getSegmentationRepresentations(toolGroupId);
                          hasRep = (reps || []).some((r: any) => r.segmentationId === segmentationId);
                        } catch (e) { }
                      }

                      if (!hasRep) {
                        addSegReps(toolGroupId, [
                          {
                            segmentationId,
                            type: ToolEnums.SegmentationRepresentations.Labelmap,
                          },
                        ]);

                        if (typeof segUtilsAny?.setActiveSegmentationRepresentation === "function") {
                          segUtilsAny.setActiveSegmentationRepresentation(toolGroupId, segmentationId);
                        }

                        const renderingEngine = getRenderingEngine(renderingEngineId);
                        if (renderingEngine) {
                          renderingEngine.renderViewports([viewportId]);
                        }
                      }
                    } else {
                      console.warn(`[ToolManager:${viewportId}] addSegmentationRepresentations not found`);
                    }
                  } catch (e) {
                    console.error(`[ToolManager:${viewportId}] Failed to sync segmentation:`, e);
                  }
                }


                // Activate any pending tool after viewport registration
                const currentSelectedTool = pendingToolActivationRef.current || selectedToolRef.current;
                if (currentSelectedTool && toolGroup.hasTool && !isCustomTool(currentSelectedTool as ToolType)) {
                  const actualToolName = getToolName(currentSelectedTool as ToolType);
                  if (actualToolName && toolGroup.hasTool(actualToolName)) {
                    activateTool(toolGroup, actualToolName, viewportId, toolGroupId);
                  }
                }
                pendingToolActivationRef.current = null;
              } catch (err) {
                console.warn(`[ToolManager:${viewportId}] Failed to add viewport:`, err);
              }
            } else {
              console.debug(`[ToolManager:${viewportId}] Viewport ref is missing, cannot register`);
            }
          }

        } catch (error) {
          console.debug("[ToolManager] Failed to add viewport to tool group:", error);
        }
      }

      if (!initialized) {
        // Fallback: subscribe to viewport state changes and attach once image data is ready
        unsubscribeViewportState = viewportStateManager.subscribe(viewportId, (state) => {
          if (viewportRegisteredRef.current) return;
          if (state.status === ViewportStatus.READY && state.imageData) {
            const currentToolGroup = toolGroupRef.current;
            if (!currentToolGroup) return;
            try {
              currentToolGroup.addViewport(viewportId, renderingEngineId);
              viewportRegisteredRef.current = true;
              console.debug(`[ToolManager] Added viewport ${viewportId} via READY event`);

              // Enable persistent tools AFTER viewport is added
              try {
                currentToolGroup.setToolEnabled(PlanarFreehandROITool.toolName);
                currentToolGroup.setToolEnabled(ScaleOverlayTool.toolName);
              } catch (enableError) {
                console.warn("[ToolManager] Error enabling persistent tools via READY event:", enableError);
              }

              // Activate any pending tool after viewport registration
              const currentSelectedTool = pendingToolActivationRef.current || selectedToolRef.current;
              if (currentSelectedTool && currentToolGroup.hasTool && !isCustomTool(currentSelectedTool as ToolType)) {
                const actualTool = getToolName(currentSelectedTool as ToolType);
                if (actualTool && currentToolGroup.hasTool(actualTool)) {
                  if (typeof currentToolGroup.setToolPassive === "function") {
                    allToolNames.forEach((n) => currentToolGroup.setToolPassive(n));
                  }
                  if (typeof currentToolGroup.setToolActive === "function") {
                    currentToolGroup.setToolActive(actualTool, { bindings: [{ mouseButton: MouseBindings.Primary }] });
                    currentToolGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: MouseBindings.Wheel }] });
                    currentToolGroup.setToolActive(PlanarRotateTool.toolName, { bindings: [{ mouseButton: MouseBindings.Wheel, modifierKey: ToolEnums.KeyboardBindings.Ctrl }] });
                    console.debug(`[ToolManager] Tool "${actualTool}" activated via READY event`);
                  }
                }
              }
              pendingToolActivationRef.current = null;
            } catch (err) {
              console.debug("[ToolManager] Failed to add viewport via state manager:", err);
            }
          }
        });

        if (!imageRenderedHandlerRef.current) {
          imageRenderedHandlerRef.current = (evt: any) => {
            const { viewportId: renderedViewportId } = evt.detail || {};

            if (renderedViewportId === viewportId) {
              const currentToolGroup = toolGroupRef.current;
              if (!currentToolGroup) return;

              const currentViewport = viewportRef.current;
              if (!currentViewport) return;

              try {
                const imageData = (currentViewport as any).getImageData?.();

                if (imageData && imageData.imageData) {
                  currentToolGroup.addViewport(viewportId, renderingEngineId);
                  viewportRegisteredRef.current = true;
                  console.log(`✅ Added viewport ${viewportId} to tool group via IMAGE_RENDERED event`);

                  // Enable persistent tools AFTER viewport is added
                  try {
                    currentToolGroup.setToolEnabled(PlanarFreehandROITool.toolName);
                    currentToolGroup.setToolEnabled(ScaleOverlayTool.toolName);
                  } catch (enableError) {
                    console.warn("[ToolManager] Error enabling persistent tools via IMAGE_RENDERED:", enableError);
                  }

                  if (imageRenderedHandlerRef.current) {
                    eventTarget.removeEventListener(
                      CoreEnums.Events.IMAGE_RENDERED,
                      imageRenderedHandlerRef.current
                    );
                    imageRenderedHandlerRef.current = null;
                  }

                  // Trigger tool activation if a tool is already selected
                  const currentSelectedTool = pendingToolActivationRef.current || selectedToolRef.current;
                  pendingToolActivationRef.current = null;
                  if (currentSelectedTool && currentToolGroup.hasTool && !isCustomTool(currentSelectedTool as ToolType)) {
                    const actualToolName = getToolName(currentSelectedTool as ToolType);
                    if (actualToolName && currentToolGroup.hasTool(actualToolName)) {
                      if (typeof currentToolGroup.setToolPassive === "function") {
                        const allNames = Object.values(TOOL_MAPPINGS)
                          .filter(m => m.category !== "custom" && m.toolClass)
                          .map(m => m.toolName);
                        allNames.forEach((toolName) => currentToolGroup.setToolPassive(toolName));
                      }

                      if (typeof currentToolGroup.setToolActive === "function") {
                        currentToolGroup.setToolActive(actualToolName, {
                          bindings: [{ mouseButton: MouseBindings.Primary }],
                        });
                        currentToolGroup.setToolActive(StackScrollTool.toolName, {
                          bindings: [{ mouseButton: MouseBindings.Wheel }],
                        });
                        currentToolGroup.setToolActive(PlanarRotateTool.toolName, {
                          bindings: [
                            {
                              mouseButton: MouseBindings.Wheel,
                              modifierKey: ToolEnums.KeyboardBindings.Ctrl,
                            },
                          ],
                        });
                        console.debug(`[ToolManager] Tool "${actualToolName}" activated via IMAGE_RENDERED`);
                      }
                    }
                  }
                }
              } catch (error) {
                console.debug("[ToolManager] Failed to add viewport via IMAGE_RENDERED:", error);
              }
            }
          };
        }

        console.log(`Setting up IMAGE_RENDERED listener for viewport ${viewportId}`);
        eventTarget.addEventListener(
          CoreEnums.Events.IMAGE_RENDERED,
          imageRenderedHandlerRef.current
        );

        return () => {
          if (imageRenderedHandlerRef.current) {
            eventTarget.removeEventListener(
              CoreEnums.Events.IMAGE_RENDERED,
              imageRenderedHandlerRef.current
            );
            imageRenderedHandlerRef.current = null;
          }
          if (unsubscribeViewportState) {
            unsubscribeViewportState();
            unsubscribeViewportState = null;
          }
          const toolGroupInstance = toolGroupRef.current;
          if (toolGroupInstance) {
            try {
              toolGroupInstance.removeViewports(renderingEngineId, viewportId);
            } catch {
              // Ignore cleanup errors
            }
          }
        };
      }

      return () => {
        if (unsubscribeViewportState) {
          unsubscribeViewportState();
          unsubscribeViewportState = null;
        }
        const toolGroupInstance = toolGroupRef.current;
        if (toolGroupInstance) {
          try {
            toolGroupInstance.removeViewports(renderingEngineId, viewportId);
          } catch {
            // Ignore cleanup errors
          }
        }
        if (initialized) {
          toolGroupRef.current = null;
        }
      };
    }, [toolGroupId, renderingEngineId, viewportId, viewportReady, nonCustomMappings]);

    useEffect(() => {
      if (!toolGroupRef.current || !selectedTool || !viewportReady || !viewportId) {
        return;
      }

      if (isCustomTool(selectedTool as ToolType)) {
        handleCustomTool(selectedTool);
        // Revert to "Pan" for one-off actions so they can be clicked again
        // and don't remain as the "active" tool state.
        if (selectedTool !== "Pan") {
          onToolChange?.("Pan");
        }
        return;
      }

      // Check if viewport is registered
      if (!viewportRegisteredRef.current) {
        pendingToolActivationRef.current = selectedTool;
        return;
      }

      const viewportsInfo = (toolGroupRef.current.getViewportsInfo?.() as Types.IViewportId[] | undefined) ?? [];
      if (viewportsInfo.length === 0) {
        pendingToolActivationRef.current = selectedTool;
        return;
      }

      const hasMissingEngine = viewportsInfo.some(({ renderingEngineId, viewportId }) => {
        const engine = getRenderingEngine(renderingEngineId);
        return !engine || !engine.getViewport?.(viewportId);
      });

      if (hasMissingEngine) {
        pendingToolActivationRef.current = selectedTool;
        return;
      }

      // Handle Cornerstone.js tools using mapping
      const actualToolName = getToolName(selectedTool as ToolType);

      console.log("[ToolManager:ToolActivation] Checking tool activation", {
        selectedTool,
        actualToolName,
        isCustom: isCustomTool(selectedTool as ToolType),
        viewportReady,
        hasToolGroupRef: !!toolGroupRef.current,
      });

      if (isCustomTool(selectedTool as ToolType)) {
        console.log("[ToolManager:ToolActivation] Executing custom tool:", selectedTool);
        handleCustomTool(selectedTool);
        // Revert to "Pan" for one-off actions so they can be clicked again
        // and don't remain as the "active" tool state.
        if (selectedTool !== "Pan") {
          console.log("[ToolManager:ToolActivation] Reverting tool from", selectedTool, "to Pan");
          onToolChange?.("Pan");
        }
        return;
      }

      if (!actualToolName) {
        return;
      }

      if (
        actualToolName &&
        toolGroupRef.current.hasTool &&
        toolGroupRef.current.hasTool(actualToolName)
      ) {
        activateTool(toolGroupRef.current, actualToolName, viewportId, toolGroupId);
        onToolChange?.(actualToolName);
      }
    }, [selectedTool, onToolChange, viewportReady, handleCustomTool, allToolNames, viewportId, toolGroupId, activateTool]);

    // Keyboard event listener
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        handleKeyboardShortcut(event);
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleKeyboardShortcut]);

    const getToolGroup = useCallback(() => toolGroupRef.current, []);

    const findAnnotation = useCallback((
      annotationId: string,
      annotationUID?: string,
      instanceId?: string
    ): Annotation | null => {
      if (viewport && viewportReady) {
        const element = viewport.element as HTMLDivElement | null;
        if (element) {
          for (const toolName of annotationToolNames) {
            const annotations = annotation.state.getAnnotations(toolName, element) as Annotation[] | undefined;

            if (annotations) {
              const ann = annotations.find(
                (a) =>
                  a.annotationUID === annotationUID ||
                  ((a.metadata as any)?.annotationId === annotationId &&
                    (!instanceId || (a.metadata as any)?.instanceId === instanceId))
              );
              if (ann) return ann;
            }
          }
        }
      }

      try {
        const allAnnotations = annotation.state.getAllAnnotations();

        if (annotationUID) {
          const annByUID = allAnnotations.find(a => a.annotationUID === annotationUID);
          if (annByUID) return annByUID;
        }

        const annById = allAnnotations.find(
          (a) =>
            ((a.metadata as any)?.annotationId === annotationId ||
              (a.metadata as any)?.dbAnnotationId === annotationId) &&
            (!instanceId || (a.metadata as any)?.instanceId === instanceId)
        );
        if (annById) return annById;

        const annByIDAsUID = allAnnotations.find(a => a.annotationUID === annotationId);
        if (annByIDAsUID) return annByIDAsUID;
      } catch (error) {
        console.warn('Error searching globally for annotation:', error);
      }

      return null;
    }, [viewport, viewportReady]);

    const handleSelectAnnotation = useCallback((params: {
      annotationId: string;
      annotationUID?: string;
      instanceId?: string;
    }) => {
      try {
        annotation.selection.deselectAnnotation();

        const allAnnotations = annotation.state.getAllAnnotations();
        allAnnotations.forEach((ann) => {
          if (ann.highlighted || ann.isSelected) {
            ann.highlighted = false;
            ann.isSelected = false;
          }
        });

        const foundAnnotation = findAnnotation(params.annotationId, params.annotationUID, params.instanceId);

        if (foundAnnotation?.annotationUID) {
          annotation.selection.setAnnotationSelected(foundAnnotation.annotationUID, true);
          foundAnnotation.highlighted = true;
          foundAnnotation.isSelected = true;

          if (viewport) {
            batchedRender(viewport);
          }

          if (renderingEngineId) {
            try {
              const engine = getRenderingEngine(renderingEngineId);
              const viewports = engine?.getViewports();
              Object.values(viewports || {}).forEach((vp) => {
                if (vp && vp !== viewport) {
                  batchedRender(vp);
                }
              });
            } catch {
              // Ignore errors
            }
          }

          console.log(`✅ Annotation ${params.annotationId} highlighted`);
        }
      } catch (error) {
        console.error("Error selecting annotation:", error);
      }
    }, [viewport, renderingEngineId, findAnnotation]);

    const handleDeselectAnnotation = useCallback(() => {
      if (!viewport || !viewportReady) return;

      const element = viewport.element as HTMLDivElement | null;
      if (!element) return;

      try {
        annotation.selection.deselectAnnotation();

        for (const toolName of annotationToolNames) {
          const annotations = annotation.state.getAnnotations(toolName, element) as Annotation[] | undefined;
          annotations?.forEach((ann) => {
            ann.highlighted = false;
            ann.isSelected = false;
          });
        }

        batchedRender(viewport);
        console.log("✅ Annotation deselected");
      } catch (error) {
        console.warn("Error deselecting annotation:", error);
      }
    }, [viewport, viewportReady]);

    const handleUpdateAnnotationColor = useCallback((params: {
      annotationId: string;
      annotationUID?: string;
      colorCode: string;
      instanceId?: string;
    }) => {
      const updateColor = (retries = 3) => {
        try {
          const foundAnnotation = findAnnotation(params.annotationId, params.annotationUID, params.instanceId);

          if (foundAnnotation?.annotationUID) {
            annotation.config.style.setAnnotationStyles(foundAnnotation.annotationUID, { color: params.colorCode });

            if (viewport) {
              batchedRender(viewport);
            } else if (renderingEngineId) {
              try {
                const engine = getRenderingEngine(renderingEngineId);
                const viewports = engine?.getViewports();
                Object.values(viewports || {}).forEach((vp) => vp && batchedRender(vp));
              } catch (e) {
                console.warn('Error rendering viewports for color update:', e);
              }
            }
            console.log(`✅ Annotation ${params.annotationId} color updated`);
          } else if (retries > 0) {
            setTimeout(() => updateColor(retries - 1), 100);
          }
        } catch (error) {
          if (retries > 0) {
            setTimeout(() => updateColor(retries - 1), 100);
          } else {
            console.error("Error updating annotation color:", error);
          }
        }
      };

      updateColor();
    }, [viewport, renderingEngineId, findAnnotation]);

    const handleLockAnnotation = useCallback((params: {
      annotationId: string;
      annotationUID?: string;
      locked: boolean;
      instanceId?: string;
    }) => {
      try {
        const foundAnnotation = findAnnotation(params.annotationId, params.annotationUID, params.instanceId);

        if (foundAnnotation?.annotationUID) {
          annotation.locking.setAnnotationLocked(foundAnnotation.annotationUID, params.locked);
          foundAnnotation.isLocked = params.locked;
          batchedRender(viewport);
          console.log(`✅ Annotation ${params.annotationId} ${params.locked ? 'locked' : 'unlocked'}`);
        }
      } catch (error) {
        console.error("Error locking/unlocking annotation:", error);
      }
    }, [viewport, findAnnotation]);

    const getToolHandlers = useCallback(() => ({
      resetView: handleResetView,
      invertColorMap: handleInvertColorMap,
      clearAnnotations: handleClearAnnotations,
      clearViewportAnnotations: handleClearViewportAnnotations,
      clearSegmentation: handleClearSegmentation,
      undoAnnotation: handleUndoAnnotation,
      redoAnnotation: handleRedoAnnotation,
      undoSegmentation: handleUndoSegmentation,
      redoSegmentation: handleRedoSegmentation,
      selectAnnotation: handleSelectAnnotation,
      deselectAnnotation: handleDeselectAnnotation,
      updateAnnotationColor: handleUpdateAnnotationColor,
      lockAnnotation: handleLockAnnotation,
    }), [handleResetView, handleInvertColorMap,
      handleClearAnnotations, handleClearViewportAnnotations, handleClearSegmentation,
      handleUndoAnnotation, handleRedoAnnotation, handleUndoSegmentation, handleRedoSegmentation,
      handleSelectAnnotation, handleDeselectAnnotation, handleUpdateAnnotationColor, handleLockAnnotation]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getToolGroup,
      getToolHandlers,
    }));

    return null; // This component doesn't render anything
  }
);

CornerstoneToolManager.displayName = "CornerstoneToolManager";
export default CornerstoneToolManager;

// Re-export tool constants for backward compatibility
export {
  TOOL_MAPPINGS,
  TOOL_BINDINGS,
  getToolMapping,
  getToolName,
  getToolClass,
  isCustomTool,
  getToolByKeyboardShortcut,
  getKeyboardShortcut,
  getAllKeyboardShortcuts,
  getAllToolNames,
  getNonCustomMappings,
  type ToolType,
  type ToolMapping,
  type ToolBindings,
} from "./tool-constants";
