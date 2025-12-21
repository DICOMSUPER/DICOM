import { PredictionMetadata } from "@/common/interfaces/system/ai-result.interface";
import {
  getEnabledElement,
  getRenderingEngine,
  type Types
} from "@cornerstonejs/core";
import {
  annotation,
  PlanarFreehandROITool,
  RectangleROITool,
  ToolGroupManager,
  utilities as toolsUtilities
} from "@cornerstonejs/tools";


import type { Annotation } from "@cornerstonejs/tools/types";

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

    const base64 = canvas.toDataURL("image/jpeg", 0.65).split(",")[1];
    return base64;
  } catch (error) {
    console.error("Error converting canvas to base64:", error);
    return null;
  }
};

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

export const getColorForClass = (className: string): string => {
  const normalizedClass = className.toLowerCase().trim();
  return AI_CLASS_COLORS[normalizedClass] || AI_CLASS_COLORS["default"];
};

export const clearAIAnnotations = (viewportId: string): void => {
  try {
    const allAnnotations = annotation.state.getAllAnnotations();

    let removedCount = 0;
    allAnnotations.forEach((ann) => {
      if (ann.annotationUID?.startsWith("ai-")) {
        annotation.state.removeAnnotation(ann.annotationUID);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      console.log(
        `Cleared ${removedCount} AI annotations from viewport:`,
        viewportId
      );
    } else {
      console.log("No AI annotations found for viewport:", viewportId);
    }
  } catch (error) {
    console.error("Error clearing AI annotations:", error);
  }
};

export const drawAIPredictions = (
  predictions: PredictionMetadata[],
  viewportId: string,
  referencedImageId: string,
  renderingEngineId: string,
  aiImageWidth: number,
  aiImageHeight: number,

): void => {


  try {
    const renderingEngine = getRenderingEngine(renderingEngineId);
    if (!renderingEngine) {
      console.error("Rendering engine not found:", renderingEngineId);
      return;
    }
    console.log("Rendering engine found");
    console.log("PlanerFreeTool", PlanarFreehandROITool.toolName);

    const viewport = renderingEngine.getViewport(
      viewportId
    ) as Types.IStackViewport;
    if (!viewport) {
      console.error("Viewport not found:", viewportId);
      return;
    }
    console.log("Viewport found");

    const currentImageId = viewport.getCurrentImageId();

    if (referencedImageId && currentImageId !== referencedImageId) {
      console.warn(
        "Người dùng đã cuộn sang ảnh khác! Annotation có thể bị lệch Z."
      );
      // Buộc viewport nhảy về ảnh cũ để vẽ đúng
      // viewport.setImageIdIndex(viewport.getImageIds().indexOf(inputImageId));
    }

    const element = viewport.element as HTMLDivElement;
    if (!element) {
      console.error(" Viewport element not found");
      return;
    }
    console.log("Element found:", element);


    const rect = element.getBoundingClientRect();
    const canvasClientWidth = rect.width;
    const canvasClientHeight = rect.height;

    const scaleX = canvasClientWidth / aiImageWidth;
    const scaleY = canvasClientHeight / aiImageHeight;

    console.log(
      `Scaling Canvas: AI(${aiImageWidth}) -> Client(${canvasClientWidth}). Ratio: ${scaleX}`
    );

    // Clear existing AI annotations
    clearAIAnnotations(viewportId);

    const toolGroups = ToolGroupManager.getAllToolGroups();
    const foundToolGroup = toolGroups.find((tg) =>
      tg.getViewportIds().includes(viewportId)
    );

    if (foundToolGroup) {
      if (!foundToolGroup.hasTool(PlanarFreehandROITool.toolName)) {
        foundToolGroup.addTool(PlanarFreehandROITool.toolName);

      }
      if (!foundToolGroup.hasTool(RectangleROITool.toolName)) {
        foundToolGroup.addTool(RectangleROITool.toolName);

      }

      foundToolGroup.setToolEnabled(PlanarFreehandROITool.toolName);
      foundToolGroup.setToolEnabled(RectangleROITool.toolName);

    } else {
      console.warn("Could not find ToolGroup for viewport", viewportId);
    }

    predictions.forEach((prediction, index) => {
      const color = getColorForClass(prediction.class);
      const annotationUID = `ai-${prediction.detection_id || Date.now()
        }-${Math.random().toString(36).substr(2, 9)}`;

      if (prediction.points && prediction.points.length > 0) {
        // const worldPoints: Types.Point3[] = prediction.points.map((p) => {
        //   const canvasPoint: Types.Point2 = [p.x, p.y];
        //   return viewport.canvasToWorld(canvasPoint);
        // });
        // const worldPoints: Types.Point3[] = prediction.points.map((p) => {
        //   // Vì aiImageWidth = canvasWidth và aiImageHeight = canvasHeight
        //   // AI coordinates chính là canvas pixel coordinates
        //   const worldPos = viewport.canvasToWorld([p.x, p.y] as Types.Point2);
        //   return [worldPos[0], worldPos[1], 0] as Types.Point3;
        // });
        const worldPoints: Types.Point3[] = prediction.points.map((p: any) => {
          // B1: Scale tọa độ AI về tọa độ màn hình hiện tại (CSS Pixel)
          const screenX = p.x * scaleX;
          const screenY = p.y * scaleY;

          // B2: Hỏi Viewport: "Tại pixel màn hình này, trong không gian 3D là điểm nào?"
          // Hàm này tự động xử lý việc ảnh đang bị Zoom hay Pan.
          const worldPos = viewport.canvasToWorld([screenX, screenY]);

          return [worldPos[0], worldPos[1], 0];
        });

        const enabledElement = getEnabledElement(element);
        const camera = viewport.getCamera();

        const className = prediction.class;
        const confidence = (prediction.confidence * 100).toFixed(1) + "%";
        const polygonAnnotation: Annotation = {
          annotationUID,
          highlighted: false,
          invalidated: false,
          isVisible: true,
          isLocked: false,
          metadata: {
            toolName: PlanarFreehandROITool.toolName,
            referencedImageId: referencedImageId,
            viewPlaneNormal:
              camera.viewPlaneNormal || ([0, 0, -1] as Types.Point3),
            viewUp: camera.viewUp || ([0, -1, 0] as Types.Point3),
          },
          data: {
            handles: {
              points: worldPoints,
              activeHandleIndex: null,
              textBox: {
                hasMoved: false,
                //
                worldPosition: [0, 0, 0],
                worldBoundingBox: {
                  topLeft: [0, 0, 0] as Types.Point3,
                  topRight: [0, 0, 0] as Types.Point3,
                  bottomLeft: [0, 0, 0] as Types.Point3,
                  bottomRight: [0, 0, 0] as Types.Point3,
                },
              },
            },

            label: [
              `AI Diagnosis`,
              `Class: ${className}`,
              `Confidence: ${confidence}`,
            ].join("\n"),

            cachedStats: {
              Diagnosis: className,
              Conf: confidence,
              imageId: referencedImageId,
              prediction,
              aiImageWidth,
              aiImageHeight,
              statsArray: [
                { key: "Diagnosis", value: className },
                { key: "Confidence", value: confidence },
              ],
            },
            contour: {
              polyline: worldPoints,
              closed: true,
            },
          },
        } as Annotation;
        annotation.state.addAnnotation(polygonAnnotation, element);

        // Set annotation style
        try {
          annotation.config.style.setAnnotationStyles(annotationUID, {
            color,
            lineWidth: 2,
            fillColor: color,
            fillOpacity: 0.15,
          });
        } catch (e) {
          console.warn("Could not set style:", e);
        }

        const verify = annotation.state.getAnnotations(
          PlanarFreehandROITool.toolName,
          element
        );
        console.log("Verify after add:", verify.length);

        console.log(
          `Added polygon: ${prediction.class} with ${prediction.points.length} points`
        );
      } else {
        // Bounding box
        const x1 = prediction.x - prediction.width / 2;
        const y1 = prediction.y - prediction.height / 2;
        const x2 = prediction.x + prediction.width / 2;
        const y2 = prediction.y + prediction.height / 2;

        const topLeft = viewport.canvasToWorld([x1, y1] as Types.Point2);
        const topRight = viewport.canvasToWorld([x2, y1] as Types.Point2);
        const bottomRight = viewport.canvasToWorld([x2, y2] as Types.Point2);
        const bottomLeft = viewport.canvasToWorld([x1, y2] as Types.Point2);

        const labelX = prediction.x;
        const labelY = y1 - 10;
        const labelWorldPos = viewport.canvasToWorld([
          labelX,
          labelY,
        ] as Types.Point2);

        const rectangleAnnotation: Annotation = {
          annotationUID,
          highlighted: false,
          invalidated: false,
          isLocked: false,
          isVisible: true,
          metadata: {
            toolName: "RectangleROI",
            referencedImageId: referencedImageId,
          },
          data: {
            handles: {
              points: [
                topLeft,
                topRight,
                bottomRight,
                bottomLeft,
              ] as Types.Point3[],
              activeHandleIndex: null,
              textBox: {
                hasMoved: false,
                worldPosition: labelWorldPos,
                worldBoundingBox: {
                  topLeft: [0, 0, 0] as Types.Point3,
                  topRight: [0, 0, 0] as Types.Point3,
                  bottomLeft: [0, 0, 0] as Types.Point3,
                  bottomRight: [0, 0, 0] as Types.Point3,
                },
              },
            },
            label: `AI: ${prediction.class} (${(
              prediction.confidence * 100
            ).toFixed(1)}%)`,
            cachedStats: {},
          },
        } as Annotation;

        annotation.state.addAnnotation(rectangleAnnotation, element);

        try {
          annotation.config.style.setAnnotationStyles(annotationUID, {
            color,
            lineWidth: 2,
            fillColor: color,
            fillOpacity: 0.15,
          });
        } catch (e) {
          console.warn("Could not set rectangle style:", e);
        }

        // Lock annotation
        // try {
        //   annotation.locking.setAnnotationLocked(annotationUID, true);
        //   const addedAnn = annotation.state.getAnnotation(annotationUID);
        //   if (addedAnn) {
        //     addedAnn.isLocked = true;
        //     addedAnn.isVisible = true;
        //   }
        // } catch (lockError) {
        //   console.warn("⚠️ Could not lock annotation:", lockError);
        // }

        console.log(`Added rectangle: ${prediction.class}`);
      }
    });

    // Force annotation rendering
    toolsUtilities.triggerAnnotationRenderForViewportIds([viewportId]);
    viewport.render();
    renderingEngine.renderViewports([viewportId]);

    // Additional delayed render to ensure SVG updates
    setTimeout(() => {
      toolsUtilities.triggerAnnotationRenderForViewportIds([viewportId]);
      viewport.render();
    }, 100);

    const allAnnotations = annotation.state.getAllAnnotations();
    const aiAnnotations = allAnnotations.filter((ann) =>
      ann.annotationUID?.startsWith("ai-")
    );
    console.log("AI annotations count:", aiAnnotations.length);
    console.log(
      "AI annotations:",
      aiAnnotations.map((ann) => ({
        uid: ann.annotationUID,
        toolName: ann.metadata?.toolName,
        isLocked: ann.isLocked,
        isVisible: ann.isVisible,
        pointsCount: ann.data?.handles?.points?.length,
        label: ann.data?.label,
      }))
    );
  } catch (error) {
    console.error("❌ Error drawing AI predictions:", error);
    console.error("Stack:", (error as Error).stack);
  }
};
