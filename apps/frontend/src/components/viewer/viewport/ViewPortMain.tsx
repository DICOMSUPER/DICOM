"use client";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import {
  useViewer,
  type AnnotationHistoryEntry,
} from "@/contexts/ViewerContext";
import type { SegmentationHistoryEntry } from "@/contexts/viewer-context/segmentation-helper";
import { useDiagnosisImageByAIMutation } from "@/store/aiAnalysisApi";
import {
  getCanvasAsBase64,
  drawAIPredictions,
  clearAIAnnotations as clearAIAnnotationsUtil,
} from "@/utils/aiDiagnosis";
import { Types } from "@cornerstonejs/core";
import { batchedRender } from "@/utils/renderBatcher";
import { Loader2, ImageOff } from "lucide-react";
import { AILabelOverlay } from "../overlay/AILabelOverlay";
import { PredictionMetadata } from "@/interfaces/system/ai-result.interface";
import { useSearchParams } from "next/navigation";
import { useViewerEvent, useViewerEvents, ViewerEvents } from "@/contexts/ViewerEventContext";

// Frame scrollbar component with draggable thumb
function FrameScrollbarComponent({
  currentFrame,
  totalFrames,
  onFrameChange,
}: {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
}) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startFrameRef = useRef(0);

  const thumbHeight = Math.max(20, (100 / totalFrames) * 100);
  const thumbPosition = (currentFrame / (totalFrames - 1)) * 100;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!scrollbarRef.current || !thumbRef.current) return;
      
      const rect = scrollbarRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickPercent = (clickY / rect.height) * 100;

      const thumbRect = thumbRef.current.getBoundingClientRect();
      const thumbTop = thumbRect.top - rect.top;
      const thumbBottom = thumbTop + thumbRect.height;

      if (clickY >= thumbTop && clickY <= thumbBottom) {
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startFrameRef.current = currentFrame;

        const handleMouseMove = (e: MouseEvent) => {
          if (!isDraggingRef.current || !scrollbarRef.current) return;

          const rect = scrollbarRef.current.getBoundingClientRect();
          const deltaY = e.clientY - startYRef.current;
          const deltaPercent = (deltaY / rect.height) * 100;
          const deltaFrames = Math.round((deltaPercent / 100) * (totalFrames - 1));

          const newFrame = startFrameRef.current + deltaFrames;
          onFrameChange(Math.max(0, Math.min(totalFrames - 1, newFrame)));
        };

        const handleMouseUp = () => {
          isDraggingRef.current = false;
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      } else {
        const newFrame = Math.round((clickPercent / 100) * (totalFrames - 1));
        onFrameChange(Math.max(0, Math.min(totalFrames - 1, newFrame)));
      }
    },
    [currentFrame, totalFrames, onFrameChange]
  );

  return (
    <div
      ref={scrollbarRef}
      className="absolute right-0 top-0 bottom-0 w-4 z-50 cursor-pointer"
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 bg-gray-800/30 hover:bg-gray-800/50 transition-colors" />
      <div
        ref={thumbRef}
        className="absolute right-0 w-3 bg-gray-400/80 hover:bg-gray-300 rounded-sm transition-all cursor-grab active:cursor-grabbing"
        style={{
          top: `${Math.max(0, Math.min(100 - thumbHeight, thumbPosition - (thumbHeight / 2)))}%`,
          height: `${thumbHeight}%`,
        }}
      />
    </div>
  );
}

interface ViewPortMainProps {
  selectedSeries?: any;
  selectedStudy?: any;
  selectedTool?: string;
  onToolChange?: (toolName: string) => void;
  viewportId?: string;
}

const ViewPortMain = ({
  selectedSeries,
  selectedStudy,
  selectedTool = "windowLevel",
  onToolChange,
  viewportId,
}: ViewPortMainProps) => {
  const viewportIndex = viewportId ? parseInt(viewportId) : 0;

  const {
    getViewportId,
    getRenderingEngineId,
    registerViewportElement,
    disposeViewport,
    loadSeriesIntoViewport,
    getViewportState,
    getStackViewport,
    nextFrame,
    prevFrame,
    goToFrame,
    refreshViewport,
  } = useViewer();

  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolManagerRef = useRef<any>(null);
  const disposeViewportRef = useRef(disposeViewport);
  const loadSeriesRef = useRef(loadSeriesIntoViewport);
  const searchParams = useSearchParams();
  const studyId = searchParams.get("study");

  useEffect(() => {
    disposeViewportRef.current = disposeViewport;
  }, [disposeViewport]);

  useEffect(() => {
    loadSeriesRef.current = loadSeriesIntoViewport;
  }, [loadSeriesIntoViewport]);

  const viewportState = useMemo(
    () => getViewportState(viewportIndex),
    [getViewportState, viewportIndex]
  );
  const viewport = getStackViewport(viewportIndex);
  const resolvedViewportId = useMemo(
    () => getViewportId(viewportIndex),
    [getViewportId, viewportIndex]
  );
  const resolvedRenderingEngineId = useMemo(
    () => getRenderingEngineId(viewportIndex),
    [getRenderingEngineId, viewportIndex]
  );

  // Cache values in refs to avoid repeated calls in event handlers
  const viewportIdRef = useRef(resolvedViewportId);
  const viewportRef = useRef(viewport);
  const toolManagerRefValue = useRef(toolManagerRef.current);
  
  useEffect(() => {
    viewportIdRef.current = resolvedViewportId;
    viewportRef.current = viewport;
    toolManagerRefValue.current = toolManagerRef.current;
  }, [resolvedViewportId, viewport]);

  const {
    isLoading,
    loadingProgress,
    viewportReady,
    currentFrame,
    totalFrames,
  } = viewportState;

  const [elementReady, setElementReady] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [predictions, setPredictions] = useState<PredictionMetadata[]>([]);
  const [aiImageMetadata, setAiImageMetadata] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [analyzedImageId, setAnalyzedImageId] = useState<string>("");

  const totalFramesRef = useRef(totalFrames);
  const diagnosisImageByAIRef = useRef<ReturnType<typeof useDiagnosisImageByAIMutation>[0] | undefined>(undefined);

  // AI Diagnosis mutation
  const [diagnosisImageByAI] = useDiagnosisImageByAIMutation();

  useEffect(() => {
    totalFramesRef.current = totalFrames;
    diagnosisImageByAIRef.current = diagnosisImageByAI;
  }, [totalFrames, diagnosisImageByAI]);

  const { publish } = useViewerEvents();

  const dispatchClearAnnotations = useCallback(() => {
    publish(ViewerEvents.CLEAR_VIEWPORT_ANNOTATIONS, { activeViewportId: viewportIdRef.current });
  }, [publish]);

  const dispatchResetView = useCallback(() => {
    publish(ViewerEvents.RESET_VIEW);
  }, [publish]);

  const wheelScrollHandlerRef = useRef<{
    rafId: number | null;
    lastTime: number;
    pendingDirection: number | null;
  }>({ rafId: null, lastTime: 0, pendingDirection: null });

  const wheelScrollHandler = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    if (totalFramesRef.current <= 1) return;

    const now = performance.now();
    const timeSinceLastCall = now - wheelScrollHandlerRef.current.lastTime;
    const throttleDelay = 50;

    const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
    if (direction === 0) return;

    wheelScrollHandlerRef.current.pendingDirection = direction;

    if (wheelScrollHandlerRef.current.rafId !== null) {
      return;
    }

    if (timeSinceLastCall < throttleDelay) {
      wheelScrollHandlerRef.current.rafId = requestAnimationFrame(() => {
        const direction = wheelScrollHandlerRef.current.pendingDirection;
        wheelScrollHandlerRef.current.rafId = null;
        wheelScrollHandlerRef.current.lastTime = performance.now();
        wheelScrollHandlerRef.current.pendingDirection = null;

        if (direction === 1) {
          nextFrame(viewportIndex);
        } else if (direction === -1) {
          prevFrame(viewportIndex);
        }
      });
    } else {
      wheelScrollHandlerRef.current.lastTime = now;
      wheelScrollHandlerRef.current.pendingDirection = null;
      
      if (direction === 1) {
        nextFrame(viewportIndex);
      } else if (direction === -1) {
        prevFrame(viewportIndex);
      }
    }
  }, [nextFrame, prevFrame, viewportIndex]);

  // Viewport transform handlers
  const handleRotateViewport = useCallback((data: { viewportId?: string; degrees: number }) => {
    if (data.viewportId && data.viewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.rotateViewport?.(data.degrees);
  }, []);

  const handleFlipViewport = useCallback((data: { viewportId?: string; direction: 'horizontal' | 'vertical' }) => {
    if (data.viewportId && data.viewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.flipViewport?.(data.direction);
  }, []);

  const handleResetView = useCallback(() => {
    toolManagerRefValue.current?.getToolHandlers?.()?.resetView?.();
  }, []);

  const handleInvertColorMap = useCallback(() => {
    toolManagerRefValue.current?.getToolHandlers?.()?.invertColorMap?.();
  }, []);

  const handleRefresh = useCallback(() => {
    void refreshViewport(viewportIndex);
  }, [refreshViewport, viewportIndex]);

  // Annotation handlers
  const handleClearAnnotations = useCallback(() => {
    // Clear ALL annotations on this viewport (no filtering by viewportId)
    toolManagerRefValue.current?.getToolHandlers?.()?.clearAnnotations?.();
  }, []);

  const handleClearViewportAnnotations = useCallback((data?: { activeViewportId?: string }) => {
    if (data?.activeViewportId && data.activeViewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.clearViewportAnnotations?.();
  }, []);

  const handleUndoAnnotation = useCallback((data?: { activeViewportId?: string; entry?: AnnotationHistoryEntry }) => {
    if (data?.activeViewportId && data.activeViewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.undoAnnotation?.(data?.entry);
  }, []);

  const handleRedoAnnotation = useCallback((data?: { activeViewportId?: string; entry?: AnnotationHistoryEntry }) => {
    if (data?.activeViewportId && data.activeViewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.redoAnnotation?.(data?.entry);
  }, []);

  const handleUndoSegmentation = useCallback((data?: { activeViewportId?: string; entry?: SegmentationHistoryEntry }) => {
    if (data?.activeViewportId && data.activeViewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.undoSegmentation?.(data?.entry);
  }, []);

  const handleRedoSegmentation = useCallback((data?: { activeViewportId?: string; entry?: SegmentationHistoryEntry }) => {
    if (data?.activeViewportId && data.activeViewportId !== viewportIdRef.current) return;
    toolManagerRefValue.current?.getToolHandlers?.()?.redoSegmentation?.(data?.entry);
  }, []);

  // AI Diagnosis handlers
  const handleAIDiagnosis = useCallback(async (event: Event) => {
    const customEvent = event as CustomEvent;
    const { viewportId: eventViewportId, modelId, modelName, versionName } = customEvent.detail || {};
    const currentViewportId = viewportIdRef.current;
    if (eventViewportId !== currentViewportId || !currentViewportId) return;
    
    const currentElement = elementRef.current;
    const currentViewport = viewportRef.current;
    if (!currentElement || !currentViewport) return;

    setIsDiagnosing(true);
    try {
      const base64Image = getCanvasAsBase64(currentElement);
      if (!base64Image) throw new Error("Failed to convert canvas to base64");

      const response = await diagnosisImageByAIRef.current?.({
        base64Image,
        aiModelId: modelId,
        modelName,
        versionName,
        selectedStudyId: studyId !== null ? studyId : undefined,
      }).unwrap();

      if (!response?.data) return;
      const { predictions, image } = response.data;
      if (!predictions || !Array.isArray(predictions) || predictions.length === 0) return;

      setPredictions(predictions);
      const stackViewport = currentViewport as Types.IStackViewport;
      const canvas = stackViewport.canvas;
      const currentImageId = stackViewport.getCurrentImageId?.() || "";
      setAiImageMetadata({ width: image.width, height: image.height });
      setAnalyzedImageId(currentImageId);

      drawAIPredictions(
        predictions,
        currentViewportId,
        currentImageId,
        resolvedRenderingEngineId as string,
        image.width,
        image.height,
        canvas.width,
        canvas.height
      );
      batchedRender(currentViewport);
    } catch (error) {
      console.error("AI diagnosis failed:", error);
    } finally {
      setIsDiagnosing(false);
    }
  }, [resolvedRenderingEngineId, studyId]);

  const handleClearAIAnnotations = useCallback((data: { viewportId?: string }) => {
    const currentViewportId = viewportIdRef.current;
    if (data.viewportId !== currentViewportId || !currentViewportId) return;

    clearAIAnnotationsUtil(currentViewportId);
    setPredictions([]);
    setAiImageMetadata(null);
    setAnalyzedImageId("");

    const currentViewport = viewportRef.current;
    batchedRender(currentViewport);
  }, []);

  // Annotation visibility handler
  const handleToggleAnnotations = useCallback((data: { showAnnotations?: boolean }) => {
    const currentElement = elementRef.current;
    const currentViewport = viewportRef.current;
    if (!currentElement || !currentViewport) return;

    try {
      const svgElements = currentElement.querySelectorAll("svg");
      svgElements.forEach((svg) => {
        const hasAnnotationElements =
          svg.querySelector("g[data-tool-name]") ||
          svg.querySelector("g[data-annotation-uid]") ||
          svg.classList.contains("annotation-svg");

        if (hasAnnotationElements) {
          if (data.showAnnotations === false) {
            svg.style.display = "none";
            svg.classList.add("annotations-hidden");
          } else {
            svg.style.display = "";
            svg.classList.remove("annotations-hidden");
          }
        }
      });

      const annotationCanvas = currentElement.querySelector("canvas.annotation-canvas");
      if (annotationCanvas) {
        (annotationCanvas as HTMLElement).style.display = data.showAnnotations === false ? "none" : "";
      }

      if (typeof currentViewport.render === "function") {
        batchedRender(currentViewport);
      }
    } catch (error) {
      console.error("Error toggling annotation visibility:", error);
    }
  }, []);

  // Annotation selection handlers
  const handleSelectAnnotation = useCallback((data: {
    annotationId: string;
    annotationUID?: string;
    annotationType?: string;
    instanceId?: string;
  }) => {
    if (data.annotationId) {
      toolManagerRefValue.current?.getToolHandlers?.()?.selectAnnotation?.(data);
    }
  }, []);

  const handleDeselectAnnotation = useCallback(() => {
    toolManagerRefValue.current?.getToolHandlers?.()?.deselectAnnotation?.();
  }, []);

  const handleUpdateAnnotationColor = useCallback((data: {
    annotationId: string;
    annotationUID?: string;
    colorCode: string;
    instanceId?: string;
  }) => {
    if (data.annotationId && data.colorCode) {
      toolManagerRefValue.current?.getToolHandlers?.()?.updateAnnotationColor?.(data);
    }
  }, []);

  const handleLockAnnotation = useCallback((data: {
    annotationId: string;
    annotationUID?: string;
    locked: boolean;
    instanceId?: string;
  }) => {
    if (data.annotationId) {
      toolManagerRefValue.current?.getToolHandlers?.()?.lockAnnotation?.(data);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (totalFramesRef.current <= 1) {
        return;
      }

      switch (event.key) {
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          prevFrame(viewportIndex);
          break;
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          nextFrame(viewportIndex);
          break;
        case "Delete":
        case "Backspace":
          event.preventDefault();
          dispatchClearAnnotations();
          break;
        case "r":
        case "R":
          event.preventDefault();
          dispatchResetView();
          break;
      }
    },
    [
      dispatchClearAnnotations,
      dispatchResetView,
      nextFrame,
      prevFrame,
      viewportIndex,
    ]
  );

  const handleViewportElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        elementRef.current = node;
        registerViewportElement(viewportIndex, node);
        setElementReady(true);
      } else {
        setElementReady(false);
        registerViewportElement(viewportIndex, null);
        disposeViewportRef.current(viewportIndex);
        elementRef.current = null;
      }
    },
    [viewportIndex, registerViewportElement]
  );

  useEffect(() => {
    if (!elementReady) return;

    if (!selectedSeries) {
      disposeViewportRef.current(viewportIndex);
      return;
    }

    if (viewportState.seriesId === selectedSeries.id) {
      if (viewportState.isLoading || viewportState.viewportReady) {
        return;
      }
    }

    loadSeriesRef.current(viewportIndex, selectedSeries, {
      studyId: selectedStudy?.id ?? null,
    });
  }, [
    viewportIndex,
    selectedSeries?.id,
    selectedStudy?.id,
    viewportState.seriesId,
    viewportState.viewportReady,
    viewportState.isLoading,
    elementReady,
  ]);

  // DOM event listeners (keyboard and wheel)
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !viewportReady) {
      return;
    }

    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", handleKeyDown);
    element.addEventListener("wheel", wheelScrollHandler, { passive: false });

    return () => {
      // Cleanup wheel handler RAF
      if (wheelScrollHandlerRef.current.rafId !== null) {
        cancelAnimationFrame(wheelScrollHandlerRef.current.rafId);
        wheelScrollHandlerRef.current.rafId = null;
      }
      
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("wheel", wheelScrollHandler);
    };
  }, [viewportReady, handleKeyDown, wheelScrollHandler]);

  // Subscribe to viewer events using pub/sub service
  useViewerEvent(ViewerEvents.ROTATE_VIEWPORT, handleRotateViewport, [handleRotateViewport]);
  useViewerEvent(ViewerEvents.FLIP_VIEWPORT, handleFlipViewport, [handleFlipViewport]);
  useViewerEvent(ViewerEvents.RESET_VIEW, handleResetView, [handleResetView]);
  useViewerEvent(ViewerEvents.INVERT_COLORMAP, handleInvertColorMap, [handleInvertColorMap]);
  useViewerEvent(ViewerEvents.CLEAR_ANNOTATIONS, handleClearAnnotations, [handleClearAnnotations]);
  useViewerEvent(ViewerEvents.CLEAR_VIEWPORT_ANNOTATIONS, handleClearViewportAnnotations, [handleClearViewportAnnotations]);
  useViewerEvent(ViewerEvents.UNDO_ANNOTATION, handleUndoAnnotation, [handleUndoAnnotation]);
  useViewerEvent(ViewerEvents.REDO_ANNOTATION, handleRedoAnnotation, [handleRedoAnnotation]);
  useViewerEvent(ViewerEvents.UNDO_SEGMENTATION, handleUndoSegmentation, [handleUndoSegmentation]);
  useViewerEvent(ViewerEvents.REDO_SEGMENTATION, handleRedoSegmentation, [handleRedoSegmentation]);
  useViewerEvent(ViewerEvents.REFRESH_VIEWPORT, handleRefresh, [handleRefresh]);
  useViewerEvent(ViewerEvents.DIAGNOSE_VIEWPORT, handleAIDiagnosis, [handleAIDiagnosis]);
  useViewerEvent(ViewerEvents.CLEAR_AI_ANNOTATIONS, handleClearAIAnnotations, [handleClearAIAnnotations]);
  useViewerEvent(ViewerEvents.TOGGLE_ANNOTATIONS, handleToggleAnnotations, [handleToggleAnnotations]);
  useViewerEvent(ViewerEvents.SELECT_ANNOTATION, handleSelectAnnotation, [handleSelectAnnotation]);
  useViewerEvent(ViewerEvents.DESELECT_ANNOTATION, handleDeselectAnnotation, [handleDeselectAnnotation]);
  useViewerEvent(ViewerEvents.UPDATE_ANNOTATION_COLOR, handleUpdateAnnotationColor, [handleUpdateAnnotationColor]);
  useViewerEvent(ViewerEvents.LOCK_ANNOTATION, handleLockAnnotation, [handleLockAnnotation]);


  const showNavigationOverlay = useMemo(
    () => totalFrames > 1 && !isLoading,
    [isLoading, totalFrames]
  );

  if (Number.isNaN(viewportIndex)) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {resolvedViewportId && resolvedRenderingEngineId && viewport && (
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
          viewportIndex={viewportIndex}
        />
      )}

      <div
        ref={containerRef}
        className="flex-1 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
      >
        {selectedSeries ? (
          <>
            <div
              ref={handleViewportElementRef}
              className="w-full h-full bg-black"
              data-viewport-id={viewportId}
              key={`viewport-element-${viewportId}`}
            />
            {predictions && predictions.length > 0 && !isDiagnosing && (
              <AILabelOverlay
                viewportId={resolvedViewportId as string}
                renderingEngineId={resolvedRenderingEngineId as string}
                predictions={predictions}
                aiImageWidth={aiImageMetadata?.width as number}
                aiImageHeight={aiImageMetadata?.height as number}
                targetImageId={analyzedImageId}
              />
            )}

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
                      <div className="w-full h-full bg-linear-to-r from-blue-400 to-blue-600 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Diagnosis Loading Overlay */}
            {isDiagnosing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                  <div className="text-white text-lg font-medium mb-2">
                    AI Analyzing...
                  </div>
                  <div className="text-gray-400 text-sm">
                    Processing medical image with AI model
                  </div>
                </div>
              </div>
            )}

            {showNavigationOverlay && totalFrames > 1 && (
              <>
                {/* Vertical scrollbar on the right edge */}
                <FrameScrollbarComponent
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  onFrameChange={(frame: number) => goToFrame(viewportIndex, frame)}
                />

                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium z-50">
                  {currentFrame + 1} / {totalFrames}
                </div>
              </>
            )}

          </>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-center text-slate-400">
              <ImageOff className="h-16 w-16 mx-auto mb-4 text-slate-500" />
              <div className="text-lg mb-2">No Series Selected</div>
              <div className="text-sm">
                Please select a series from the sidebar
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPortMain;
