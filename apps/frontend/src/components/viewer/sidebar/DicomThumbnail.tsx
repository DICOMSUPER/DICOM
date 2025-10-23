"use client";
import { useEffect, useRef, useState } from "react";
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
export default function DicomThumbnail({ 
  imageId, 
  size = 48, 
  className = "",
  alt = "DICOM Thumbnail"
}: DicomThumbnailProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const viewportIdRef = useRef<string>(`thumbnail-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
    let renderingEngine: RenderingEngine | null = null;

    const loadThumbnail = async () => {
      if (!elementRef.current || !imageId || typeof window === 'undefined') return;

      try {
        setIsLoading(true);
        setHasError(false);

        // Initialize Cornerstone only once globally
        if (!(window as any).cornerstoneInitialized) {
          await csRenderInit();
          await csToolsInit();
          dicomImageLoaderInit({ maxWebWorkers: 1 });
          (window as any).cornerstoneInitialized = true;
        }

        if (!mounted) return;

        // Create unique rendering engine for this thumbnail
        const engineId = `thumbnail-engine-${viewportIdRef.current}`;
        renderingEngine = new RenderingEngine(engineId);

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
              thumbnailImageId = `${imageId}?frame=0`;
            }
          } catch (err) {
            // If metadata check fails, just use the imageId as-is
            console.warn('Failed to check frames for thumbnail:', err);
          }
        }

        if (!mounted) return;

        // Enable the element as a stack viewport
        renderingEngine.enableElement({
          viewportId: viewportIdRef.current,
          type: Enums.ViewportType.STACK,
          element: elementRef.current,
          defaultOptions: {
            background: [0, 0, 0] as Types.Point3,
          },
        });

        const viewport = renderingEngine.getViewport(viewportIdRef.current) as Types.IStackViewport;
        
        // Set single image stack
        await viewport.setStack([thumbnailImageId]);
        
        // Fit to window
        viewport.render();

        if (mounted) {
          setIsLoading(false);
          setInitialized(true);
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
      if (renderingEngine) {
        try {
          renderingEngine.destroy();
        } catch (err) {
          console.warn('Error destroying thumbnail rendering engine:', err);
        }
      }
    };
  }, [imageId]);

  return (
    <div 
      className={`relative bg-gray-900 rounded overflow-hidden ${className}`}
      style={{ width: size, height: size }}
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

