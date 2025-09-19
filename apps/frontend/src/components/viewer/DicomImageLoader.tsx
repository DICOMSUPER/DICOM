"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { RenderingEngine, Enums, type Types } from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as csToolsInit } from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { metaData } from "@cornerstonejs/core";
import { loadImage } from "@cornerstonejs/core/loaders/imageLoader";

export default function DicomImageLoader({
  imageId,
  viewportId,
  isThumbnail,
  size,
  hasToolBars,
  hasFrameNavigation,
  renderingEngine,
  setRenderingEngine, //Shared singleton renderingEngine
}: {
  imageId: string;
  viewportId?: string;
  isThumbnail?: boolean;
  size?: number;
  hasToolBars?: boolean;
  hasFrameNavigation?: boolean;
  renderingEngine: RenderingEngine | null;
  setRenderingEngine: (engine: RenderingEngine) => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const [viewport, setViewport] = useState<Types.IStackViewport | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(1);
  const [showOverlayButtons, setShowOverlayButtons] = useState(false);

  const getTotalFrames = async (imageId: string) => {
    await loadImage(imageId);

    const multiFrameModule = metaData.get("multiframeModule", imageId);
    const numFrames = multiFrameModule?.NumberOfFrames;

    // console.log("Total Frames:", numFrames);
    return numFrames;
  };

  const goToFrame = useCallback(
    (frameIndex: number) => {
      if (!viewport) return;

      // Ensure frame index is within bounds
      let newFrame = frameIndex;
      if (newFrame >= totalFrames) newFrame = totalFrames - 1;
      if (newFrame < 0) newFrame = 0;

      viewport.setImageIdIndex(newFrame);
      viewport.render();
      setCurrentFrame(newFrame);
    },
    [viewport, totalFrames]
  );

  const nextFrame = useCallback(() => {
    if (!viewport) return;
    let newFrame = currentFrame + 1;
    if (newFrame >= totalFrames) newFrame = 0; // Loop back to start
    goToFrame(newFrame);
  }, [viewport, currentFrame, totalFrames, goToFrame]);

  const prevFrame = useCallback(() => {
    if (!viewport) return;
    let newFrame = currentFrame - 1;
    if (newFrame < 0) newFrame = totalFrames - 1; // Loop back to end
    goToFrame(newFrame);
  }, [viewport, currentFrame, totalFrames, goToFrame]);

  // Handle mouse wheel scrolling
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!hasFrameNavigation || totalFrames <= 1) return;

      event.preventDefault();

      // Determine scroll direction
      const delta = event.deltaY;

      if (delta > 0) {
        // Scrolling down/away - next frame
        nextFrame();
      } else if (delta < 0) {
        // Scrolling up/toward - previous frame
        prevFrame();
      }
    },
    [hasFrameNavigation, totalFrames, nextFrame, prevFrame]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!hasFrameNavigation || totalFrames <= 1) return;

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
      }
    },
    [hasFrameNavigation, totalFrames, nextFrame, prevFrame]
  );

  useEffect(() => {
    const setup = async () => {
      if (running.current) return;
      running.current = true;

      // Initialize Cornerstone Core, Tools, and DICOM Loader
      await csRenderInit();
      await csToolsInit();
      dicomImageLoaderInit({ maxWebWorkers: 1 });

      let numberOfFrame = 1;
      if (!isThumbnail && hasFrameNavigation) {
        numberOfFrame = await getTotalFrames(imageId);
        setTotalFrames(numberOfFrame);
      }

      const imageIds = Array.from(
        { length: numberOfFrame },
        (_, i) => `${imageId}?frame=${i + 1}`
      );

      const vpId = viewportId || "CT";

      let currentEngine = renderingEngine;
      if (!currentEngine) {
        currentEngine = new RenderingEngine("My Engine");
        setRenderingEngine(currentEngine);
      }

      currentEngine.enableElement({
        viewportId: vpId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current!,
        defaultOptions: {
          background: [0, 0, 0],
        },
      });

      const vp = currentEngine.getViewport(vpId) as Types.IStackViewport;
      vp.setStack(imageIds);
      vp.render();

      // Slightly zoom out to ensure circular images fit comfortably within the viewport
      try {
        const zoomPaddingFactor = 1.0; // 8% zoom-out
        const camera = vp.getCamera();
        if (typeof camera.parallelScale === "number") {
          vp.setCamera({
            ...camera,
            parallelScale: camera.parallelScale * zoomPaddingFactor,
          });
        }
        vp.render();
      } catch {
        // If camera manipulation isn't available, ignore and keep default fit
      }
      setViewport(vp);
    };

    setup();
  }, [
    imageId,
    hasFrameNavigation,
    isThumbnail,
    viewportId,
    renderingEngine,
    setRenderingEngine,
  ]);

  // Add event listeners for scroll and keyboard
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !hasFrameNavigation) return;

    element.addEventListener("wheel", handleWheel, { passive: false });

    // Make element focusable for keyboard events
    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    viewport,
    currentFrame,
    totalFrames,
    hasFrameNavigation,
    handleKeyDown,
    handleWheel,
  ]);

  const viewportSize = size || 300;

  return (
    <div className="min-h-screen bg-black p-1 flex justify-center items-center ">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            style={{
              width: `${viewportSize}px`,
              height: `${viewportSize}px`,
            }}
            onMouseEnter={() => setShowOverlayButtons(true)}
            onMouseLeave={() => setShowOverlayButtons(false)}
          >
            {/* Main viewport element */}
            <div
              ref={elementRef}
              className="w-full h-full"
              style={{
                backgroundColor: "#000",
              }}
            />

            {/* Overlay navigation buttons */}
            {hasFrameNavigation && totalFrames > 1 && showOverlayButtons && (
              <>
                {/* Left arrow button */}
                <button
                  onClick={prevFrame}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentFrame + 1} / {totalFrames}
                </div>
              </>
            )}

            {/* Scroll hint */}
            {hasFrameNavigation && totalFrames > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-75">
                Use scroll wheel or arrow keys to navigate
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
