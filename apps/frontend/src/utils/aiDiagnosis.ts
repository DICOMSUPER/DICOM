import { getEnabledElement } from "@cornerstonejs/core";
import { annotation, Enums as ToolEnums } from "@cornerstonejs/tools";
import type { Annotation } from "@cornerstonejs/tools/types";
import { PredictionMetadata } from "@/interfaces/system/ai-result.interface";

/**
 * Get canvas from viewport element and convert to base64
 */
export const getCanvasAsBase64 = (
  viewportElement: HTMLDivElement
): string | null => {
  try {
    const enabledElement = getEnabledElement(viewportElement);
    if (!enabledElement) {
      console.error("Enabled element not found");
      return null;
    }

    const { viewport } = enabledElement;
    const canvas = viewport.canvas;

    if (!canvas) {
      console.error("Canvas not found in viewport");
      return null;
    }

    // Convert canvas to base64 (JPEG format, 95% quality)
    const base64 = canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
    return base64;
  } catch (error) {
    console.error("Error converting canvas to base64:", error);
    return null;
  }
};

/**
 * Color mapping for different AI prediction classes
 */
const AI_CLASS_COLORS: Record<string, string> = {
  effusion: "#FF6B6B", // Red
  noeffusion: "#51CF66", // Green
  pneumothorax: "#FFD93D", // Yellow
  normal: "#4ECDC4", // Cyan
  fracture: "#FF8C42", // Orange
  mass: "#9D4EDD", // Purple
  nodule: "#F72585", // Pink
  default: "#748FFC", // Blue
};

/**
 * Get color for AI prediction class
 */
export const getColorForClass = (className: string): string => {
  const normalizedClass = className.toLowerCase().trim();
  return AI_CLASS_COLORS[normalizedClass] || AI_CLASS_COLORS["default"];
};

/**
 * Add AI prediction as Cornerstone annotation
 */
export const addAIPredictionAnnotation = (
  prediction: PredictionMetadata,
  viewportId: string,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void => {
  try {
    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;
    const color = getColorForClass(prediction.class);

    // Create unique annotation UID
    const annotationUID = `ai-${
      prediction.detection_id || Date.now()
    }-${Math.random().toString(36).substr(2, 9)}`;

    if (prediction.points && prediction.points.length > 0) {
      // Draw polygon segmentation
      const scaledPoints = prediction.points.map((p) => [
        p.x * scaleX,
        p.y * scaleY,
        0,
      ]) as [number, number, number][];

      const polygonAnnotation: Annotation = {
        annotationUID,
        highlighted: false,
        invalidated: false,
        isLocked: true,
        metadata: {
          toolName: "PlanarFreehandROI",
          viewportId,
          FrameOfReferenceUID: viewportId,
        },
        data: {
          handles: {
            points: scaledPoints,
            activeHandleIndex: null,
            textBox: {
              hasMoved: false,
              worldPosition: [0, 0, 0],
              worldBoundingBox: {
                topLeft: [0, 0, 0],
                topRight: [0, 0, 0],
                bottomLeft: [0, 0, 0],
                bottomRight: [0, 0, 0],
              },
            },
          },
          label: `AI: ${prediction.class} (${(
            prediction.confidence * 100
          ).toFixed(1)}%)`,
          cachedStats: {},
        },
      } as Annotation;

      annotation.state.addAnnotation(polygonAnnotation, viewportId);

      // Set style
      annotation.config.style.setAnnotationStyles(annotationUID, {
        color,
        lineWidth: 2,
        fillOpacity: 0.2,
      });

      console.log(
        "✅ Added AI polygon annotation:",
        prediction.class,
        "with",
        prediction.points.length,
        "points"
      );
    } else {
      // Draw bounding box
      const x1 = (prediction.x - prediction.width / 2) * scaleX;
      const y1 = (prediction.y - prediction.height / 2) * scaleY;
      const x2 = (prediction.x + prediction.width / 2) * scaleX;
      const y2 = (prediction.y + prediction.height / 2) * scaleY;

      const rectangleAnnotation: Annotation = {
        annotationUID,
        highlighted: false,
        invalidated: false,
        isLocked: true,
        metadata: {
          toolName: 'RectangleROI',
          viewportId,
          FrameOfReferenceUID: viewportId,
        },
        data: {
          handles: {
            points: [
              [x1, y1, 0],
              [x2, y1, 0],
              [x2, y2, 0],
              [x1, y2, 0],
            ] as [number, number, number][],
            activeHandleIndex: null,
            textBox: {
              hasMoved: false,
              worldPosition: [0, 0, 0],
              worldBoundingBox: {
                topLeft: [0, 0, 0],
                topRight: [0, 0, 0],
                bottomLeft: [0, 0, 0],
                bottomRight: [0, 0, 0],
              },
            },
          },
          label: `AI: ${prediction.class} (${(prediction.confidence * 100).toFixed(1)}%)`,
          cachedStats: {},
        },
      } as Annotation;

      annotation.state.addAnnotation(rectangleAnnotation, viewportId);
      
      annotation.config.style.setAnnotationStyles(annotationUID, {
        color,
        lineWidth: 2,
      });

      console.log("✅ Added AI rectangle annotation:", prediction.class);
    }
  } catch (error) {
    console.error("❌ Error adding AI prediction annotation:", error);
  }
};

/**
 * Clear all AI annotations from viewport
 */
export const clearAIAnnotations = (viewportId: string): void => {
  try {
    const frameOfReferenceUID = viewportId;
    const toolGroup =
      annotation.state.getAnnotations(
        frameOfReferenceUID,
        "PlanarFreehandROI"
      ) || [];
    const rectangleAnnotations =
      annotation.state.getAnnotations(frameOfReferenceUID, "RectangleROI") ||
      [];

    const allAnnotations = [...toolGroup, ...rectangleAnnotations];

    if (allAnnotations.length === 0) {
      console.log("No annotations found for viewport:", viewportId);
      return;
    }

    let removedCount = 0;
    allAnnotations.forEach((ann) => {
      if (ann.annotationUID?.startsWith("ai-")) {
        annotation.state.removeAnnotation(ann.annotationUID);
        removedCount++;
      }
    });

    console.log(
      `🗑️ Cleared ${removedCount} AI annotations from viewport:`,
      viewportId
    );
  } catch (error) {
    console.error("❌ Error clearing AI annotations:", error);
  }
};

/**
 * Draw multiple AI predictions as annotations
 */
export const drawAIPredictions = (
  predictions: PredictionMetadata[],
  viewportId: string,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void => {
  console.log(
    "🎨 Drawing",
    predictions.length,
    "AI predictions for viewport:",
    viewportId
  );

  // Clear existing AI annotations first
  clearAIAnnotations(viewportId);

  // Add each prediction
  predictions.forEach((prediction, index) => {
    console.log(
      `Drawing prediction ${index + 1}/${predictions.length}:`,
      prediction.class,
      "confidence:",
      prediction.confidence
    );
    addAIPredictionAnnotation(
      prediction,
      viewportId,
      imageWidth,
      imageHeight,
      canvasWidth,
      canvasHeight
    );
  });

  console.log("✅ Finished drawing AI predictions");
};