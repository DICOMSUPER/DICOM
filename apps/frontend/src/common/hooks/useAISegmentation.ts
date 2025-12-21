"use client";

import { eventTarget, type Types } from "@cornerstonejs/core";
import { annotation, Enums as ToolEnums, RectangleROITool } from "@cornerstonejs/tools";
import { useCallback, useEffect, useRef, useState } from "react";

import { useViewer } from "@/common/contexts/ViewerContext";
import {
  useViewerEvents,
  ViewerEvents,
} from "@/common/contexts/ViewerEventContext";
import { type SegmentationSnapshot } from "@/common/contexts/viewer-context/segmentation-helper";
import { toast } from "sonner";

export interface AISegmentationState {
  isLoading: boolean;
  error: string | null;
  lastResult: SegmentationSnapshot | null;
  isAISegmentationMode: boolean;
}

/**
 * Hook to orchestrate AI segmentation using MedSAM2 with RectangleROI bbox input.
 * Workflow:
 * 1. User clicks "Segment with AI" button → startAISegmentationMode()
 * 2. RectangleROI tool is enabled
 * 3. User draws bbox on viewport
 * 4. When annotation is completed → publish AI_SEGMENT_VIEWPORT event
 * 5. ViewPortMain handles the event, processes segmentation, and publishes AI_SEGMENTATION_SUCCESS
 * 6. This hook listens for success event and saves the snapshot to the layer
 */
export function useAISegmentation() {
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] =
    useState<SegmentationSnapshot | null>(null);
  const [isAISegmentationMode, setIsAISegmentationMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { state, setActiveTool, saveSegmentationSnapshot } = useViewer();
  const { publish, subscribe } = useViewerEvents();

  // Refs to track current viewport info for the annotation listener
  const viewportInfoRef = useRef<{
    viewportId: string;
    viewportElement: HTMLDivElement;
    imageIds: string[];
    imageIdToInstanceMap: Record<string, string>;
    currentImageIndex: number;
  } | null>(null);

  const previousToolRef = useRef<string | null>(null);
  const handleAnnotationCompleted = useCallback(
    async (evt: any) => {
      console.log("[useAISegmentation] ANNOTATION_COMPLETED event received:", {
        isAISegmentationMode,
        isProcessing,
        toolName: evt?.detail?.annotation?.metadata?.toolName,
        hasViewportInfo: !!viewportInfoRef.current,
      });

      // Only process if in AI segmentation mode
      if (!isAISegmentationMode || isProcessing) {
        console.log("[useAISegmentation] Skipping - not in AI mode or processing");
        return;
      }

      const { annotation: completedAnnotation } = evt.detail || {};

      // Check if this is a RectangleROI annotation
      if (
        completedAnnotation?.metadata?.toolName !== RectangleROITool.toolName
      ) {
        console.log("[useAISegmentation] Skipping - not RectangleROI tool:", completedAnnotation?.metadata?.toolName);
        return;
      }

      // Get viewport info from ref
      const viewportInfo = viewportInfoRef.current;
      if (!viewportInfo) {
        console.warn("[useAISegmentation] No viewport info available");
        return;
      }

      // Get bbox from the completed annotation
      const handles = completedAnnotation.data?.handles?.points as
        | Types.Point3[]
        | undefined;
      if (!handles || handles.length < 4) {
        console.warn("[useAISegmentation] Invalid annotation handles");
        return;
      }

      const [topLeft, topRight, bottomRight, bottomLeft] = handles;
      const x_min = Math.min(topLeft[0], bottomLeft[0]);
      const y_min = Math.min(topLeft[1], topRight[1]);
      const x_max = Math.max(topRight[0], bottomRight[0]);
      const y_max = Math.max(bottomLeft[1], bottomRight[1]);

      setIsProcessing(true);

      // Remove the RectangleROI annotation
      if (completedAnnotation.annotationUID) {
        annotation.state.removeAnnotation(completedAnnotation.annotationUID);
      }

      // Publish AI_SEGMENT_VIEWPORT event - ViewPortMain will handle it
      publish(ViewerEvents.AI_SEGMENT_VIEWPORT, {
        viewportId: viewportInfo.viewportId,
        bbox: [x_min, y_min, x_max, y_max] as [number, number, number, number],
        imageIds: viewportInfo.imageIds,
        currentImageIndex: viewportInfo.currentImageIndex,
      });

      // Exit AI segmentation mode and restore previous tool
      setIsAISegmentationMode(false);
      if (previousToolRef.current) {
        setActiveTool(previousToolRef.current as any);
      }
    },
    [isAISegmentationMode, isProcessing, publish, setActiveTool]
  );

  // Subscribe to annotation completed events
  useEffect(() => {
    if (!isAISegmentationMode) {
      return;
    }

    const eventHandler = handleAnnotationCompleted as EventListener;
    eventTarget.addEventListener(
      ToolEnums.Events.ANNOTATION_COMPLETED,
      eventHandler
    );

    return () => {
      eventTarget.removeEventListener(
        ToolEnums.Events.ANNOTATION_COMPLETED,
        eventHandler
      );
    };
  }, [isAISegmentationMode, handleAnnotationCompleted]);

  // Subscribe to AI segmentation success event
  useEffect(() => {
    const unsubscribeSuccess = subscribe(
      ViewerEvents.AI_SEGMENTATION_SUCCESS,
      (data: { viewportId: string; snapshot: SegmentationSnapshot; layerId: string }) => {
        setIsProcessing(false);
        setLastResult(data.snapshot);
        setError(null);

        // Save snapshot to the layer
        if (data.layerId && data.snapshot) {
          saveSegmentationSnapshot(data.layerId, data.snapshot);
          
          // Log for verification - this should match database save format
          console.log("[useAISegmentation] AI Segmentation saved to layer:", {
            layerId: data.layerId,
            snapshot: {
              segmentationId: data.snapshot.segmentationId,
              capturedAt: data.snapshot.capturedAt,
              imageData: data.snapshot.imageData.map((img: any) => ({
                imageId: img.imageId,
                originalImageId: img.originalImageId,
                frameNumber: img.frameNumber,
                instanceId: img.instanceId,
                pixelDataLength: img.pixelData?.length,
                isCompressed: false, // Raw Uint8Array, will be compressed when saving to DB
              })),
            },
          });
        }
      }
    );

    const unsubscribeError = subscribe(
      ViewerEvents.AI_SEGMENTATION_ERROR,
      (data: { error: any; viewportId: string }) => {
        setIsProcessing(false);
        const errMsg = data.error?.message || "AI segmentation failed";
        setError(errMsg);
      }
    );

    const unsubscribeStart = subscribe(
      ViewerEvents.AI_SEGMENTATION_START,
      () => {
        setIsProcessing(true);
        setError(null);
      }
    );

    return () => {
      unsubscribeSuccess();
      unsubscribeError();
      unsubscribeStart();
    };
  }, [subscribe, saveSegmentationSnapshot]);

  const startAISegmentationMode = useCallback(
    (
      viewportElement: HTMLDivElement,
      viewportId: string,
      imageIds: string[],
      imageIdToInstanceMap: Record<string, string>,
      currentImageIndex: number
    ) => {
      // Verify layer is selected
      if (!state.selectedSegmentationLayer) {
        toast.error("Please select a segmentation layer first.");
        return false;
      }

      console.log("[useAISegmentation] Starting AI segmentation mode", {
        viewportId,
        currentImageIndex,
        imageIdsCount: imageIds.length,
        previousTool: state.activeTool,
      });

      // Store current tool to restore later
      previousToolRef.current = state.activeTool;

      // Store viewport info for the annotation listener
      viewportInfoRef.current = {
        viewportId,
        viewportElement,
        imageIds,
        imageIdToInstanceMap,
        currentImageIndex,
      };

      // Enable RectangleROI tool - this updates Redux state
      // CornerstoneToolManager will pick this up via selectedTool prop
      console.log("[useAISegmentation] Calling setActiveTool('RectangleROI')");
      setActiveTool("RectangleROI" as any);

      // Enter AI segmentation mode
      setIsAISegmentationMode(true);
      setError(null);

      toast.info(
        "Draw a bounding box around the area to segment, then release to process."
      );

      return true;
    },
    [state.selectedSegmentationLayer, state.activeTool, setActiveTool]
  );

  /**
   * Cancel AI segmentation mode
   */
  const cancelAISegmentationMode = useCallback(() => {
    setIsAISegmentationMode(false);
    viewportInfoRef.current = null;

    // Restore previous tool
    if (previousToolRef.current) {
      setActiveTool(previousToolRef.current as any);
    }

    toast.info("AI segmentation cancelled.");
  }, [setActiveTool]);

  /**
   * Get the first RectangleROI annotation from the current viewport.
   */
  const getRectangleROIBBox = useCallback(
    (
      viewportElement: HTMLDivElement
    ): {
      bbox: [number, number, number, number];
      annotationUID: string;
    } | null => {
      try {
        const rectangleAnnotations = annotation.state.getAnnotations(
          RectangleROITool.toolName,
          viewportElement
        );

        if (!rectangleAnnotations || rectangleAnnotations.length === 0) {
          return null;
        }

        const latestAnnotation =
          rectangleAnnotations[rectangleAnnotations.length - 1];
        const handles = latestAnnotation.data?.handles?.points as
          | Types.Point3[]
          | undefined;

        if (!handles || handles.length < 4) {
          return null;
        }

        const [topLeft, topRight, bottomRight, bottomLeft] = handles;
        const x_min = Math.min(topLeft[0], bottomLeft[0]);
        const y_min = Math.min(topLeft[1], topRight[1]);
        const x_max = Math.max(topRight[0], bottomRight[0]);
        const y_max = Math.max(bottomLeft[1], bottomRight[1]);

        return {
          bbox: [x_min, y_min, x_max, y_max],
          annotationUID: latestAnnotation.annotationUID || "",
        };
      } catch (err) {
        console.error(
          "[useAISegmentation] Error getting RectangleROI bbox:",
          err
        );
        return null;
      }
    },
    []
  );

  const hasRectangleROI = useCallback(
    (viewportElement: HTMLDivElement | null): boolean => {
      if (!viewportElement) return false;
      return getRectangleROIBBox(viewportElement) !== null;
    },
    [getRectangleROIBBox]
  );

  return {
    // State
    isLoading: isProcessing,
    error,
    lastResult,
    isAISegmentationMode,

    // Actions
    startAISegmentationMode,
    cancelAISegmentationMode,
    hasRectangleROI,
    getRectangleROIBBox,
  };
}
