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
import { useCreateAnnotationMutation } from "@/store/annotationApi";
import { useLazyGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import { useViewer } from "@/contexts/ViewerContext";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { extractApiData } from "@/utils/api";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import type {
  Annotation,
  AnnotationEventDetail,
} from "@/types/Annotation";
import { resolveDicomImageUrl } from "@/utils/dicom/resolveDicomImageUrl";

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
  const currentFrameRef = useRef(0);
  const [viewport, setViewport] = useState<Types.IStackViewport | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);
  const [loadedSeriesId, setLoadedSeriesId] = useState<string | null>(null);
  const [seriesInstancesCache, setSeriesInstancesCache] = useState<Record<string, any[]>>({});
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);
  const [forceRebuild, setForceRebuild] = useState(false);
  const toolManagerRef = useRef<any>(null);
  const [currentInstances, setCurrentInstances] = useState<any[]>([]);
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();
  const [createAnnotation] = useCreateAnnotationMutation();
  const viewportListenersRef = useRef<{
    imageRendered?: (event: Event) => void;
    annotationCompleted?: (event: CustomEvent<AnnotationEventDetail>) => void;
    segmentationModified?: (event: Event) => void;
  }>({});
  const imageIdInstanceMapRef = useRef<Record<string, string>>({});

  const resolvedViewportId = getViewportId(viewportIndex);
  const resolvedRenderingEngineId = getRenderingEngineId(viewportIndex);
  
  // Get current user from Redux or cookies
  const authUser = useSelector((state: any) => state.auth?.user);
  const getUser = () => {
    if (authUser?.id) return authUser;
    try {
      const userCookie = Cookies.get("user");
      if (userCookie) {
        return JSON.parse(userCookie);
      }
    } catch (error) {
      
    }
    return null;
  };

  const getTotalFrames = async (imageId: string) => {
    try {
      await imageLoader.loadImage(imageId);
      
      const multiFrameModule = metaData.get("multiframeModule", imageId);
      const numberOfFrames = multiFrameModule?.NumberOfFrames;
      
      if (numberOfFrames && typeof numberOfFrames === 'number' && numberOfFrames > 0) {
        return numberOfFrames;
      }
      
      return 1;
    } catch (_error) {
      return 1;
    }
  };

  // Load instances with caching
  const loadSeriesInstances = async (seriesId: string) => {
    // Check cache first
    if (seriesInstancesCache[seriesId]) {
      return seriesInstancesCache[seriesId];
    }
    try {
      const instancesResponse = await fetchInstancesByReference({
        id: seriesId,
        type: 'series',
        params: { page: 1, limit: 9999 },
      }).unwrap();
      
      const instances = extractApiData<any>(instancesResponse);
      
      // Cache the instances
      setSeriesInstancesCache(prev => ({
        ...prev,
        [seriesId]: instances
      }));
      
      // Store current instances for annotation mapping
      setCurrentInstances(instances);

      return instances;
    } catch (_error) {
      return [];
    }
  };
  
  const prefetchImages = useCallback(
    async (imageIds: string[], startIndex: number, countAhead = 5) => {
      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        return;
      }

      const endIndex = Math.min(startIndex + countAhead + 1, imageIds.length);
      const loadPromises: Promise<unknown>[] = [];

      for (let i = startIndex + 1; i < endIndex; i += 1) {
        const imageId = imageIds[i];
        if (!imageId) continue;
        loadPromises.push(
          imageLoader
            .loadAndCacheImage(imageId)
            .catch(() => undefined)
        );
      }

      if (loadPromises.length) {
        try {
          await Promise.all(loadPromises);
        } catch {
          // individual errors already logged
        }
      }
    },
    []
  );

  const goToFrame = useCallback(
    (frameIndex: number) => {
      if (!viewport || typeof viewport.getImageIds !== 'function') {
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
        if (
          typeof viewport.setImageIdIndex === 'function' &&
          typeof viewport.render === 'function'
        ) {
          viewport.setImageIdIndex(newFrame);
          viewport.render();
          const imageIds = viewport.getImageIds?.();
          if (Array.isArray(imageIds) && imageIds.length > 0) {
            prefetchImages(imageIds, newFrame);
          }

          const currentImageId =
            typeof viewport.getCurrentImageId === "function"
              ? viewport.getCurrentImageId()
              : imageIds?.[newFrame];
          const validFrame = Math.max(0, newFrame);
          currentFrameRef.current = validFrame;
          setCurrentFrame(validFrame);
        } else {
        }
      } catch (_error) {
      }
    },
    [viewport]
  );

  const nextFrame = useCallback(() => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
      return;
    }

    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;
    const currentIndex =
      typeof viewport.getCurrentImageIdIndex === 'function'
        ? viewport.getCurrentImageIdIndex()
        : currentFrameRef.current;

    const newFrame = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    goToFrame(newFrame);
  }, [viewport, goToFrame]);

  const prevFrame = useCallback(() => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
      return;
    }

    const stackData = viewport.getImageIds();
    const maxIndex = stackData.length - 1;
    const currentIndex =
      typeof viewport.getCurrentImageIdIndex === 'function'
        ? viewport.getCurrentImageIdIndex()
        : currentFrameRef.current;

    const newFrame = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    goToFrame(newFrame);
  }, [viewport, goToFrame]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!viewport || typeof viewport.getImageIds !== 'function') {
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
        setSeriesInstancesCache({});
        setCurrentStudyId(selectedStudy.id);
      }
      
      if (viewportIndex !== 0 && loadedSeriesId === selectedSeries.id && viewportReady && viewport && !forceRebuild) {
        const hasImageData = viewport.getImageIds && viewport.getImageIds().length > 0;
        if (hasImageData) {
          running.current = false;
          if (forceRebuild) {
            setForceRebuild(false);
          }
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
        } catch (_error) {
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
        } catch (_error) {
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
                  const imageIdToInstance: Record<string, string> = {};
                  const imageIdsPromises = instances.map(async (instance: any) => {
                    if (!instance.filePath) return [];
                    const resolvedUrl = resolveDicomImageUrl(
                      instance.filePath,
                      instance.fileName
                    );
                    if (!resolvedUrl) {
                      return [];
                    }
                    const instanceBaseId = `wadouri:${resolvedUrl}`;
                    try {
                      const numberOfFrames = await getTotalFrames(instanceBaseId);
                      const validFrames = numberOfFrames && typeof numberOfFrames === 'number' && numberOfFrames > 0 ? numberOfFrames : 1;
                      const ids =
                        validFrames > 1
                          ? Array.from({ length: validFrames }, (_, index) => {
                              const frameNumber = index + 1;
                              return `${instanceBaseId}?frame=${frameNumber}`;
                            }).filter(id => id !== null)
                          : [`${instanceBaseId}?frame=1`];
                      ids.forEach((id) => {
                        if (id) {
                          imageIdToInstance[id] = instance.id;
                        }
                      });
                      return ids;
                    } catch (_error) {
                      const fallbackId = `${instanceBaseId}?frame=1`;
                      imageIdToInstance[fallbackId] = instance.id;
                      return [fallbackId];
                    }
                  });

                  const imageIdsArrays = await Promise.all(imageIdsPromises);
                  const imageIds = imageIdsArrays.flat().filter((id: string) => id && id.length > 0);
                  imageIdInstanceMapRef.current = imageIds.length > 0 ? imageIdToInstance : {};
                  
                  if (imageIds.length > 0) {
                    await vp.setStack(imageIds, 0);
                    prefetchImages(imageIds, 0);
                    vp.resetCamera();

                    try {
                      existingRenderingEngine.renderViewports([actualViewportId]);
                    } catch (renderError) {
                      vp.render();
                    }

                    setViewport(vp);
                    setViewportReady(true);
                    setCurrentFrame(0);
                    setLoadedSeriesId(selectedSeries.id);
                    running.current = false;
                    if (forceRebuild) {
                      setForceRebuild(false);
                    }
                    return;
                  }
                }
              }
            } catch (_error) {
              // Fall through to full setup
            }
          }
        }
      }

      try {
        setIsLoading(true);
        setLoadingProgress(0);
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 4 });
        setLoadingProgress(20);
        
        if (!selectedSeries) {
          setIsLoading(false);
          if (forceRebuild) {
            setForceRebuild(false);
          }
          return;
        }
        
        let imageIds: string[] = [];

        try {
          // Load instances using cache
          const instances = await loadSeriesInstances(selectedSeries.id);

          setLoadingProgress(30);
          
          if (instances && instances.length > 0) {
            const imageIdToInstance: Record<string, string> = {};
            const imageIdsPromises = instances.map(async (instance: any) => {
              if (!instance.filePath) {
                return [];
              }

              const resolvedUrl = resolveDicomImageUrl(
                instance.filePath,
                instance.fileName
              );
              
              if (!resolvedUrl) {
                return [];
              }

              const instanceBaseId = `wadouri:${resolvedUrl}`;
              
              try {
                const numberOfFrames = await getTotalFrames(instanceBaseId);
                const validFrames = numberOfFrames && typeof numberOfFrames === 'number' && numberOfFrames > 0 ? numberOfFrames : 1;
                
                if (validFrames > 1) {
                  const frameIds = Array.from(
                    { length: validFrames },
                    (_, index) => {
                      const frameNumber = index + 1;
                      return `${instanceBaseId}?frame=${frameNumber}`;
                    }
                  ).filter(id => id !== null);
                  frameIds.forEach((id) => {
                    if (id) {
                      imageIdToInstance[id] = instance.id;
                    }
                  });
                  return frameIds;
                } else {
                  const frameId = `${instanceBaseId}?frame=1`;
                  imageIdToInstance[frameId] = instance.id;
                  return [frameId];
                }
              } catch (_error) {
                const frameId = `${instanceBaseId}?frame=1`;
                imageIdToInstance[frameId] = instance.id;
                return [frameId];
              }
            });

            const imageIdsArrays = await Promise.all(imageIdsPromises);
            
            imageIds = imageIdsArrays.flat().filter((id: string) => id && id.length > 0);
            imageIdInstanceMapRef.current = imageIdToInstance;
            
            setLoadingProgress(40);
            
          } else {
          }
          
        } catch (_error) {
        }

        if (imageIds.length === 0) {
          imageIdInstanceMapRef.current = {};
          setIsLoading(false);
          if (forceRebuild) {
            setForceRebuild(false);
          }
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
        
        // Allow rendering engine to finish enabling element
        const readyViewport = await new Promise<Types.IStackViewport | null>(
          (resolve) => {
            requestAnimationFrame(() => {
              const engine = getRenderingEngine(renderingEngineId);
              if (!engine) {
                resolve(null);
                return;
              }

              const candidate = engine.getViewport(currentViewportId);
              resolve(candidate as Types.IStackViewport | null);
            });
          }
        );
        
        if (!readyViewport) {
          throw new Error(`Failed to create viewport for id: ${currentViewportId}`);
        }

        elementRef.current.setAttribute('data-enabled-element', currentViewportId);
        
        await readyViewport.setStack(imageIds, 0);
        prefetchImages(imageIds, 0);

        if (readyViewport && typeof readyViewport.resetCamera === 'function') {
          try {
            const currentImageIds = readyViewport.getImageIds();
            if (currentImageIds && currentImageIds.length > 0) {
              readyViewport.resetCamera();
              readyViewport.render();
            } else {
            }
          } catch (error) {
            try {
              readyViewport.render();
            } catch (renderError) {
            }
          }
        } else {
        }
        
        setLoadingProgress(60);
        
        setViewport(readyViewport);
        setViewportReady(true);
        
        setCurrentFrame(0);
        
        if (currentFrame < 0) {
          setCurrentFrame(0);
        }

        const updateFrameIndex = () => {
          const currentImageIdIndex = readyViewport.getCurrentImageIdIndex();

          const validIndex = Math.max(0, currentImageIdIndex);
          currentFrameRef.current = validIndex;
          setCurrentFrame(validIndex);
        };

        elementRef.current?.addEventListener(
          Enums.Events.IMAGE_RENDERED,
          updateFrameIndex
        );

        setLoadingProgress(70);

        setLoadingProgress(90);

        // Helper function to extract instance ID from imageId
        const getInstanceIdFromImageId = (imageId: string): string | null => {
          const mappedInstanceId = imageIdInstanceMapRef.current[imageId];
          if (mappedInstanceId) {
            return mappedInstanceId;
          }

          // Try to find instance by matching imageId with instance filePath or URL
          // ImageId format might be: "wadouri:https://..." or similar
          // We need to match it with instances in the cache
          const instances = seriesInstancesCache[selectedSeries.id] || currentInstances;
          
          // Try to extract instance ID from imageId if it contains instance info
          // Or match by filePath/fileName
          for (const instance of instances) {
            if (imageId.includes(instance.fileName) || 
                imageId.includes(instance.sopInstanceUid) ||
                imageId.includes(instance.id)) {
              return instance.id;
            }
          }
          
          // If no match, try to get from current frame
          const currentImageId = readyViewport.getCurrentImageId();
          if (currentImageId) {
            const currentIndex = readyViewport.getCurrentImageIdIndex();
            if (currentIndex >= 0 && instances[currentIndex]) {
              return instances[currentIndex].id;
            }
          }
          
          return null;
        };

        // Helper function to map Cornerstone annotation to DTO
        const mapAnnotationToDto = async (
          annotation: Annotation
        ): Promise<any> => {
          const user = getUser();
          if (!user?.id) {
            throw new Error("User not authenticated. Cannot create annotation.");
          }

          // Get current imageId from viewport
          const currentImageId = readyViewport.getCurrentImageId();
          if (!currentImageId) {
            throw new Error("No image loaded in viewport. Cannot create annotation.");
          }

          // Get instance ID
          let instanceId = getInstanceIdFromImageId(currentImageId);
        if (!instanceId) {
          const currentIndex = readyViewport.getCurrentImageIdIndex();
          const instances = seriesInstancesCache[selectedSeries.id] || currentInstances;
          if (currentIndex >= 0 && instances[currentIndex]) {
            instanceId = instances[currentIndex].id;
          } else {
            throw new Error("Could not determine instance ID for annotation.");
          }
          }

          // Extract tool name from metadata
          const toolName = annotation.metadata?.toolName || "Unknown";
          
          // Extract measurement data from cachedStats
          let measurementValue: number | undefined;
          let measurementUnit: string | undefined;
          
          if (annotation.data?.cachedStats && currentImageId) {
            const stats = annotation.data.cachedStats[`imageId:${currentImageId}`];
            if (stats) {
              measurementValue = stats.length || stats.area || stats.volume;
              measurementUnit = stats.unit;
            }
          }

          // Extract coordinates from handles
          const coordinates = annotation.data?.handles?.points 
            ? { points: annotation.data.handles.points }
            : undefined;

          // Extract text content
          const textContent = annotation.data?.label || undefined;

          return {
            instanceId,
            annotationType: toolName, // This should match AnnotationType enum values
            annotationData: annotation, // Store full Cornerstone annotation
            coordinates,
            measurementValue,
            measurementUnit,
            textContent,
            colorCode: annotation.metadata?.segmentColor || undefined,
            annotationStatus: AnnotationStatus.DRAFT,
            annotatorId: user.id,
            annotationDate: new Date(),
            notes: undefined,
          };
        };

        // Annotation creation handler
        const handleAnnotationCompleted = async (
          evt: CustomEvent<AnnotationEventDetail>
        ) => {
          try {
            const { annotation } = evt.detail;
            
            if (!annotation) {
              return;
            }
            console.log("📝 Annotation completed event received");
            
            // Map annotation to DTO format
            const annotationDto = await mapAnnotationToDto(annotation);
            
            // Save to backend
            const response = await createAnnotation(annotationDto).unwrap();
            
            if (!response.success) {
              // Optionally show user-friendly error message
              // You could use a toast notification here
            }
          } catch (error: any) {
            // Optionally show user-friendly error message
            // You could use a toast notification here
          }
        };

        const handleSegmentationModified = (evt: Event) => {
          const customEvent = evt as CustomEvent;
          const { segmentationId, modifiedSlicesToUse } = customEvent.detail || {};
          void segmentationId;
          void modifiedSlicesToUse;
        };

        eventTarget.addEventListener(
          Events.ANNOTATION_COMPLETED,
          handleAnnotationCompleted
        );

        eventTarget.addEventListener(
          ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
          handleSegmentationModified
        );

        viewportListenersRef.current = {
          imageRendered: updateFrameIndex,
          annotationCompleted: handleAnnotationCompleted,
          segmentationModified: handleSegmentationModified,
        };

        readyViewport.render();
        setLoadingProgress(100);
        setIsLoading(false);
        setLoadedSeriesId(selectedSeries.id);
        setViewportReady(true);
      } catch (error) {
        setIsLoading(false);
        setLoadingProgress(0);
      } finally {
        running.current = false;
        if (forceRebuild) {
          setForceRebuild(false);
        }
      }
    };

    setup();

    return () => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      try {
        const { imageRendered, annotationCompleted, segmentationModified } = viewportListenersRef.current || {};

        if (imageRendered && elementRef.current) {
          elementRef.current.removeEventListener(Enums.Events.IMAGE_RENDERED, imageRendered);
        }

        if (annotationCompleted) {
          eventTarget.removeEventListener(Events.ANNOTATION_COMPLETED, annotationCompleted);
        }

        if (segmentationModified) {
          eventTarget.removeEventListener(
            ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
            segmentationModified
          );
        }

        viewportListenersRef.current = {};
        imageIdInstanceMapRef.current = {};

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
        
        try {
          const engineId = getRenderingEngineId(viewportIndex);
          if (engineId) {
            const engine = getRenderingEngine(engineId);
            const actualViewportId = getViewportId(viewportIndex);
            if (engine && actualViewportId) {
              try {
                engine.disableElement(actualViewportId);
              } catch (disableError) {
              }
              const remainingViewports = engine.getViewports?.() ?? {};
              if (!remainingViewports || Object.keys(remainingViewports).length === 0) {
                engine.destroy();
              }
            }
          }
        } catch (engineCleanupError) {
        }
        
      } catch (error) {
      }
    };
  }, [selectedSeries, forceRebuild]);

  // Clear cache when study changes
  useEffect(() => {
    if (selectedStudy && selectedStudy.id !== currentStudyId) {
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
      setForceRebuild(true);
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
  }, [
    viewport,
    viewportReady,
    viewportIndex,
    viewportId,
    getViewportId,
    handleKeyDown,
    nextFrame,
    prevFrame,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !viewport) {
      return;
    }

    let resizeFrame: number | null = null;

    const handleResize = () => {
      if (!viewport) return;

      try {
        viewport.resize?.();
        viewport.render?.();
      } catch (error) {
      }
    };

    const observer = new ResizeObserver(() => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = requestAnimationFrame(handleResize);
    });

    observer.observe(container);

    // Trigger initial resize to ensure correct aspect ratio
    handleResize();

    return () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      observer.disconnect();
    };
  }, [viewport]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Cornerstone Tool Manager */}
      {resolvedViewportId && resolvedRenderingEngineId && (
        <CornerstoneToolManager
          key={`tool-manager-${resolvedViewportId}`}
          ref={toolManagerRef}
          toolGroupId={`toolGroup_${resolvedViewportId}`}
          renderingEngineId={resolvedRenderingEngineId}
          viewportId={resolvedViewportId}
          selectedTool={selectedTool}
          onToolChange={onToolChange}
          viewport={viewport}
          viewportReady={viewportReady}
        />
      )}

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
                      <div className="w-full h-full bg-linear-to-r from-blue-400 to-blue-600 animate-pulse"></div>
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