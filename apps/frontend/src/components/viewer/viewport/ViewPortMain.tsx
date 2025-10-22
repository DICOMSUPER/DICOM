"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  eventTarget,
  volumeLoader,
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
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  ProbeTool,
  RectangleROITool,
  annotation,
} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { MouseBindings, Events } from "@cornerstonejs/tools/enums";
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
        console.log('🚫 Setup already running, skipping');
        return;
      }
      running.current = true;
      
      console.log('🔄 Starting setup for series:', selectedSeries?.id, 'viewport:', viewportId, 'viewportIndex:', viewportIndex);
      
      if (!selectedSeries || !selectedSeries.id) {
        console.warn('No series selected, skipping setup');
        running.current = false;
        return;
      }
      
      if (loadedSeriesId === selectedSeries.id && viewportReady) {
        console.log('Series already loaded, skipping setup');
        running.current = false;
        return;
      }
      
      const existingRenderingEngineId = getRenderingEngineId(viewportIndex);
      if (existingRenderingEngineId) {
        const existingRenderingEngine = getRenderingEngine(existingRenderingEngineId);
        if (existingRenderingEngine) {
          console.log('🔄 Rendering engine already exists, checking if viewport is ready');
          const viewports = existingRenderingEngine.getViewports();
          const viewportIds = Object.keys(viewports);
          if (viewportIds.length > 0) {
            console.log('🔄 Viewport already exists, skipping setup');
            running.current = false;
            return;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        setIsLoading(true);
        setLoadingProgress(0);
        console.log('Initializing DICOM viewer for series:', selectedSeries?.id);
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });
        setLoadingProgress(20);
        
        if (!selectedSeries) {
          console.warn('No series selected, cannot load DICOM images');
          setIsLoading(false);
          return;
        }
        
        let imageIds: string[] = [];

        try {
          const instancesResponse = await imagingApi.getInstancesByReferenceId(
            selectedSeries.id, 
            'series', 
            { page: 1, limit: 9999 }
          );

          setLoadingProgress(30);
          
          if (instancesResponse.data && instancesResponse.data.length > 0) {
            const imageIdsPromises = instancesResponse.data.map(async (instance: any) => {
              if (!instance.filePath) {
                console.warn('Instance missing filePath:', instance);
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
        
        console.log('🔍 ViewPortMain: Retrieved from context - viewportId:', currentViewportId, 'renderingEngineId:', renderingEngineId, 'for index:', viewportIndex);
        
        if (!currentViewportId) {
          console.error('❌ Viewport ID not found in context for index:', viewportIndex);
          console.error('❌ This indicates a problem with ViewportGrid ID management');
          currentViewportId = viewportId || `viewport-${viewportIndex + 1}`;
          setViewportId(viewportIndex, currentViewportId);
        }
        
        if (!renderingEngineId) {
          renderingEngineId = `renderingEngine_${currentViewportId}`;
          setRenderingEngineId(viewportIndex, renderingEngineId);
        }
        
        let renderingEngine = getRenderingEngine(renderingEngineId);
        if (!renderingEngine) {
          console.log('🔧 Creating new rendering engine with ID:', renderingEngineId);
          renderingEngine = new RenderingEngine(renderingEngineId);
          console.log('✅ Rendering engine created successfully:', renderingEngineId);
        } else {
          console.log('🔄 Reusing existing rendering engine:', renderingEngineId);
        }
        
        if (!renderingEngine) {
          console.error('❌ Failed to create rendering engine with ID:', renderingEngineId);
          throw new Error(`Failed to create rendering engine with ID: ${renderingEngineId}`);
        }

        if (!elementRef.current) {
          console.error('❌ Element not found for viewport:', viewportId);
          throw new Error(`Element not found for viewport: ${viewportId}`);
        }
        console.log('✅ Element found for viewport:', viewportId);

        const existingEnabledElement = elementRef.current.getAttribute('data-enabled-element');
        if (existingEnabledElement && existingEnabledElement !== viewportId) {
          console.warn(`Element already enabled for different viewport: ${existingEnabledElement}`);
        }
        console.log('🔍 Element enabled status:', existingEnabledElement || 'not enabled');

        const viewportInput: Types.PublicViewportInput = {
          viewportId: currentViewportId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current as HTMLDivElement,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        };
        console.log('🔧 Creating viewport input:', {
          viewportId: currentViewportId,
          type: 'STACK',
          element: elementRef.current?.tagName,
          orientation: 'AXIAL'
        });

        console.log('🔧 Enabling element with viewport input:', viewportInput);
        try {
          renderingEngine.enableElement(viewportInput);
          console.log('✅ Element enabled successfully');
        } catch (error) {
          console.error('❌ Error enabling element:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const viewports = renderingEngine.getViewports();
        const viewportIds = Object.keys(viewports);
        console.log('🔍 Rendering engine viewports after creation:', viewportIds);
        console.log('🔍 Total viewports in rendering engine:', viewportIds.length);
        
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
        
        const invalidImageIds = imageIds.filter(id => {
          if (typeof id !== 'string' || !id) return true;
          
          const frameMatch = id.match(/\?frame=(-?\d+)/);
          if (frameMatch) {
            const frameIndex = parseInt(frameMatch[1]);
            if (frameIndex < 0) {
              return true;
            }
          }
          
          return false;
        });
        
        if (invalidImageIds.length > 0) {
          throw new Error(`Found ${invalidImageIds.length} invalid image IDs`);
        }
        
        await vp.setStack(imageIds, 0);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (vp && typeof vp.resetCamera === 'function') {
          try {
            const imageIds = vp.getImageIds();
            if (imageIds && imageIds.length > 0) {
              vp.resetCamera();
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
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
      
      if (viewport && typeof viewport.getCamera === 'function' && typeof viewport.setCamera === 'function' && typeof viewport.render === 'function') {
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
      }
    };

    const handleFlipViewportLocal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId, direction } = customEvent.detail || {};
      
      // Get the actual viewport ID from context
      const actualViewportId = getViewportId(viewportIndex);
      
      // Check if this event is for our viewport and viewport is ready
      if (eventViewportId !== actualViewportId || !viewportReady) return;
      
      if (viewport && typeof viewport.getCamera === 'function' && typeof viewport.setCamera === 'function' && typeof viewport.render === 'function') {
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
      }
    };

    const handleResetView = () => {
      if (viewportReady && viewport && typeof viewport.resetCamera === 'function' && typeof viewport.render === 'function') {
        try {
          console.log('Resetting view for viewport:', viewportId);
        viewport.resetCamera();
          
          // Add delay before rendering to prevent VTK errors
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
          // Fallback: try alternative reset method
          try {
            const currentCamera = viewport.getCamera();
            console.log('Current camera before reset:', currentCamera);
            
            // Reset to default values
            viewport.setCamera({
              ...currentCamera,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false
            });
            
            // Add delay before rendering
            setTimeout(() => {
              try {
                viewport.render();
                console.log(`Reset view (fallback) for viewport ${viewportId}`);
              } catch (renderError) {
                console.error('Error rendering after reset (fallback):', renderError);
              }
            }, 100);
          } catch (fallbackError) {
            console.error('Fallback reset failed:', fallbackError);
          }
        }
      } else {
        console.warn('Viewport is not properly initialized for reset view');
      }
    };

    const handleClearAnnotations = (event?: Event) => {
      if (viewportReady && viewport && typeof viewport.render === 'function') {
        try {
          // Check if this is a targeted clear (from context) or local clear
          let shouldClear = true;
          if (event) {
            const customEvent = event as CustomEvent;
            const { activeViewportId } = customEvent.detail || {};
            shouldClear = !activeViewportId || activeViewportId === viewportId;
          }
          
          if (!shouldClear) return;
          
          console.log(`Clearing annotations and segmentations for viewport ${viewportId}`);
          
          // Step 1: Clear all annotations for this viewport
          const actualViewportId = getViewportId(viewportIndex);
          const toolGroupId = `toolGroup_${actualViewportId}`;
          console.log(`Using toolGroupId: ${toolGroupId} for viewport: ${actualViewportId}`);
          
          // Method 1: Clear by tool group and viewport
          const annotations = annotation.state.getAnnotations(toolGroupId, actualViewportId || 'default-viewport');
          
          if (annotations && annotations.length > 0) {
            console.log(`Found ${annotations.length} annotations to clear via tool group`);
            annotations.forEach(ann => {
              if (ann.annotationUID) {
                annotation.state.removeAnnotation(ann.annotationUID);
              }
            });
          }
          
          // Method 2: Clear all annotations globally and filter by viewport
          try {
            const annotationManager = annotation.state.getAnnotationManager();
            if (annotationManager) {
              const allAnnotations = annotationManager.getAnnotations();
              const viewportAnnotations = allAnnotations.filter((ann: any) => {
                // Check if annotation belongs to this viewport
                return ann.metadata && (
                  ann.metadata.viewportId === viewportId ||
                  ann.metadata.toolGroupId === toolGroupId ||
                  ann.metadata.renderingEngineId === `renderingEngine_${viewportId}`
                );
              });
              
              if (viewportAnnotations.length > 0) {
                console.log(`Found ${viewportAnnotations.length} additional annotations to clear globally`);
                viewportAnnotations.forEach((ann: any) => {
                  if (ann.annotationUID) {
                    annotationManager.removeAnnotation(ann.annotationUID);
                  }
                });
              }
            }
          } catch (error) {
            console.warn('Error with global annotation clearing:', error);
          }
          
          // Step 2: Clear all segmentations for this viewport
          try {
            // Remove all segmentation representations from this viewport
            const segmentationRepresentations = segmentation.state.getSegmentationRepresentations(actualViewportId || 'default-viewport');
            
            if (segmentationRepresentations && segmentationRepresentations.length > 0) {
              console.log(`Found ${segmentationRepresentations.length} segmentation representations to clear for viewport ${viewportId}`);
              
              segmentationRepresentations.forEach(rep => {
                if (rep.segmentationId) {
                  try {
                    console.log(`Removing segmentation ${rep.segmentationId} from viewport ${viewportId}`);
                    // Remove the representation from the viewport
                    segmentation.removeSegmentationRepresentation(actualViewportId || 'default-viewport', {
                      segmentationId: rep.segmentationId,
                      type: rep.type
                    });
                  } catch (error) {
                    console.warn(`Error removing segmentation ${rep.segmentationId}:`, error);
                  }
                }
              });
            } else {
              console.log(`No segmentation representations found for viewport ${viewportId}`);
            }
            
            // Also try to clear any global segmentations that might be associated with this viewport
            try {
              // Get all segmentations and try to remove their representations from this viewport
              const allSegmentations = segmentation.state.getSegmentations();
              Object.keys(allSegmentations).forEach(segId => {
                try {
                  // Try to remove segmentation representation from this specific viewport
                  segmentation.removeSegmentationRepresentation(actualViewportId || 'default-viewport', {
                    segmentationId: segId,
                    type: 'LABELMAP' as any // Default type, will be corrected by the API if needed
                  });
                } catch (error) {
                  // Ignore errors if segmentation doesn't exist for this viewport
                }
              });
            } catch (error) {
              console.warn('Error clearing global segmentations:', error);
            }
          } catch (error) {
            console.warn('Error clearing segmentations:', error);
          }
          
          // Step 3: Force render the viewport to show the cleared state
          setTimeout(() => {
            try {
              // Force render multiple times to ensure clearing is visible
            viewport.render();
              
              // Also try to render via rendering engine
              const currentRenderingEngineId = getRenderingEngineId(viewportIndex);
              if (currentRenderingEngineId && actualViewportId) {
                const renderingEngine = getRenderingEngine(currentRenderingEngineId);
                if (renderingEngine) {
                  renderingEngine.renderViewports([actualViewportId]);
                }
              }
              
              console.log(`Successfully cleared annotations and segmentations for viewport ${viewportId}`);
            } catch (renderError) {
              console.error('Error rendering viewport after clear:', renderError);
            }
          }, 100);
          
        } catch (error) {
          console.error('Error clearing annotations and segmentations:', error);
        }
      } else {
        console.warn('Viewport is not properly initialized for clearing annotations');
      }
    };

    // Add invert color map handler
    const handleInvertColorMap = () => {
      if (viewportReady && viewport && typeof viewport.render === 'function') {
        try {
          console.log('Inverting color map for viewport:', viewportId);
          
          // For StackViewport, we need to use setProperties for color map inversion
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
      } else {
        console.warn('Viewport is not properly initialized for color map inversion');
      }
    };


    window.addEventListener('rotateViewport', handleRotateViewportLocal as EventListener);
    window.addEventListener('flipViewport', handleFlipViewportLocal as EventListener);
    window.addEventListener('resetView', handleResetView);
    window.addEventListener('invertColorMap', handleInvertColorMap);
    window.addEventListener('clearAnnotations', handleClearAnnotations as EventListener);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("wheel", wheelScrollHandler);
      window.removeEventListener('rotateViewport', handleRotateViewportLocal as EventListener);
      window.removeEventListener('flipViewport', handleFlipViewportLocal as EventListener);
      window.removeEventListener('resetView', handleResetView);
      window.removeEventListener('invertColorMap', handleInvertColorMap);
      window.removeEventListener('clearAnnotations', handleClearAnnotations);
    };
  }, [viewport, handleKeyDown, nextFrame, prevFrame, currentFrame]);


  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
    const toolGroupId = `toolGroup_${viewportId}`;
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

    if (toolGroup) {
      try {
        toolGroup.setToolPassive(WindowLevelTool.toolName);
        toolGroup.setToolPassive(ProbeTool.toolName);
        toolGroup.setToolPassive(RectangleROITool.toolName);

        toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
    });
      } catch (error) {
        console.error('Error changing tool:', error);
      }
    } else {
      console.warn(`Tool group not found: ${toolGroupId}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Cornerstone Tool Manager */}
      <CornerstoneToolManager
        toolGroupId={`toolGroup_${getViewportId(viewportIndex) || viewportId}`}
        renderingEngineId={getRenderingEngineId(viewportIndex) || `renderingEngine_${viewportId}`}
        viewportId={getViewportId(viewportIndex) || viewportId || 'default-viewport'}
        selectedTool={selectedTool}
        onToolChange={onToolChange}
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