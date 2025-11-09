"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  eventTarget,

  imageLoader,
  utilities as csUtilities,
  getRenderingEngine,
  metaData,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  init as csToolsInit,
  ToolGroupManager,
  Enums as ToolEnums,
  segmentation,
 
} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { Events } from "@cornerstonejs/tools/enums";
import { imagingApi } from "@/services/imagingApi";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import { useViewer } from "@/contexts/ViewerContext";

interface ViewPortMainProps {
  selectedSeries?: any;
  selectedStudy?: any;
  selectedTool?: string;
  onToolChange?: (toolName: string) => void;
  viewportId?: string;
}

const ViewPortMain = ({ selectedSeries, selectedStudy, selectedTool = "windowLevel", onToolChange, viewportId }: ViewPortMainProps) => {
  const viewportIndex = viewportId ? parseInt(viewportId) : 0;
  
  if (isNaN(viewportIndex)) {
    console.error('❌ Invalid viewportIndex:', viewportIndex, 'from viewportId:', viewportId);
    return null;
  }
  const { getViewportId, setViewportId, getRenderingEngineId, setRenderingEngineId } = useViewer();
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const isFirstLoad = useRef(true);
  const mounted = useRef(true);
  const [activeTool, setActiveTool] = useState("WindowLevel");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [viewport, setViewport] = useState<Types.IStackViewport | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);
  const [loadedSeriesId, setLoadedSeriesId] = useState<string | null>(null);
  const [seriesInstancesCache, setSeriesInstancesCache] = useState<Record<string, any[]>>({});
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);
  const [forceRebuild, setForceRebuild] = useState(false);
  const toolManagerRef = useRef<any>(null);

  const getTotalFrames = async (imageId: string) => {
    try {
      await imageLoader.loadImage(imageId);
      
      const multiFrameModule = metaData.get("multiframeModule", imageId);
      const numberOfFrames = multiFrameModule?.NumberOfFrames;
      
      if (numberOfFrames && typeof numberOfFrames === 'number' && numberOfFrames > 0) {
        return numberOfFrames;
      }
      
      return 1;
    } catch (error) {
      return 1;
    }
  };

  // Load instances with caching
  const loadSeriesInstances = async (seriesId: string) => {
    // Check cache first
    if (seriesInstancesCache[seriesId]) {
      console.log('📋 Using cached instances for series:', seriesId, `(${seriesInstancesCache[seriesId].length} instances)`);
      return seriesInstancesCache[seriesId];
    }

    console.log('🔄 Loading instances for series:', seriesId);
    try {
      const instancesResponse = await imagingApi.getInstancesByReferenceId(
        seriesId, 
        'series', 
        { page: 1, limit: 9999 }
      );

      const instances = instancesResponse.data?.data || [];
      
      // Cache the instances
      setSeriesInstancesCache(prev => ({
        ...prev,
        [seriesId]: instances
      }));

      console.log('✅ Cached instances for series:', seriesId, `(${instances.length} instances)`);
      console.log('📊 Cache status:', Object.keys(seriesInstancesCache).length + 1, 'series cached');
      return instances;
    } catch (error) {
      console.error('❌ Failed to load instances for series:', seriesId, error);
      return [];
    }
  };
  
  const goToFrame = (frameIndex: number) => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
      console.warn('Viewport is not properly initialized');
      return;
    }

    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;

    let newFrame = frameIndex;
    if (newFrame > maxIndex) {
      newFrame = maxIndex;
    }
    if (newFrame < 0) {
      newFrame = 0;
    }

    try {
      if (typeof viewport.setImageIdIndex === 'function' && typeof viewport.render === 'function') {
      viewport.setImageIdIndex(newFrame);
      viewport.render();
      
      const validFrame = Math.max(0, newFrame);
      setCurrentFrame(validFrame);
      } else {
        console.error('Viewport methods are not available');
      }
    } catch (error) {
      console.error('Error navigating to frame:', newFrame, error);
    }
  };

  const nextFrame = useCallback(() => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
      console.warn('Viewport is not properly initialized for nextFrame');
      return;
    }
    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;
    
    let newFrame = currentFrame + 1;
    if (newFrame > maxIndex) newFrame = 0;
    
    goToFrame(newFrame);
  }, [viewport, currentFrame]);

  const prevFrame = useCallback(() => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
      console.warn('Viewport is not properly initialized for prevFrame');
      return;
    }
    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;
    
    let newFrame = currentFrame - 1;
    if (newFrame < 0) newFrame = maxIndex;
    
    goToFrame(newFrame);
  }, [viewport, currentFrame]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
      console.warn('Viewport is not properly initialized for keyboard navigation');
      return;
    }
    const stackData = viewport.getImageIds();
    if (stackData.length <= 1) return;

    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        prevFrame();
        break;
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        nextFrame();
        break;
      case "Delete":
      case "Backspace":
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('clearAnnotations'));
        break;
      case "r":
      case "R":
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('resetView'));
        break;
    }
  }, [viewport, nextFrame, prevFrame]);

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return;
      }
      running.current = true;
      
      if (!selectedSeries || !selectedSeries.id) {
        running.current = false;
        return;
      }

      // Clear cache if study changed
      if (selectedStudy && selectedStudy.id !== currentStudyId) {
        console.log('🧹 Clearing instances cache for new study:', selectedStudy.id);
        setSeriesInstancesCache({});
        setCurrentStudyId(selectedStudy.id);
      }
      
      if (viewportIndex !== 0 && loadedSeriesId === selectedSeries.id && viewportReady && viewport && !forceRebuild) {
        const hasImageData = viewport.getImageIds && viewport.getImageIds().length > 0;
        if (hasImageData) {
          running.current = false;
          return;
        }
      }
      
      const existingRenderingEngineId = getRenderingEngineId(viewportIndex);
      
      if (forceRebuild && existingRenderingEngineId) {
        try {
          const existingRenderingEngine = getRenderingEngine(existingRenderingEngineId);
          if (existingRenderingEngine) {
            existingRenderingEngine.destroy();
            setRenderingEngineId(viewportIndex, '');
            setViewportId(viewportIndex, '');
            setViewport(null);
            setViewportReady(false);
            setLoadedSeriesId(null);
          }
        } catch (error) {
          console.warn('Error destroying rendering engine for rebuild:', error);
        }
      }
      
      if (viewportIndex === 0 && existingRenderingEngineId) {
        try {
          const existingRenderingEngine = getRenderingEngine(existingRenderingEngineId);
          if (existingRenderingEngine) {
            existingRenderingEngine.destroy();
            setRenderingEngineId(viewportIndex, '');
            setViewportId(viewportIndex, '');
            setViewport(null);
            setViewportReady(false);
            setLoadedSeriesId(null);
          }
        } catch (error) {
          console.warn('Error destroying rendering engine for viewport 0:', error);
        }
      }
      if (existingRenderingEngineId && loadedSeriesId !== selectedSeries.id) {
        const existingRenderingEngine = getRenderingEngine(existingRenderingEngineId);
        if (existingRenderingEngine) {
          const viewports = existingRenderingEngine.getViewports();
          const viewportIds = Object.keys(viewports);
          const actualViewportId = viewportIndex.toString();
          
          if (viewportIds.includes(actualViewportId)) {
            try {
              const vp = existingRenderingEngine.getViewport(actualViewportId) as Types.IStackViewport;
              if (vp) {
                const instances = await loadSeriesInstances(selectedSeries.id);

                if (instances && instances.length > 0) {
                  const imageIdsPromises = instances.map(async (instance: any) => {
                    if (!instance.filePath) return [];
                    const baseImageId = `wadouri:${instance.filePath}`;
                    try {
                      const numberOfFrames = await getTotalFrames(baseImageId);
                      const validFrames = numberOfFrames && typeof numberOfFrames === 'number' && numberOfFrames > 0 ? numberOfFrames : 1;
                      return validFrames > 1 
                        ? Array.from({ length: validFrames }, (_, frameIndex) => 
                            frameIndex === 0 ? baseImageId : `${baseImageId}?frame=${frameIndex}`
                          ).filter(id => id !== null)
                        : [baseImageId];
                    } catch (error) {
                      return [baseImageId];
                    }
                  });

                  const imageIdsArrays = await Promise.all(imageIdsPromises);
                  const imageIds = imageIdsArrays.flat().filter((id: string) => id && id.length > 0);
                  
                  if (imageIds.length > 0) {
                    await vp.setStack(imageIds, 0);
                    vp.resetCamera();
                    
                    const currentImageIds = vp.getImageIds();
                    const currentImageIdIndex = vp.getCurrentImageIdIndex();
                    const element = vp.element;
                    
                    try {
                      await new Promise(resolve => setTimeout(resolve, 50));
                      
                      const viewports = existingRenderingEngine.getViewports();
                      const viewportIds = Object.keys(viewports);
                      if (viewportIds.includes(actualViewportId)) {
                        existingRenderingEngine.renderViewports([actualViewportId]);
                        
                        setTimeout(() => {
                          try {
                            existingRenderingEngine.renderViewports([actualViewportId]);
                          } catch (error) {
                          }
                        }, 100);
                      } else {
                        vp.render();
                      }
                    } catch (renderError) {
                      console.error('Error rendering viewport:', renderError);
                      vp.render();
                    }
                    
                    setViewport(vp);
                    setViewportReady(true);
                    setCurrentFrame(0);
                    setLoadedSeriesId(selectedSeries.id);
                    console.log('✅ Series updated successfully:', selectedSeries.id);
                    running.current = false;
                    return;
                  }
                }
              }
            } catch (error) {
              console.error('Error updating series in existing viewport:', error);
              // Fall through to full setup
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        setIsLoading(true);
        setLoadingProgress(0);
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });
        setLoadingProgress(20);
        
        if (!selectedSeries) {
          setIsLoading(false);
          return;
        }
        
        let imageIds: string[] = [];

        try {
          // Load instances using cache
          const instances = await loadSeriesInstances(selectedSeries.id);

          setLoadingProgress(30);
          
          if (instances && instances.length > 0) {
            const imageIdsPromises = instances.map(async (instance: any) => {
              if (!instance.filePath) {
                return [];
              }

              const baseImageId = `wadouri:${instance.filePath}`;
              
              try {
                const numberOfFrames = await getTotalFrames(baseImageId);
                const validFrames = numberOfFrames && typeof numberOfFrames === 'number' && numberOfFrames > 0 ? numberOfFrames : 1;
                
                if (validFrames > 1) {
                  const frameIds = Array.from(
                    { length: validFrames },
                    (_, frameIndex) => {
                      if (frameIndex < 0 || frameIndex >= validFrames) {
                        return null;
                      }
                      
                      const imageId = frameIndex === 0 ? baseImageId : `${baseImageId}?frame=${frameIndex}`;
                      return imageId;
                    }
                  ).filter(id => id !== null);
                  
                  return frameIds;
                } else {
                  return [baseImageId];
                }
              } catch (error) {
                return [baseImageId];
              }
            });

            const imageIdsArrays = await Promise.all(imageIdsPromises);
            
            imageIds = imageIdsArrays.flat().filter((id: string) => id && id.length > 0);
            
            setLoadingProgress(40);
            
          } else {
          }
          
        } catch (error) {
          console.error('Error loading series:', error);
        }

        if (imageIds.length === 0) {
          setIsLoading(false);
          return;
        }

        setLoadingProgress(50);

        let currentViewportId = getViewportId(viewportIndex);
        let renderingEngineId = getRenderingEngineId(viewportIndex);
        
        if (!currentViewportId) {
          currentViewportId = viewportId || `viewport-${viewportIndex + 1}`;
          setViewportId(viewportIndex, currentViewportId);
        }
        
        if (!renderingEngineId) {
          renderingEngineId = `renderingEngine_${currentViewportId}`;
          setRenderingEngineId(viewportIndex, renderingEngineId);
        }
        
        let renderingEngine = getRenderingEngine(renderingEngineId);
        if (!renderingEngine) {
          renderingEngine = new RenderingEngine(renderingEngineId);
        } else {
          segmentation.removeAllSegmentationRepresentations();
          segmentation.removeAllSegmentations();
        }
        
        if (!renderingEngine) {
          throw new Error(`Failed to create rendering engine with ID: ${renderingEngineId}`);
        }

        if (!elementRef.current) {
          throw new Error(`Element not found for viewport: ${viewportId}`);
        }

        const viewportInput: Types.PublicViewportInput = {
          viewportId: currentViewportId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current as HTMLDivElement,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        };

        try {
          renderingEngine.enableElement(viewportInput);
        } catch (error) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const viewports = renderingEngine.getViewports();
        const viewportIds = Object.keys(viewports);
        
        const actualViewportId = viewportIndex.toString();
        console.log('🔍 Using Cornerstone.js standard viewport ID:', actualViewportId);
        
        setViewportId(viewportIndex, actualViewportId);
        
        console.log('🔍 Getting viewport with Cornerstone.js ID:', actualViewportId);
        
        const vp = renderingEngine.getViewport(actualViewportId) as Types.IStackViewport;
        
        if (!vp) {
          console.error('❌ Failed to create viewport with ID:', actualViewportId);
          console.error('❌ Rendering engine ID:', renderingEngineId);
          console.error('❌ Available viewports:', viewportIds);
          throw new Error(`Failed to create viewport with ID: ${actualViewportId}`);
        }
        
        console.log('✅ Viewport retrieved successfully:', actualViewportId);
        
        console.log('✅ Viewport created successfully:', actualViewportId);

        elementRef.current.setAttribute('data-enabled-element', actualViewportId);
        
        await vp.setStack(imageIds, 0);

        if (vp && typeof vp.resetCamera === 'function') {
          try {
            const imageIds = vp.getImageIds();
            if (imageIds && imageIds.length > 0) {
              vp.resetCamera();
              
              
              const viewports = renderingEngine.getViewports();
              const viewportIds = Object.keys(viewports);
              if (viewportIds.includes(actualViewportId)) {
                renderingEngine.renderViewports([actualViewportId]);
              } else {
                vp.render();
              }
              console.log(`Reset camera for viewport ${viewportId}`);
            } else {
              console.warn(`No image data available for viewport ${viewportId}`);
            }
          } catch (error) {
            console.error('Error resetting camera:', error);
            try {
              const viewports = renderingEngine.getViewports();
              const viewportIds = Object.keys(viewports);
              if (viewportIds.includes(actualViewportId)) {
                renderingEngine.renderViewports([actualViewportId]);
              } else {
                vp.render();
              }
            } catch (renderError) {
              console.error('Error rendering viewport:', renderError);
            }
          }
        } else {
          console.error('Viewport is not properly initialized or resetCamera method is not available');
        }
        
        setLoadingProgress(60);
        
        setViewport(vp);
        setViewportReady(true);
        
        setCurrentFrame(0);
        console.log(`Total frames: ${imageIds.length}, Current: 0`);
        
        if (currentFrame < 0) {
          console.warn(`⚠️ currentFrame is negative: ${currentFrame}, resetting to 0`);
          setCurrentFrame(0);
        }

        const updateFrameIndex = () => {
          const currentImageIdIndex = vp.getCurrentImageIdIndex();
          
          const validIndex = Math.max(0, currentImageIdIndex);
          setCurrentFrame(validIndex);
        };
        
        elementRef.current?.addEventListener(Enums.Events.IMAGE_RENDERED, updateFrameIndex);

        const toolGroupId = `toolGroup_${actualViewportId}`;
        let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
        if (!toolGroup) {
          toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
        }
        
        if (!toolGroup) {
          throw new Error(`Failed to create tool group with ID: ${toolGroupId}`);
        }
        
        try {
          toolGroup.addViewport(actualViewportId, renderingEngineId);
          console.log(`Successfully added viewport ${actualViewportId} to tool group ${toolGroupId}`);
        } catch (error) {
          console.error(`Error adding viewport to tool group:`, error);
          throw error;
        }
        
        setLoadingProgress(70);

        const segmentationId = `MY_SEGMENTATION_ID_${Date.now()}`;
        const segmentationImages =
          await imageLoader.createAndCacheDerivedLabelmapImages(imageIds);
        const segmentationImagesIds = segmentationImages.map(
          (image) => image.imageId
        );

        const existingSegmentation = segmentation.state.getSegmentation(segmentationId);
        if (!existingSegmentation) {
          segmentation.addSegmentations([
            {
              segmentationId,
              representation: {
                type: ToolEnums.SegmentationRepresentations.Labelmap,
                data: {
                  imageIds: segmentationImagesIds,
                },
              },
            },
          ]);
        }

        try {
          const viewportMap: Record<string, any[]> = {};
          viewportMap[actualViewportId] = [{ segmentationId }];
          await segmentation.addLabelmapRepresentationToViewportMap(viewportMap);
          console.log(`Successfully added segmentation representation to viewport ${actualViewportId}`);
        } catch (error) {
          console.error(`Error adding segmentation representation to viewport:`, error);
        }

        setLoadingProgress(90);

        eventTarget.addEventListener(
          Events.ANNOTATION_COMPLETED,
          (evt: any) => {
            const { annotation } = evt.detail;
          }
        );

        eventTarget.addEventListener(
          ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
          async (evt: any) => {
            const { segmentationId, modifiedSlicesToUse } = evt.detail || {};
          }
        );

        vp.render();
        setLoadingProgress(100);
        setIsLoading(false);
        setLoadedSeriesId(selectedSeries.id);
        setViewportReady(true);
        console.log('DICOM viewer initialized successfully');
      } catch (error) {
        console.error("Error setting up DICOM viewer:", error);
        setIsLoading(false);
        setLoadingProgress(0);
      } finally {
        running.current = false;
      }
    };

    setup();

    return () => {
      if (isFirstLoad.current) {
        console.log('🚫 Skipping cleanup on first load');
        isFirstLoad.current = false;
        return;
      }
      
      console.log('🧹 Cleaning up viewport:', viewportId, 'viewportIndex:', viewportIndex);
      try {
        if (elementRef.current) {
          elementRef.current.removeAttribute('data-enabled-element');
        }
        
        if (mounted.current) {
          setViewport(null);
          setViewportReady(false);
          setCurrentFrame(0);
          setLoadingProgress(0);
          setIsLoading(false);
          setLoadedSeriesId(null);
          running.current = false;
        }
        
        console.log('✅ Viewport cleanup completed (rendering engine preserved)');
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    };
  }, [selectedSeries]);

  // Clear cache when study changes
  useEffect(() => {
    if (selectedStudy && selectedStudy.id !== currentStudyId) {
      console.log('🧹 Clearing instances cache for new study:', selectedStudy.id);
      setSeriesInstancesCache({});
      setCurrentStudyId(selectedStudy.id);
    }
  }, [selectedStudy, currentStudyId]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);


  useEffect(() => {
    const element = containerRef.current;
    if (!element || !viewport) return;

    // Make element focusable for keyboard events
    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", handleKeyDown);

    const wheelScrollHandler = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scroll
      
      if (!viewport || typeof viewport.getImageIds !== 'function') {
        console.warn('Viewport is not properly initialized for wheel scroll');
        return;
      }
      const stackData = viewport.getImageIds();
      if (stackData.length <= 1) return;

      // Determine scroll direction
      const delta = e.deltaY;
      
      if (delta > 0) {
        // Scrolling down - next frame
        nextFrame();
      } else if (delta < 0) {
        // Scrolling up - previous frame
        prevFrame();
      }
    };
    
    element.addEventListener("wheel", wheelScrollHandler, { passive: false });

    // Add custom event listeners for flip and reset
    const handleRotateViewportLocal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId, degrees } = customEvent.detail || {};
      
      // Get the actual viewport ID from context
      const actualViewportId = getViewportId(viewportIndex);
      
      // Check if this event is for our viewport and viewport is ready
      if (eventViewportId !== actualViewportId || !viewportReady) return;
      
      // Use tool manager handler
      if (toolManagerRef.current && toolManagerRef.current.getToolHandlers) {
        const handlers = toolManagerRef.current.getToolHandlers();
        handlers.rotateViewport(degrees);
      }
    };

    const handleFlipViewportLocal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId, direction } = customEvent.detail || {};
      
      // Get the actual viewport ID from context
      const actualViewportId = getViewportId(viewportIndex);
      
      // Check if this event is for our viewport and viewport is ready
      if (eventViewportId !== actualViewportId || !viewportReady) return;
      
      // Use tool manager handler
      if (toolManagerRef.current && toolManagerRef.current.getToolHandlers) {
        const handlers = toolManagerRef.current.getToolHandlers();
        handlers.flipViewport(direction);
      }
    };

    const handleResetView = () => {
      // Use tool manager handler
      if (toolManagerRef.current && toolManagerRef.current.getToolHandlers) {
        const handlers = toolManagerRef.current.getToolHandlers();
        handlers.resetView();
      }
    };

    const handleClearAnnotations = (event?: Event) => {
      // Check if this is a targeted clear (from context) or local clear
      let shouldClear = true;
      if (event) {
        const customEvent = event as CustomEvent;
        const { activeViewportId } = customEvent.detail || {};
        shouldClear = !activeViewportId || activeViewportId === viewportId;
      }
      
      if (!shouldClear) return;
      
      // Use tool manager handler
      if (toolManagerRef.current && toolManagerRef.current.getToolHandlers) {
        const handlers = toolManagerRef.current.getToolHandlers();
        handlers.clearAnnotations();
      }
    };

    const handleUndoAnnotation = (event?: Event) => {
      // Check if this is a targeted undo (from context) or local undo
      let shouldUndo = true;
      if (event) {
        const customEvent = event as CustomEvent;
        const { activeViewportId } = customEvent.detail || {};
        shouldUndo = !activeViewportId || activeViewportId === viewportId;
      }
      
      if (!shouldUndo) return;
      
      // Use tool manager handler
      if (toolManagerRef.current && toolManagerRef.current.getToolHandlers) {
        const handlers = toolManagerRef.current.getToolHandlers();
        handlers.undoAnnotation();
      }
    };

    // Add invert color map handler
    const handleInvertColorMap = () => {
      // Use tool manager handler
      if (toolManagerRef.current && toolManagerRef.current.getToolHandlers) {
        const handlers = toolManagerRef.current.getToolHandlers();
        handlers.invertColorMap();
      }
    };

    // Add refresh handler to force rebuild viewport
    const handleRefresh = () => {
      console.log('🔄 Refresh triggered - forcing viewport rebuild');
      setForceRebuild(true);
      // Reset the flag after a short delay to allow rebuild
      setTimeout(() => {
        setForceRebuild(false);
      }, 100);
    };


    window.addEventListener('rotateViewport', handleRotateViewportLocal as EventListener);
    window.addEventListener('flipViewport', handleFlipViewportLocal as EventListener);
    window.addEventListener('resetView', handleResetView);
    window.addEventListener('invertColorMap', handleInvertColorMap);
    window.addEventListener('clearAnnotations', handleClearAnnotations as EventListener);
    window.addEventListener('undoAnnotation', handleUndoAnnotation as EventListener);
    window.addEventListener('refreshViewport', handleRefresh);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("wheel", wheelScrollHandler);
      window.removeEventListener('rotateViewport', handleRotateViewportLocal as EventListener);
      window.removeEventListener('flipViewport', handleFlipViewportLocal as EventListener);
      window.removeEventListener('resetView', handleResetView);
      window.removeEventListener('invertColorMap', handleInvertColorMap);
      window.removeEventListener('clearAnnotations', handleClearAnnotations);
      window.removeEventListener('undoAnnotation', handleUndoAnnotation);
      window.removeEventListener('refreshViewport', handleRefresh);
    };
  }, [viewport, handleKeyDown, nextFrame, prevFrame, currentFrame]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Cornerstone Tool Manager */}
      <CornerstoneToolManager
        ref={toolManagerRef}
        toolGroupId={`toolGroup_${getViewportId(viewportIndex) || viewportId}`}
        renderingEngineId={getRenderingEngineId(viewportIndex) || `renderingEngine_${viewportId}`}
        viewportId={getViewportId(viewportIndex) || viewportId || 'default-viewport'}
        selectedTool={selectedTool}
        onToolChange={onToolChange}
        viewport={viewport}
        viewportReady={viewportReady}
      />

      <div 
        ref={containerRef}
        className="flex-1 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
      >
        {selectedSeries ? (
          <>
            <div 
              ref={elementRef} 
              className="w-full h-full bg-black" 
              data-viewport-id={viewportId}
              key={`viewport-element-${viewportId}`}
            />
            
            {/* Loading Progress Bar */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                <div className="w-80 max-w-md">
                  <div className="mb-4 text-center">
                    <div className="text-white text-lg font-medium mb-2">
                      Loading DICOM Images...
                    </div>
                    <div className="text-gray-400 text-sm">
                      {loadingProgress}% Complete
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Overlay navigation buttons for frame navigation */}
            {viewport && typeof viewport.getImageIds === 'function' && viewport.getImageIds().length > 1 && !isLoading && (
              <>
                {/* Left arrow button */}
                <button
                  onClick={prevFrame}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label="Previous frame"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Right arrow button */}
                <button
                  onClick={nextFrame}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
                  aria-label="Next frame"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Frame indicator overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium z-50">
                  {Math.max(0, currentFrame) + 1} / {viewport && typeof viewport.getImageIds === 'function' ? viewport.getImageIds().length : 0}
                </div>
              </>
            )}

            {/* Scroll hint */}
            {viewport && typeof viewport.getImageIds === 'function' && viewport.getImageIds().length > 1 && !isLoading && (
              <div className="absolute bottom-15 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-75 z-50">
                Use scroll wheel or arrow keys to navigate
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="text-lg mb-2">No Series Selected</div>
              <div className="text-sm">Please select a series from the sidebar</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ViewPortMain;