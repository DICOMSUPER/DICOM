"use client";
import { useEffect, useRef } from "react";
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
  annotation,
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";

interface CornerstoneToolManagerProps {
  toolGroupId: string;
  renderingEngineId: string;
  viewportId: string;
  selectedTool: string;
  onToolChange?: (toolName: string) => void;
}

export default function CornerstoneToolManager({
  toolGroupId,
  renderingEngineId,
  viewportId,
  selectedTool,
  onToolChange,
}: CornerstoneToolManagerProps) {
  const toolGroupRef = useRef<any>(null);

  useEffect(() => {
    // Wait a bit for the rendering engine to be initialized
    const initTimeout = setTimeout(() => {
      try {
        // Initialize all available tools (only once)
        const initializeTools = () => {
          try {
            addTool(WindowLevelTool);
            addTool(PanTool);
            addTool(ZoomTool);
            addTool(StackScrollTool);
            addTool(ProbeTool);
            addTool(LengthTool);
            addTool(CircleROITool);
            addTool(EllipticalROITool);
            addTool(RectangleROITool);
            addTool(BidirectionalTool);
            addTool(AngleTool);
            addTool(ArrowAnnotateTool);
            addTool(CobbAngleTool);
            addTool(PlanarRotateTool);
            addTool(MagnifyTool);
          } catch (error) {
            // Tools might already be added, ignore error
            console.log('Tools already initialized');
          }
        };

        initializeTools();

        // Create or get tool group
        let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
        if (!toolGroup) {
          toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
        }

        toolGroupRef.current = toolGroup;

        // Add all tools to the group
        const toolNames = [
          WindowLevelTool.toolName,
          PanTool.toolName,
          ZoomTool.toolName,
          StackScrollTool.toolName,
          ProbeTool.toolName,
          LengthTool.toolName,
          CircleROITool.toolName,
          EllipticalROITool.toolName,
          RectangleROITool.toolName,
          BidirectionalTool.toolName,
          AngleTool.toolName,
          ArrowAnnotateTool.toolName,
          CobbAngleTool.toolName,
          PlanarRotateTool.toolName,
          MagnifyTool.toolName,
        ];

        toolNames.forEach(toolName => {
          if (!toolGroup?.hasTool(toolName)) {
            toolGroup?.addTool(toolName);
          }
        });

        // Set up mouse bindings
        toolGroup?.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });

        toolGroup?.setToolActive(ZoomTool.toolName, {
          bindings: [
            { mouseButton: MouseBindings.Secondary },
            { mouseButton: MouseBindings.Wheel, modifierKey: ToolEnums.KeyboardBindings.Ctrl }
          ],
        });

        toolGroup?.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Auxiliary }],
        });

        toolGroup?.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Wheel }],
        });

        // Try to add viewport to tool group
        try {
          toolGroup?.addViewport(viewportId, renderingEngineId);
        } catch (error) {
          console.warn('Failed to add viewport to tool group, will retry:', error);
          // Viewport might not be ready yet, that's okay
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
    if (!toolGroupRef.current || !selectedTool) return;

    // Map selected tool names to actual tool names
    const toolMapping: Record<string, string> = {
      'WindowLevel': WindowLevelTool.toolName,
      'Pan': PanTool.toolName,
      'Zoom': ZoomTool.toolName,
      'Probe': ProbeTool.toolName,
      'Length': LengthTool.toolName,
      'CircleROI': CircleROITool.toolName,
      'EllipticalROI': EllipticalROITool.toolName,
      'RectangleROI': RectangleROITool.toolName,
      'Bidirectional': BidirectionalTool.toolName,
      'Angle': AngleTool.toolName,
      'ArrowAnnotate': ArrowAnnotateTool.toolName,
      'CobbAngle': CobbAngleTool.toolName,
      'Rotate': PlanarRotateTool.toolName,
      'Magnify': MagnifyTool.toolName,
    };

    const actualToolName = toolMapping[selectedTool];
    if (actualToolName && toolGroupRef.current?.hasTool(actualToolName)) {
      // Deactivate all tools first
      toolGroupRef.current.setToolPassive(WindowLevelTool.toolName);
      toolGroupRef.current.setToolPassive(PanTool.toolName);
      toolGroupRef.current.setToolPassive(ZoomTool.toolName);
      toolGroupRef.current.setToolPassive(StackScrollTool.toolName);
      toolGroupRef.current.setToolPassive(ProbeTool.toolName);
      toolGroupRef.current.setToolPassive(LengthTool.toolName);
      toolGroupRef.current.setToolPassive(CircleROITool.toolName);
      toolGroupRef.current.setToolPassive(EllipticalROITool.toolName);
      toolGroupRef.current.setToolPassive(RectangleROITool.toolName);
      toolGroupRef.current.setToolPassive(BidirectionalTool.toolName);
      toolGroupRef.current.setToolPassive(AngleTool.toolName);
      toolGroupRef.current.setToolPassive(ArrowAnnotateTool.toolName);
      toolGroupRef.current.setToolPassive(CobbAngleTool.toolName);
      toolGroupRef.current.setToolPassive(PlanarRotateTool.toolName);
      toolGroupRef.current.setToolPassive(MagnifyTool.toolName);

      // Activate selected tool
      toolGroupRef.current.setToolActive(actualToolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });

      onToolChange?.(actualToolName);
    }
  }, [selectedTool, onToolChange]);

  // Expose tool group for external access
  const getToolGroup = () => toolGroupRef.current;

  return null; // This component doesn't render anything
}

export { CornerstoneToolManager };
