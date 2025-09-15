"use client";
import { useEffect, useRef } from "react";
import { RenderingEngine, Enums, type Types } from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";

export default function DicomThumbnail({
  imageId,
  viewportId,
  width = 50,
  height = 50,
  onError, // Optional: (error: Error) => void
  renderingEngine,
  setRenderingEngine, //Shared singleton renderingEngine
}: {
  imageId: string;
  viewportId?: string;
  width?: number;
  height?: number;
  onError?: (error: Error) => void;
  renderingEngine: RenderingEngine | null;
  setRenderingEngine: (engine: RenderingEngine) => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (running.current || !elementRef.current) return;
      running.current = true;

      try {
        // Initialize (Core + DICOM Loader only—tools not needed for static thumbnails)
        await csRenderInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });

        const imageIds = [imageId]; // Raw imageId—no ?frame=1 for single-frame

        // Unique engine ID to avoid conflicts across thumbnails
        const engineId = `thumbnailEngine_${viewportId || "default"}`;

        let currentEngine = renderingEngine;
        if (!currentEngine) {
          currentEngine = new RenderingEngine("My Engine");
          setRenderingEngine(currentEngine);
        }
        const vpId = viewportId || "thumbnail";

        currentEngine.enableElement({
          viewportId: vpId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current,
          defaultOptions: {
            background: [0, 0, 0],
          },
        });

        const vp = currentEngine.getViewport(vpId) as Types.IStackViewport;
        vp.setStack(imageIds);
        vp.render();

        console.log(`Thumbnail rendered: ${vpId}`); // Debug: Confirm success
      } catch (error) {
        console.error(`DicomThumbnail error for ${imageId}:`, error);
        onError?.(error as Error);
      }
    };

    setup();
  }, [imageId, viewportId, onError]);

  return (
    <div
      className="relative rounded-lg"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div
        ref={elementRef}
        className="w-full h-full"
        style={{
          backgroundColor: "#000",
        }}
      />
    </div>
  );
}
