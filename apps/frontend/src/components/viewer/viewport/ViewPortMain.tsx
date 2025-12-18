"use client";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import {
  useViewer,
  type AnnotationHistoryEntry,
} from "@/common/contexts/ViewerContext";
import { toast } from "sonner";
import type { SegmentationHistoryEntry } from "@/common/contexts/viewer-context/segmentation-helper";
import { useDiagnosisImageByAIMutation } from "@/store/aiAnalysisApi";
import {
  getCanvasAsBase64,
  drawAIPredictions,
  clearAIAnnotations as clearAIAnnotationsUtil,
} from "@/common/utils/aiDiagnosis";
import { Types } from "@cornerstonejs/core";
import { batchedRender } from "@/common/utils/renderBatcher";
import { Loader2, ImageOff } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { AILabelOverlay } from "../overlay/AILabelOverlay";
import { PredictionMetadata } from "@/common/interfaces/system/ai-result.interface";
import { useSearchParams } from "next/navigation";
import {
  useViewerEvent,
  useViewerEvents,
  ViewerEvents,
} from "@/common/contexts/ViewerEventContext";

// Compact frame slider (short, not full height)
function FrameSlider({
  currentFrame,
  totalFrames,
  onFrameChange,
  sliderRef,
}: {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  sliderRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (totalFrames <= 1) return null;

  const value = Number.isFinite(currentFrame) ? currentFrame : 0;
  const clamped = Math.max(0, Math.min(totalFrames - 1, value));

  return (
    <div
      ref={sliderRef}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-50 h-64 w-6 flex items-center justify-center"
    >
      <Slider
        orientation="vertical"
        min={0}
        max={Math.max(1, totalFrames - 1)}
        step={1}
        value={[totalFrames - 1 - clamped]}
        onValueChange={(vals) => {
          const next = vals?.[0] ?? 0;
          const inverted = totalFrames - 1 - next;
          onFrameChange(Math.max(0, Math.min(totalFrames - 1, inverted)));
        }}
        className="w-6 h-64 cursor-pointer"
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
  selectedTool = "",
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
  const sliderRef = useRef<HTMLDivElement | null>(null);
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
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);

  const totalFramesRef = useRef(totalFrames);
  const diagnosisImageByAIRef = useRef<
    ReturnType<typeof useDiagnosisImageByAIMutation>[0] | undefined
  >(undefined);

  // AI Diagnosis mutation
  const [diagnosisImageByAI] = useDiagnosisImageByAIMutation();

  useEffect(() => {
    totalFramesRef.current = totalFrames;
    diagnosisImageByAIRef.current = diagnosisImageByAI;
  }, [totalFrames, diagnosisImageByAI]);

  const { publish } = useViewerEvents();

  const dispatchClearAnnotations = useCallback(() => {
    publish(ViewerEvents.CLEAR_VIEWPORT_ANNOTATIONS, {
      activeViewportId: viewportIdRef.current,
    });
  }, [publish]);

  const dispatchResetView = useCallback(() => {
    publish(ViewerEvents.RESET_VIEW);
  }, [publish]);

  const wheelScrollHandlerRef = useRef<{
    rafId: number | null;
    lastTime: number;
    pendingDirection: number | null;
  }>({ rafId: null, lastTime: 0, pendingDirection: null });

  const wheelScrollHandler = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      if (totalFramesRef.current <= 1) return;

      const now = performance.now();
      const timeSinceLastCall = now - wheelScrollHandlerRef.current.lastTime;
      const throttleDelay = 50;

      const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      // Ignore wheel when hovering the slider
      if (sliderRef.current && event.target instanceof Node && sliderRef.current.contains(event.target)) {
        return;
      }

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
    },
    [nextFrame, prevFrame, viewportIndex]
  );

  // Viewport transform handlers
  const handleRotateViewport = useCallback(
    (data: { viewportId?: string; degrees: number }) => {
      if (data.viewportId && data.viewportId !== viewportIdRef.current) return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.rotateViewport?.(data.degrees);
    },
    []
  );

  const handleFlipViewport = useCallback(
    (data: { viewportId?: string; direction: "horizontal" | "vertical" }) => {
      if (data.viewportId && data.viewportId !== viewportIdRef.current) return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.flipViewport?.(data.direction);
    },
    []
  );

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

  const handleClearViewportAnnotations = useCallback(
    (data?: { activeViewportId?: string }) => {
      if (
        data?.activeViewportId &&
        data.activeViewportId !== viewportIdRef.current
      )
        return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.clearViewportAnnotations?.();
    },
    []
  );

  const handleUndoAnnotation = useCallback(
    (data?: { activeViewportId?: string; entry?: AnnotationHistoryEntry }) => {
      if (
        data?.activeViewportId &&
        data.activeViewportId !== viewportIdRef.current
      )
        return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.undoAnnotation?.(data?.entry);
    },
    []
  );

  const handleRedoAnnotation = useCallback(
    (data?: { activeViewportId?: string; entry?: AnnotationHistoryEntry }) => {
      if (
        data?.activeViewportId &&
        data.activeViewportId !== viewportIdRef.current
      )
        return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.redoAnnotation?.(data?.entry);
    },
    []
  );

  const handleUndoSegmentation = useCallback(
    (data?: {
      activeViewportId?: string;
      entry?: SegmentationHistoryEntry;
    }) => {
      if (
        data?.activeViewportId &&
        data.activeViewportId !== viewportIdRef.current
      )
        return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.undoSegmentation?.(data?.entry);
    },
    []
  );

  const handleRedoSegmentation = useCallback(
    (data?: {
      activeViewportId?: string;
      entry?: SegmentationHistoryEntry;
    }) => {
      if (
        data?.activeViewportId &&
        data.activeViewportId !== viewportIdRef.current
      )
        return;
      toolManagerRefValue.current
        ?.getToolHandlers?.()
        ?.redoSegmentation?.(data?.entry);
    },
    []
  );

  // AI Diagnosis handlers
  const handleAIDiagnosis = useCallback(
    async (data: any) => {
      const {
        viewportId,
        modelId,
        modelName,
        versionName,
      } = data || {};
      const currentViewportId = viewportIdRef.current;

      console.log("🔍 Viewport check:", {
        viewportId,
        currentViewportId,
        willProcess: viewportId === currentViewportId,
      });

      if (viewportId !== currentViewportId || !currentViewportId) return;

      const currentElement = elementRef.current;
      const currentViewport = viewportRef.current;
      if (!currentElement || !currentViewport) return;

      // Get studyId from selectedSeries instead of searchParams
      const studyIdToUse = selectedSeries?.studyId || studyId;
      
      console.log("📊 Study ID check:", {
        fromSeries: selectedSeries?.studyId,
        fromSearchParams: studyId,
        willUse: studyIdToUse,
      });

      setIsDiagnosing(true);
      publish("ai:diagnosis:start", { viewportId: currentViewportId });
      
      try {
        const base64Image = getCanvasAsBase64(currentElement);
        if (!base64Image) throw new Error("Failed to convert canvas to base64");

        const response = await diagnosisImageByAIRef
          .current?.({
            base64Image,
            aiModelId: modelId,
            modelName,
            versionName,
            selectedStudyId: studyIdToUse || undefined,
            folder: "base64",
          })
          .unwrap();

        if (!response?.data) {
          throw new Error("No response data received");
        }
        
        console.log("📦 Full response structure:", JSON.stringify(response, null, 2));
        console.log("📦 Response.data:", response.data);
        
        const { predictions, image } = response.data;
        const analysisId = response?.data?.analysisId || null;
        const aiAnalyzeMessage = response?.data?.aiAnalyzeMessage || "";
        
        console.log("✅ Extracted data:", { 
          predictionsCount: predictions?.length, 
          imageWidth: image?.width, 
          imageHeight: image?.height,
          analysisId,
          hasAiMessage: !!aiAnalyzeMessage
        });
        
        setLastAnalysisId(analysisId);
        
        // Handle case when no predictions found
        if (
          !predictions ||
          !Array.isArray(predictions) ||
          predictions.length === 0
        ) {
          publish("ai:diagnosis:success", { 
            analysisId, 
            viewportId: currentViewportId,
            studyId: studyIdToUse,
            predictions: [],
            aiAnalyzeMessage: aiAnalyzeMessage || "No abnormalities detected."
          });
          
          toast.warning("No abnormalities detected in the image.");
          return;
        }
        
        setPredictions(predictions);
        const stackViewport = currentViewport as Types.IStackViewport;
        const currentImageId = stackViewport.getCurrentImageId?.() || "";
        
        console.log("🖼️ Image metadata from response:", image);
        console.log("📊 Drawing predictions:", {
          predictionsCount: predictions.length,
          imageWidth: image.width,
          imageHeight: image.height,
          viewportId: currentViewportId,
          currentImageId
        });
        
        setAiImageMetadata({ width: image.width, height: image.height });
        setAnalyzedImageId(currentImageId);

        drawAIPredictions(
          predictions,
          currentViewportId,
          currentImageId,
          resolvedRenderingEngineId as string,
          image.width,
          image.height,
        );
        batchedRender(currentViewport);
        
        console.log("📢 Publishing ai:diagnosis:success event with:", { 
          analysisId, 
          viewportId: currentViewportId,
          studyId: studyIdToUse,
          predictionsCount: predictions.length,
          hasAiMessage: !!aiAnalyzeMessage
        });
        
        publish("ai:diagnosis:success", { 
          analysisId, 
          viewportId: currentViewportId,
          studyId: studyIdToUse,
          predictions: predictions,
          aiAnalyzeMessage: aiAnalyzeMessage
        });
        
        toast.success(`AI diagnosis completed. Found ${predictions.length} detection(s).`);
      } catch (error: any) {
        console.error("AI diagnosis failed:", error);
        const errorMessage = error?.message || "AI diagnosis failed. Please try again.";
        toast.error(errorMessage);
        publish("ai:diagnosis:error", { error, viewportId: currentViewportId });
      } finally {
        setIsDiagnosing(false);
      }
    },
    [resolvedRenderingEngineId, studyId, selectedSeries, publish]
  );

  const handleClearAIAnnotations = useCallback(
    (data: { viewportId?: string }) => {
      const currentViewportId = viewportIdRef.current;
      if (data.viewportId !== currentViewportId || !currentViewportId) return;

      clearAIAnnotationsUtil(currentViewportId);
      setPredictions([]);
      setAiImageMetadata(null);
      setAnalyzedImageId("");

      const currentViewport = viewportRef.current;
      batchedRender(currentViewport);
    },
    []
  );

  // Annotation visibility handler
  const handleToggleAnnotations = useCallback(
    (data: { showAnnotations?: boolean }) => {
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

        const annotationCanvas = currentElement.querySelector(
          "canvas.annotation-canvas"
        );
        if (annotationCanvas) {
          (annotationCanvas as HTMLElement).style.display =
            data.showAnnotations === false ? "none" : "";
        }

        if (typeof currentViewport.render === "function") {
          batchedRender(currentViewport);
        }
      } catch (error) {
        console.error("Error toggling annotation visibility:", error);
      }
    },
    []
  );

  // Annotation selection handlers
  const handleSelectAnnotation = useCallback(
    (data: {
      annotationId: string;
      annotationUID?: string;
      annotationType?: string;
      instanceId?: string;
    }) => {
      if (data.annotationId) {
        toolManagerRefValue.current
          ?.getToolHandlers?.()
          ?.selectAnnotation?.(data);
      }
    },
    []
  );

  const handleDeselectAnnotation = useCallback(() => {
    toolManagerRefValue.current?.getToolHandlers?.()?.deselectAnnotation?.();
  }, []);

  const handleUpdateAnnotationColor = useCallback(
    (data: {
      annotationId: string;
      annotationUID?: string;
      colorCode: string;
      instanceId?: string;
    }) => {
      if (data.annotationId && data.colorCode) {
        toolManagerRefValue.current
          ?.getToolHandlers?.()
          ?.updateAnnotationColor?.(data);
      }
    },
    []
  );

  const handleLockAnnotation = useCallback(
    (data: {
      annotationId: string;
      annotationUID?: string;
      locked: boolean;
      instanceId?: string;
    }) => {
      if (data.annotationId) {
        toolManagerRefValue.current
          ?.getToolHandlers?.()
          ?.lockAnnotation?.(data);
      }
    },
    []
  );

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
    selectedSeries,
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

    const handlerSnapshot = wheelScrollHandlerRef.current;

    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", handleKeyDown);
    element.addEventListener("wheel", wheelScrollHandler, { passive: false });

    return () => {
      if (handlerSnapshot.rafId !== null) {
        cancelAnimationFrame(handlerSnapshot.rafId);
        handlerSnapshot.rafId = null;
      }

      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("wheel", wheelScrollHandler);
    };
  }, [viewportReady, handleKeyDown, wheelScrollHandler]);

  // Subscribe to viewer events using pub/sub service
  useViewerEvent(ViewerEvents.ROTATE_VIEWPORT, handleRotateViewport, [
    handleRotateViewport,
  ]);
  useViewerEvent(ViewerEvents.FLIP_VIEWPORT, handleFlipViewport, [
    handleFlipViewport,
  ]);
  useViewerEvent(ViewerEvents.RESET_VIEW, handleResetView, [handleResetView]);
  useViewerEvent(ViewerEvents.INVERT_COLORMAP, handleInvertColorMap, [
    handleInvertColorMap,
  ]);
  useViewerEvent(ViewerEvents.CLEAR_ANNOTATIONS, handleClearAnnotations, [
    handleClearAnnotations,
  ]);
  useViewerEvent(
    ViewerEvents.CLEAR_VIEWPORT_ANNOTATIONS,
    handleClearViewportAnnotations,
    [handleClearViewportAnnotations]
  );
  useViewerEvent(ViewerEvents.UNDO_ANNOTATION, handleUndoAnnotation, [
    handleUndoAnnotation,
  ]);
  useViewerEvent(ViewerEvents.REDO_ANNOTATION, handleRedoAnnotation, [
    handleRedoAnnotation,
  ]);
  useViewerEvent(ViewerEvents.UNDO_SEGMENTATION, handleUndoSegmentation, [
    handleUndoSegmentation,
  ]);
  useViewerEvent(ViewerEvents.REDO_SEGMENTATION, handleRedoSegmentation, [
    handleRedoSegmentation,
  ]);
  useViewerEvent(ViewerEvents.REFRESH_VIEWPORT, handleRefresh, [handleRefresh]);
  useViewerEvent(ViewerEvents.DIAGNOSE_VIEWPORT, handleAIDiagnosis, [
    handleAIDiagnosis,
  ]);
  useViewerEvent(ViewerEvents.CLEAR_AI_ANNOTATIONS, handleClearAIAnnotations, [
    handleClearAIAnnotations,
  ]);
  useViewerEvent(ViewerEvents.TOGGLE_ANNOTATIONS, handleToggleAnnotations, [
    handleToggleAnnotations,
  ]);
  useViewerEvent(ViewerEvents.SELECT_ANNOTATION, handleSelectAnnotation, [
    handleSelectAnnotation,
  ]);
  useViewerEvent(ViewerEvents.DESELECT_ANNOTATION, handleDeselectAnnotation, [
    handleDeselectAnnotation,
  ]);
  useViewerEvent(
    ViewerEvents.UPDATE_ANNOTATION_COLOR,
    handleUpdateAnnotationColor,
    [handleUpdateAnnotationColor]
  );
  useViewerEvent(ViewerEvents.LOCK_ANNOTATION, handleLockAnnotation, [
    handleLockAnnotation,
  ]);

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
                <FrameSlider
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  onFrameChange={(frame: number) =>
                    goToFrame(viewportIndex, frame)
                  }
                  sliderRef={sliderRef}
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
