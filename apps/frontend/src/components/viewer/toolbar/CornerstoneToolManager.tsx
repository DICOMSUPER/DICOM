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
  annotation,
  segmentation,
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";

interface CornerstoneToolManagerProps {
  toolGroupId: string;
  renderingEngineId: string;
  viewportId: string;
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
      console.log(`Clearing annotations and segmentations for viewport ${viewportId}`);
      
      // Get viewport ID and tool group ID
      const actualViewportId = viewportId;
      const toolGroupId = `toolGroup_${actualViewportId}`;
      
      const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
      
      try {
        const allAnnotations = annotation.state.getAllAnnotations();
        if (Array.isArray(allAnnotations) && allAnnotations.length > 0) {
          console.log(`Found ${allAnnotations.length} global annotations to clear`);
          // Remove all annotations at once
          annotation.state.removeAllAnnotations();
        }
      } catch (error) {
        console.warn('Error clearing global annotations:', error);
      }
      
      // Force render
      setTimeout(() => {
        if (viewport && typeof viewport.render === 'function') {
          viewport.render();
        }
      }, 100);
      
      console.log(`Successfully cleared annotations and segmentations for viewport ${viewportId}`);
    } catch (error) {
      console.error('Error clearing annotations and segmentations:', error);
    }
  };

  useEffect(() => {
    // Wait a bit for the rendering engine to be initialized
    const initTimeout = setTimeout(() => {
      try {
        // Initialize all available tools (only once)
        const initializeTools = () => {
          try {
            // Navigation tools
            addTool(WindowLevelTool);
            addTool(PanTool);
            addTool(ZoomTool);
            addTool(StackScrollTool);
            addTool(ProbeTool);
            
            // Measurement tools
            addTool(LengthTool);
            addTool(HeightTool);
            addTool(CircleROITool);
            addTool(EllipticalROITool);
            addTool(RectangleROITool);
            addTool(BidirectionalTool);
            addTool(AngleTool);
            addTool(ArrowAnnotateTool);
            addTool(CobbAngleTool);
            addTool(SplineROITool);
            
            // Advanced tools
            addTool(PlanarRotateTool);
            addTool(MagnifyTool);
            addTool(ETDRSGridTool);
            addTool(ReferenceLinesTool);
            
            console.log('All tools initialized successfully');
          } catch (error) {
            // Tools might already be added, ignore error
            console.log('Tools already initialized or some tools failed to initialize:', error);
          }
        };

        initializeTools();

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

        // Add all tools to the group
        const toolNames = [
          // Navigation tools
          WindowLevelTool.toolName,
          PanTool.toolName,
          ZoomTool.toolName,
          StackScrollTool.toolName,
          ProbeTool.toolName,
          
          // Measurement tools
          LengthTool.toolName,
          HeightTool.toolName,
          CircleROITool.toolName,
          EllipticalROITool.toolName,
          RectangleROITool.toolName,
          BidirectionalTool.toolName,
          AngleTool.toolName,
          ArrowAnnotateTool.toolName,
          CobbAngleTool.toolName,
          SplineROITool.toolName,
          
          // Advanced tools
          PlanarRotateTool.toolName,
          MagnifyTool.toolName,
          ETDRSGridTool.toolName,
          ReferenceLinesTool.toolName,
        ];

        toolNames.forEach(toolName => {
          if (toolGroup && !toolGroup.hasTool(toolName)) {
            try {
              toolGroup.addTool(toolName);
            } catch (error) {
              console.warn(`Failed to add tool ${toolName}:`, error);
            }
          }
        });

        // Set up mouse bindings
        if (toolGroup && typeof toolGroup.setToolActive === 'function') {
          try {
            toolGroup.setToolActive(WindowLevelTool.toolName, {
              bindings: [{ mouseButton: MouseBindings.Primary }],
            });

            toolGroup.setToolActive(ZoomTool.toolName, {
              bindings: [
                { mouseButton: MouseBindings.Secondary },
                { mouseButton: MouseBindings.Wheel, modifierKey: ToolEnums.KeyboardBindings.Ctrl }
              ],
            });

            toolGroup.setToolActive(PanTool.toolName, {
              bindings: [{ mouseButton: MouseBindings.Auxiliary }],
            });

            toolGroup.setToolActive(StackScrollTool.toolName, {
              bindings: [{ mouseButton: MouseBindings.Wheel }],
            });
          } catch (error) {
            console.warn('Error setting up mouse bindings:', error);
          }
        }

        // Try to add viewport to tool group
        if (toolGroup && typeof toolGroup.addViewport === 'function') {
          try {
            toolGroup.addViewport(viewportId, renderingEngineId);
          } catch (error) {
            console.warn('Failed to add viewport to tool group, will retry:', error);
            // Viewport might not be ready yet, that's okay
          }
        }
      } catch (error) {
        console.error('Error initializing tools:', error);
      }
    }, 500); // Wait 500ms for rendering engine to initialize

    return () => {
      clearTimeout(initTimeout);
      // Cleanup - remove all viewports from tool group
      const toolGroup = toolGroupRef.current;
      if (toolGroup) {
        try {
          toolGroup.removeViewports(renderingEngineId, viewportId);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [toolGroupId, renderingEngineId, viewportId]);

  useEffect(() => {
    // Add a small delay to ensure tool group is initialized
    const toolTimeout = setTimeout(() => {
      if (!toolGroupRef.current || !selectedTool) {
        console.warn('Tool group not ready or no selected tool:', { 
          toolGroupReady: !!toolGroupRef.current, 
          selectedTool 
        });
        return;
      }

    // Map selected tool names to actual tool names
    const cornerstoneToolMapping: Record<string, string> = {
      // Navigation tools
      'WindowLevel': WindowLevelTool.toolName,
      'Pan': PanTool.toolName,
      'Zoom': ZoomTool.toolName,
      'Probe': ProbeTool.toolName,
      
      // Measurement tools
      'Length': LengthTool.toolName,
      'Height': HeightTool.toolName,
      'CircleROI': CircleROITool.toolName,
      'EllipticalROI': EllipticalROITool.toolName,
      'RectangleROI': RectangleROITool.toolName,
      'Bidirectional': BidirectionalTool.toolName,
      'Angle': AngleTool.toolName,
      'ArrowAnnotate': ArrowAnnotateTool.toolName,
      'CobbAngle': CobbAngleTool.toolName,
      'SplineROI': SplineROITool.toolName,
      
      // Advanced tools (Cornerstone.js tools)
      'PlanarRotate': PlanarRotateTool.toolName, // This is the actual Cornerstone.js rotate tool
      'Magnify': MagnifyTool.toolName,
      'ETDRSGrid': ETDRSGridTool.toolName,
      'ReferenceLines': ReferenceLinesTool.toolName,
    };

    // Custom tools (not Cornerstone.js tools)
    const customTools = ['Rotate', 'Flip', 'Invert', 'ClearAnnotations', 'Reset'];

    // Check if it's a custom tool
    if (customTools.includes(selectedTool)) {
      console.log('Handling custom tool:', selectedTool);
      handleCustomTool(selectedTool);
      onToolChange?.(selectedTool);
      return;
    }

    // Handle Cornerstone.js tools
    const actualToolName = cornerstoneToolMapping[selectedTool];
    if (actualToolName && toolGroupRef.current && toolGroupRef.current.hasTool && toolGroupRef.current.hasTool(actualToolName)) {
      // Set all tools to passive first
      if (toolGroupRef.current && typeof toolGroupRef.current.setToolPassive === 'function') {
        toolGroupRef.current.setToolPassive(WindowLevelTool.toolName);
        toolGroupRef.current.setToolPassive(PanTool.toolName);
        toolGroupRef.current.setToolPassive(ZoomTool.toolName);
        toolGroupRef.current.setToolPassive(ProbeTool.toolName);
        toolGroupRef.current.setToolPassive(LengthTool.toolName);
        toolGroupRef.current.setToolPassive(HeightTool.toolName);
        toolGroupRef.current.setToolPassive(CircleROITool.toolName);
        toolGroupRef.current.setToolPassive(EllipticalROITool.toolName);
        toolGroupRef.current.setToolPassive(RectangleROITool.toolName);
        toolGroupRef.current.setToolPassive(BidirectionalTool.toolName);
        toolGroupRef.current.setToolPassive(AngleTool.toolName);
        toolGroupRef.current.setToolPassive(ArrowAnnotateTool.toolName);
        toolGroupRef.current.setToolPassive(CobbAngleTool.toolName);
        toolGroupRef.current.setToolPassive(SplineROITool.toolName);
        toolGroupRef.current.setToolPassive(PlanarRotateTool.toolName);
        toolGroupRef.current.setToolPassive(MagnifyTool.toolName);
        toolGroupRef.current.setToolPassive(ETDRSGridTool.toolName);
        toolGroupRef.current.setToolPassive(ReferenceLinesTool.toolName);
      }

      // Activate selected tool
      if (toolGroupRef.current && typeof toolGroupRef.current.setToolActive === 'function') {
        toolGroupRef.current.setToolActive(actualToolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });

        // Ensure StackScrollTool remains active for wheel scrolling
        toolGroupRef.current.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Wheel }],
        });
      }

      onToolChange?.(actualToolName);
    } else {
      console.warn('Tool not found or not available:', selectedTool);
    }
    }, 100); // Small delay to ensure tool group is ready

    return () => {
      clearTimeout(toolTimeout);
    };
  }, [selectedTool, onToolChange]);

  // Expose tool group for external access
  const getToolGroup = () => toolGroupRef.current;

  // Expose tool handlers for external access
  const getToolHandlers = () => ({
    rotateViewport: handleRotateViewport,
    flipViewport: handleFlipViewport,
    resetView: handleResetView,
    invertColorMap: handleInvertColorMap,
    clearAnnotations: handleClearAnnotations,
  });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getToolGroup,
    getToolHandlers,
  }));

  return null; // This component doesn't render anything
});

export default CornerstoneToolManager;

export { CornerstoneToolManager };
