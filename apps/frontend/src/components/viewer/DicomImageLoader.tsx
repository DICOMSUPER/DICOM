"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { RenderingEngine, Enums, type Types } from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as csToolsInit } from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { metaData } from "@cornerstonejs/core";
import { loadImage } from "@cornerstonejs/core/loaders/imageLoader";
import { batchedRender } from "@/utils/renderBatcher";

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

  const thumbHeight = Math.max(20, (100 / totalFrames) * 100); // Minimum 20px, scales with total frames
  const thumbPosition = (currentFrame / (totalFrames - 1)) * 100;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!scrollbarRef.current || !thumbRef.current) return;
      
      const rect = scrollbarRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickPercent = (clickY / rect.height) * 100;

      // Check if clicking on thumb
      const thumbRect = thumbRef.current.getBoundingClientRect();
      const thumbTop = thumbRect.top - rect.top;
      const thumbBottom = thumbTop + thumbRect.height;

      if (clickY >= thumbTop && clickY <= thumbBottom) {
        // Start dragging thumb
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
        // Jump to clicked position
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
      {/* Track */}
      <div className="absolute inset-0 bg-gray-800/30 hover:bg-gray-800/50 transition-colors" />
      
      {/* Thumb */}
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
      batchedRender(viewport);
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

  // Handle mouse wheel scrolling - optimized with throttling to prevent main thread blocking
  const wheelHandlerRef = useRef<{
    rafId: number | null;
    lastTime: number;
    pendingDirection: number | null;
  }>({ rafId: null, lastTime: 0, pendingDirection: null });

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!hasFrameNavigation || totalFrames <= 1) return;

      // Prevent default immediately (lightweight operation)
      event.preventDefault();

      const now = performance.now();
      const timeSinceLastCall = now - wheelHandlerRef.current.lastTime;
      const throttleDelay = 50; // Throttle to max 20 calls per second

      // Determine direction
      const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (direction === 0) return;

      // Update pending direction
      wheelHandlerRef.current.pendingDirection = direction;

      // If we have a pending RAF, don't create a new one
      if (wheelHandlerRef.current.rafId !== null) {
        return;
      }

      // Throttle: only process if enough time has passed
      if (timeSinceLastCall < throttleDelay) {
        // Schedule for later
        wheelHandlerRef.current.rafId = requestAnimationFrame(() => {
          const direction = wheelHandlerRef.current.pendingDirection;
          wheelHandlerRef.current.rafId = null;
          wheelHandlerRef.current.lastTime = performance.now();
          wheelHandlerRef.current.pendingDirection = null;

          if (direction === 1) {
            nextFrame();
          } else if (direction === -1) {
            prevFrame();
          }
        });
      } else {
        // Process immediately
        wheelHandlerRef.current.lastTime = now;
        wheelHandlerRef.current.pendingDirection = null;
        
        if (direction === 1) {
          nextFrame();
        } else if (direction === -1) {
          prevFrame();
        }
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
      dicomImageLoaderInit({ maxWebWorkers: 4 });

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
      // Cleanup wheel handler RAF
      if (wheelHandlerRef.current.rafId !== null) {
        cancelAnimationFrame(wheelHandlerRef.current.rafId);
        wheelHandlerRef.current.rafId = null;
      }
      
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

            {/* Overlay navigation scrollbar */}
            {hasFrameNavigation && totalFrames > 1 && showOverlayButtons && (
              <>
                {/* Vertical scrollbar on the right edge */}
                <FrameScrollbarComponent
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  onFrameChange={goToFrame}
                />

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
