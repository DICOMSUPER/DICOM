"use client";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import {
  useViewer,
  type AnnotationHistoryEntry,
} from "@/contexts/ViewerContext";
import { useDiagnosisImageByAIMutation } from "@/store/aiAnalysisApi";
import {
  getCanvasAsBase64,
  drawAIPredictions,
  clearAIAnnotations as clearAIAnnotationsUtil,
} from "@/utils/aiDiagnosis";
import { getEnabledElement, Types } from "@cornerstonejs/core";
import { Loader2 } from "lucide-react";
import { AnnotationHoverTooltip } from "@/components/viewer/AnnotationHoverTooltip";
import { annotation } from "@cornerstonejs/tools";
import { AnnotationType } from "@/enums/image-dicom.enum";
import type { Annotation } from "@cornerstonejs/tools/types";

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

  if (Number.isNaN(viewportIndex)) {
    return null;
  }

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
    refreshViewport,
  } = useViewer();

  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolManagerRef = useRef<any>(null);
  const disposeViewportRef = useRef(disposeViewport);
  const loadSeriesRef = useRef(loadSeriesIntoViewport);

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
  const resolvedViewportId = getViewportId(viewportIndex);
  const resolvedRenderingEngineId = getRenderingEngineId(viewportIndex);

  const {
    isLoading,
    loadingProgress,
    viewportReady,
    currentFrame,
    totalFrames,
  } = viewportState;

  const [elementReady, setElementReady] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const totalFramesRef = useRef(totalFrames);

  // AI Diagnosis mutation
  const [diagnosisImageByAI] = useDiagnosisImageByAIMutation();

  useEffect(() => {
    totalFramesRef.current = totalFrames;
  }, [totalFrames]);

  const dispatchClearAnnotations = useCallback(() => {
    window.dispatchEvent(new CustomEvent("clearAnnotations"));
  }, []);

  const dispatchResetView = useCallback(() => {
    window.dispatchEvent(new CustomEvent("resetView"));
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
        console.log("Đây chính là elementRef.current:", node);
        console.log("className:", node.className); // → "w-full h-full bg-black ..."
        console.log("data-viewport-id:", node.dataset.viewportId); // → "0"
        console.log("data-viewport-uid:", node.dataset.viewportUid); // → "viewport-1"
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
    if (!elementReady) {
      return;
    }

    if (!selectedSeries) {
      disposeViewportRef.current(viewportIndex);
      return;
    }

    if (viewportState.seriesId === selectedSeries.id) {
      if (viewportState.isLoading) {
        return;
      }

      if (viewportState.viewportReady) {
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

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !viewportReady) {
      return;
    }

    element.setAttribute("tabindex", "0");

    const wheelScrollHandler = (event: WheelEvent) => {
      event.preventDefault();
      if (totalFramesRef.current <= 1) return;

      if (event.deltaY > 0) {
        nextFrame(viewportIndex);
      } else if (event.deltaY < 0) {
        prevFrame(viewportIndex);
      }
    };

    const handleRotateViewportLocal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId, degrees } = customEvent.detail || {};
      const actualViewportId = getViewportId(viewportIndex);

      if (eventViewportId !== actualViewportId) return;

      toolManagerRef.current?.getToolHandlers?.()?.rotateViewport?.(degrees);
    };

    const handleFlipViewportLocal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId, direction } =
        customEvent.detail || {};
      const actualViewportId = getViewportId(viewportIndex);

      if (eventViewportId !== actualViewportId) return;

      toolManagerRef.current?.getToolHandlers?.()?.flipViewport?.(direction);
    };

    const handleResetView = () => {
      toolManagerRef.current?.getToolHandlers?.()?.resetView?.();
    };

    const handleClearAnnotations = (event?: Event) => {
      if (event) {
        const customEvent = event as CustomEvent;
        const { activeViewportId } = customEvent.detail || {};
        const actualViewportId = getViewportId(viewportIndex);
        if (activeViewportId && activeViewportId !== actualViewportId) return;
      }
      toolManagerRef.current?.getToolHandlers?.()?.clearAnnotations?.();
    };

    const handleClearViewportAnnotations = (event?: Event) => {
      if (event) {
        const customEvent = event as CustomEvent;
        const { activeViewportId } = customEvent.detail || {};
        const actualViewportId = getViewportId(viewportIndex);
        // Only execute if this is the active viewport or if no viewport ID is specified
        if (activeViewportId && activeViewportId !== actualViewportId) {
          console.log(
            `Skipping clear viewport annotations - viewportId mismatch: ${actualViewportId} !== ${activeViewportId}`
          );
          return;
        }
      }
      const actualViewportId = getViewportId(viewportIndex);
      console.log(
        `Executing clear viewport annotations for viewport ${actualViewportId}`
      );
      toolManagerRef.current?.getToolHandlers?.()?.clearViewportAnnotations?.();
    };

    const handleUndoAnnotation = (event?: Event) => {
      let historyEntry: AnnotationHistoryEntry | undefined;
      if (event) {
        const customEvent = event as CustomEvent<{
          activeViewportId?: string;
          entry?: AnnotationHistoryEntry;
        }>;
        const { activeViewportId } = customEvent.detail || {};
        const actualViewportId = getViewportId(viewportIndex);
        if (activeViewportId && activeViewportId !== actualViewportId) return;
        historyEntry = customEvent.detail?.entry;
      }
      toolManagerRef.current
        ?.getToolHandlers?.()
        ?.undoAnnotation?.(historyEntry);
    };

    const handleRedoAnnotation = (event?: Event) => {
      let historyEntry: AnnotationHistoryEntry | undefined;
      if (event) {
        const customEvent = event as CustomEvent<{
          activeViewportId?: string;
          entry?: AnnotationHistoryEntry;
        }>;
        const { activeViewportId } = customEvent.detail || {};
        const actualViewportId = getViewportId(viewportIndex);
        if (activeViewportId && activeViewportId !== actualViewportId) return;
        historyEntry = customEvent.detail?.entry;
      }
      toolManagerRef.current
        ?.getToolHandlers?.()
        ?.redoAnnotation?.(historyEntry);
    };

    const handleInvertColorMap = () => {
      toolManagerRef.current?.getToolHandlers?.()?.invertColorMap?.();
    };

    const handleRefresh = () => {
      void refreshViewport(viewportIndex);
    };

    // AI Diagnosis handler

    const handleAIDiagnosis = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId } = customEvent.detail || {};
      if (eventViewportId !== resolvedViewportId || !resolvedViewportId) {
        return;
      }
      if (!elementRef.current || !viewport) {
        console.error("Viewport not ready for AI diagnosis");
        return;
      }

      console.log("🧠 Starting AI diagnosis for viewport:", resolvedViewportId);
      setIsDiagnosing(true);

      try {
        // Get canvas and convert to base64
        const base64Image = getCanvasAsBase64(elementRef.current);

        if (!base64Image) {
          throw new Error("Failed to convert canvas to base64");
        }

        console.log("Canvas converted to base64, calling API...");
        const response = await diagnosisImageByAI({
          base64Image,
          aiModelId: undefined,
        }).unwrap();

        console.log("Full AI diagnosis response:", response);

        if (!response?.data) {
          console.warn("No data in response");
          return;
        }

        const { predictions, image } = response.data;

        console.log("Predictions:", predictions);
        console.log("Image metadata:", image);
        if (
          !predictions ||
          !Array.isArray(predictions) ||
          predictions.length === 0
        ) {
          console.log("ℹNo predictions found in AI response");
          return;
        }

        console.log(`Found ${predictions.length} predictions`);

        // Get necessary viewport metadata
        const stackViewport = viewport as Types.IStackViewport;
        const canvas = stackViewport.canvas;
        const currentImageId = stackViewport.getCurrentImageId?.() || "";
        // FrameOfReferenceUID
        const frameOfReferenceUID = stackViewport.getFrameOfReferenceUID?.();
        console.log("frame2", frameOfReferenceUID);
        


        console.log("🔍 Viewport metadata:", {
          canvasSize: { width: canvas.width, height: canvas.height },
          currentImageId,
          imageSize: image,
        });
        drawAIPredictions(
          predictions,
          resolvedViewportId,
          currentImageId,
          resolvedRenderingEngineId as string,
          image.width,
          image.height,
          canvas.width,
          canvas.height
        );

        viewport.render();

        console.log("✅ AI annotations drawn successfully");
      } catch (error) {
        console.error("❌ AI diagnosis failed:", error);
      } finally {
        setIsDiagnosing(false);
      }
    };
    // Clear AI annotations handler
    const handleClearAIAnnotations = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { viewportId: eventViewportId } = customEvent.detail || {};

      if (eventViewportId !== resolvedViewportId || !resolvedViewportId) {
        return;
      }

      console.log(
        "🗑️ Clearing AI annotations for viewport:",
        resolvedViewportId
      );
      clearAIAnnotationsUtil(resolvedViewportId);

      if (viewport) {
        viewport.render();
      }
    };

    // Toggle annotation visibility handler
    const handleToggleAnnotations = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { showAnnotations } = customEvent.detail || {};

      if (!elementRef.current || !viewport) {
        return;
      }

      console.log('👁️ Toggling annotation visibility:', showAnnotations);

      try {
        // Find all SVG elements containing annotations (Cornerstone.js renders annotations as SVG)
        const svgElements = elementRef.current.querySelectorAll('svg');
        
        // Toggle visibility using CSS
        svgElements.forEach((svg) => {
          // Check if this SVG contains annotation elements (not the main viewport canvas)
          const hasAnnotationElements = svg.querySelector('g[data-tool-name]') || 
                                        svg.querySelector('g[data-annotation-uid]') ||
                                        svg.classList.contains('annotation-svg');
          
          if (hasAnnotationElements) {
            if (showAnnotations === false) {
              svg.style.display = 'none';
              svg.classList.add('annotations-hidden');
            } else {
              svg.style.display = '';
              svg.classList.remove('annotations-hidden');
            }
          }
        });

        // Also try to find annotation canvas elements
        const annotationCanvas = elementRef.current.querySelector('canvas.annotation-canvas');
        if (annotationCanvas) {
          if (showAnnotations === false) {
            (annotationCanvas as HTMLElement).style.display = 'none';
          } else {
            (annotationCanvas as HTMLElement).style.display = '';
          }
        }

        // Force re-render of the viewport
        if (viewport && typeof viewport.render === 'function') {
          viewport.render();
        }

        console.log(`✅ Annotation visibility set to: ${showAnnotations !== false ? 'visible' : 'hidden'}`);
      } catch (error) {
        console.error('❌ Error toggling annotation visibility:', error);
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    element.addEventListener("wheel", wheelScrollHandler, { passive: false });
    window.addEventListener(
      "rotateViewport",
      handleRotateViewportLocal as EventListener
    );
    window.addEventListener(
      "flipViewport",
      handleFlipViewportLocal as EventListener
    );
    window.addEventListener("resetView", handleResetView);
    window.addEventListener("invertColorMap", handleInvertColorMap);
    window.addEventListener(
      "clearAnnotations",
      handleClearAnnotations as EventListener
    );
    window.addEventListener(
      "clearViewportAnnotations",
      handleClearViewportAnnotations as EventListener
    );
    window.addEventListener(
      "undoAnnotation",
      handleUndoAnnotation as EventListener
    );
    window.addEventListener(
      "redoAnnotation",
      handleRedoAnnotation as EventListener
    );
    window.addEventListener("refreshViewport", handleRefresh);
    window.addEventListener("diagnoseViewport", handleAIDiagnosis as EventListener);
    window.addEventListener("clearAIAnnotations", handleClearAIAnnotations as EventListener);
    window.addEventListener("toggleAnnotations", handleToggleAnnotations as EventListener);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("wheel", wheelScrollHandler);
      window.removeEventListener(
        "rotateViewport",
        handleRotateViewportLocal as EventListener
      );
      window.removeEventListener(
        "flipViewport",
        handleFlipViewportLocal as EventListener
      );
      window.removeEventListener("resetView", handleResetView);
      window.removeEventListener("invertColorMap", handleInvertColorMap);
      window.removeEventListener(
        "clearAnnotations",
        handleClearAnnotations as EventListener
      );
      window.removeEventListener(
        "clearViewportAnnotations",
        handleClearViewportAnnotations as EventListener
      );
      window.removeEventListener(
        "undoAnnotation",
        handleUndoAnnotation as EventListener
      );
      window.removeEventListener(
        "redoAnnotation",
        handleRedoAnnotation as EventListener
      );
      window.removeEventListener("refreshViewport", handleRefresh);
      window.removeEventListener("diagnoseViewport", handleAIDiagnosis as EventListener);
      window.removeEventListener("clearAIAnnotations", handleClearAIAnnotations as EventListener);
      window.removeEventListener("toggleAnnotations", handleToggleAnnotations as EventListener);
    };
  }, [
    viewportIndex,
    viewportId,
    viewportReady,
    handleKeyDown,
    getViewportId,
    nextFrame,
    prevFrame,
    refreshViewport,
    resolvedViewportId,
    viewport,
    diagnosisImageByAI,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !viewport) {
      return;
    }

    let resizeFrame: number | null = null;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    const handleResize = () => {
      try {
        viewport.resize?.();
        viewport.render?.();
      } catch (error) {
        // ignore resize errors
      }
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      const widthDelta = Math.abs(width - lastWidth);
      const heightDelta = Math.abs(height - lastHeight);

      if (widthDelta < 1 && heightDelta < 1) {
        return;
      }

      lastWidth = width;
      lastHeight = height;

      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
      }

      const sizeDelta = widthDelta + heightDelta;

      if (sizeDelta > 50) {
        resizeFrame = requestAnimationFrame(handleResize);
      } else {
        resizeTimeout = setTimeout(() => {
          resizeFrame = requestAnimationFrame(handleResize);
        }, 150);
      }
    });

    observer.observe(container);
    handleResize();

    return () => {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
      }
      observer.disconnect();
    };
  }, [viewport]);

  const showNavigationOverlay = useMemo(
    () => totalFrames > 1 && !isLoading,
    [isLoading, totalFrames]
  );

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

            {showNavigationOverlay && (
              <>
                <button
                  onClick={() => prevFrame(viewportIndex)}
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

                <button
                  onClick={() => nextFrame(viewportIndex)}
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

                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium z-50">
                  {Math.max(0, currentFrame) + 1} / {Math.max(totalFrames, 0)}
                </div>
              </>
            )}

            {/* Annotation Hover Tooltip */}
            {elementReady && elementRef.current && resolvedViewportId && (
              <AnnotationHoverTooltip
                viewportId={resolvedViewportId}
                viewportIndex={viewportIndex}
                element={elementRef.current}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-center text-slate-400">
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
