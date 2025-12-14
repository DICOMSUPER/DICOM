import React, { useEffect, useState, useCallback, useRef } from "react";
import { getRenderingEngine, Enums, type Types } from "@cornerstonejs/core";
import { PredictionMetadata } from "@/common/interfaces/system/ai-result.interface";

interface AILabelOverlayProps {
  viewportId: string;
  renderingEngineId: string;
  predictions: PredictionMetadata[];
  aiImageWidth: number;
  aiImageHeight: number;
  targetImageId: string;
}

export const AILabelOverlay = ({
  viewportId,
  renderingEngineId,
  predictions,
  aiImageWidth,
  aiImageHeight,
  targetImageId,
}: AILabelOverlayProps) => {
  const [overlayItems, setOverlayItems] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const cameraModifiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePositions = useCallback(() => {
    console.log("🔄 updatePositions called");
    
    const renderingEngine = getRenderingEngine(renderingEngineId);
    if (!renderingEngine) {
      console.warn("❌ No rendering engine found:", renderingEngineId);
      return;
    }

    const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
    if (!viewport) {
      console.warn("❌ No viewport found:", viewportId);
      return;
    }

    if (!predictions || predictions.length === 0) {
      console.warn("❌ No predictions");
      return;
    }

    // Lấy canvas và image dimensions
    const canvas = viewport.canvas;
    const imageData = viewport.getImageData();
    
    if (!imageData) {
      console.warn("❌ No image data");
      return;
    }

    const { dimensions } = imageData;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    console.log("📐 Image dimensions:", dimensions);
    console.log("🎨 Canvas size:", { canvasWidth, canvasHeight });
    console.log("📐 AI Image size:", { aiImageWidth, aiImageHeight });

    const items = predictions.map((pred, index) => {
      let sumX = 0;
      let minY = Infinity;

      // Tính tọa độ trung bình từ AI predictions
      pred.points.forEach((p) => {
        sumX += p.x;
        if (p.y < minY) minY = p.y;
      });

      const aiCenterX = sumX / pred.points.length;
      const aiTopY = minY;

      console.log("AI coords:", { aiCenterX, aiTopY });

      //  Chuyển từ AI image coords → Normalized coords (0-1)
      const normalizedX = aiCenterX / aiImageWidth;
      const normalizedY = aiTopY / aiImageHeight;

      console.log("Normalized coords:", { normalizedX, normalizedY });

      // Chuyển từ Normalized coords → DICOM image pixel coords
      const imagePixelX = normalizedX * dimensions[0];
      const imagePixelY = normalizedY * dimensions[1];

      console.log("Image pixel coords:", { imagePixelX, imagePixelY });


      
      // Cách đơn giản: Scale trực tiếp từ image pixels sang canvas
      const scaleX = canvasWidth / dimensions[0];
      const scaleY = canvasHeight / dimensions[1];
      
      const canvasX = imagePixelX * scaleX;
      const canvasY = imagePixelY * scaleY;

      console.log("🎨 Canvas coords:", { canvasX, canvasY });

      return {
        id: index,
        x: canvasX,
        y: canvasY,
        label: pred.class,
        confidence: Math.round(pred.confidence * 100),
      };
    });

    console.log("Overlay Items calculated:", items);
    setOverlayItems(items);
  }, [viewportId, renderingEngineId, predictions, aiImageWidth, aiImageHeight]);


  useEffect(() => {
    console.log(" AILabelOverlay mounted/updated");
    
    const renderingEngine = getRenderingEngine(renderingEngineId);
    if (!renderingEngine) {
      console.warn("No rendering engine on mount");
      return;
    }

    const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
    if (!viewport) {
      console.warn("No viewport on mount");
      return;
    }

    const element = viewport.element;


    const checkVisibility = () => {
      const currentImageId = viewport.getCurrentImageId();
      console.log("Checking visibility:", { 
        currentImageId, 
        targetImageId,
        match: currentImageId === targetImageId 
      });

      const shouldShow = currentImageId === targetImageId;
      setIsVisible(shouldShow);

      if (shouldShow) {
        console.log("✅ Should show - calling updatePositions");
       
        setTimeout(() => {
          updatePositions();
        }, 0);
      } else {
        console.log("Should hide - different image");
      }
    };

    // Xử lý camera modified (zoom/pan) - debounced to prevent excessive RAF calls
    const onCameraModified = () => {
      if (!isVisible) return;

      // Cancel any pending RAF
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Cancel any pending timeout
      if (cameraModifiedTimeoutRef.current) {
        clearTimeout(cameraModifiedTimeoutRef.current);
        cameraModifiedTimeoutRef.current = null;
      }

      // Debounce camera modifications to prevent excessive RAF calls
      cameraModifiedTimeoutRef.current = setTimeout(() => {
        if (isVisible && !animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(() => {
            updatePositions();
            animationFrameRef.current = null;
          });
        }
        cameraModifiedTimeoutRef.current = null;
      }, 16); // ~60fps
    };

    // Gọi ngay lần đầu để khởi tạo
    console.log("Initial check visibility");
    checkVisibility();

    // Đăng ký event listeners
    element.addEventListener(Enums.Events.STACK_NEW_IMAGE, checkVisibility);
    element.addEventListener(Enums.Events.CAMERA_MODIFIED, onCameraModified);

    return () => {
      console.log("AILabelOverlay cleanup");
      element.removeEventListener(Enums.Events.STACK_NEW_IMAGE, checkVisibility);
      element.removeEventListener(Enums.Events.CAMERA_MODIFIED, onCameraModified);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (cameraModifiedTimeoutRef.current) {
        clearTimeout(cameraModifiedTimeoutRef.current);
        cameraModifiedTimeoutRef.current = null;
      }
    };
  }, [viewportId, renderingEngineId, targetImageId, updatePositions, isVisible]);

  console.log("Overlay render state:", {
    isVisible,
    overlayItemsCount: overlayItems.length,
    predictionsCount: predictions.length,
  });

  if (!isVisible) {
    console.log("Overlay hidden - not visible");
    return null;
  }

  if (overlayItems.length === 0) {
    console.log("Overlay hidden - no items yet (calculating...)");
    return null;
  }

  console.log("Rendering overlay with items:", overlayItems);

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {overlayItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: "translate(-50%, -100%)",
            marginTop: "-10px",
          }}
          className="flex flex-col items-center group"
        >
          <div className="bg-red-600/90 text-white text-xs px-2 py-1 rounded shadow-lg border border-red-400 backdrop-blur-sm flex items-center gap-2 transition-transform group-hover:scale-110">
            <span className="font-bold uppercase">{item.label}</span>
            <span className="bg-white/20 px-1 rounded text-[10px]">
              {item.confidence}%
            </span>
          </div>

          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-600/90"></div>
        </div>
      ))}
    </div>
  );
};