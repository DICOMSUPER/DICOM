"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RenderingEngine, Enums, type Types, metaData } from "@cornerstonejs/core";
import { init as csRenderInit, imageLoader } from "@cornerstonejs/core";
import { init as csToolsInit } from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { ImageIcon, Loader2 } from "lucide-react";

interface DicomThumbnailProps {
  imageId: string;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Lightweight DICOM thumbnail component for sidebar previews
 * Optimized for displaying series thumbnails without tools or navigation
 */
declare global {
  interface Window {
    cornerstoneInitialized?: boolean;
    cornerstoneInitPromise?: Promise<boolean>;
    thumbnailRenderingEngine?: RenderingEngine | null;
    thumbnailRenderingEngineRefs?: number;
  }
}

const ensureCornerstoneInitialized = async () => {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.cornerstoneInitPromise) {
    window.cornerstoneInitPromise = (async () => {
      if (!window.cornerstoneInitialized) {
        await csRenderInit();
        await csToolsInit();
          dicomImageLoaderInit({ maxWebWorkers: 4 });
        window.cornerstoneInitialized = true;
      }
      return true;
    })();
  }

  try {
    await window.cornerstoneInitPromise;
  } catch (error) {
    window.cornerstoneInitPromise = undefined;
    throw error;
  }
};

const getSharedThumbnailEngine = async (): Promise<RenderingEngine> => {
  await ensureCornerstoneInitialized();

  if (!window.thumbnailRenderingEngine) {
    window.thumbnailRenderingEngine = new RenderingEngine("thumbnail-shared-engine");
    window.thumbnailRenderingEngineRefs = 0;
  }

  window.thumbnailRenderingEngineRefs =
    (window.thumbnailRenderingEngineRefs ?? 0) + 1;

  return window.thumbnailRenderingEngine;
};

export default function DicomThumbnail({ 
  imageId, 
  size,
  className = "",
  alt = "DICOM Thumbnail"
}: DicomThumbnailProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewportIdRef = useRef<string>(`thumbnail-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  // Early return for SSR
  if (typeof window === 'undefined') {
    return (
      <div 
        className={`relative bg-gray-900 rounded overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
        </div>
      </div>
    );
  }

  useEffect(() => {
    let mounted = true;
    const loadThumbnail = async () => {
      if (!elementRef.current || !imageId || typeof window === 'undefined') return;

      try {
        setIsLoading(true);
        setHasError(false);

        const renderingEngine = await getSharedThumbnailEngine();
        renderingEngineRef.current = renderingEngine;

        if (!mounted) return;

        // Load the first frame only for thumbnail
        let thumbnailImageId = imageId;
        
        // For multi-frame images, just load frame 0
        if (imageId.includes('?frame=')) {
          // Already has frame parameter
          thumbnailImageId = imageId;
        } else {
          // Check if it's multi-frame and add frame parameter
          try {
            await imageLoader.loadImage(imageId);
            const multiFrameModule = metaData.get("multiframeModule", imageId);
            const numFrames = multiFrameModule?.NumberOfFrames || 1;
            
            if (numFrames > 1) {
              // Multi-frame: load first frame
              thumbnailImageId = `${imageId}?frame=1`;
            }
          } catch (err) {
            // If metadata check fails, just use the imageId as-is
            console.warn('Failed to check frames for thumbnail:', err);
          }
        }

        if (!mounted) return;

        // Disable any existing viewport with the same id before re-enabling
        try {
          renderingEngine.disableElement(viewportIdRef.current);
        } catch {
          // ignore if viewport wasn't enabled yet
        }

        // Enable the element as a stack viewport
        renderingEngine.enableElement({
          viewportId: viewportIdRef.current,
          type: Enums.ViewportType.STACK,
          element: elementRef.current,
          defaultOptions: {
            background: [0, 0, 0] as Types.Point3,
          },
        });

        const viewport = renderingEngine.getViewport(
          viewportIdRef.current
        ) as Types.IStackViewport;
        
        try {
          if (!elementRef.current) {
            throw new Error("Thumbnail element is not available");
          }
          await viewport.setStack([thumbnailImageId]);
          viewport.resetCamera?.();
          viewport.render();

          if (mounted) {
            setIsLoading(false);
            setInitialized(true);
          }
        } catch (renderError) {
          console.error(
            "Error rendering DICOM thumbnail viewport:",
            renderError
          );
          if (mounted) {
            setHasError(true);
            setIsLoading(false);
          }
        }

      } catch (error) {
        console.error('Error loading DICOM thumbnail:', error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadThumbnail();

    // Cleanup
    return () => {
      mounted = false;
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.disableElement(viewportIdRef.current);
        } catch (err) {
          console.warn('Error disabling thumbnail viewport:', err);
        }
      }

      if (typeof window !== "undefined") {
        const currentRefs = (window.thumbnailRenderingEngineRefs ?? 1) - 1;
        window.thumbnailRenderingEngineRefs = Math.max(0, currentRefs);

        if (window.thumbnailRenderingEngineRefs === 0 && window.thumbnailRenderingEngine) {
          try {
            window.thumbnailRenderingEngine.destroy();
          } catch (destroyError) {
            console.warn("Error destroying shared thumbnail rendering engine:", destroyError);
          } finally {
            window.thumbnailRenderingEngine = null;
          }
        }
      }

      renderingEngineRef.current = null;
    };
  }, [imageId]);

  const containerStyle: CSSProperties = {};

  if (typeof size === "number") {
    containerStyle.width = size;
    containerStyle.height = size;
  }

  return (
    <div 
      className={`relative bg-gray-900 rounded overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* DICOM viewport element */}
      <div 
        ref={elementRef} 
        className="w-full h-full"
        style={{ backgroundColor: '#000' }}
      />

      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <ImageIcon className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
}

