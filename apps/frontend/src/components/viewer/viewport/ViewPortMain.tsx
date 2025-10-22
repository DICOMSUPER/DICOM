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
} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { MouseBindings, Events } from "@cornerstonejs/tools/enums";
import { imagingApi } from "@/services/imagingApi";
import { annotation } from "@cornerstonejs/tools";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import { metaData } from "@cornerstonejs/core";
import { loadImage } from "@cornerstonejs/core/loaders/imageLoader";

interface ViewPortMainProps {
  selectedSeries?: any;
  selectedStudy?: any;
  selectedTool?: string;
  onToolChange?: (toolName: string) => void;
}

const ViewPortMain = ({ selectedSeries, selectedStudy, selectedTool = "windowLevel", onToolChange }: ViewPortMainProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const [activeTool, setActiveTool] = useState("WindowLevel");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [viewport, setViewport] = useState<Types.IStackViewport | null>(null);

  // Get total frames from DICOM metadata
  const getTotalFrames = async (imageId: string) => {
    try {
      await loadImage(imageId);
      const multiFrameModule = metaData.get("multiframeModule", imageId);
      const numFrames = multiFrameModule?.NumberOfFrames;
      return numFrames || 1;
    } catch (error) {
      console.warn("Failed to get frame count:", error);
      return 1;
    }
  };

  // Navigate to specific frame
  const goToFrame = (frameIndex: number) => {
    if (!viewport) {
      console.warn('⚠️ No viewport available for frame navigation');
      return;
    }

    // Get actual number of images in the stack
    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;

    console.log(`🔍 Current viewport has ${stackData.length} images (indices 0-${maxIndex})`);

    // Ensure frame index is within bounds
    let newFrame = frameIndex;
    if (newFrame > maxIndex) newFrame = maxIndex;
    if (newFrame < 0) newFrame = 0;

    try {
      console.log(`🎬 Navigating to frame ${newFrame + 1}/${maxIndex + 1}`);
      viewport.setImageIdIndex(newFrame);
      viewport.render();
      setCurrentFrame(newFrame);
      console.log(`✅ Now showing frame ${newFrame + 1}`);
    } catch (error) {
      console.error('❌ Error navigating to frame:', newFrame, error);
    }
  };

  // Navigate to next frame
  const nextFrame = useCallback(() => {
    if (!viewport) return;
    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;
    
    let newFrame = currentFrame + 1;
    if (newFrame > maxIndex) newFrame = 0; // Loop back to start
    goToFrame(newFrame);
  }, [viewport, currentFrame]);

  // Navigate to previous frame
  const prevFrame = useCallback(() => {
    if (!viewport) return;
    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;
    
    let newFrame = currentFrame - 1;
    if (newFrame < 0) newFrame = maxIndex; // Loop back to end
    goToFrame(newFrame);
  }, [viewport, currentFrame]);

  // Handle mouse wheel scrolling for frame navigation
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!viewport) return;
    const stackData = viewport.getImageIds();
    if (stackData.length <= 1) return;

    event.preventDefault();

    // Determine scroll direction
    const delta = event.deltaY;

    if (delta > 0) {
      // Scrolling down/away - next frame
      nextFrame();
    } else if (delta < 0) {
      // Scrolling up/toward - previous frame
      prevFrame();
    }
  }, [viewport, nextFrame, prevFrame]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!viewport) return;
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
    }
  }, [viewport, nextFrame, prevFrame]);

  useEffect(() => {
    // Listen for clear annotations event from context
    const handleClearAnnotations = () => {
      try {
        // Clear all annotations
        const annotationManager = annotation.state.getAnnotationManager();
        annotationManager.removeAllAnnotations();
        
        // Clear all segmentations
        segmentation.removeAllSegmentationRepresentations();
        segmentation.removeAllSegmentations();
        
        console.log('✅ Cleared all annotations and segmentations');
      } catch (error) {
        console.error('❌ Failed to clear annotations:', error);
      }
    };

    // Listen for rotate viewport event
    const handleRotateViewport = (event: CustomEvent) => {
      try {
        const { degrees, viewportId } = event.detail;
        const renderingEngine = getRenderingEngine('myRenderingEngine');
        if (renderingEngine) {
          const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
          if (viewport) {
            const currentCamera = viewport.getCamera();
            const newRotation = (currentCamera.rotation + degrees) % 360;
            viewport.setCamera({ rotation: newRotation });
            viewport.render();
            console.log(`✅ Rotated viewport by ${degrees} degrees`);
          }
        }
      } catch (error) {
        console.error('❌ Error rotating viewport:', error);
      }
    };

    // Listen for flip viewport event
    const handleFlipViewport = (event: CustomEvent) => {
      try {
        const { direction, viewportId } = event.detail;
        const renderingEngine = getRenderingEngine('myRenderingEngine');
        if (renderingEngine) {
          const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
          if (viewport) {
            const currentCamera = viewport.getCamera();
            if (direction === 'horizontal') {
              viewport.setCamera({ flipHorizontal: !currentCamera.flipHorizontal });
            } else {
              viewport.setCamera({ flipVertical: !currentCamera.flipVertical });
            }
            viewport.render();
            console.log(`✅ Flipped viewport ${direction}`);
          }
        }
      } catch (error) {
        console.error('❌ Error flipping viewport:', error);
      }
    };

    window.addEventListener('clearAnnotations', handleClearAnnotations);
    window.addEventListener('rotateViewport', handleRotateViewport as EventListener);
    window.addEventListener('flipViewport', handleFlipViewport as EventListener);
    
    return () => {
      window.removeEventListener('clearAnnotations', handleClearAnnotations);
      window.removeEventListener('rotateViewport', handleRotateViewport as EventListener);
      window.removeEventListener('flipViewport', handleFlipViewport as EventListener);
    };
  }, []);

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        console.log('⏳ Setup already running, skipping...');
        return;
      }
      running.current = true;

      try {
        console.log('🚀 Initializing DICOM viewer for series:', selectedSeries?.id);
        console.log('📊 Selected series instances count:', selectedSeries?.numberOfInstances);
        // Init cornerstone
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });

        let imageIds: string[] = [];

        // Load instances from selected series
        if (selectedSeries) {
          try {
            console.log('🔍 Loading instances for series:', selectedSeries.id);
            console.log('📦 Selected series data:', selectedSeries);
            
            const instancesResponse = await imagingApi.getInstancesByReferenceId(
              selectedSeries.id, 
              'series', 
              { page: 1, limit: 100 }
            );
            
            console.log('📊 API Response:', instancesResponse);
            console.log('📊 Found instances:', instancesResponse.data?.length || 0);
            
            if (instancesResponse.data && instancesResponse.data.length > 0) {
              // Use filePath from instances (should be Cloudinary URLs)
              imageIds = instancesResponse.data
                .filter(instance => {
                  const hasPath = !!instance.filePath;
                  if (!hasPath) console.warn('⚠️ Instance missing filePath:', instance);
                  return hasPath;
                })
                .map(instance => {
                  // Check if filePath is already a full URL
                  const path = instance.filePath.startsWith('http') 
                    ? instance.filePath 
                    : `${instance.filePath}/${instance.fileName}`;
                  const wadoUri = `wadouri:${path}`;
                  console.log('🔗 Image ID:', wadoUri);
                  return wadoUri;
                });
              
              console.log('✅ Loaded', imageIds.length, 'DICOM images');
              console.log('📋 First 3 Image URLs:', imageIds.slice(0, 3));
            } else {
              console.warn('⚠️ No instances found for series:', selectedSeries.seriesDescription);
            }
          } catch (error) {
            console.error('❌ Failed to load series instances:', error);
          }
        } else {
          console.warn('⚠️ No series selected, cannot load DICOM images');
        }

        // If no images loaded, don't initialize viewport
        if (imageIds.length === 0) {
          console.warn('⚠️ No DICOM images available');
          return;
        }

        // Tools are now managed by CornerstoneToolManager

        const renderingEngineId = "myRenderingEngine";
        const renderingEngine = new RenderingEngine(renderingEngineId);

        if (renderingEngine) {
          // renderingEngine.destroy();
          segmentation.removeAllSegmentationRepresentations();
          segmentation.removeAllSegmentations();
        }

        const viewportId = "CT_VIEWPORT";

        const viewportInput: Types.PublicViewportInput = {
          viewportId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current as HTMLDivElement,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        };

        renderingEngine.enableElement(viewportInput);
        const vp = renderingEngine.getViewport(
          viewportId
        ) as Types.IStackViewport;
        
        console.log('📸 Setting stack with', imageIds.length, 'images');
        await vp.setStack(imageIds, 0);
        console.log('✅ Stack set successfully');
        
        // Store viewport for frame navigation
        setViewport(vp);
        
        // Reset current frame to 0
        setCurrentFrame(0);
        console.log(`🎬 Total frames: ${imageIds.length}, Current: 0`);
        console.log(`🔍 Viewport stack images:`, vp.getImageIds().length);

        const toolGroupId = "myToolGroup";
        const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
        toolGroup?.addViewport(viewportId, renderingEngineId);
        const segmentationId = `MY_SEGMENTATION_ID_${Date.now()}`;
        const segmentationImages =
          await imageLoader.createAndCacheDerivedLabelmapImages(imageIds);
        const segmentationImagesIds = segmentationImages.map(
          (image) => image.imageId
        );

        // Check if segmentation already exists before adding
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

        await segmentation.addLabelmapRepresentationToViewportMap({
          [viewportId]: [{ segmentationId }],
        });

        eventTarget.addEventListener(
          Events.ANNOTATION_COMPLETED,
          (evt: any) => {
            const { annotation } = evt.detail;
            // Annotation completed - tool and data available in annotation object
            // console.log("Annotation completed:", annotation.metadata.toolName);
          }
        );

        eventTarget.addEventListener(
          ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
          async (evt: any) => {
            // Segmentation modified - data available in evt.detail
            // Uncomment for debugging:
            // const { segmentationId, modifiedSlicesToUse } = evt.detail || {};
            // console.log("Segmentation modified:", segmentationId, modifiedSlicesToUse);
          }
        );

        vp.render();
        console.log('✅ DICOM viewer initialized successfully');
      } catch (error) {
        console.error("❌ Error setting up DICOM viewer:", error);
      } finally {
        running.current = false;
      }
    };

    // Reset running flag when series changes
    running.current = false;
    setup();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up viewport...');
      try {
        const renderingEngine = getRenderingEngine('myRenderingEngine');
        if (renderingEngine) {
          renderingEngine.destroy();
        }
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    };
  }, [selectedSeries]);

  // Add event listeners for frame navigation (wheel and keyboard)
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !viewport) return;

    element.addEventListener("wheel", handleWheel, { passive: false });

    // Make element focusable for keyboard events
    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewport, handleWheel, handleKeyDown]);

  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
    const toolGroup = ToolGroupManager.getToolGroup("myToolGroup");

    toolGroup?.setToolPassive(WindowLevelTool.toolName);
    toolGroup?.setToolPassive(ProbeTool.toolName);
    toolGroup?.setToolPassive(RectangleROITool.toolName);

    toolGroup?.setToolActive(toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Cornerstone Tool Manager */}
      <CornerstoneToolManager
        toolGroupId="myToolGroup"
        renderingEngineId="myRenderingEngine"
        viewportId="CT_VIEWPORT"
        selectedTool={selectedTool}
        onToolChange={onToolChange}
      />

      <div 
        ref={containerRef}
        className="flex-1 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {selectedSeries ? (
          <>
            <div ref={elementRef} className="w-full h-full bg-black" />
            
            {/* Overlay navigation buttons for frame navigation */}
            {viewport && viewport.getImageIds().length > 1 && (
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
                  {currentFrame + 1} / {viewport?.getImageIds().length || 0}
                </div>
              </>
            )}

            {/* Scroll hint */}
            {viewport && viewport.getImageIds().length > 1 && (
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