"use client";
import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import CornerstoneToolManager from "@/components/viewer/toolbar/CornerstoneToolManager";
import {
  useViewer,
  type AnnotationHistoryEntry,
} from "@/common/contexts/ViewerContext";
import { toast } from "sonner";
import type { SegmentationHistoryEntry } from "@/common/contexts/viewer-context/segmentation-helper";
import {
  captureSegmentationSnapshot,
  ensureViewportLabelmapSegmentation,
  segmentationIdForViewport,
} from "@/common/contexts/viewer-context/segmentation-helper";
import { useDiagnosisImageByAIMutation } from "@/store/aiAnalysisApi";
import { useSegmentWithBBoxMutation } from "@/store/aiSegmentationApi";
import {
  getCanvasAsBase64,
  drawAIPredictions,
  clearAIAnnotations as clearAIAnnotationsUtil,
} from "@/common/utils/aiDiagnosis";
import { cache, eventTarget, Types } from "@cornerstonejs/core";
import { Enums as ToolEnums } from "@cornerstonejs/tools";
import pako from "pako";
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

// Memoized FrameSlider with optimized rendering
const FrameSlider = React.memo(({
  currentFrame,
  totalFrames,
  onFrameChange,
  sliderRef,
}: {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  sliderRef: React.RefObject<HTMLDivElement | null>;
}) => {
  // Hooks must be called before any early returns
  const handleValueChange = useCallback((vals: number[]) => {
    const inverted = totalFrames - 1 - (vals[0] ?? 0);
    onFrameChange(Math.max(0, Math.min(totalFrames - 1, inverted)));
  }, [totalFrames, onFrameChange]);

  if (totalFrames <= 1) return null;

  const clampedFrame = Math.max(0, Math.min(totalFrames - 1, Number.isFinite(currentFrame) ? currentFrame : 0));
  const invertedValue = totalFrames - 1 - clampedFrame;

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
        value={[invertedValue]}
        onValueChange={handleValueChange}
        className="w-6 h-64 cursor-pointer"
      />
    </div>
  );
}, (prev, next) =>
  prev.currentFrame === next.currentFrame &&
  prev.totalFrames === next.totalFrames
);

FrameSlider.displayName = "FrameSlider";

// Loading overlay component
const LoadingOverlay = React.memo(({ progress }: { progress: number }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
    <div className="w-80 max-w-md">
      <div className="mb-4 text-center">
        <div className="text-white text-lg font-medium mb-2">
          Loading DICOM Images...
        </div>
        <div className="text-gray-400 text-sm">
          {progress}% Complete
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="w-full h-full bg-linear-to-r from-blue-400 to-blue-600 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
));

LoadingOverlay.displayName = "LoadingOverlay";

// AI Diagnosis loading overlay
const AIDiagnosisOverlay = React.memo(() => (
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
));

AIDiagnosisOverlay.displayName = "AIDiagnosisOverlay";

// Empty state component
const EmptyState = React.memo(() => (
  <div className="w-full h-full bg-black flex items-center justify-center">
    <div className="text-center text-slate-400">
      <ImageOff className="h-16 w-16 mx-auto mb-4 text-slate-500" />
      <div className="text-lg mb-2">No Series Selected</div>
      <div className="text-sm">
        Please select a series from the sidebar
      </div>
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

// Frame counter component
const FrameCounter = React.memo(({ current, total }: { current: number; total: number }) => (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium z-50">
    {current + 1} / {total}
  </div>
));

FrameCounter.displayName = "FrameCounter";

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
  const viewportIndex = useMemo(() =>
    viewportId ? parseInt(viewportId) : 0,
    [viewportId]
  );

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
    getImageIdToInstanceMap,
    state,
  } = useViewer();

  // Refs
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const toolManagerRef = useRef<any>(null);

  const searchParams = useSearchParams();
  const studyId = searchParams.get("study");

  // Memoized viewport data
  const viewportState = useMemo(
    () => getViewportState(viewportIndex),
    [getViewportState, viewportIndex]
  );

  const viewport = useMemo(
    () => getStackViewport(viewportIndex),
    [getStackViewport, viewportIndex]
  );

  const resolvedViewportId = useMemo(
    () => getViewportId(viewportIndex),
    [getViewportId, viewportIndex]
  );

  const resolvedRenderingEngineId = useMemo(
    () => getRenderingEngineId(viewportIndex),
    [getRenderingEngineId, viewportIndex]
  );

  // Mutation hooks (must be declared before refs that use them)
  const [diagnosisImageByAI] = useDiagnosisImageByAIMutation();
  const [segmentWithBBox] = useSegmentWithBBoxMutation();
  const { publish } = useViewerEvents();

  // Stable refs for event handlers
  const viewportIdRef = useRef(resolvedViewportId);
  const viewportRef = useRef(viewport);
  const disposeViewportRef = useRef(disposeViewport);
  const loadSeriesRef = useRef(loadSeriesIntoViewport);
  const diagnosisImageByAIRef = useRef(diagnosisImageByAI);
  const segmentWithBBoxRef = useRef(segmentWithBBox);

  // Update all refs in a single effect
  useEffect(() => {
    viewportIdRef.current = resolvedViewportId;
    viewportRef.current = viewport;
    disposeViewportRef.current = disposeViewport;
    loadSeriesRef.current = loadSeriesIntoViewport;
    diagnosisImageByAIRef.current = diagnosisImageByAI;
    segmentWithBBoxRef.current = segmentWithBBox;
  }, [resolvedViewportId, viewport, disposeViewport, loadSeriesIntoViewport, diagnosisImageByAI, segmentWithBBox]);

  const {
    isLoading,
    loadingProgress,
    viewportReady,
    currentFrame,
    totalFrames,
  } = viewportState;

  // Local state
  const [elementReady, setElementReady] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [predictions, setPredictions] = useState<PredictionMetadata[]>([]);
  const [aiImageMetadata, setAiImageMetadata] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [analyzedImageId, setAnalyzedImageId] = useState<string>("");
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);
  const [isAISegmenting, setIsAISegmenting] = useState(false);

  // Helper to check viewport match
  const isCurrentViewport = useCallback((targetViewportId?: string) => {
    return !targetViewportId || targetViewportId === viewportIdRef.current;
  }, []);

  // Event dispatchers
  const dispatchClearAnnotations = useCallback(() => {
    publish(ViewerEvents.CLEAR_VIEWPORT_ANNOTATIONS, {
      activeViewportId: viewportIdRef.current,
    });
  }, [publish]);

  const dispatchResetView = useCallback(() => {
    publish(ViewerEvents.RESET_VIEW);
  }, [publish]);

  // Viewport transform handlers
  const handleRotateViewport = useCallback(
    (data: { viewportId?: string; degrees: number }) => {
      if (!isCurrentViewport(data.viewportId)) return;
      toolManagerRef.current?.getToolHandlers?.()?.rotateViewport?.(data.degrees);
    },
    [isCurrentViewport]
  );

  const handleResetView = useCallback(() => {
    toolManagerRef.current?.getToolHandlers?.()?.resetView?.();
  }, []);

  const handleInvertColorMap = useCallback(() => {
    toolManagerRef.current?.getToolHandlers?.()?.invertColorMap?.();
  }, []);

  const handleRefresh = useCallback(() => {
    void refreshViewport(viewportIndex);
  }, [refreshViewport, viewportIndex]);

  // Annotation handlers
  const handleClearAnnotations = useCallback(() => {
    toolManagerRef.current?.getToolHandlers?.()?.clearAnnotations?.();
  }, []);

  const handleClearViewportAnnotations = useCallback(
    (data?: { activeViewportId?: string }) => {
      if (!isCurrentViewport(data?.activeViewportId)) return;
      toolManagerRef.current?.getToolHandlers?.()?.clearViewportAnnotations?.();
    },
    [isCurrentViewport]
  );

  const handleUndoAnnotation = useCallback(
    (data?: { activeViewportId?: string; entry?: AnnotationHistoryEntry }) => {
      if (!isCurrentViewport(data?.activeViewportId)) return;
      toolManagerRef.current?.getToolHandlers?.()?.undoAnnotation?.(data?.entry);
    },
    [isCurrentViewport]
  );

  const handleRedoAnnotation = useCallback(
    (data?: { activeViewportId?: string; entry?: AnnotationHistoryEntry }) => {
      if (!isCurrentViewport(data?.activeViewportId)) return;
      toolManagerRef.current?.getToolHandlers?.()?.redoAnnotation?.(data?.entry);
    },
    [isCurrentViewport]
  );

  const handleUndoSegmentation = useCallback(
    (data?: { activeViewportId?: string; entry?: SegmentationHistoryEntry }) => {
      if (!isCurrentViewport(data?.activeViewportId)) return;
      toolManagerRef.current?.getToolHandlers?.()?.undoSegmentation?.(data?.entry);
    },
    [isCurrentViewport]
  );

  const handleRedoSegmentation = useCallback(
    (data?: { activeViewportId?: string; entry?: SegmentationHistoryEntry }) => {
      if (!isCurrentViewport(data?.activeViewportId)) return;
      toolManagerRef.current?.getToolHandlers?.()?.redoSegmentation?.(data?.entry);
    },
    [isCurrentViewport]
  );

  // AI Diagnosis handler
  const handleAIDiagnosis = useCallback(
    async (data: any) => {
      const { viewportId, modelId, modelName, versionName } = data || {};

      if (!isCurrentViewport(viewportId) || !viewportIdRef.current) return;

      const currentElement = elementRef.current;
      // Get viewport directly from context instead of potentially stale ref
      const currentViewport = getStackViewport(viewportIndex) || viewportRef.current;
      if (!currentElement || !currentViewport) {
        console.log("[ViewPortMain] Skipping AI Diagnosis - no element/viewport");
        return;
      }

      const studyIdToUse = selectedSeries?.studyId || studyId;

      setIsDiagnosing(true);
      publish("ai:diagnosis:start", { viewportId: viewportIdRef.current });
      
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
        
        const { predictions, image } = response.data;
        const analysisId = response?.data?.analysisId || null;
        const aiAnalyzeMessage = response?.data?.aiAnalyzeMessage || "";
        
        
        setLastAnalysisId(analysisId);
        
        // Handle case when no predictions found
        if (
          !predictions ||
          !Array.isArray(predictions) ||
          predictions.length === 0
        ) {
          publish("ai:diagnosis:success", { 
            analysisId, 
            viewportId: viewportIdRef.current,
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
        
        setAiImageMetadata({ width: image.width, height: image.height });
        setAnalyzedImageId(currentImageId);

        drawAIPredictions(
          predictions,
          viewportIdRef.current,
          currentImageId,
          resolvedRenderingEngineId as string,
          image.width,
          image.height,
        );

        batchedRender(currentViewport);
        
        
        publish("ai:diagnosis:success", { 
          analysisId, 
          viewportId: viewportIdRef.current,
          studyId: studyIdToUse,
          predictions: predictions,
          aiAnalyzeMessage: aiAnalyzeMessage
        });
        
        toast.success(`AI diagnosis completed. Found ${predictions.length} detection(s).`);
      } catch (error: any) {
        console.error("AI diagnosis failed:", error);
        const errorMessage = error?.message || "AI diagnosis failed. Please try again.";
        toast.error(errorMessage);
        publish("ai:diagnosis:error", { error, viewportId: viewportIdRef.current });
      } finally {
        setIsDiagnosing(false);
      }
    },
    [isCurrentViewport,resolvedRenderingEngineId, studyId, selectedSeries, publish]
  );

  const handleClearAIAnnotations = useCallback(
    (data: { viewportId?: string }) => {
      if (!isCurrentViewport(data.viewportId) || !viewportIdRef.current) return;

      clearAIAnnotationsUtil(viewportIdRef.current);
      setPredictions([]);
      setAiImageMetadata(null);
      setAnalyzedImageId("");

      batchedRender(viewportRef.current);
    },
    [isCurrentViewport]
  );

  // AI Segmentation handler
  const handleAISegmentation = useCallback(
    async (data: {
      viewportId?: string;
      bbox: [number, number, number, number];
      imageIds: string[];
      currentImageIndex: number;
    }) => {
      console.log("[ViewPortMain] handleAISegmentation called:", {
        receivedViewportId: data?.viewportId,
        currentViewportId: viewportIdRef.current,
        isCurrentViewport: isCurrentViewport(data?.viewportId),
        hasElement: !!elementRef.current,
        hasViewport: !!viewportRef.current,
        bbox: data?.bbox,
        imageIdsCount: data?.imageIds?.length,
        currentImageIndex: data?.currentImageIndex,
      });

      const { viewportId, bbox, imageIds, currentImageIndex } = data || {};


      if (!isCurrentViewport(viewportId) || !viewportIdRef.current) {
        console.log("[ViewPortMain] Skipping AI Segmentation - wrong viewport");
        return;
      }

      const currentElement = elementRef.current;
      // Get viewport directly from context instead of potentially stale ref
      const currentViewport = getStackViewport(viewportIndex) || viewportRef.current;
      
      console.log("[ViewPortMain] AI Segmentation viewport check:", {
        hasElement: !!currentElement,
        hasViewportFromContext: !!getStackViewport(viewportIndex),
        hasViewportFromRef: !!viewportRef.current,
        usingViewport: !!currentViewport,
      });
      
      if (!currentElement || !currentViewport) {
        console.log("[ViewPortMain] Skipping AI Segmentation - no element/viewport");
        return;
      }

      publish(ViewerEvents.AI_SEGMENTATION_START, { viewportId: viewportIdRef.current });
      setIsAISegmenting(true);

      try {

        const base64Image = getCanvasAsBase64(currentElement);
        if (!base64Image) throw new Error("Failed to capture viewport image");

        // Get current image info
        const currentImageId = imageIds[currentImageIndex];
        const imageIdToInstanceMap = getImageIdToInstanceMap(viewportIndex);
        const instanceId = imageIdToInstanceMap[currentImageId] || "";
        const frameNumber = currentImageIndex + 1;

        console.log("[ViewPortMain] AI Segmentation:", {
          viewportId: viewportIdRef.current,
          frameNumber,
          instanceId,
          bboxLength: bbox.length,
          base64ImageLength: base64Image.length,
        });

        await ensureViewportLabelmapSegmentation({
          viewportId: viewportIdRef.current,
          imageIds,
          imageIdToInstanceMap,
        });

        // 4. Get the labelmap buffer to determine dimensions
        const labelmapImageId = `labelmap:${viewportIdRef.current}:${frameNumber}`;
        const labelmapImage = cache.getImage(labelmapImageId);

        if (!labelmapImage) {
          throw new Error(`Labelmap image not found: ${labelmapImageId}`);
        }

        const labelmapPixels =
          typeof labelmapImage.getPixelData === "function"
            ? labelmapImage.getPixelData()
            : (labelmapImage as { pixelData?: Uint8Array }).pixelData;

        if (!labelmapPixels) {
          throw new Error("Failed to get labelmap pixel data");
        }

        const targetWidth = labelmapImage.width;
        const targetHeight = labelmapImage.height;

        const worldTopLeft: Types.Point3 = [bbox[0], bbox[1], 0];
        const worldBottomRight: Types.Point3 = [bbox[2], bbox[3], 0];
        
        const canvasTopLeft = (currentViewport as Types.IStackViewport).worldToCanvas(worldTopLeft);
        const canvasBottomRight = (currentViewport as Types.IStackViewport).worldToCanvas(worldBottomRight);
        
        const rect = currentElement.getBoundingClientRect();
        const canvasClientWidth = rect.width;
        const canvasClientHeight = rect.height;

        const clientToImageScaleX = targetWidth / canvasClientWidth;
        const clientToImageScaleY = targetHeight / canvasClientHeight;
        
        const pixelBbox: [number, number, number, number] = [
          Math.max(0, Math.min(targetWidth, canvasTopLeft[0] * clientToImageScaleX)),
          Math.max(0, Math.min(targetHeight, canvasTopLeft[1] * clientToImageScaleY)),
          Math.max(0, Math.min(targetWidth, canvasBottomRight[0] * clientToImageScaleX)),
          Math.max(0, Math.min(targetHeight, canvasBottomRight[1] * clientToImageScaleY)),
        ];

        console.log("[ViewPortMain] BBox coordinate conversion:", {
          worldBbox: bbox,
          canvasTopLeft,
          canvasBottomRight,
          clientDisplaySize: { w: canvasClientWidth, h: canvasClientHeight },
          imageSize: { w: targetWidth, h: targetHeight },
          clientToImageScaleX,
          clientToImageScaleY,
          pixelBbox,
        });

        toast.info("Processing AI segmentation...");

        console.log("[ViewPortMain] About to call segmentWithBBox API:", {
          imageUrlLength: base64Image.length,
          bbox: pixelBbox,
          frameNumber,
          instanceId,
          hasSegmentWithBBoxRef: !!segmentWithBBoxRef.current,
        });


        const result = await segmentWithBBoxRef.current?.({
          imageUrl: base64Image,
          bbox: pixelBbox,
          frameNumber,
          instanceId,
        }).unwrap();

        if (!result) {
          throw new Error("No result from AI segmentation API");
        }

        // Get display dimensions for coordinate transformation understanding
        const displayRect = currentElement.getBoundingClientRect();
        
        console.log("[ViewPortMain] AI Segmentation coordinate analysis:", {
          displaySize: { w: displayRect.width, h: displayRect.height },
          aiMaskSize: { w: result.width, h: result.height },
          labelmapSize: { w: targetWidth, h: targetHeight },
          isCompressed: result.isCompressed,
        });


        let aiPixelData: Uint8Array;
        if (result.isCompressed) {
          const binaryString = atob(result.pixelData);
          const compressedBytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            compressedBytes[i] = binaryString.charCodeAt(i);
          }
          aiPixelData = pako.inflate(compressedBytes);
        } else {
          const binaryString = atob(result.pixelData);
          aiPixelData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            aiPixelData[i] = binaryString.charCodeAt(i);
          }
        }
        
        const displayWidth = displayRect.width;
        const displayHeight = displayRect.height;
        const aiWidth = result.width;
        const aiHeight = result.height;
        
        const imageAspect = targetWidth / targetHeight;
        const displayAspect = displayWidth / displayHeight;
        
        let renderWidth: number, renderHeight: number;
        let offsetX: number, offsetY: number;
        
        if (displayAspect > imageAspect) {
          
          renderHeight = displayHeight;
          renderWidth = displayHeight * imageAspect;
          offsetX = (displayWidth - renderWidth) / 2;
          offsetY = 0;
        } else {
          renderWidth = displayWidth;
          renderHeight = displayWidth / imageAspect;
          offsetX = 0;
          offsetY = (displayHeight - renderHeight) / 2;
        }
        
        console.log("[ViewPortMain] Coordinate mapping:", {
          imageAspect,
          displayAspect,
          renderArea: { w: renderWidth, h: renderHeight },
          offset: { x: offsetX, y: offsetY },
        });
        
        let resizedPixelData = new Uint8Array(targetWidth * targetHeight);
  
        const scaleX = targetWidth / renderWidth;
        const scaleY = targetHeight / renderHeight;
        
        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const displayX = (x / scaleX) + offsetX;
            const displayY = (y / scaleY) + offsetY;
            
            const aiX = Math.floor(displayX * (aiWidth / displayWidth));
            const aiY = Math.floor(displayY * (aiHeight / displayHeight));
            
            if (aiX >= 0 && aiX < aiWidth && aiY >= 0 && aiY < aiHeight) {
              const srcIndex = aiY * aiWidth + aiX;
              const dstIndex = y * targetWidth + x;
              resizedPixelData[dstIndex] = aiPixelData[srcIndex] > 0 ? 1 : 0;
            }
          }
        }

        if (resizedPixelData.length !== labelmapPixels.length) {
          throw new Error(`Size mismatch: ${resizedPixelData.length} vs ${labelmapPixels.length}`);
        }

        labelmapPixels.set(resizedPixelData);

        const segmentationId = segmentationIdForViewport(viewportIdRef.current);
        eventTarget.dispatchEvent(
          new CustomEvent(ToolEnums.Events.SEGMENTATION_DATA_MODIFIED, {
            detail: {
              segmentationId,
              modifiedSlicesToUse: [labelmapImageId],
              reason: "medsam2-ai-segmentation",
            },
          })
        );

        const snapshot = captureSegmentationSnapshot(
          segmentationId,
          viewportIdRef.current,
          imageIdToInstanceMap
        );

        if (snapshot && state.selectedSegmentationLayer) {
          console.log("[ViewPortMain] AI Segmentation snapshot captured:", {
            segmentationId: snapshot.segmentationId,
            capturedAt: snapshot.capturedAt,
            imageDataCount: snapshot.imageData.length,
            firstImageData: snapshot.imageData[0] ? {
              imageId: snapshot.imageData[0].imageId,
              originalImageId: snapshot.imageData[0].originalImageId,
              frameNumber: snapshot.imageData[0].frameNumber,
              instanceId: snapshot.imageData[0].instanceId,
              pixelDataLength: snapshot.imageData[0].pixelData?.length,
              hasNonZeroPixels: Array.from(snapshot.imageData[0].pixelData || []).some(p => p > 0),
            } : null,
          });

          publish(ViewerEvents.AI_SEGMENTATION_SUCCESS, {
            viewportId: viewportIdRef.current,
            snapshot,
            layerId: state.selectedSegmentationLayer,
          });
        }

        batchedRender(currentViewport);
        toast.success("AI segmentation completed!");
        setIsAISegmenting(false);

      } catch (error: any) {
        const errorMessage = error?.message || "AI segmentation failed";
        console.error("[ViewPortMain] AI Segmentation error:", error);
        toast.error(errorMessage);
        publish(ViewerEvents.AI_SEGMENTATION_ERROR, { 
          error, 
          viewportId: viewportIdRef.current 
        });
        setIsAISegmenting(false);
      }
    },
    [isCurrentViewport, viewportIndex, getImageIdToInstanceMap, getStackViewport, state.selectedSegmentationLayer, publish]
  );

  // Annotation visibility handler
  const handleToggleAnnotations = useCallback(
    (data: { showAnnotations?: boolean }) => {
      const currentElement = elementRef.current;
      const currentViewport = viewportRef.current;
      if (!currentElement || !currentViewport) return;

      try {
        const svgElements = currentElement.querySelectorAll("svg");
        const shouldHide = data.showAnnotations === false;

        svgElements.forEach((svg) => {
          const hasAnnotationElements =
            svg.querySelector("g[data-tool-name]") ||
            svg.querySelector("g[data-annotation-uid]") ||
            svg.classList.contains("annotation-svg");

          if (hasAnnotationElements) {
            svg.style.display = shouldHide ? "none" : "";
            svg.classList.toggle("annotations-hidden", shouldHide);
          }
        });

        const annotationCanvas = currentElement.querySelector("canvas.annotation-canvas");
        if (annotationCanvas) {
          (annotationCanvas as HTMLElement).style.display = shouldHide ? "none" : "";
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
    (data: { annotationId: string; annotationUID?: string; annotationType?: string; instanceId?: string }) => {
      if (data.annotationId) {
        toolManagerRef.current?.getToolHandlers?.()?.selectAnnotation?.(data);
      }
    },
    []
  );

  const handleDeselectAnnotation = useCallback(() => {
    toolManagerRef.current?.getToolHandlers?.()?.deselectAnnotation?.();
  }, []);

  const handleUpdateAnnotationColor = useCallback(
    (data: { annotationId: string; annotationUID?: string; colorCode: string; instanceId?: string }) => {
      if (data.annotationId && data.colorCode) {
        toolManagerRef.current?.getToolHandlers?.()?.updateAnnotationColor?.(data);
      }
    },
    []
  );

  const handleLockAnnotation = useCallback(
    (data: { annotationId: string; annotationUID?: string; locked: boolean; instanceId?: string }) => {
      if (data.annotationId) {
        toolManagerRef.current?.getToolHandlers?.()?.lockAnnotation?.(data);
      }
    },
    []
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (totalFrames <= 1 && !["Delete", "Backspace", "r", "R"].includes(event.key)) {
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
    [totalFrames, dispatchClearAnnotations, dispatchResetView, nextFrame, prevFrame, viewportIndex]
  );

  // Viewport element ref callback
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

  // Load series effect
  useEffect(() => {
    if (!elementReady || !selectedSeries) {
      if (!selectedSeries) {
        disposeViewportRef.current(viewportIndex);
      }
      return;
    }

    // Skip if already loading or loaded the same series
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

  // Keyboard event listener
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !viewportReady) return;

    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewportReady, handleKeyDown]);

  // Subscribe to viewer events
  useViewerEvent(ViewerEvents.ROTATE_VIEWPORT, handleRotateViewport, [handleRotateViewport]);
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
  useViewerEvent(ViewerEvents.AI_SEGMENT_VIEWPORT, handleAISegmentation, [handleAISegmentation]);
  useViewerEvent(ViewerEvents.CLEAR_AI_ANNOTATIONS, handleClearAIAnnotations, [handleClearAIAnnotations]);
  useViewerEvent(ViewerEvents.TOGGLE_ANNOTATIONS, handleToggleAnnotations, [handleToggleAnnotations]);
  useViewerEvent(ViewerEvents.SELECT_ANNOTATION, handleSelectAnnotation, [handleSelectAnnotation]);
  useViewerEvent(ViewerEvents.DESELECT_ANNOTATION, handleDeselectAnnotation, [handleDeselectAnnotation]);
  useViewerEvent(ViewerEvents.UPDATE_ANNOTATION_COLOR, handleUpdateAnnotationColor, [handleUpdateAnnotationColor]);
  useViewerEvent(ViewerEvents.LOCK_ANNOTATION, handleLockAnnotation, [handleLockAnnotation]);

  // Derived state
  const showNavigationOverlay = useMemo(
    () => totalFrames > 1 && !isLoading,
    [isLoading, totalFrames]
  );

  const showAIOverlay = useMemo(
    () => predictions.length > 0 && !isDiagnosing && aiImageMetadata,
    [predictions.length, isDiagnosing, aiImageMetadata]
  );

  if (Number.isNaN(viewportIndex)) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
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

            {showAIOverlay && (
              <AILabelOverlay
                viewportId={resolvedViewportId as string}
                renderingEngineId={resolvedRenderingEngineId as string}
                predictions={predictions}
                aiImageWidth={aiImageMetadata!.width}
                aiImageHeight={aiImageMetadata!.height}
                targetImageId={analyzedImageId}
              />
            )}

            {(isLoading ) && <LoadingOverlay progress={loadingProgress} />}
            {(isDiagnosing || isAISegmenting) && <AIDiagnosisOverlay />}

            {showNavigationOverlay && (
              <>
                <FrameSlider
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  onFrameChange={(frame: number) => goToFrame(viewportIndex, frame)}
                  sliderRef={sliderRef}
                />
                <FrameCounter current={currentFrame} total={totalFrames} />
              </>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default React.memo(ViewPortMain);