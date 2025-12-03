"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  addTool,
  ToolGroupManager,
  Enums as ToolEnums,
  LengthTool,
  CircleROITool,
  EllipticalROITool,
  BidirectionalTool,
  AngleTool,
  ProbeTool,
  RectangleROITool,
  PlanarFreehandROITool,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  ArrowAnnotateTool,
  CobbAngleTool,
  PlanarRotateTool,
  MagnifyTool,
  HeightTool,
  SplineROITool,
  // Additional tools
  TrackballRotateTool,
  MIPJumpToClickTool,
  SegmentBidirectionalTool,
  ScaleOverlayTool,
  KeyImageTool,
  LabelTool,
  DragProbeTool,
  PaintFillTool,
  EraserTool,
  annotation,
  segmentation,
  Enums as SegmentationEnums,
  // Segmentation tools
  BrushTool,
  CircleScissorsTool,
  RectangleScissorsTool,
  SphereScissorsTool,
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";
import {
  eventTarget,
  getRenderingEngine,
  type Types,
  Enums as CoreEnums,
} from "@cornerstonejs/core";
import { AnnotationType } from "@/enums/image-dicom.enum";
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
import { batchedRender, immediateRender } from "@/utils/renderBatcher";
import { extractMeasurementFromAnnotation, formatMeasurement } from "@/utils/dicom/extractCornerstoneMeasurement";
import viewportStateManager from "@/utils/viewportStateManager";

// Tool type definitions
type NavigationTool =
  | "WindowLevel"
  | "Pan"
  | "Zoom"
  | "StackScroll"
  | "Probe"
  | "TrackballRotate"
  | "MIPJumpToClick";
type MeasurementTool =
  | "Length"
  | "Height"
  | "CircleROI"
  | "EllipticalROI"
  | "RectangleROI"
  | "PlanarFreehandROI"
  | "Bidirectional"
  | "Angle"
  | "ArrowAnnotate"
  | "CobbAngle"
  | "SplineROI"
  | "SegmentBidirectional"
  | "ScaleOverlay";
type AdvancedTool =
  | "PlanarRotate"
  | "Magnify";
type AnnotationTool =
  | "KeyImage"
  | "Label"
  | "DragProbe"
  | "PaintFill"
  | "Eraser";
type SegmentationTool =
  | "Brush"
  | "CircleScissors"
  | "RectangleScissors"
  | "SphereScissors";
type CustomTool =
  | "Rotate"
  | "Flip"
  | "Invert"
  | "ClearAnnotations"
  | "ClearViewportAnnotations"
  | "ClearSegmentation"
  | "UndoAnnotation"
  | "Reset";
type ToolType =
  | NavigationTool
  | MeasurementTool
  | AdvancedTool
  | AnnotationTool
  | SegmentationTool
  | CustomTool;

// Tool mapping interfaces
interface ToolMapping {
  toolName: string;
  toolClass: any;
  category:
    | "navigation"
    | "measurement"
    | "advanced"
    | "annotation"
    | "segmentation"
    | "custom";
}

interface ToolBindings {
  primary?: MouseBindings;
  secondary?: MouseBindings;
  auxiliary?: MouseBindings;
  wheel?: MouseBindings;
  wheelWithCtrl?: MouseBindings; // For tools that need Ctrl + Wheel
  keyboard?: string; // Keyboard shortcut (e.g., 'w', 'p', 'z', 'r')
}

// Tool mappings for reusability
const TOOL_MAPPINGS: Record<ToolType, ToolMapping> = {
  // Navigation tools
  WindowLevel: {
    toolName: WindowLevelTool.toolName,
    toolClass: WindowLevelTool,
    category: "navigation",
  },
  Pan: {
    toolName: PanTool.toolName,
    toolClass: PanTool,
    category: "navigation",
  },
  Zoom: {
    toolName: ZoomTool.toolName,
    toolClass: ZoomTool,
    category: "navigation",
  },
  StackScroll: {
    toolName: StackScrollTool.toolName,
    toolClass: StackScrollTool,
    category: "navigation",
  },
  Probe: {
    toolName: ProbeTool.toolName,
    toolClass: ProbeTool,
    category: "navigation",
  },

  // Measurement tools
  Length: {
    toolName: LengthTool.toolName,
    toolClass: LengthTool,
    category: "measurement",
  },
  Height: {
    toolName: HeightTool.toolName,
    toolClass: HeightTool,
    category: "measurement",
  },
  CircleROI: {
    toolName: CircleROITool.toolName,
    toolClass: CircleROITool,
    category: "measurement",
  },
  EllipticalROI: {
    toolName: EllipticalROITool.toolName,
    toolClass: EllipticalROITool,
    category: "measurement",
  },
  RectangleROI: {
    toolName: RectangleROITool.toolName,
    toolClass: RectangleROITool,
    category: "measurement",
  },
  PlanarFreehandROI: {
    toolName: PlanarFreehandROITool.toolName,
    toolClass: PlanarFreehandROITool,
    category: "measurement",
  },
  Bidirectional: {
    toolName: BidirectionalTool.toolName,
    toolClass: BidirectionalTool,
    category: "measurement",
  },
  Angle: {
    toolName: AngleTool.toolName,
    toolClass: AngleTool,
    category: "measurement",
  },
  ArrowAnnotate: {
    toolName: ArrowAnnotateTool.toolName,
    toolClass: ArrowAnnotateTool,
    category: "measurement",
  },
  CobbAngle: {
    toolName: CobbAngleTool.toolName,
    toolClass: CobbAngleTool,
    category: "measurement",
  },
  SplineROI: {
    toolName: SplineROITool.toolName,
    toolClass: SplineROITool,
    category: "measurement",
  },

  // Advanced tools
  PlanarRotate: {
    toolName: PlanarRotateTool.toolName,
    toolClass: PlanarRotateTool,
    category: "advanced",
  },
  Magnify: {
    toolName: MagnifyTool.toolName,
    toolClass: MagnifyTool,
    category: "advanced",
  },

  // Custom tools (no Cornerstone.js tool class)
  Rotate: { toolName: "Rotate", toolClass: null, category: "custom" },
  Flip: { toolName: "Flip", toolClass: null, category: "custom" },
  Invert: { toolName: "Invert", toolClass: null, category: "custom" },
  ClearAnnotations: {
    toolName: "ClearAnnotations",
    toolClass: null,
    category: "custom",
  },
  ClearViewportAnnotations: {
    toolName: "ClearViewportAnnotations",
    toolClass: null,
    category: "custom",
  },
  ClearSegmentation: {
    toolName: "ClearSegmentation",
    toolClass: null,
    category: "custom",
  },
  UndoAnnotation: {
    toolName: "UndoAnnotation",
    toolClass: null,
    category: "custom",
  },
  Reset: { toolName: "Reset", toolClass: null, category: "custom" },

  // Additional Navigation tools
  TrackballRotate: {
    toolName: TrackballRotateTool.toolName,
    toolClass: TrackballRotateTool,
    category: "navigation",
  },
  MIPJumpToClick: {
    toolName: MIPJumpToClickTool.toolName,
    toolClass: MIPJumpToClickTool,
    category: "navigation",
  },

  // Additional Measurement tools
  SegmentBidirectional: {
    toolName: SegmentBidirectionalTool.toolName,
    toolClass: SegmentBidirectionalTool,
    category: "measurement",
  },
  ScaleOverlay: {
    toolName: ScaleOverlayTool.toolName,
    toolClass: ScaleOverlayTool,
    category: "measurement",
  },

  // Annotation tools
  KeyImage: {
    toolName: KeyImageTool.toolName,
    toolClass: KeyImageTool,
    category: "annotation",
  },
  Label: {
    toolName: LabelTool.toolName,
    toolClass: LabelTool,
    category: "annotation",
  },
  DragProbe: {
    toolName: DragProbeTool.toolName,
    toolClass: DragProbeTool,
    category: "annotation",
  },
  PaintFill: {
    toolName: PaintFillTool.toolName,
    toolClass: PaintFillTool,
    category: "annotation",
  },
  Eraser: {
    toolName: EraserTool.toolName,
    toolClass: EraserTool,
    category: "annotation",
  },

  // Segmentation tools
  Brush: {
    toolName: BrushTool.toolName,
    toolClass: BrushTool,
    category: "segmentation",
  },
  CircleScissors: {
    toolName: CircleScissorsTool.toolName,
    toolClass: CircleScissorsTool,
    category: "segmentation",
  },
  RectangleScissors: {
    toolName: RectangleScissorsTool.toolName,
    toolClass: RectangleScissorsTool,
    category: "segmentation",
  },
  SphereScissors: {
    toolName: SphereScissorsTool.toolName,
    toolClass: SphereScissorsTool,
    category: "segmentation",
  },
};

// Tool bindings configuration
const TOOL_BINDINGS: Record<string, ToolBindings> = {
  [WindowLevelTool.toolName]: { primary: MouseBindings.Primary, keyboard: "w" },
  [PanTool.toolName]: { auxiliary: MouseBindings.Auxiliary, keyboard: "p" },
  [ZoomTool.toolName]: { secondary: MouseBindings.Secondary, keyboard: "z" },
  [StackScrollTool.toolName]: { wheel: MouseBindings.Wheel },
  [ProbeTool.toolName]: { keyboard: "i" }, // Info/Probe tool
  [LengthTool.toolName]: { keyboard: "l" }, // Length measurement
  [RectangleROITool.toolName]: { keyboard: "r" }, // Rectangle ROI
  [CircleROITool.toolName]: { keyboard: "c" }, // Circle ROI
  [EllipticalROITool.toolName]: { keyboard: "e" }, // Elliptical ROI
  [AngleTool.toolName]: { keyboard: "a" }, // Angle measurement
  [BidirectionalTool.toolName]: { keyboard: "b" }, // Bidirectional measurement
  [ArrowAnnotateTool.toolName]: { keyboard: "t" }, // Text annotation

  [CobbAngleTool.toolName]: { keyboard: "k" }, // Cobb angle
  [MagnifyTool.toolName]: { keyboard: "m" }, // Magnify tool
  [PlanarRotateTool.toolName]: {
    wheelWithCtrl: MouseBindings.Wheel,
    keyboard: "o",
  }, // Rotate

  // Additional tools keyboard shortcuts
  [TrackballRotateTool.toolName]: { keyboard: "r" }, // Trackball rotate
  [MIPJumpToClickTool.toolName]: { keyboard: "j" }, // MIP jump
  [SegmentBidirectionalTool.toolName]: { keyboard: "d" }, // Segment bidirectional
  [ScaleOverlayTool.toolName]: { keyboard: "v" }, // Scale overlay
  [KeyImageTool.toolName]: { keyboard: "q" }, // Key image
  [LabelTool.toolName]: { keyboard: "n" }, // Label
  [DragProbeTool.toolName]: { keyboard: "f" }, // Drag probe
  [PaintFillTool.toolName]: { keyboard: "y" }, // Paint fill
  [EraserTool.toolName]: { keyboard: "shift+z" }, // Eraser

  // Segmentation tools keyboard shortcuts
  [BrushTool.toolName]: { keyboard: "s" }, // Brush (Segmentation)
  [CircleScissorsTool.toolName]: { keyboard: "g" }, // Circle scissors
  [RectangleScissorsTool.toolName]: { keyboard: "x" }, // Rectangle scissors
  [SphereScissorsTool.toolName]: { keyboard: "shift+s" }, // Sphere scissors
};

// Helper functions
const getToolMapping = (toolType: ToolType): ToolMapping | null => {
  return TOOL_MAPPINGS[toolType] || null;
};

const getToolName = (toolType: ToolType): string | null => {
  const mapping = getToolMapping(toolType);
  return mapping?.toolName || null;
};

const getToolClass = (toolType: ToolType): any | null => {
  const mapping = getToolMapping(toolType);
  return mapping?.toolClass || null;
};

const isCustomTool = (toolType: ToolType): boolean => {
  return getToolMapping(toolType)?.category === "custom";
};

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

const removeDraftAnnotationsFromElement = (element: HTMLDivElement | null) => {
  if (!element) {
    return;
  }

  annotationToolNames.forEach((toolName) => {
    try {
      const annotationsForTool = annotation.state.getAnnotations(
        toolName,
        element
      ) as Annotation[] | undefined;
      if (!annotationsForTool?.length) {
        return;
      }
      annotationsForTool.forEach((annotationItem) => {
        if (isDatabaseAnnotation(annotationItem)) {
          return;
        }
        if (annotationItem?.annotationUID) {
          annotation.state.removeAnnotation(annotationItem.annotationUID);
        }
      });
    } catch (error) {
      console.warn(`Failed to remove annotations for tool ${toolName}:`, error);
    }
  });
};

// Keyboard shortcut helpers
const getToolByKeyboardShortcut = (key: string): string | null => {
  for (const [toolName, bindings] of Object.entries(TOOL_BINDINGS)) {
    if (bindings.keyboard === key.toLowerCase()) {
      return toolName;
    }
  }
  return null;
};

const getKeyboardShortcut = (toolName: string): string | null => {
  const bindings = TOOL_BINDINGS[toolName];
  return bindings?.keyboard || null;
};

const getAllKeyboardShortcuts = (): Record<string, string> => {
  const shortcuts: Record<string, string> = {};
  Object.entries(TOOL_BINDINGS).forEach(([toolName, bindings]) => {
    if (bindings.keyboard) {
      shortcuts[toolName] = bindings.keyboard;
    }
  });
  return shortcuts;
};

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
    const {
      recordAnnotationHistoryEntry,
      updateAnnotationHistoryEntry,
      removeAnnotationHistoryEntry,
    } = useViewer();
    const safeViewportIndex = viewportIndex ?? 0;

    // Keyboard shortcut handler
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const toolName = getToolByKeyboardShortcut(key);

      if (toolName && onToolChange) {
        event.preventDefault();
        console.log(`🎹 Keyboard shortcut activated: ${key} -> ${toolName}`);

        // Find the tool type from tool name
        const toolType = Object.keys(TOOL_MAPPINGS).find(
          (toolType) => getToolName(toolType as ToolType) === toolName
        ) as ToolType;

        if (toolType) {
          if (isCustomTool(toolType)) {
            handleCustomTool(toolType);
          } else {
            // Trigger tool change for Cornerstone tools
            onToolChange(toolType);
          }
        }
      }
    };

    // Custom tool handlers for non-Cornerstone tools
    const handleCustomTool = (toolName: string) => {
      if (!viewport || !viewportReady) {
        console.warn("Viewport not ready for custom tool:", toolName);
        return;
      }

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

        default:
          console.log("Unknown custom tool:", toolName);
      }
    };

    // Rotate viewport handler
    const handleRotateViewport = (degrees: number = 90) => {
      if (!viewport || !viewportReady) return;

      try {
        const camera = viewport.getCamera();
        const { rotation = 0 } = camera;
        viewport.setCamera({
          ...camera,
          rotation: (rotation + degrees) % 360,
        });
        batchedRender(viewport);
        console.log(`Rotated viewport ${viewportId} by ${degrees} degrees`);
      } catch (error) {
        console.error("Error rotating viewport:", error);
      }
    };

    // Flip viewport handler
    const handleFlipViewport = (direction: "horizontal" | "vertical") => {
      if (!viewport || !viewportReady) return;

      try {
        const camera = viewport.getCamera();
        const { flipHorizontal = false, flipVertical = false } = camera;

        if (direction === "horizontal") {
          viewport.setCamera({
            ...camera,
            flipHorizontal: !flipHorizontal,
          });
        } else {
          viewport.setCamera({
            ...camera,
            flipVertical: !flipVertical,
          });
        }
        batchedRender(viewport);
        console.log(`Flipped viewport ${viewportId} ${direction}`);
      } catch (error) {
        console.error("Error flipping viewport:", error);
      }
    };

    // Reset view handler
    const handleResetView = () => {
      if (!viewport || !viewportReady) return;

      try {
        console.log("Resetting view for viewport:", viewportId);
        viewport.resetCamera();

        setTimeout(() => {
          try {
            batchedRender(viewport);
            console.log(`Reset view for viewport ${viewportId}`);
          } catch (renderError) {
            console.error("Error rendering after reset:", renderError);
          }
        }, 100);
      } catch (error) {
        console.error("Error resetting view:", error);
      }
    };

    // Invert color map handler
    const handleInvertColorMap = () => {
      if (!viewport || !viewportReady) return;

      try {
        console.log("Inverting color map for viewport:", viewportId);

        if (typeof viewport.setProperties === "function") {
          const currentProperties = viewport.getProperties();
          viewport.setProperties({
            ...currentProperties,
            invert: !currentProperties.invert,
          });
          batchedRender(viewport);
          console.log(`Inverted color map for viewport ${viewportId}`);
        } else {
          console.warn("setProperties not available for color map inversion");
        }
      } catch (error) {
        console.error("Error inverting color map:", error);
      }
    };

    // Clear annotations handler - removes ONLY non-database annotations from annotation.state
    const handleClearAnnotations = () => {
      try {
        // Get all annotations and only remove those without source: 'db'
        const allAnnotations = annotation.state.getAllAnnotations() as Annotation[];
        let removedCount = 0;

        allAnnotations.forEach((annotationItem) => {
          // Only remove annotations that don't have source: 'db' in their metadata
          if (
            annotationItem?.annotationUID &&
            !isDatabaseAnnotation(annotationItem)
          ) {
            annotation.state.removeAnnotation(annotationItem.annotationUID);
            removedCount++;
          }
        });

        console.log(`Cleared ${removedCount} non-database annotations (kept database annotations)`);
        
        // Don't manually render - Cornerstone's annotation state change events will trigger re-render automatically
      } catch (error) {
        console.error("Error clearing annotations:", error);
      }
    };

    const handleClearViewportAnnotations = () => {
      console.log(
        `handleClearViewportAnnotations called for viewport ${viewportId}`
      );
      if (!viewport || !viewportReady || !viewportId) {
        console.warn(
          `Cannot clear viewport annotations - viewport not ready: ${viewportId}`
        );
        return;
      }

      const element = viewport.element as HTMLDivElement | null;
      if (!element) {
        console.warn(
          "Unable to resolve viewport element for clearing annotations."
        );
        return;
      }

      try {
        let removedCount = 0;
        // Remove only non-database annotations for this specific viewport element
        annotationToolNames.forEach((toolName) => {
          try {
            const annotationsForTool = annotation.state.getAnnotations(
              toolName,
              element
            ) as Annotation[] | undefined;
            if (annotationsForTool?.length) {
              annotationsForTool.forEach((annotationItem) => {
                // Only remove annotations that don't have source: 'db' (or no source field)
                if (
                  annotationItem?.annotationUID &&
                  !isDatabaseAnnotation(annotationItem)
                ) {
                  annotation.state.removeAnnotation(
                    annotationItem.annotationUID
                  );
                  removedCount++;
                }
              });
            }
          } catch (error) {
            console.warn(
              `Failed to get annotations for tool ${toolName}:`,
              error
            );
          }
        });

        // Render viewport after removing annotations using batched render
        if (removedCount > 0) {
          batchedRender(viewport);
          console.log(
            `Cleared ${removedCount} non-database annotations from viewport ${viewportId}`
          );
        }
      } catch (error) {
        console.error("Error clearing viewport annotations:", error);
      }
    };

    // Clear segmentation handler
    const handleClearSegmentation = () => {
      if (!viewport || !viewportReady) return;

      try {
        console.log(`Clearing segmentation for viewport ${viewportId}`);

        if (viewport) {
          // Get all segmentation representations for this viewport
          const segmentationRepresentations =
            segmentation.state.getSegmentationRepresentations(viewport.element);

          if (
            segmentationRepresentations &&
            segmentationRepresentations.length > 0
          ) {
            console.log(
              `Found ${segmentationRepresentations.length} segmentation representations`
            );

            // Remove all segmentation representations
            segmentationRepresentations.forEach((representation) => {
              try {
                console.log(
                  `Removing segmentation representation:`,
                  representation.segmentationId
                );
                segmentation.state.removeSegmentationRepresentation(
                  viewport.element,
                  {
                    segmentationId: representation.segmentationId,
                    type: representation.type,
                  }
                );
              } catch (error) {
                console.warn(
                  `Failed to remove segmentation representation ${representation.segmentationId}:`,
                  error
                );
              }
            });
          } else {
            console.log(
              "No segmentation representations found for this viewport"
            );
          }
        }

        setTimeout(() => {
          batchedRender(viewport);
        }, 100);

        console.log(
          `Successfully cleared segmentation for viewport ${viewportId}`
        );
      } catch (error) {
        console.error("Error clearing segmentation:", error);
      }
    };

    const getAnnotationByUID = (
      element: HTMLDivElement | null,
      toolName?: string | null,
      annotationUID?: string | null
    ): Annotation | null => {
      if (!element || !toolName || !annotationUID) {
        return null;
      }
      try {
        const annotations = annotation.state.getAnnotations(
          toolName,
          element
        ) as Annotation[] | undefined;
        return (
          annotations?.find((item) => item.annotationUID === annotationUID) ??
          null
        );
      } catch (error) {
        console.warn(`Failed to get annotations for ${toolName}:`, error);
        return null;
      }
    };

    const handleUndoAnnotation = async (
      historyEntry?: AnnotationHistoryEntry
    ) => {
      if (!viewport || !viewportReady) return;

      if (!historyEntry?.annotationUID) {
        console.log(
          `No history entry found to undo for viewport ${viewportId}`
        );
        return;
      }

      const annotationUID = historyEntry.annotationUID;
      const element = viewport.element as HTMLDivElement | null;
      if (!element) {
        console.warn("Unable to resolve viewport element for undo.");
        return;
      }

      try {
        console.log(
          `Undoing annotation ${annotationUID} for viewport ${viewportId}`
        );

        // Get the annotation from Cornerstone state
        const lastAnnotation = getAnnotationByUID(
          element,
          historyEntry.toolName ?? null,
          annotationUID
        );

        if (!lastAnnotation || !lastAnnotation.annotationUID) {
          console.log(
            `Annotation ${annotationUID} not found in viewport ${viewportId}`
          );
          return;
        }

        // Only undo annotations that don't have source: 'db' (or no source field)
        if (isDatabaseAnnotation(lastAnnotation)) {
          console.log(`Skipping undo for database annotation ${annotationUID}`);
          return;
        }

        // Remove from Cornerstone state only (no API call)
        pendingUndoAnnotationsRef.current.add(annotationUID);
        annotation.state.removeAnnotation(lastAnnotation.annotationUID);
        console.log(
          `Successfully undone annotation ${annotationUID} for viewport ${viewportId}`
        );

        setTimeout(() => {
          batchedRender(viewport);
        }, 100);
      } catch (error) {
        console.error("Error undoing annotation:", error);
      }
    };

    const handleRedoAnnotation = (historyEntry?: AnnotationHistoryEntry) => {
      if (!viewport || !viewportReady || !historyEntry) {
        return;
      }

      const element = viewport.element as HTMLDivElement | null;
      if (!element) {
        console.warn("Unable to resolve viewport element for redo.");
        return;
      }

      const addAnnotationApi = (
        annotation.state as unknown as {
          addAnnotation?: (
            annotation: unknown,
            element: HTMLDivElement
          ) => void;
        }
      ).addAnnotation;

      if (typeof addAnnotationApi !== "function") {
        console.warn(
          "annotation.state.addAnnotation is not available; redo is not supported."
        );
        return;
      }

      const existing = getAnnotationByUID(
        element,
        historyEntry.toolName ?? null,
        historyEntry.annotationUID ?? null
      );
      if (existing) {
        console.log("Annotation already exists; skipping redo.");
        return;
      }

      try {
        const payload = cloneAnnotationPayload(historyEntry.snapshot);
        addAnnotationApi(payload, element);
        setTimeout(() => {
          batchedRender(viewport);
        }, 100);
        console.log(
          `Successfully redone annotation for viewport ${viewportId}`
        );
      } catch (error) {
        console.error("Error redoing annotation:", error);
      }
    };

    const applySegmentationSnapshot = (
      snapshot: SegmentationSnapshot | null | undefined,
      action: "undo" | "redo"
    ) => {
      if (!snapshot) {
        console.warn(`[Segmentation] No snapshot available to ${action}.`);
        return;
      }

      const restored = restoreSegmentationSnapshot(snapshot, {
        reason: action === "undo" ? "history-undo" : "history-redo",
      });
      if (restored) {
        viewport.render?.();
        console.log(`[Segmentation] ${action} applied`, {
          viewportId,
          segmentationId: snapshot.segmentationId,
          slices: snapshot.imageData.length,
        });
      } else {
        console.warn(
          `[Segmentation] Failed to ${action} segmentation`,
          snapshot.segmentationId
        );
      }
    };

    const handleUndoSegmentation = (
      historyEntry?: SegmentationHistoryEntry
    ) => {
      if (!viewport || !viewportReady) {
        console.warn("Viewport not ready for segmentation undo");
        return;
      }

      if (!historyEntry) {
        console.log("No segmentation undo history entry provided.");
        return;
      }

      const previousSnapshot = historyEntry.previousSnapshot as
        | SegmentationSnapshot
        | undefined;
      if (previousSnapshot) {
        applySegmentationSnapshot(previousSnapshot, "undo");
        return;
      }

      const fallbackSnapshot = historyEntry.snapshot as
        | SegmentationSnapshot
        | undefined;
      const segmentationId = fallbackSnapshot?.segmentationId;
      if (segmentationId) {
        try {
          const cleared = clearSegmentationData(segmentationId, {
            reason: "history-undo",
          });
          if (cleared) {
            viewport.render?.();
          }
        } catch (error) {
          console.error("Failed to clear segmentation during undo", error);
        }
      } else {
        console.warn(
          "[Segmentation] Unable to resolve segmentation to clear during undo."
        );
      }
    };

    const handleRedoSegmentation = (
      historyEntry?: SegmentationHistoryEntry
    ) => {
      if (!viewport || !viewportReady) {
        console.warn("Viewport not ready for segmentation redo");
        return;
      }

      const snapshot = historyEntry?.snapshot as
        | SegmentationSnapshot
        | undefined;
      if (!snapshot) {
        console.log("No segmentation redo history entry provided.");
        return;
      }

      applySegmentationSnapshot(snapshot, "redo");
    };

      // Handle viewport changes to ensure annotations/segmentations scale properly
    useEffect(() => {
      if (!viewport || !viewportReady || !viewportId) {
        return;
      }

      const handleViewportChange = (event: Event) => {
        const customEvent = event as CustomEvent<{
          element?: HTMLDivElement;
          viewportId?: string;
          segmentationId?: string;
        }>;
        
        // Only handle events for this viewport
        const eventViewportId = customEvent.detail?.viewportId;
        if (eventViewportId && eventViewportId !== viewportId) {
          return;
        }
        
        // Trigger render to keep annotations/segmentations synchronized
        batchedRender(viewport);
      };

      // Listen to all viewport transformation events
      const events = [
        CoreEnums.Events.CAMERA_MODIFIED,          // Zoom, pan, rotate
        SegmentationEnums.Events.SEGMENTATION_DATA_MODIFIED, // Segmentation changes
      ];

      events.forEach(eventName => {
        eventTarget.addEventListener(eventName, handleViewportChange as EventListener);
      });

      return () => {
        events.forEach(eventName => {
          eventTarget.removeEventListener(eventName, handleViewportChange as EventListener);
        });
      };
    }, [viewport, viewportReady, viewportId]);

    useEffect(() => {
      if (!viewport || !viewportReady) {
        return;
      }

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

        // Extract measurement from Cornerstone's calculated stats (already in mm/cm)
        if (annotationPayload && (event.type === ToolEnums.Events.ANNOTATION_COMPLETED || event.type === ToolEnums.Events.ANNOTATION_MODIFIED)) {
          try {
            const measurement = extractMeasurementFromAnnotation(annotationPayload);
            if (measurement) {
              // Format measurement (convert mm to cm for larger values)
              const formatted = formatMeasurement(measurement.value, measurement.unit);
              
              // Store measurement in annotation metadata for display
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

        if (typeof viewport.render === "function") {
          try {
            batchedRender(viewport);
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
      viewport,
      viewportReady,
      viewportId,
      pendingUndoAnnotationsRef,
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

      try {
        // Initialize all available tools (only once)
        const nonCustomTools = Object.values(TOOL_MAPPINGS)
          .filter(
            (mapping) => mapping.category !== "custom" && mapping.toolClass
          )
          .map((mapping) => mapping.toolClass);

        nonCustomTools.forEach((toolClass) => {
          addTool(toolClass);
        });

        console.log(`Initialized ${nonCustomTools.length} tools successfully`);
      } catch (error) {
        console.log(
          "Tools already initialized or some tools failed to initialize:",
          error
        );
      }

      // Create or get tool group
      let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
      if (!toolGroup) {
        toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      }

      if (!toolGroup) {
        console.error("Failed to create or get tool group:", toolGroupId);
        return;
      }

      toolGroupRef.current = toolGroup;

      // Add all tools to the group using mappings
      const toolNames = Object.values(TOOL_MAPPINGS)
        .filter((mapping) => mapping.category !== "custom" && mapping.toolClass)
        .map((mapping) => mapping.toolName);

      toolNames.forEach((toolName) => {
        if (toolGroup && !toolGroup.hasTool(toolName)) {
          try {
            // Skip ScaleOverlayTool for now - it causes errors when viewport doesn't have image data
            if (toolName === ScaleOverlayTool.toolName) {
              console.debug('Skipping ScaleOverlayTool - prevents errors on viewports without image data');
              return;
            }
            toolGroup.addTool(toolName);
          } catch (error) {
            console.warn(`Failed to add tool ${toolName}:`, error);
          }
        }
      });

      // Set up mouse bindings using TOOL_BINDINGS configuration
      if (toolGroup && typeof toolGroup.setToolActive === "function") {
        try {
          toolGroup.setToolActive(WindowLevelTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
          });

          toolGroup.setToolActive(PanTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Auxiliary }],
          });

          toolGroup.setToolActive(ZoomTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Secondary }],
          });

          toolGroup.setToolActive(StackScrollTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Wheel }],
          });

          toolGroup.setToolActive(PlanarRotateTool.toolName, {
            bindings: [
              {
                mouseButton: MouseBindings.Wheel,
                modifierKey: ToolEnums.KeyboardBindings.Ctrl,
              },
            ],
          });
        } catch (error) {
          console.warn("Error setting up mouse bindings:", error);
        }
      }

      if (toolGroup && typeof toolGroup.setToolEnabled === "function") {
        try {
          toolGroup.setToolEnabled(PlanarFreehandROITool.toolName);
        } catch (error) {
          console.warn("Error enabling PlanarFreehandROITool:", error);
        }
      }

      // Try to add viewport to tool group only if viewport has valid image data
      if (toolGroup && typeof toolGroup.addViewport === "function") {
        try {
          // CRITICAL: Don't add viewport to tool group until it has image data
          // This prevents ScaleOverlayTool errors when trying to render on empty viewports
          if (!viewport) {
            console.warn(`Viewport not available for ${viewportId}, deferring tool group attachment`);
            return;
          }
          
          const imageData = (viewport as any).getImageData?.();
          if (!imageData || !imageData.imageData) {
            console.warn(`Viewport ${viewportId} has no image data, deferring tool group attachment`);
            return;
          }
          
          toolGroup.addViewport(viewportId, renderingEngineId);
          initialized = true;
          console.log(`Added viewport ${viewportId} to tool group with valid image data`);
        } catch (error) {
          console.warn("Failed to add viewport to tool group:", error);
        }
      }

      return () => {
        const toolGroupInstance = toolGroupRef.current;
        if (toolGroupInstance) {
          try {
            toolGroupInstance.removeViewports(renderingEngineId, viewportId);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        if (initialized) {
          toolGroupRef.current = null;
        }
      };
    }, [toolGroupId, renderingEngineId, viewportId, viewportReady]);

    useEffect(() => {
      if (!toolGroupRef.current || !selectedTool || !viewportReady) {
        if (!selectedTool) {
          console.warn("Tool group not ready or no selected tool:", {
            toolGroupReady: !!toolGroupRef.current,
            selectedTool,
          });
        }
        return;
      }

      // Check if it's a custom tool using helper function
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
        console.warn(
          "Tool group has no registered viewports; skipping tool activation."
        );
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
      if (
        actualToolName &&
        toolGroupRef.current.hasTool &&
        toolGroupRef.current.hasTool(actualToolName)
      ) {
        // Set all tools to passive first using mappings
        if (typeof toolGroupRef.current.setToolPassive === "function") {
          const allToolNames = Object.values(TOOL_MAPPINGS)
            .filter(
              (mapping) => mapping.category !== "custom" && mapping.toolClass
            )
            .map((mapping) => mapping.toolName);

          allToolNames.forEach((toolName) => {
            toolGroupRef.current!.setToolPassive(toolName);
          });
        }

        // Activate selected tool
        if (typeof toolGroupRef.current.setToolActive === "function") {
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
        }

        onToolChange?.(actualToolName);
      } else {
        console.warn("Tool not found or not available:", selectedTool);
      }
    }, [selectedTool, onToolChange, viewportReady]);

    // Keyboard event listener
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        handleKeyboardShortcut(event);
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [onToolChange]);

    // Expose tool group for external access
    const getToolGroup = () => toolGroupRef.current;

    // Helper function to find annotation by ID/UID
    const findAnnotation = (
      annotationId: string,
      annotationUID?: string,
      instanceId?: string
    ): Annotation | null => {
      // First try to find in current viewport
      if (viewport && viewportReady) {
        const element = viewport.element as HTMLDivElement | null;
        if (element) {
          for (const toolName of annotationToolNames) {
            const annotations = annotation.state.getAnnotations(
              toolName,
              element
            ) as Annotation[] | undefined;

            if (annotations) {
              const ann = annotations.find(
                (a) =>
                  a.annotationUID === annotationUID ||
                  ((a.metadata as any)?.annotationId === annotationId &&
                    (!instanceId || (a.metadata as any)?.instanceId === instanceId))
              );
              if (ann) {
                return ann;
              }
            }
          }
        }
      }

      // If not found in current viewport, search globally across all annotations
      try {
        const allAnnotations = annotation.state.getAllAnnotations();
        console.log(`[findAnnotation] Searching globally among ${allAnnotations.length} annotations`);
        
        // First try by annotationUID (most reliable for local annotations)
        if (annotationUID) {
          const annByUID = allAnnotations.find(a => a.annotationUID === annotationUID);
          if (annByUID) {
            console.log(`[findAnnotation] Found by UID: ${annotationUID}`);
            return annByUID;
          }
        }
        
        // Then try by annotationId in metadata
        const annById = allAnnotations.find(
          (a) =>
            ((a.metadata as any)?.annotationId === annotationId ||
             (a.metadata as any)?.dbAnnotationId === annotationId) &&
            (!instanceId || (a.metadata as any)?.instanceId === instanceId)
        );
        if (annById) {
          console.log(`[findAnnotation] Found by ID in metadata: ${annotationId}`);
          return annById;
        }
        
        // Last resort: check if annotationId itself is a UID
        const annByIDAsUID = allAnnotations.find(a => a.annotationUID === annotationId);
        if (annByIDAsUID) {
          console.log(`[findAnnotation] Found by treating annotationId as UID: ${annotationId}`);
          return annByIDAsUID;
        }
        
        console.log(`[findAnnotation] Not found. Available UIDs:`, allAnnotations.slice(0, 5).map(a => a.annotationUID));
      } catch (error) {
        console.warn('Error searching globally for annotation:', error);
      }

      return null;
    };

    // Handler to select/highlight an annotation
    const handleSelectAnnotation = (params: {
      annotationId: string;
      annotationUID?: string;
      instanceId?: string;
    }) => {
      const { annotationId, annotationUID, instanceId } = params;

      console.log('[handleSelectAnnotation] Searching for:', { annotationId, annotationUID, instanceId });

      try {
        // First, deselect all currently selected annotations
        try {
          annotation.selection.deselectAnnotation(); // Deselect all
          
          // Clear highlighted/selected on all annotations globally
          const allAnnotations = annotation.state.getAllAnnotations();
          allAnnotations.forEach((ann) => {
            if (ann.highlighted || ann.isSelected) {
              ann.highlighted = false;
              ann.isSelected = false;
            }
          });
          console.log('[handleSelectAnnotation] Cleared all previous selections');
        } catch (error) {
          console.warn("Failed to deselect previous annotations:", error);
        }

        // Now select the new annotation
        const foundAnnotation = findAnnotation(annotationId, annotationUID, instanceId);

        if (foundAnnotation && foundAnnotation.annotationUID) {
          // Set annotation as selected/highlighted
          try {
            // Use the selection API to mark as selected
            annotation.selection.setAnnotationSelected(foundAnnotation.annotationUID, true);
            
            // Set properties directly on the annotation object
            foundAnnotation.highlighted = true;
            foundAnnotation.isSelected = true;
            
            // Trigger render to show the highlight on all viewports
            if (viewport) {
              batchedRender(viewport);
            }
            
            // Also render other viewports that might display this annotation
            try {
              if (renderingEngineId) {
                const engine = getRenderingEngine(renderingEngineId);
                if (engine) {
                  const viewports = engine.getViewports();
                  Object.values(viewports).forEach((vp) => {
                    if (vp && vp !== viewport) {
                      batchedRender(vp);
                    }
                  });
                }
              }
            } catch (e) {
              // Ignore errors rendering other viewports
            }
            
            console.log(`✅ Annotation ${annotationId} highlighted in viewer`);
          } catch (error) {
            console.warn("Failed to set annotation as active:", error);
          }
        } else {
          console.warn(`Annotation ${annotationId} not found in viewer`);
        }
      } catch (error) {
        console.error("Error selecting annotation:", error);
      }
    };

    // Handler to deselect annotation
    const handleDeselectAnnotation = () => {
      if (!viewport || !viewportReady) return;
      
      const element = viewport.element as HTMLDivElement | null;
      if (!element) return;
      
      try {
        // Clear selection using API - deselectAnnotation() without args clears all
        annotation.selection.deselectAnnotation();
        
        // Also clear highlighted/selected on all annotations in this viewport
        for (const toolName of annotationToolNames) {
          const annotations = annotation.state.getAnnotations(
            toolName,
            element
          ) as Annotation[] | undefined;
          
          if (annotations) {
            annotations.forEach((ann) => {
              ann.highlighted = false;
              ann.isSelected = false;
            });
          }
        }
        
        batchedRender(viewport);
        console.log("✅ Annotation deselected");
      } catch (error) {
        console.warn("Error deselecting annotation:", error);
      }
    };

    // Handler to update annotation color
    const handleUpdateAnnotationColor = (params: {
      annotationId: string;
      annotationUID?: string;
      colorCode: string;
      instanceId?: string;
    }) => {
      const { annotationId, annotationUID, colorCode, instanceId } = params;

      console.log('[handleUpdateAnnotationColor] Updating color:', { annotationId, annotationUID, colorCode });

      // Retry mechanism: annotation might not be immediately available
      const updateColor = (retries = 3) => {
        try {
          const foundAnnotation = findAnnotation(annotationId, annotationUID, instanceId);

          if (foundAnnotation && foundAnnotation.annotationUID) {
            // Update annotation color using Cornerstone's style API
            annotation.config.style.setAnnotationStyles(foundAnnotation.annotationUID, {
              color: colorCode,
            });

            // Trigger render to show the updated color
            if (viewport) {
              batchedRender(viewport);
            } else if (renderingEngineId) {
              // If no viewport but we have renderingEngineId, try to render all viewports in that engine
              try {
                const engine = getRenderingEngine(renderingEngineId);
                if (engine) {
                  const viewports = engine.getViewports();
                  for (const vp of Object.values(viewports)) {
                    if (vp) {
                      batchedRender(vp);
                    }
                  }
                }
              } catch (e) {
                console.warn('Error rendering viewports for color update:', e);
              }
            }
            console.log(`✅ Annotation ${annotationId} color updated to ${colorCode}`);
          } else if (retries > 0) {
            // Retry if annotation not found yet
            console.log(`[handleUpdateAnnotationColor] Annotation not found, retrying... (${retries} left)`);
            setTimeout(() => updateColor(retries - 1), 100);
          } else {
            console.warn(`Annotation ${annotationId} not found in viewer for color update after retries`);
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
    };

    // Handler to lock/unlock annotation
    const handleLockAnnotation = (params: {
      annotationId: string;
      annotationUID?: string;
      locked: boolean;
      instanceId?: string;
    }) => {
      const { annotationId, annotationUID, locked, instanceId } = params;

      try {
        const foundAnnotation = findAnnotation(annotationId, annotationUID, instanceId);

        if (foundAnnotation && foundAnnotation.annotationUID) {
          // Use Cornerstone's locking API
          annotation.locking.setAnnotationLocked(foundAnnotation.annotationUID, locked);
          
          // Also set isLocked property directly
          foundAnnotation.isLocked = locked;

          // Trigger render
          batchedRender(viewport);
          console.log(`✅ Annotation ${annotationId} ${locked ? 'locked' : 'unlocked'}`);
        } else {
          console.warn(`Annotation ${annotationId} not found in viewer for lock operation`);
        }
      } catch (error) {
        console.error("Error locking/unlocking annotation:", error);
      }
    };

    // Expose tool handlers for external access
    const getToolHandlers = () => ({
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
    });

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

export {
  CornerstoneToolManager,
  // Export tool mappings and helper functions for reusability
  TOOL_MAPPINGS,
  TOOL_BINDINGS,
  getToolMapping,
  getToolName,
  getToolClass,
  isCustomTool,
  // Export keyboard shortcut functions
  getToolByKeyboardShortcut,
  getKeyboardShortcut,
  getAllKeyboardShortcuts,
  type ToolType,
  type ToolMapping,
  type ToolBindings,
};
