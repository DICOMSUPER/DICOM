"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
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
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";
import {
  eventTarget,
  getRenderingEngine,
  type Types,
  Enums as CoreEnums,
} from "@cornerstonejs/core";
import { AnnotationType } from "@/enums/image-dicom.enum";
import viewportStateManager from "@/utils/viewportStateManager";
import { ViewportStatus } from "@/types/viewport-state";
import {
  useViewer,
  type AnnotationHistoryEntry,
} from "@/contexts/ViewerContext";
import {
  restoreSegmentationSnapshot,
  clearSegmentationData,
  type SegmentationHistoryEntry,
  type SegmentationSnapshot,
} from "@/contexts/viewer-context/segmentation-helper";
import type { Annotation } from "@cornerstonejs/tools/types";
import { batchedRender } from "@/utils/renderBatcher";
import { extractMeasurementFromAnnotation, formatMeasurement } from "@/utils/dicom/extractCornerstoneMeasurement";
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
import { segmentationIdForViewport } from "@/contexts/viewer-context/segmentation-helper";

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
    const viewportRegisteredRef = useRef<boolean>(false);
    const {
      recordAnnotationHistoryEntry,
      updateAnnotationHistoryEntry,
      removeAnnotationHistoryEntry,
    } = useViewer();
    const safeViewportIndex = useMemo(() => viewportIndex ?? 0, [viewportIndex]);

    // Use pre-computed constants instead of recalculating
    const nonCustomMappings = useMemo(() => getNonCustomMappings(), []);
    const allToolNames = useMemo(() => getAllToolNames(), []);

    useEffect(() => {
      viewportRef.current = viewport;
    }, [viewport]);

    useEffect(() => {
      selectedToolRef.current = selectedTool;
    }, [selectedTool]);

    const updateViewportCamera = useCallback((updateFn: (camera: any) => any, action: string) => {
      if (!viewport || !viewportReady) return;

      try {
        const camera = viewport.getCamera();
        viewport.setCamera(updateFn(camera));
        batchedRender(viewport);
        console.log(`${action} viewport ${viewportId}`);
      } catch (error) {
        console.error(`Error ${action.toLowerCase()} viewport:`, error);
      }
    }, [viewport, viewportReady, viewportId]);

    const handleRotateViewport = useCallback((degrees: number = 90) => {
      updateViewportCamera(
        (camera) => ({ ...camera, rotation: ((camera.rotation || 0) + degrees) % 360 }),
        `Rotated by ${degrees} degrees`
      );
    }, [updateViewportCamera]);

    const handleFlipViewport = useCallback((direction: "horizontal" | "vertical") => {
      updateViewportCamera(
        (camera) => ({
          ...camera,
          [direction === "horizontal" ? "flipHorizontal" : "flipVertical"]: 
            !(camera[direction === "horizontal" ? "flipHorizontal" : "flipVertical"] || false),
        }),
        `Flipped ${direction}`
      );
    }, [updateViewportCamera]);

    const handleResetView = useCallback(() => {
      if (!viewport || !viewportReady) return;

      try {
        viewport.resetCamera();
        setTimeout(() => batchedRender(viewport), 100);
        console.log(`Reset view for viewport ${viewportId}`);
      } catch (error) {
        console.error("Error resetting view:", error);
      }
    }, [viewport, viewportReady, viewportId]);

    const handleInvertColorMap = useCallback(() => {
      if (!viewport || !viewportReady) return;

      try {
        if (typeof viewport.setProperties === "function") {
          const currentProperties = viewport.getProperties();
          viewport.setProperties({ ...currentProperties, invert: !currentProperties.invert });
          batchedRender(viewport);
          console.log(`Inverted color map for viewport ${viewportId}`);
        } else {
          console.warn("setProperties not available for color map inversion");
        }
      } catch (error) {
        console.error("Error inverting color map:", error);
      }
    }, [viewport, viewportReady, viewportId]);

    const handleClearAnnotations = useCallback(() => {
      try {
        const allAnnotations = annotation.state.getAllAnnotations() as Annotation[];
        
        // Collect all annotation UIDs to remove (prevents skipping due to array mutation)
        const annotationUIDsToRemove: string[] = [];
        allAnnotations.forEach((annotationItem) => {
          if (annotationItem?.annotationUID && !isDatabaseAnnotation(annotationItem)) {
            annotationUIDsToRemove.push(annotationItem.annotationUID);
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

        console.log(`Cleared ${removedCount} non-database annotations`);
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
          console.log(`Cleared ${removedCount} non-database annotations from viewport ${viewportId}`);
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
        console.log(`Cleared segmentation for viewport ${viewportId}`);
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
        console.log(`Undone annotation ${historyEntry.annotationUID} for viewport ${viewportId}`);
        
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
        console.log(`Redone annotation for viewport ${viewportId}`);
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

    const handleUndoSegmentation = useCallback((historyEntry?: SegmentationHistoryEntry) => {
      if (!viewport || !viewportReady || !historyEntry) return;

      const previousSnapshot = historyEntry.previousSnapshot as SegmentationSnapshot | undefined;
      if (previousSnapshot) {
        applySegmentationSnapshot(previousSnapshot, "undo");
        return;
      }

      const segmentationId = (historyEntry.snapshot as SegmentationSnapshot | undefined)?.segmentationId;
      if (segmentationId) {
        try {
          if (clearSegmentationData(segmentationId, { reason: "history-undo" })) {
            viewport.render?.();
          }
        } catch (error) {
          console.error("Failed to clear segmentation during undo", error);
        }
      }
    }, [viewport, viewportReady, applySegmentationSnapshot]);

    const handleRedoSegmentation = useCallback((historyEntry?: SegmentationHistoryEntry) => {
      if (!viewport || !viewportReady) return;
      
      const snapshot = historyEntry?.snapshot as SegmentationSnapshot | undefined;
      if (snapshot) {
        applySegmentationSnapshot(snapshot, "redo");
      }
    }, [viewport, viewportReady, applySegmentationSnapshot]);

    const handleCustomTool = useCallback((toolName: string) => {
      if (!viewport || !viewportReady) return;

      switch (toolName) {
        case "Rotate":
          handleRotateViewport(90);
          break;
        case "Flip":
          handleFlipViewport("horizontal");
          break;
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
    }, [viewport, viewportReady, handleRotateViewport, handleFlipViewport, handleInvertColorMap, 
        handleClearAnnotations, handleClearViewportAnnotations, handleClearSegmentation, 
        handleUndoAnnotation, handleResetView]);

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
          recordAnnotationHistoryEntry(safeViewportIndex, {
            annotationUID,
            toolName:
              resolveToolNameFromAnnotation(annotationPayload) ??
              AnnotationType.LABEL,
            snapshot: cloneAnnotationPayload(annotationPayload) as Annotation,
            viewportId,
          });
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
      if (!toolGroupId || !renderingEngineId || !viewportId || !viewportReady) {
        return;
      }

      let initialized = false;
      let unsubscribeViewportState: (() => void) | null = null;

      try {
        nonCustomMappings.forEach(({ toolClass }) => addTool(toolClass));
        console.log(`Initialized ${nonCustomMappings.length} tools successfully`);
      } catch (error) {
        console.log("Tools already initialized or some tools failed to initialize:", error);
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

      if (toolGroup && typeof toolGroup.setToolEnabled === "function") {
        try {
          toolGroup.setToolEnabled(PlanarFreehandROITool.toolName);
        } catch (error) {
          console.warn("Error enabling PlanarFreehandROITool:", error);
        }
      }

      if (toolGroup && typeof toolGroup.addViewport === "function") {
        try {
          const currentViewport = viewportRef.current;
          if (!currentViewport) {
            console.warn(`Viewport not available for ${viewportId}, deferring tool group attachment`);
          } else {
            const imageData = (currentViewport as any).getImageData?.();
            const stateData = viewportStateManager.getState(viewportId);
            const resolvedImageData = imageData?.imageData || stateData?.imageData;

            if (resolvedImageData) {
              toolGroup.addViewport(viewportId, renderingEngineId);
              initialized = true;
              viewportRegisteredRef.current = true;
              console.log(`✅ Added viewport ${viewportId} to tool group with valid image data`);
            } else {
              console.warn(`Viewport ${viewportId} has no image data, deferring tool group attachment`);
            }
          }
        } catch (error) {
          console.warn("Failed to add viewport to tool group:", error);
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
              console.log(`✅ Added viewport ${viewportId} via viewportStateManager READY event`);
            } catch (err) {
              console.warn("Failed to add viewport via state manager:", err);
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
                  
                  if (imageRenderedHandlerRef.current) {
                    eventTarget.removeEventListener(
                      CoreEnums.Events.IMAGE_RENDERED,
                      imageRenderedHandlerRef.current
                    );
                    imageRenderedHandlerRef.current = null;
                  }
                  
                  // Trigger tool activation if a tool is already selected
                  const currentSelectedTool = selectedToolRef.current;
                  if (currentSelectedTool && currentToolGroup.hasTool && !isCustomTool(currentSelectedTool as ToolType)) {
                    const actualToolName = getToolName(currentSelectedTool as ToolType);
                    if (actualToolName && currentToolGroup.hasTool(actualToolName)) {
                      console.log(`🔄 Re-activating selected tool "${currentSelectedTool}" after viewport registration`);
                      
                      if (typeof currentToolGroup.setToolPassive === "function") {
                        const allToolNames = Object.values(TOOL_MAPPINGS)
                          .filter(m => m.category !== "custom" && m.toolClass)
                          .map(m => m.toolName);
                        
                        allToolNames.forEach((toolName) => {
                          currentToolGroup.setToolPassive(toolName);
                        });
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
                        
                        console.log(`✅ Tool "${actualToolName}" activated after viewport registration`);
                      }
                    }
                  }
                }
              } catch (error) {
                console.warn("Failed to add viewport via IMAGE_RENDERED:", error);
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
      if (!toolGroupRef.current || !selectedTool || !viewportReady) {
        console.log("Tool activation skipped:", { 
          hasToolGroup: !!toolGroupRef.current, 
          selectedTool, 
          viewportReady 
        });
        return;
      }

      if (isCustomTool(selectedTool as ToolType)) {
        console.log("Handling custom tool:", selectedTool);
        handleCustomTool(selectedTool);
        onToolChange?.(selectedTool);
        return;
      }

      const viewportsInfo =
        (toolGroupRef.current.getViewportsInfo?.() as
          | Types.IViewportId[]
          | undefined) ?? [];
      if (viewportsInfo.length === 0) {
        console.warn(`⚠️ Cannot activate tool "${selectedTool}" - viewport not registered to tool group yet. Waiting for IMAGE_RENDERED event.`);
        return;
      }
      const hasMissingEngine = viewportsInfo.some(
        ({ renderingEngineId, viewportId }) => {
          const engine = getRenderingEngine(renderingEngineId);
          return !engine || !engine.getViewport?.(viewportId);
        }
      );
      if (hasMissingEngine) {
        console.warn(
          "Rendering engine/viewport missing for tool group; defer tool activation."
        );
        return;
      }

      // Handle Cornerstone.js tools using mapping
      const actualToolName = getToolName(selectedTool as ToolType);
      const toolCategory =
        TOOL_MAPPINGS[selectedTool as ToolType]?.category ||
        TOOL_MAPPINGS[actualToolName as ToolType]?.category;
      const isSegmentationTool = toolCategory === "segmentation";
      if (
        actualToolName &&
        toolGroupRef.current.hasTool &&
        toolGroupRef.current.hasTool(actualToolName)
      ) {
        // Set all tools to passive first using mappings
        if (typeof toolGroupRef.current.setToolPassive === "function") {
          allToolNames.forEach((toolName) => {
            toolGroupRef.current!.setToolPassive(toolName);
          });
        }

        // Activate selected tool
        if (typeof toolGroupRef.current.setToolActive === "function") {
          // Before activation, ensure segmentation/segment is active for segmentation tools (Brush/Eraser/etc.)
          if (isSegmentationTool) {
            const segUtilsAny = (csToolsUtilities as any)?.segmentation;
            const segmentationId = segmentationIdForViewport(viewportId);
            if (segmentationId) {
              try {
                if (
                  typeof segUtilsAny?.addSegmentationRepresentations === "function"
                ) {
                  segUtilsAny.addSegmentationRepresentations(toolGroupId, [
                    {
                      segmentationId,
                      type: SegmentationEnums.SegmentationRepresentations.Labelmap,
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
                if (
                  typeof segUtilsAny?.setActiveSegmentation === "function"
                ) {
                  segUtilsAny.setActiveSegmentation(toolGroupId, segmentationId);
                }
                if (
                  typeof segUtilsAny?.setActiveSegmentationForViewport === "function"
                ) {
                  segUtilsAny.setActiveSegmentationForViewport(
                    viewportId,
                    segmentationId
                  );
                }
                if (typeof segUtilsAny?.setActiveSegmentIndex === "function") {
                  const isEraser =
                    actualToolName === TOOL_MAPPINGS.Eraser.toolName;
                  segUtilsAny.setActiveSegmentIndex(
                    toolGroupId,
                    isEraser ? 0 : 1
                  );
                }
                if (
                  typeof segUtilsAny?.setActiveSegmentIndexForViewport === "function"
                ) {
                  const isEraser =
                    actualToolName === TOOL_MAPPINGS.Eraser.toolName;
                  segUtilsAny.setActiveSegmentIndexForViewport(
                    viewportId,
                    isEraser ? 0 : 1
                  );
                }
              } catch (err) {
                console.debug(
                  "[Segmentation] Tool activation could not set active segmentation/segment",
                  err
                );
              }
            }
          }

          toolGroupRef.current.setToolActive(actualToolName, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
          });

          // Ensure StackScrollTool remains active for wheel scrolling (image navigation)
          toolGroupRef.current.setToolActive(StackScrollTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Wheel }],
          });

          // Ensure PlanarRotate remains active with Ctrl + Wheel
          toolGroupRef.current.setToolActive(PlanarRotateTool.toolName, {
            bindings: [
              {
                mouseButton: MouseBindings.Wheel,
                modifierKey: ToolEnums.KeyboardBindings.Ctrl,
              },
            ],
          });
          
          console.log(`✅ Tool "${actualToolName}" activated successfully`);
        }

        onToolChange?.(actualToolName);
      } else {
        console.warn("Tool not found or not available:", selectedTool);
      }
    }, [selectedTool, onToolChange, viewportReady, handleCustomTool, allToolNames]);

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
      rotateViewport: handleRotateViewport,
      flipViewport: handleFlipViewport,
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
    }), [handleRotateViewport, handleFlipViewport, handleResetView, handleInvertColorMap,
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
