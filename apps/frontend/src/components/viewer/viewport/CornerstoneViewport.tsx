"use client";

import React, { useRef, useEffect, useState } from 'react';
import {
  RenderingEngine,
  Enums,
  type Types,
  getRenderingEngine,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  addTool,
  init as csToolsInit,
  PanTool,
  StackScrollTool,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { MouseBindings } from "@cornerstonejs/tools/enums";
import { useViewer, ToolType } from "@/contexts/ViewerContext";

// Global state management
declare global {
  interface Window {
    cornerstoneInitialized?: boolean;
    cornerstoneToolsAdded?: boolean;
  }
}

interface CornerstoneViewportProps {
  viewportId: string;
  isActive: boolean;
  onClick: () => void;
  imageIds?: string[];
}

const CornerstoneViewport = ({ viewportId, isActive, onClick, imageIds }: CornerstoneViewportProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const toolGroupRef = useRef<any>(null);
  const { state } = useViewer();

  const setToolBindings = (toolGroup: any, activeTool: ToolType) => {
    if (!toolGroup) return;

    // Clear all existing bindings
    toolGroup.setToolPassive(WindowLevelTool.toolName);
    toolGroup.setToolPassive(ZoomTool.toolName);
    toolGroup.setToolPassive(PanTool.toolName);

    // Set active tool based on context
    switch (activeTool) {
      case 'WindowLevel':
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: 1 }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: 2 }],
        });
        break;
      case 'Zoom':
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: 1 }],
        });
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: 2 }],
        });
        break;
      case 'Pan':
        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: 1 }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: 2 }],
        });
        break;
      default:
        // Default to Window/Level
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: 1 }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: 2 }],
        });
        break;
    }

    // Stack scroll is always active on wheel
    toolGroup.setToolActive(StackScrollTool.toolName, {
      bindings: [{ mouseButton: MouseBindings.Wheel }],
    });
  };

  useEffect(() => {
    const initCornerstone = async () => {
      if (initialized || !elementRef.current) return;

      try {
        // Initialize Cornerstone (only once globally)
        if (!window.cornerstoneInitialized) {
          await csRenderInit();
          await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 4 });
          window.cornerstoneInitialized = true;
        }

        // Create rendering engine for this viewport
        const renderingEngineId = `renderingEngine-${viewportId}`;
        const renderingEngine = new RenderingEngine(renderingEngineId);
        renderingEngineRef.current = renderingEngine;

        // Viewport configuration
        const viewportInput: Types.PublicViewportInput = {
          viewportId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current,
        };

        // Enable the viewport
        renderingEngine.enableElement(viewportInput);

        // Setup tools
        const toolGroupId = `toolGroup-${viewportId}`;
        const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
        
        // Add tools (only if not already added globally)
        if (!window.cornerstoneToolsAdded) {
          addTool(ZoomTool);
          addTool(WindowLevelTool);
          addTool(PanTool);
          addTool(StackScrollTool);
          window.cornerstoneToolsAdded = true;
        }

        toolGroup?.addTool(ZoomTool.toolName);
        toolGroup?.addTool(WindowLevelTool.toolName);
        toolGroup?.addTool(PanTool.toolName);
        toolGroup?.addTool(StackScrollTool.toolName);
        toolGroup?.addViewport(viewportId);

        // Store tool group reference
        toolGroupRef.current = toolGroup;

        // Set default tool bindings
        setToolBindings(toolGroup, state.activeTool);

        setInitialized(true);

        // Load images if provided
        if (imageIds && imageIds.length > 0) {
          const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
           viewport.setStack(imageIds, 0);
          viewport.render();
        }

      } catch (error) {
        console.error('Error initializing Cornerstone viewport:', error);
      }
    };

    initCornerstone();

    return () => {
      // Cleanup
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy();
        } catch (error) {
          console.error('Error destroying rendering engine:', error);
        }
      }
    };
  }, [viewportId, initialized]);

  // Load new images when imageIds change
  // useEffect(() => {
  //   if (!initialized || !renderingEngineRef.current || !imageIds?.length) return;

  //   const loadImages =  () => {
  //     try {
  //       const viewport = renderingEngineRef.current!.getViewport(viewportId) as Types.IStackViewport;
  //       viewport.setStack(imageIds, 0);
  //       viewport.render();
  //     } catch (error) {
  //       console.error('Error loading images:', error);
  //     }
  //   };

  //   loadImages();
  // }, [imageIds, initialized, viewportId]);

  useEffect(() => {
    if (!initialized || !toolGroupRef.current) return;
    
    setToolBindings(toolGroupRef.current, state.activeTool);
  }, [state.activeTool, initialized]);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className={`relative bg-black border-2 cursor-pointer transition-colors h-full ${
        isActive ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={onClick}
      onContextMenu={handleRightClick}
    >
      <div
        ref={elementRef}
        style={{
          width: "100%",
          height: "512px",
          backgroundColor: "#000",
          border: "1px solid #ccc",
        }}
      />
      
      {/* Viewport Info */}
      <div className="absolute top-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
        <div>{viewportId}</div>
        {imageIds?.length && <div className="text-blue-400">{imageIds.length} images</div>}
      </div>

      {/* Image Info */}
      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
        <div>W: 400 L: 200</div>
        <div>Zoom: 100%</div>
      </div>

      {/* Series Info */}
      <div className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
        <div>1 (1/{imageIds?.length || 1})</div>
      </div>

      {!initialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Initializing...</div>
        </div>
      )}
    </div>
  );
};

export default CornerstoneViewport;