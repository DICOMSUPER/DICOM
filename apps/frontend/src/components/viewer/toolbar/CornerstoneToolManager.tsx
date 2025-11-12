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
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  ArrowAnnotateTool,
  CobbAngleTool,
  PlanarRotateTool,
  MagnifyTool,
  HeightTool,
  ETDRSGridTool,
  SplineROITool,
  ReferenceLinesTool,
  // Additional tools
  TrackballRotateTool,
  MIPJumpToClickTool,
  SegmentBidirectionalTool,
  ScaleOverlayTool,
  OrientationMarkerTool,
  OverlayGridTool,
  KeyImageTool,
  LabelTool,
  DragProbeTool,
  PaintFillTool,
  EraserTool,
  annotation,
  segmentation,
  // Segmentation tools
  BrushTool,
  CircleScissorsTool,
  RectangleScissorsTool,
  SphereScissorsTool,
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";
import { eventTarget, getRenderingEngine, type Types } from "@cornerstonejs/core";
import { AnnotationType } from "@/enums/image-dicom.enum";

// Tool type definitions
type NavigationTool = 'WindowLevel' | 'Pan' | 'Zoom' | 'StackScroll' | 'Probe' | 'TrackballRotate' | 'MIPJumpToClick';
type MeasurementTool = 'Length' | 'Height' | 'CircleROI' | 'EllipticalROI' | 'RectangleROI' | 'Bidirectional' | 'Angle' | 'ArrowAnnotate' | 'CobbAngle' | 'SplineROI' | 'SegmentBidirectional' | 'ScaleOverlay';
type AdvancedTool = 'PlanarRotate' | 'Magnify' | 'ETDRSGrid' | 'ReferenceLines' | 'OrientationMarker' | 'OverlayGrid';
type AnnotationTool = 'KeyImage' | 'Label' | 'DragProbe' | 'PaintFill' | 'Eraser';
type SegmentationTool = 'Brush' | 'CircleScissors' | 'RectangleScissors' | 'SphereScissors';
type CustomTool =
  | "Rotate"
  | "Flip"
  | "Invert"
  | "ClearAnnotations"
  | "ClearViewportAnnotations"
  | "ClearSegmentation"
  | "UndoAnnotation"
  | "Reset";
type ToolType = NavigationTool | MeasurementTool | AdvancedTool | AnnotationTool | SegmentationTool | CustomTool;

// Tool mapping interfaces
interface ToolMapping {
  toolName: string;
  toolClass: any;
  category: 'navigation' | 'measurement' | 'advanced' | 'annotation' | 'segmentation' | 'custom';
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
  'WindowLevel': { toolName: WindowLevelTool.toolName, toolClass: WindowLevelTool, category: 'navigation' },
  'Pan': { toolName: PanTool.toolName, toolClass: PanTool, category: 'navigation' },
  'Zoom': { toolName: ZoomTool.toolName, toolClass: ZoomTool, category: 'navigation' },
  'StackScroll': { toolName: StackScrollTool.toolName, toolClass: StackScrollTool, category: 'navigation' },
  'Probe': { toolName: ProbeTool.toolName, toolClass: ProbeTool, category: 'navigation' },
  
  // Measurement tools
  'Length': { toolName: LengthTool.toolName, toolClass: LengthTool, category: 'measurement' },
  'Height': { toolName: HeightTool.toolName, toolClass: HeightTool, category: 'measurement' },
  'CircleROI': { toolName: CircleROITool.toolName, toolClass: CircleROITool, category: 'measurement' },
  'EllipticalROI': { toolName: EllipticalROITool.toolName, toolClass: EllipticalROITool, category: 'measurement' },
  'RectangleROI': { toolName: RectangleROITool.toolName, toolClass: RectangleROITool, category: 'measurement' },
  'Bidirectional': { toolName: BidirectionalTool.toolName, toolClass: BidirectionalTool, category: 'measurement' },
  'Angle': { toolName: AngleTool.toolName, toolClass: AngleTool, category: 'measurement' },
  'ArrowAnnotate': { toolName: ArrowAnnotateTool.toolName, toolClass: ArrowAnnotateTool, category: 'measurement' },
  'CobbAngle': { toolName: CobbAngleTool.toolName, toolClass: CobbAngleTool, category: 'measurement' },
  'SplineROI': { toolName: SplineROITool.toolName, toolClass: SplineROITool, category: 'measurement' },
  
  // Advanced tools
  'PlanarRotate': { toolName: PlanarRotateTool.toolName, toolClass: PlanarRotateTool, category: 'advanced' },
  'Magnify': { toolName: MagnifyTool.toolName, toolClass: MagnifyTool, category: 'advanced' },
  'ETDRSGrid': { toolName: ETDRSGridTool.toolName, toolClass: ETDRSGridTool, category: 'advanced' },
  'ReferenceLines': { toolName: ReferenceLinesTool.toolName, toolClass: ReferenceLinesTool, category: 'advanced' },
  
  // Custom tools (no Cornerstone.js tool class)
  'Rotate': { toolName: 'Rotate', toolClass: null, category: 'custom' },
  'Flip': { toolName: 'Flip', toolClass: null, category: 'custom' },
  'Invert': { toolName: 'Invert', toolClass: null, category: 'custom' },
  'ClearAnnotations': { toolName: 'ClearAnnotations', toolClass: null, category: 'custom' },
  'ClearViewportAnnotations': { toolName: 'ClearViewportAnnotations', toolClass: null, category: 'custom' },
  'ClearSegmentation': { toolName: 'ClearSegmentation', toolClass: null, category: 'custom' },
  'UndoAnnotation': { toolName: 'UndoAnnotation', toolClass: null, category: 'custom' },
  'Reset': { toolName: 'Reset', toolClass: null, category: 'custom' },
  
  // Additional Navigation tools
  'TrackballRotate': { toolName: TrackballRotateTool.toolName, toolClass: TrackballRotateTool, category: 'navigation' },
  'MIPJumpToClick': { toolName: MIPJumpToClickTool.toolName, toolClass: MIPJumpToClickTool, category: 'navigation' },
  
  // Additional Measurement tools
  'SegmentBidirectional': { toolName: SegmentBidirectionalTool.toolName, toolClass: SegmentBidirectionalTool, category: 'measurement' },
  'ScaleOverlay': { toolName: ScaleOverlayTool.toolName, toolClass: ScaleOverlayTool, category: 'measurement' },
  
  // Additional Advanced tools
  'OrientationMarker': { toolName: OrientationMarkerTool.toolName, toolClass: OrientationMarkerTool, category: 'advanced' },
  'OverlayGrid': { toolName: OverlayGridTool.toolName, toolClass: OverlayGridTool, category: 'advanced' },
  
  // Annotation tools
  'KeyImage': { toolName: KeyImageTool.toolName, toolClass: KeyImageTool, category: 'annotation' },
  'Label': { toolName: LabelTool.toolName, toolClass: LabelTool, category: 'annotation' },
  'DragProbe': { toolName: DragProbeTool.toolName, toolClass: DragProbeTool, category: 'annotation' },
  'PaintFill': { toolName: PaintFillTool.toolName, toolClass: PaintFillTool, category: 'annotation' },
  'Eraser': { toolName: EraserTool.toolName, toolClass: EraserTool, category: 'annotation' },
  
  // Segmentation tools
  'Brush': { toolName: BrushTool.toolName, toolClass: BrushTool, category: 'segmentation' },
  'CircleScissors': { toolName: CircleScissorsTool.toolName, toolClass: CircleScissorsTool, category: 'segmentation' },
  'RectangleScissors': { toolName: RectangleScissorsTool.toolName, toolClass: RectangleScissorsTool, category: 'segmentation' },
  'SphereScissors': { toolName: SphereScissorsTool.toolName, toolClass: SphereScissorsTool, category: 'segmentation' },
};

// Tool bindings configuration
const TOOL_BINDINGS: Record<string, ToolBindings> = {
  [WindowLevelTool.toolName]: { primary: MouseBindings.Primary, keyboard: 'w' },
  [PanTool.toolName]: { auxiliary: MouseBindings.Auxiliary, keyboard: 'p' },
  [ZoomTool.toolName]: { secondary: MouseBindings.Secondary, keyboard: 'z' }, 
  [StackScrollTool.toolName]: { wheel: MouseBindings.Wheel }, 
  [ProbeTool.toolName]: { keyboard: 'i' }, // Info/Probe tool
  [LengthTool.toolName]: { keyboard: 'l' }, // Length measurement
  [RectangleROITool.toolName]: { keyboard: 'r' }, // Rectangle ROI
  [CircleROITool.toolName]: { keyboard: 'c' }, // Circle ROI
  [EllipticalROITool.toolName]: { keyboard: 'e' }, // Elliptical ROI
  [AngleTool.toolName]: { keyboard: 'a' }, // Angle measurement
  [BidirectionalTool.toolName]: { keyboard: 'b' }, // Bidirectional measurement
  [ArrowAnnotateTool.toolName]: { keyboard: 't' }, // Text annotation
                                              
  [CobbAngleTool.toolName]: { keyboard: 'k' }, // Cobb angle
  [MagnifyTool.toolName]: { keyboard: 'm' }, // Magnify tool
  [PlanarRotateTool.toolName]: { wheelWithCtrl: MouseBindings.Wheel, keyboard: 'o' }, // Rotate
  
  // Additional tools keyboard shortcuts
  [TrackballRotateTool.toolName]: { keyboard: 'r' }, // Trackball rotate
  [MIPJumpToClickTool.toolName]: { keyboard: 'j' }, // MIP jump
  [SegmentBidirectionalTool.toolName]: { keyboard: 'd' }, // Segment bidirectional
  [ScaleOverlayTool.toolName]: { keyboard: 'v' }, // Scale overlay
  [OrientationMarkerTool.toolName]: { keyboard: 'u' }, // Orientation marker
  [OverlayGridTool.toolName]: { keyboard: 'h' }, // Overlay grid
  [KeyImageTool.toolName]: { keyboard: 'q' }, // Key image
  [LabelTool.toolName]: { keyboard: 'n' }, // Label
  [DragProbeTool.toolName]: { keyboard: 'f' }, // Drag probe
  [PaintFillTool.toolName]: { keyboard: 'y' }, // Paint fill
  [EraserTool.toolName]: { keyboard: 'shift+z' }, // Eraser
  
  // Segmentation tools keyboard shortcuts
  [BrushTool.toolName]: { keyboard: 's' }, // Brush (Segmentation)
  [CircleScissorsTool.toolName]: { keyboard: 'g' }, // Circle scissors
  [RectangleScissorsTool.toolName]: { keyboard: 'x' }, // Rectangle scissors
  [SphereScissorsTool.toolName]: { keyboard: 'shift+s' }, // Sphere scissors
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
  return getToolMapping(toolType)?.category === 'custom';
};

const annotationToolNames = Object.values(AnnotationType);

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
}

const CornerstoneToolManager = forwardRef<any, CornerstoneToolManagerProps>(({
  toolGroupId,
  renderingEngineId,
  viewportId,
  selectedTool,
  onToolChange,
  viewport,
  viewportReady,
}, ref) => {
  const toolGroupRef = useRef<any>(null);

  // Keyboard shortcut handler
  const handleKeyboardShortcut = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const toolName = getToolByKeyboardShortcut(key);
    
    if (toolName && onToolChange) {
      event.preventDefault();
      console.log(`🎹 Keyboard shortcut activated: ${key} -> ${toolName}`);
      
      // Find the tool type from tool name
      const toolType = Object.keys(TOOL_MAPPINGS).find(toolType => 
        getToolName(toolType as ToolType) === toolName
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
      console.warn('Viewport not ready for custom tool:', toolName);
      return;
    }

    switch (toolName) {
      case 'Rotate':
        handleRotateViewport(90);
        break;
      
      case 'Flip':
        handleFlipViewport('horizontal');
        break;
      
      case 'Invert':
        handleInvertColorMap();
        break;
      
      case 'ClearAnnotations':
        handleClearAnnotations();
        break;

      case 'ClearViewportAnnotations':
        handleClearViewportAnnotations();
        break;
      
      case 'ClearSegmentation':
        handleClearSegmentation();
        break;
      
      case 'UndoAnnotation':
        handleUndoAnnotation();
        break;
      
      case 'Reset':
        handleResetView();
        break;
      
      default:
        console.log('Unknown custom tool:', toolName);
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
        rotation: (rotation + degrees) % 360
      });
      viewport.render();
      console.log(`Rotated viewport ${viewportId} by ${degrees} degrees`);
    } catch (error) {
      console.error('Error rotating viewport:', error);
    }
  };

  // Flip viewport handler
  const handleFlipViewport = (direction: 'horizontal' | 'vertical') => {
    if (!viewport || !viewportReady) return;
    
    try {
      const camera = viewport.getCamera();
      const { flipHorizontal = false, flipVertical = false } = camera;
      
      if (direction === 'horizontal') {
        viewport.setCamera({
          ...camera,
          flipHorizontal: !flipHorizontal
        });
      } else {
        viewport.setCamera({
          ...camera,
          flipVertical: !flipVertical
        });
      }
      viewport.render();
      console.log(`Flipped viewport ${viewportId} ${direction}`);
    } catch (error) {
      console.error('Error flipping viewport:', error);
    }
  };

  // Reset view handler
  const handleResetView = () => {
    if (!viewport || !viewportReady) return;
    
    try {
      console.log('Resetting view for viewport:', viewportId);
      viewport.resetCamera();
      
      setTimeout(() => {
        try {
          viewport.render();
          console.log(`Reset view for viewport ${viewportId}`);
        } catch (renderError) {
          console.error('Error rendering after reset:', renderError);
        }
      }, 100);
    } catch (error) {
      console.error('Error resetting view:', error);
    }
  };

  // Invert color map handler
  const handleInvertColorMap = () => {
    if (!viewport || !viewportReady) return;
    
    try {
      console.log('Inverting color map for viewport:', viewportId);
      
      if (typeof viewport.setProperties === 'function') {
        const currentProperties = viewport.getProperties();
        viewport.setProperties({
          ...currentProperties,
          invert: !currentProperties.invert
        });
        viewport.render();
        console.log(`Inverted color map for viewport ${viewportId}`);
      } else {
        console.warn('setProperties not available for color map inversion');
      }
    } catch (error) {
      console.error('Error inverting color map:', error);
    }
  };

  // Clear annotations handler
  const handleClearAnnotations = () => {
    if (!viewport || !viewportReady) return;
    
    try {            
      annotation.state.removeAllAnnotations();
      
      console.log(`Successfully cleared annotations for viewport ${viewportId}`);
    } catch (error) {
      console.error('Error clearing annotations:', error);
    }
  };

  const handleClearViewportAnnotations = () => {
    if (!viewport || !viewportReady) return;

    const element = viewport.element as HTMLDivElement | null;
    if (!element) {
      console.warn("Unable to resolve viewport element for clearing annotations.");
      return;
    }

    annotationToolNames.forEach((toolName) => {
      try {
        annotation.state.removeAnnotations(toolName, element);
      } catch (error) {
        console.warn(
          `Failed to remove annotations for tool ${toolName} on viewport ${viewportId}:`,
          error
        );
      }
    });
  };

  // Clear segmentation handler
  const handleClearSegmentation = () => {
    if (!viewport || !viewportReady) return;
    
    try {
      console.log(`Clearing segmentation for viewport ${viewportId}`);
      
      if (viewport) {
        // Get all segmentation representations for this viewport
        const segmentationRepresentations = segmentation.state.getSegmentationRepresentations(viewport.element);
        
        if (segmentationRepresentations && segmentationRepresentations.length > 0) {
          console.log(`Found ${segmentationRepresentations.length} segmentation representations`);
          
          // Remove all segmentation representations
          segmentationRepresentations.forEach(representation => {
            try {
              console.log(`Removing segmentation representation:`, representation.segmentationId);
              segmentation.state.removeSegmentationRepresentation(viewport.element, {
                segmentationId: representation.segmentationId,
                type: representation.type
              });
            } catch (error) {
              console.warn(`Failed to remove segmentation representation ${representation.segmentationId}:`, error);
            }
          });
        } else {
          console.log('No segmentation representations found for this viewport');
        }
      }

      setTimeout(() => {
        if (viewport && typeof viewport.render === 'function') {
          viewport.render();
        }
      }, 100);
      
      console.log(`Successfully cleared segmentation for viewport ${viewportId}`);
    } catch (error) {
      console.error('Error clearing segmentation:', error);
    }
  };

  // Undo annotation handler - removes the last annotation created
  const handleUndoAnnotation = () => {
    if (!viewport || !viewportReady) return;
    
    try {
      console.log(`Undoing last annotation for viewport ${viewportId}`);
      
      if (viewport) {
        let lastAnnotation = null;
        let lastAnnotationToolName = null;
        
        // Get all measurement tools and find the last annotation
        // Simple approach: get the last annotation from the last tool that has annotations
        for (let i = annotationToolNames.length - 1; i >= 0; i--) {
          const toolName = annotationToolNames[i];
          try {
            const annotations = annotation.state.getAnnotations(toolName, viewport.element);
            if (annotations && annotations.length > 0) {
              // Get the last annotation from this tool
              lastAnnotation = annotations[annotations.length - 1];
              lastAnnotationToolName = toolName;
              break; // Found the most recent annotation
            }
          } catch (error) {
            console.warn(`Failed to get annotations for ${toolName}:`, error);
          }
        }
        
        // If we found an annotation, remove it
        if (lastAnnotation && lastAnnotationToolName && lastAnnotation.annotationUID) {
          console.log(`Removing last annotation:`, lastAnnotation.annotationUID, 'from tool:', lastAnnotationToolName);
          annotation.state.removeAnnotation(lastAnnotation.annotationUID);
          console.log(`Successfully undone annotation for viewport ${viewportId}`);
        } else {
          console.log(`No annotations found to undo for viewport ${viewportId}`);
        }
      }

      setTimeout(() => {
        if (viewport && typeof viewport.render === 'function') {
          viewport.render();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error undoing annotation:', error);
    }
  };

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
        annotation?: { metadata?: Record<string, unknown> };
      }>;

      const eventViewportId =
        customEvent.detail?.viewportId ??
        (customEvent.detail?.annotation?.metadata?.viewportId as string | undefined);

      if (viewportId && eventViewportId && eventViewportId !== viewportId) {
        return;
      }

      if (typeof viewport.render === "function") {
        try {
          viewport.render();
        } catch (renderError) {
          console.error("Error rendering viewport after annotation event:", renderError);
        }
      }
    };

    relevantEvents.forEach((eventName) => {
      eventTarget.addEventListener(eventName, handleAnnotationEvent as EventListener);
    });

    return () => {
      relevantEvents.forEach((eventName) => {
        eventTarget.removeEventListener(eventName, handleAnnotationEvent as EventListener);
      });
    };
  }, [viewport, viewportReady, viewportId]);

  useEffect(() => {
    if (!toolGroupId || !renderingEngineId || !viewportId || !viewportReady) {
      return;
    }

    let initialized = false;

    try {
      // Initialize all available tools (only once)
      const nonCustomTools = Object.values(TOOL_MAPPINGS)
        .filter(mapping => mapping.category !== 'custom' && mapping.toolClass)
        .map(mapping => mapping.toolClass);

      nonCustomTools.forEach(toolClass => {
        addTool(toolClass);
      });

      console.log(`Initialized ${nonCustomTools.length} tools successfully`);
    } catch (error) {
      console.log('Tools already initialized or some tools failed to initialize:', error);
    }

    // Create or get tool group
    let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) {
      toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
    }

    if (!toolGroup) {
      console.error('Failed to create or get tool group:', toolGroupId);
      return;
    }

    toolGroupRef.current = toolGroup;

    // Add all tools to the group using mappings
    const toolNames = Object.values(TOOL_MAPPINGS)
      .filter(mapping => mapping.category !== 'custom' && mapping.toolClass)
      .map(mapping => mapping.toolName);

    toolNames.forEach(toolName => {
      if (toolGroup && !toolGroup.hasTool(toolName)) {
        try {
          toolGroup.addTool(toolName);
        } catch (error) {
          console.warn(`Failed to add tool ${toolName}:`, error);
        }
      }
    });

    // Set up mouse bindings using TOOL_BINDINGS configuration
    if (toolGroup && typeof toolGroup.setToolActive === 'function') {
      try {
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }]
        });

        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Auxiliary }]
        });

        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Secondary }]
        });

        toolGroup.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Wheel }]
        });

        toolGroup.setToolActive(PlanarRotateTool.toolName, {
          bindings: [
            { mouseButton: MouseBindings.Wheel, modifierKey: ToolEnums.KeyboardBindings.Ctrl }
          ]
        });
      } catch (error) {
        console.warn('Error setting up mouse bindings:', error);
      }
    }

    // Try to add viewport to tool group
    if (toolGroup && typeof toolGroup.addViewport === 'function') {
      try {
        toolGroup.addViewport(viewportId, renderingEngineId);
        initialized = true;
      } catch (error) {
        console.warn('Failed to add viewport to tool group:', error);
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
        console.warn('Tool group not ready or no selected tool:', { 
          toolGroupReady: !!toolGroupRef.current, 
          selectedTool 
        });
      }
      return;
    }

    // Check if it's a custom tool using helper function
    if (isCustomTool(selectedTool as ToolType)) {
      console.log('Handling custom tool:', selectedTool);
      handleCustomTool(selectedTool);
      onToolChange?.(selectedTool);
      return;
    }

    const viewportsInfo =
      (toolGroupRef.current.getViewportsInfo?.() as Types.IViewportId[] | undefined) ?? [];
    if (viewportsInfo.length === 0) {
      console.warn('Tool group has no registered viewports; skipping tool activation.');
      return;
    }
    const hasMissingEngine = viewportsInfo.some(({ renderingEngineId, viewportId }) => {
      const engine = getRenderingEngine(renderingEngineId);
      return !engine || !engine.getViewport?.(viewportId);
    });
    if (hasMissingEngine) {
      console.warn('Rendering engine/viewport missing for tool group; defer tool activation.');
      return;
    }

    // Handle Cornerstone.js tools using mapping
    const actualToolName = getToolName(selectedTool as ToolType);
    if (actualToolName && toolGroupRef.current.hasTool && toolGroupRef.current.hasTool(actualToolName)) {
      // Set all tools to passive first using mappings
      if (typeof toolGroupRef.current.setToolPassive === 'function') {
        const allToolNames = Object.values(TOOL_MAPPINGS)
          .filter(mapping => mapping.category !== 'custom' && mapping.toolClass)
          .map(mapping => mapping.toolName);
        
        allToolNames.forEach(toolName => {
          toolGroupRef.current!.setToolPassive(toolName);
        });
      }

      // Activate selected tool
      if (typeof toolGroupRef.current.setToolActive === 'function') {
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
            { mouseButton: MouseBindings.Wheel, modifierKey: ToolEnums.KeyboardBindings.Ctrl }
          ]
        });
      }

      onToolChange?.(actualToolName);
    } else {
      console.warn('Tool not found or not available:', selectedTool);
    }
  }, [selectedTool, onToolChange, viewportReady]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyboardShortcut(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToolChange]);

  // Expose tool group for external access
  const getToolGroup = () => toolGroupRef.current;

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
  });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getToolGroup,
    getToolHandlers,
  }));

  return null; // This component doesn't render anything
});

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
  type ToolBindings
};
