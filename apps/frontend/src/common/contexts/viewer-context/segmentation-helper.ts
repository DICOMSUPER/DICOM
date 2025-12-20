import type { MutableRefObject } from "react";
import { cache, eventTarget, imageLoader, getRenderingEngine } from "@cornerstonejs/core";
import {
  segmentation,
  ToolGroupManager,
  Enums as ToolEnums,
  utilities as csToolsUtilities,
} from "@cornerstonejs/tools"; 
import pako from "pako";
/**
 * Segmentation history types and helpers.
 *
 * This mirrors the annotation history pattern but is kept in a separate
 * module to avoid further bloating ViewerContext.
 *
 * NOTE: The actual snapshot structure is intentionally generic (`unknown`)
 * so callers can choose the right shape (full segmentation state, per‑
 * segmentation payload, etc.) without tightly coupling this helper to
 * Cornerstone internals.
 */

export interface SegmentationHistoryEntry {
  /** Logical identifier for this history entry (e.g. segmentationId or a UUID). */
  id: string;
  /** Optional human-readable label or tool name. */
  label?: string;
  /** Serialized snapshot of the segmentation state for this entry (state after the change). */
  snapshot: SegmentationSnapshot;
  /** Serialized snapshot that represents the state before the change (used for undo). */
  previousSnapshot?: SegmentationSnapshot | null;
  /** The logical layer that produced this snapshot. */
  layerId?: string;
}

export interface SegmentationHistoryStacks {
  undoStack: SegmentationHistoryEntry[];
  redoStack: SegmentationHistoryEntry[];
}

export interface SegmentationSnapshot {
  segmentationId: string;
  imageData: Array<{
    imageId: string;
    originalImageId: string; // Track original DICOM image ID
    frameNumber: number; // Track frame number
    instanceId?: string; // Track instance ID
    pixelData: Uint8Array;
  }>;
  capturedAt: number;
}

export interface SegmentationHistoryHelpers {
  ensureLayerStacks: (
    viewport: number,
    layerId: string
  ) => SegmentationHistoryStacks;
  recordEntry: (
    viewport: number,
    layerId: string,
    entry: SegmentationHistoryEntry
  ) => void;
  updateEntry: (
    viewport: number,
    layerId: string,
    id: string,
    snapshot: SegmentationSnapshot
  ) => void;
  removeEntry: (viewport: number, layerId: string, id: string) => void;
  clearLayerHistory: (viewport: number, layerId: string) => void;
  clearViewportHistory: (viewport: number) => void;
  consumeUndo: (
    viewport: number,
    layerId: string
  ) => SegmentationHistoryEntry | null;
  consumeRedo: (
    viewport: number,
    layerId: string
  ) => SegmentationHistoryEntry | null;
  getLayerStacks: (
    viewport: number,
    layerId: string
  ) => SegmentationHistoryStacks | undefined;
}

// Debug logging utility - defined early for use throughout the module
let DEBUG_SEGMENTATION = false; // Can be enabled at runtime via setSegmentationDebugMode

const debugLog = (...args: unknown[]) => {
  if (DEBUG_SEGMENTATION) {
    console.log('[Segmentation Debug]', ...args);
  }
};

// Helper functions for compression
// Memoized base64 helpers that work in non-browser contexts (e.g. SSR)
const btoaFn: ((input: string) => string) | null =
  typeof window !== "undefined" && typeof window.btoa === "function"
    ? window.btoa.bind(window)
    : typeof globalThis !== "undefined" && typeof (globalThis as any).btoa === "function"
      ? (globalThis as any).btoa
      : typeof Buffer !== "undefined"
        ? (input: string) => Buffer.from(input, "binary").toString("base64")
        : null;

const atobFn: ((input: string) => string) | null =
  typeof window !== "undefined" && typeof window.atob === "function"
    ? window.atob.bind(window)
    : typeof globalThis !== "undefined" && typeof (globalThis as any).atob === "function"
      ? (globalThis as any).atob
      : typeof Buffer !== "undefined"
        ? (input: string) => Buffer.from(input, "base64").toString("binary")
        : null;

export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  if (!btoaFn) {
    debugLog("No base64 encoder available");
    return "";
  }
  // Batch process in chunks to avoid stack overflow on very large arrays
  // and avoid O(n²) string concatenation
  const chunkSize = 0x8000; // 32KB chunks
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    chunks.push(String.fromCharCode.apply(null, chunk as unknown as number[]));
  }
  return btoaFn(chunks.join(""));
};

export const compressSnapshots = (snapshots: any[]) => {
  return snapshots.map((snapshot) => ({
    ...snapshot,
    imageData: snapshot.imageData.map((data: any) => {
      if (data.pixelData instanceof Uint8Array) {
        const compressed = pako.deflate(data.pixelData);
        return {
          ...data,
          pixelData: uint8ArrayToBase64(compressed),
          isCompressed: true,
        };
      }
      return data;
    }),
  }));
};

export const decompressSnapshots = (snapshots: any[]) => {
  return snapshots.map((snapshot) => ({
    ...snapshot,
    imageData: snapshot.imageData.map((data: any) => {
      if (data.isCompressed && typeof data.pixelData === "string") {
        if (!atobFn) {
          debugLog("No base64 decoder available, skipping decompress");
          return data;
        }
        const binaryString = atobFn(data.pixelData);
        const len = binaryString.length;
        const compressed = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          compressed[i] = binaryString.charCodeAt(i);
        }
        const decompressed = pako.inflate(compressed);
        return {
          ...data,
          pixelData: decompressed,
          isCompressed: false,
        };
      }
      return data;
    }),
  }));
};

export const segmentationIdForViewport = (viewportId: string) =>
  `seg_${viewportId}`;
const labelmapPrefixForViewport = (viewportId: string) =>
  `labelmap:${viewportId}`;

/**
 * Safely get a segmentation by ID with defensive checks.
 * Returns null if the segmentation doesn't exist or is invalid.
 */
export const safeGetSegmentation = (segmentationId: string) => {
  if (!segmentationId) {
    return null;
  }
  try {
    const seg = segmentation.state.getSegmentation(segmentationId);
    if (!seg) {
      return null;
    }
    return seg;
  } catch (error) {
    debugLog('Failed to get segmentation:', segmentationId, error);
    return null;
  }
};

/**
 * Safely get representation data from a segmentation.
 * Returns null if not available.
 */
export const safeGetRepresentationData = (segmentationId: string) => {
  const seg = safeGetSegmentation(segmentationId);
  if (!seg) {
    return null;
  }
  try {
    return seg.representationData ?? null;
  } catch (error) {
    debugLog('Failed to get representation data:', segmentationId, error);
    return null;
  }
};

/**
 * Safely get labelmap data from a segmentation.
 * Returns null if not available.
 */
export const safeGetLabelmapData = (segmentationId: string) => {
  const repData = safeGetRepresentationData(segmentationId);
  if (!repData) {
    return null;
  }
  try {
    return repData.Labelmap ?? null;
  } catch (error) {
    debugLog('Failed to get labelmap data:', segmentationId, error);
    return null;
  }
};

/**
 * Frame type detection for DICOM images.
 */
export type DicomFrameType = 'single' | 'multiframe' | 'unknown';

export interface DicomFrameInfo {
  type: DicomFrameType;
  frameCount: number;
  currentFrame?: number;
}

/**
 * Detect if a DICOM image is single-frame or multi-frame based on image IDs.
 * Returns frame info including type and count.
 */
export const detectDicomFrameType = (imageIds: string[]): DicomFrameInfo => {
  if (!imageIds || imageIds.length === 0) {
    return { type: 'unknown', frameCount: 0 };
  }

  if (imageIds.length === 1) {
    // Single image - check if it has a frame parameter
    const hasFrameParam = /[?&]frame=\d+/i.test(imageIds[0]) || /\/frames\/\d+/i.test(imageIds[0]);
    return { 
      type: hasFrameParam ? 'multiframe' : 'single', 
      frameCount: 1 
    };
  }

  // Multiple images - check if they're frames of the same study
  // Extract series/study identifiers to check if all images belong to same series
  const extractSeriesIdentifier = (imageId: string): string => {
    // Try to extract series UID from the URL
    const seriesMatch = imageId.match(/series\/([a-zA-Z0-9.-]+)/i);
    if (seriesMatch) return seriesMatch[1];
    
    // Try WADO-RS pattern
    const wadoMatch = imageId.match(/studies\/([^/]+)\/series\/([^/]+)/i);
    if (wadoMatch) return `${wadoMatch[1]}_${wadoMatch[2]}`;
    
    // Fallback: use base URL without frame parameter
    return imageId.replace(/[?&]frame=\d+/gi, '').replace(/\/frames\/\d+/gi, '');
  };

  const seriesIds = new Set(imageIds.map(extractSeriesIdentifier));
  
  // If all images are from the same series, it's likely multiframe
  const isMultiframe = seriesIds.size === 1 && imageIds.length > 1;
  
  return {
    type: isMultiframe ? 'multiframe' : 'single',
    frameCount: imageIds.length,
  };
};

/**
 * Get current frame number from an image ID.
 * Handles multiple URL patterns:
 * - Query params: ?frame=N or &frame=N
 * - Path segments: /frames/N (WADO-RS style)
 * - Duplicated frames: &dup=N suffix
 */
export const getCurrentFrameFromImageId = (imageId: string): number => {
  if (!imageId) return 1;
  
  try {
    // Pattern 1: ?frame=N or &frame=N (most common)
    const queryMatch = imageId.match(/[?&]frame=(\d+)/i);
    if (queryMatch) return parseInt(queryMatch[1], 10);
    
    // Pattern 2: /frames/N in path (WADO-RS style)
    const pathMatch = imageId.match(/\/frames\/(\d+)/i);
    if (pathMatch) return parseInt(pathMatch[1], 10);
    
    // Pattern 3: &dup=N suffix for duplicated frames
    const dupMatch = imageId.match(/&dup=(\d+)/i);
    if (dupMatch) {
      // For duplicated frames, try to extract the base frame first
      const baseFrameMatch = imageId.match(/[?&]frame=(\d+)/i);
      if (baseFrameMatch) {
        return parseInt(baseFrameMatch[1], 10);
      }
    }
    
    return 1;
  } catch {
    debugLog('Failed to extract frame number from:', imageId);
    return 1;
  }
};

/**
 * Check if segmentation exists and is valid for operations.
 */
export const isSegmentationValid = (segmentationId: string): boolean => {
  if (!segmentationId) return false;
  const seg = safeGetSegmentation(segmentationId);
  return seg !== null;
};

/**
 * Check if segmentation has labelmap data.
 */
export const hasLabelmapData = (segmentationId: string): boolean => {
  const labelmap = safeGetLabelmapData(segmentationId);
  return labelmap !== null;
};

const viewportLabelmapImageIds = new Map<string, string[]>();
const viewportReferenceImageIds = new Map<string, string[]>();

const disposeLabelmapImages = (viewportId: string) => {
  const imageIds = viewportLabelmapImageIds.get(viewportId);
  if (!imageIds?.length) {
    return;
  }

  imageIds.forEach((imageId) => {
    try {
      cache.removeImageLoadObject(imageId, { force: true });
    } catch (error) {
    }
  });

  viewportLabelmapImageIds.delete(viewportId);
  viewportReferenceImageIds.delete(viewportId);
};

// Store mapping between labelmap and original image IDs
const viewportImageMappings = new Map<
  string,
  Map<
    string,
    {
      originalImageId: string;
      frameNumber: number;
      instanceId?: string;
    }
  >
>();

const normalizeImageIdReferenceMap = (
  mapLike: unknown
): Map<string, string> | null => {
  if (!mapLike) {
    return null;
  }
  if (mapLike instanceof Map) {
    return mapLike as Map<string, string>;
  }
  if (typeof mapLike === "object") {
    return new Map(Object.entries(mapLike as Record<string, string>));
  }
  return null;
};

const ensureLabelmapImagesForViewport = async (
  viewportId: string,
  referenceImageIds: string[],
  imageIdToInstanceMap?: Record<string, string>
): Promise<string[]> => {
  debugLog('ensureLabelmapImagesForViewport called', {
    viewportId,
    referenceImageCount: referenceImageIds.length,
    hasInstanceMap: !!imageIdToInstanceMap,
  });

  const existingReferenceIds = viewportReferenceImageIds.get(viewportId);
  if (!imageSetsMatch(existingReferenceIds, referenceImageIds)) {
    debugLog('ensureLabelmapImagesForViewport: Image set changed, disposing old labelmaps');
    disposeLabelmapImages(viewportId);
    viewportImageMappings.delete(viewportId); // Clear mappings
  }

  const prefix = labelmapPrefixForViewport(viewportId);
  const derivedImageIds: string[] = [];

  // Initialize mapping for this viewport
  if (!viewportImageMappings.has(viewportId)) {
    viewportImageMappings.set(viewportId, new Map());
  }
  const mapping = viewportImageMappings.get(viewportId)!;

  for (let index = 0; index < referenceImageIds.length; index += 1) {
    const referencedImageId = referenceImageIds[index];
    const derivedImageId = `${prefix}:${index + 1}`;

    // Extract frame number from original image ID
    const frameNumber = extractFrameNumber(referencedImageId);

    // Get instance ID from the provided map
    const instanceId = imageIdToInstanceMap?.[referencedImageId];

    // Store mapping
    mapping.set(derivedImageId, {
      originalImageId: referencedImageId,
      frameNumber,
      instanceId,
    });

    // Log first few mappings for debugging
    if (index < 3 || index === referenceImageIds.length - 1) {
      debugLog('ensureLabelmapImagesForViewport: Mapping', index + 1, 
        'frame:', frameNumber, 'instanceId:', instanceId?.substring(0, 8) || 'none');
    }

    // Check if image already exists in cache (both load object and actual image)
    const existingImage = cache.getImage(derivedImageId);
    const existingLoadObject = cache.getImageLoadObject(derivedImageId);
    
    if (!existingImage && !existingLoadObject) {
      try {
        await imageLoader.loadAndCacheImage(referencedImageId);
        const derivedImage = imageLoader.createAndCacheDerivedImage(
          referencedImageId,
          {
            imageId: derivedImageId,
            targetBuffer: { type: "Uint8Array" },
          }
        );

        // IMPORTANT: Ensure the derived labelmap image starts with all zeros
        // This prevents segmentation from appearing on frames where nothing was drawn
        if (derivedImage && typeof derivedImage.getPixelData === "function") {
          const pixelData = derivedImage.getPixelData();
          if (pixelData instanceof Uint8Array) {
            pixelData.fill(0);
          }
        }
      } catch (error: any) {
        // Handle "already in cache" error gracefully
        if (error?.message?.includes("already in cache")) {
          // Try to get the existing image
          const cachedImage = cache.getImage(derivedImageId);
          if (cachedImage && typeof cachedImage.getPixelData === "function") {
            const pixelData = cachedImage.getPixelData();
            if (pixelData instanceof Uint8Array) {
              // Ensure it's cleared
              pixelData.fill(0);
            }
          }
        } else {
          throw error;
        }
      }
    } else {
      // Labelmap already exists - ensure it's still cleared
      if (existingImage && typeof existingImage.getPixelData === "function") {
        const pixelData = existingImage.getPixelData();
        if (pixelData instanceof Uint8Array) {
          const hasData = pixelData.some((p) => p !== 0);
        }
      } else if (existingLoadObject) {
      }
    }

    derivedImageIds.push(derivedImageId);
  }

  viewportLabelmapImageIds.set(viewportId, derivedImageIds);
  viewportReferenceImageIds.set(viewportId, [...referenceImageIds]);
  return derivedImageIds;
};

const imageSetsMatch = (
  existing: string[] | undefined,
  incoming: string[]
): boolean => {
  if (!existing || existing.length !== incoming.length) {
    return false;
  }
  for (let i = 0; i < incoming.length; i += 1) {
    if (existing[i] !== incoming[i]) {
      return false;
    }
  }
  return true;
};

// Alias for internal use - uses the consolidated getCurrentFrameFromImageId
const extractFrameNumber = getCurrentFrameFromImageId;

/**
 * Enable or disable segmentation debug logging at runtime
 * Call this from browser console: window.setSegmentationDebugMode(true)
 */
export const setSegmentationDebugMode = (enabled: boolean) => {
  DEBUG_SEGMENTATION = enabled;
  console.log(`[Segmentation] Debug mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
};

/**
 * Get current viewport mapping state for debugging
 * Call this from browser console: window.getSegmentationDebugInfo('viewport-0')
 */
export const getSegmentationDebugInfo = (viewportId?: string) => {
  const info: Record<string, unknown> = {
    allViewportMappings: Array.from(viewportImageMappings.keys()),
    allLabelmapImageIds: Array.from(viewportLabelmapImageIds.entries()),
  };
  
  if (viewportId && viewportImageMappings.has(viewportId)) {
    const mapping = viewportImageMappings.get(viewportId)!;
    info.viewportMapping = Array.from(mapping.entries()).map(([labelmapId, data]) => ({
      labelmapId,
      originalImageId: data.originalImageId,
      frameNumber: data.frameNumber,
      instanceId: data.instanceId,
    }));
  }
  
  debugLog('Debug Info', info);
  return info;
};

// Expose debug functions globally for console access
if (typeof window !== 'undefined') {
  (window as unknown as { setSegmentationDebugMode: typeof setSegmentationDebugMode }).setSegmentationDebugMode = setSegmentationDebugMode;
  (window as unknown as { getSegmentationDebugInfo: typeof getSegmentationDebugInfo }).getSegmentationDebugInfo = getSegmentationDebugInfo;
}

const extractInstanceId = (imageId: string): string | undefined => {
  // This would need to be implemented based on how you store instance mapping
  // For now, returning undefined - you'll need to pass this from the viewport context
  return undefined;
};

const safelyRemoveSegmentation = (segmentationId: string) => {
  if (!segmentationId) {
    return;
  }
  try {
    segmentation.removeSegmentation(segmentationId);
  } catch (error) {
  }
};

export const clearViewportLabelmapSegmentation = (viewportId?: string) => {
  if (!viewportId) {
    return;
  }
  const segmentationId = segmentationIdForViewport(viewportId);
  const existing = segmentation.state.getSegmentation(segmentationId);
  if (!existing) {
    disposeLabelmapImages(viewportId);
    return;
  }
  safelyRemoveSegmentation(segmentationId);
  disposeLabelmapImages(viewportId);
};

export const createSegmentationHistoryHelpers = (
  ref: MutableRefObject<Map<number, Map<string, SegmentationHistoryStacks>>>
): SegmentationHistoryHelpers => {
  const ensureViewportStacks = (viewport: number) => {
    if (!ref.current.has(viewport)) {
      ref.current.set(viewport, new Map());
    }
    return ref.current.get(viewport)!;
  };

  const ensureLayerStacks = (
    viewport: number,
    layerId: string
  ): SegmentationHistoryStacks => {
    const viewportStacks = ensureViewportStacks(viewport);
    if (!viewportStacks.has(layerId)) {
      viewportStacks.set(layerId, { undoStack: [], redoStack: [] });
    }
    return viewportStacks.get(layerId)!;
  };

  const recordEntry = (
    viewport: number,
    layerId: string,
    entry: SegmentationHistoryEntry
  ): void => {
    if (!entry.id || !layerId) {
      return;
    }
    const stacks = ensureLayerStacks(viewport, layerId);
    const existingIndex = stacks.undoStack.findIndex(
      (candidate) => candidate.id === entry.id
    );
    if (existingIndex !== -1) {
      stacks.undoStack.splice(existingIndex, 1);
    }
    stacks.undoStack.push({ ...entry, layerId });
    // Enforce history limit
    if (stacks.undoStack.length > 20) {
       stacks.undoStack.shift();
    }
    stacks.redoStack = [];
  };

  const updateEntry = (
    viewport: number,
    layerId: string,
    id: string,
    snapshot: SegmentationSnapshot
  ): void => {
    if (!id || !layerId) {
      return;
    }
    const stacks = ensureLayerStacks(viewport, layerId);
    const applyUpdate = (stack: SegmentationHistoryEntry[]) => {
      const index = stack.findIndex((candidate) => candidate.id === id);
      if (index !== -1) {
        stack[index] = {
          ...stack[index],
          snapshot,
        };
      }
    };
    applyUpdate(stacks.undoStack);
    applyUpdate(stacks.redoStack);
  };

  const removeEntry = (viewport: number, layerId: string, id: string): void => {
    if (!id || !layerId) {
      return;
    }
    const stacks = ensureLayerStacks(viewport, layerId);
    const removeFrom = (stack: SegmentationHistoryEntry[]) => {
      const index = stack.findIndex((candidate) => candidate.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
      }
    };
    removeFrom(stacks.undoStack);
    removeFrom(stacks.redoStack);
  };

  const clearLayerHistory = (viewport: number, layerId: string): void => {
    const viewportStacks = ref.current.get(viewport);
    if (!viewportStacks) {
      return;
    }
    viewportStacks.delete(layerId);
    if (viewportStacks.size === 0) {
      ref.current.delete(viewport);
    }
  };

  const clearViewportHistory = (viewport: number): void => {
    ref.current.delete(viewport);
  };

  const consumeUndo = (
    viewport: number,
    layerId: string
  ): SegmentationHistoryEntry | null => {
    const viewportStacks = ref.current.get(viewport);
    const stacks = viewportStacks?.get(layerId);
    if (!stacks || stacks.undoStack.length === 0) {
      return null;
    }
    const entry = stacks.undoStack.pop() ?? null;
    if (entry) {
      stacks.redoStack.push(entry);
      return { ...entry };
    }
    return null;
  };

  const consumeRedo = (
    viewport: number,
    layerId: string
  ): SegmentationHistoryEntry | null => {
    const viewportStacks = ref.current.get(viewport);
    const stacks = viewportStacks?.get(layerId);
    if (!stacks || stacks.redoStack.length === 0) {
      return null;
    }
    const entry = stacks.redoStack.pop() ?? null;
    if (entry) {
      stacks.undoStack.push(entry);
      return { ...entry };
    }
    return null;
  };

  return {
    ensureLayerStacks,
    recordEntry,
    updateEntry,
    removeEntry,
    clearLayerHistory,
    clearViewportHistory,
    consumeUndo,
    consumeRedo,
    getLayerStacks: (viewport: number, layerId: string) => {
      return ref.current.get(viewport)?.get(layerId);
    },
  };
};

/**
 * Create (if needed) and attach a labelmap segmentation to a single viewport.
 * This is the stack-analogue of the tutorial's volume-based code.
 */
export async function ensureViewportLabelmapSegmentation(options: {
  viewportId: string;
  imageIds: string[];
  imageIdToInstanceMap?: Record<string, string>;
  toolGroupId?: string;
}) {
  const { viewportId, imageIds, imageIdToInstanceMap } = options;
  const toolGroupId = options.toolGroupId ?? `toolGroup_${viewportId}`;

  if (!viewportId || !imageIds?.length) {
    return;
  }

  const segmentationId = segmentationIdForViewport(viewportId);
  const existingSegmentation = safeGetSegmentation(segmentationId);

  if (existingSegmentation) {
    const labelmapData = safeGetLabelmapData(segmentationId);
    const existingImageIds =
      viewportReferenceImageIds.get(viewportId) ??
      (labelmapData && "imageIds" in labelmapData
        ? (labelmapData.imageIds as string[])
        : []);

    if (!imageSetsMatch(existingImageIds, imageIds)) {
      safelyRemoveSegmentation(segmentationId);
    }
  }

  const labelmapImageIds = await ensureLabelmapImagesForViewport(
    viewportId,
    imageIds,
    imageIdToInstanceMap
  );

  const mappingForViewport = viewportImageMappings.get(viewportId);
  const imageIdReferenceMap = mappingForViewport
    ? new Map<string, string>(
        Array.from(mappingForViewport.entries()).map(
          ([labelmapImageId, info]) => [info.originalImageId, labelmapImageId]
        )
      )
    : undefined;

  // Safely update labelmap reference map if it exists
  const currentLabelmapData = safeGetLabelmapData(segmentationId);
  if (imageIdReferenceMap && currentLabelmapData) {
    try {
      (currentLabelmapData as any).imageIdReferenceMap = imageIdReferenceMap;
    } catch (error) {
      debugLog('Failed to set imageIdReferenceMap:', error);
    }
  }

  if (!segmentation.state.getSegmentation(segmentationId)) {
    segmentation.addSegmentations([
      {
        segmentationId,
        representation: {
          type: ToolEnums.SegmentationRepresentations.Labelmap,
          data: {
            imageIds: labelmapImageIds,
            ...(imageIdReferenceMap ? { imageIdReferenceMap } : {}),
          },
        },
      },
    ]);
  }

// 2) Attach labelmap representation to this viewport only if not already attached
  // Check if representation already exists to prevent duplicates
  try {
    const existingReps = segmentation.state.getSegmentationRepresentations?.(viewportId) ?? [];
    const hasLabelmapRep = existingReps.some((rep: any) => 
      rep.segmentationId === segmentationId && 
      rep.type === ToolEnums.SegmentationRepresentations.Labelmap
    );
    
    if (!hasLabelmapRep) {
      console.log(`[Segmentation] Adding labelmap representation to viewport ${viewportId}`);
      await segmentation.addLabelmapRepresentationToViewportMap({
        [viewportId]: [
          {
            segmentationId,
            type: ToolEnums.SegmentationRepresentations.Labelmap,
          },
        ],
      });
      console.log(`[Segmentation] Successfully added labelmap representation to viewport ${viewportId}`);
    } else {
      console.log(`[Segmentation] Labelmap representation already exists for viewport ${viewportId}, skipping`);
    }
  } catch (error) {
    console.warn(`[Segmentation] Failed to add labelmap representation to viewport ${viewportId}:`, error);
  }

  // Also register the representation with the tool group (if available) so tools like Eraser work
  try {
    // START DEBUG
    console.log(`[Segmentation] ToolGroup registration - Id: ${toolGroupId}`);
    const tg = ToolGroupManager.getToolGroup(toolGroupId);
    console.log(`[Segmentation] ToolGroup found: ${!!tg}`);
    // END DEBUG

    const addSegReps =
      (segmentation as any).addSegmentationRepresentations ||
      (csToolsUtilities as any)?.segmentation?.addSegmentationRepresentations;

    if (toolGroupId && typeof addSegReps === "function") {
      // Check if representation already exists in the tool group
      const segUtilsAny = (csToolsUtilities as any)?.segmentation;
      const getSegReps = segUtilsAny?.getSegmentationRepresentations;
      
      let hasRep = false;
      if (typeof getSegReps === "function") {
        const reps = getSegReps(toolGroupId) || [];
        hasRep = reps.some((r: any) => r.segmentationId === segmentationId);
      }

      if (!hasRep) {
        try {
          console.log(`[Segmentation] Adding representation to ToolGroup ${toolGroupId}`);
          await addSegReps(toolGroupId, [
            {
              segmentationId,
              type: ToolEnums.SegmentationRepresentations.Labelmap,
            },
          ]);
          
          // Also set it as active
          if (typeof segUtilsAny?.setActiveSegmentationRepresentation === "function") {
             segUtilsAny.setActiveSegmentationRepresentation(toolGroupId, segmentationId);
          }
        } catch (e) {
             console.warn(`[Segmentation] Failed to add rep to ToolGroup ${toolGroupId}:`, e);
        }
      }
    }
    
    // Check if segmentation is already registered with toolGroup using state API
    // This part should run regardless of the previous block
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (toolGroup) {
        const viewportIds = toolGroup.getViewportIds?.() || [];
        
        // Check if any viewport in the toolGroup already has this segmentation
        const alreadyRegistered = viewportIds.some((vpId: string) => {
        const reps = segmentation.state.getSegmentationRepresentations?.(vpId) ?? [];
        return reps.some((rep: any) => rep.segmentationId === segmentationId);
        });

        if (!alreadyRegistered) {
        console.log(`[Segmentation] Calling addSegmentationRepresentations for ${toolGroupId} with segId: ${segmentationId}`);
        // Only attempt to add if we didn't just add it above (though the check above handles the 'hasRep' logic)
        // If we want to be safe, we can skip this if we know we added it.
        // However, the original code had this as a fallback/check using toolGroup API directly.
        // Let's just log it for now as the previous block should have handled it.
        } else {
        console.log(`[Segmentation] Segmentation ${segmentationId} already registered with toolGroup ${toolGroupId}, skipping`);
        }
    } else {
        console.warn(
        `[Segmentation] addSegmentationRepresentations not available or toolGroupId missing.`
        );
    }

    const segUtilsAny = (csToolsUtilities as any)?.segmentation;

    if (
      toolGroupId &&
      typeof segUtilsAny?.setActiveSegmentationRepresentation === "function"
    ) {
      segUtilsAny.setActiveSegmentationRepresentation(toolGroupId, segmentationId);
    }

    if (
      toolGroupId &&
      typeof segUtilsAny?.setActiveSegmentation === "function"
    ) {
      // Some versions expose setActiveSegmentation
      segUtilsAny.setActiveSegmentation(toolGroupId, segmentationId);
    }

    // Default active segment index to 1 (background is 0)
    if (
      toolGroupId &&
      typeof segUtilsAny?.setActiveSegmentIndex === "function"
    ) {
      segUtilsAny.setActiveSegmentIndex(toolGroupId, 1);
    }
  } catch (err) {
    // Swallow optional API errors to avoid breaking older versions
    console.error("[Segmentation] Tool-group registration failed:", err);
  }

  // Apply a softer default style so the base image stays visible.
  segmentation.config.style.setStyle(
    {
      segmentationId,
      type: ToolEnums.SegmentationRepresentations.Labelmap,
    },
    {
      renderFill: true,
      fillAlpha: 0.1,
      renderOutline: true,
      outlineWidth: 1,
      renderFillInactive: false,
      renderOutlineInactive: true,
      outlineOpacityInactive: 0.35,
    }
  );
}

export function captureSegmentationSnapshot(
  segmentationId: string,
  viewportId?: string,
  imageIdToInstanceMap?: Record<string, string>
): SegmentationSnapshot | null {
  debugLog('captureSegmentationSnapshot called', { segmentationId, viewportId });

  if (!segmentationId) {
    debugLog('captureSegmentationSnapshot: No segmentationId provided');
    return null;
  }

  // Use safe getter to prevent representationData errors
  const labelmapData = safeGetLabelmapData(segmentationId);

  // Extract labelmap image IDs from imageIdReferenceMap (new format) or imageIds (legacy)
  let imageIds: string[] = [];
  let referenceMap: Map<string, string> | null = null;

  if (labelmapData && "imageIdReferenceMap" in labelmapData) {
    referenceMap = normalizeImageIdReferenceMap(
      (labelmapData as any).imageIdReferenceMap
    );
    imageIds = referenceMap ? Array.from(referenceMap.values()) : [];
  } else if (
    labelmapData &&
    "imageIds" in labelmapData &&
    Array.isArray(labelmapData.imageIds)
  ) {
    imageIds = labelmapData.imageIds as string[];
  }

  if (!imageIds.length) {
    debugLog('captureSegmentationSnapshot: No imageIds found in labelmap data');
    return null;
  }

  debugLog('captureSegmentationSnapshot: Processing', imageIds.length, 'labelmap images');

  // Get the mapping for this viewport
  const mapping = viewportId ? viewportImageMappings.get(viewportId) : null;
  const reverseReferenceMap = referenceMap
    ? new Map<string, string>(
        Array.from(referenceMap.entries()).map(([original, labelmap]) => [
          labelmap,
          original,
        ])
      )
    : null;

  const imageData: Array<{
    imageId: string;
    originalImageId: string;
    frameNumber: number;
    instanceId?: string;
    pixelData: Uint8Array;
  }> = [];

  imageIds.forEach((imageId) => {
    if (!imageId) {
      return;
    }
    const cachedImage = cache.getImage(imageId);
    if (!cachedImage) {
      return;
    }

    const sourcePixels =
      typeof cachedImage.getPixelData === "function"
        ? cachedImage.getPixelData()
        : (cachedImage as { pixelData?: Uint8Array }).pixelData;

    if (!sourcePixels) {
      return;
    }

    const clone =
      sourcePixels instanceof Uint8Array
        ? new Uint8Array(sourcePixels)
        : new Uint8Array(sourcePixels.buffer.slice(0));

    // Get original image info from mapping
    const mappingInfo = mapping?.get(imageId);
    const referenceOriginal = reverseReferenceMap?.get(imageId);
    const originalImageId =
      mappingInfo?.originalImageId || referenceOriginal || imageId;
    const frameNumber =
      mappingInfo?.frameNumber ||
      (referenceOriginal
        ? extractFrameNumber(referenceOriginal)
        : extractFrameNumber(imageId));

    // Use the original image ID to look up the instance ID from the map
    let instanceId: string | undefined = mappingInfo?.instanceId;
    if (!instanceId && imageIdToInstanceMap && originalImageId) {
      instanceId = imageIdToInstanceMap[originalImageId];
    }

    imageData.push({
      imageId,
      originalImageId,
      frameNumber,
      instanceId,
      pixelData: clone,
    });

    // Log frame data with non-zero pixels
    const nonZeroPixels = clone.filter(p => p !== 0).length;
    if (nonZeroPixels > 0) {
      debugLog('captureSegmentationSnapshot: Frame', frameNumber, 'has', nonZeroPixels, 'non-zero pixels');
    }
  });

  debugLog('captureSegmentationSnapshot: Captured', imageData.length, 'frames,',
    imageData.filter(d => d.pixelData.some(p => p !== 0)).length, 'with data');

  if (!imageData.length) {
    return null;
  }

  return {
    segmentationId,
    imageData,
    capturedAt: Date.now(),
  };
}

/**
 * Get the current segmentation state for a layer (not history)
 * This captures the current pixel data without adding to history
 */
export function getCurrentSegmentationSnapshot(
  segmentationId: string,
  viewportId?: string,
  imageIdToInstanceMap?: Record<string, string>
): SegmentationSnapshot | null {
  return captureSegmentationSnapshot(
    segmentationId,
    viewportId,
    imageIdToInstanceMap
  );
}

export function restoreSegmentationSnapshot(
  snapshot: SegmentationSnapshot | null | undefined,
  options?: { reason?: string; viewportId?: string }
): boolean {
  debugLog('restoreSegmentationSnapshot called', {
    segmentationId: snapshot?.segmentationId,
    viewportId: options?.viewportId,
    imageDataCount: snapshot?.imageData?.length,
    reason: options?.reason,
  });

  if (!snapshot?.segmentationId || !snapshot.imageData?.length) {
    debugLog('restoreSegmentationSnapshot: Invalid snapshot, returning false');
    return false;
  }

  const viewportMapping = options?.viewportId
    ? viewportImageMappings.get(options.viewportId)
    : undefined;

  const reverseOriginalToLabelmap = viewportMapping
    ? new Map<string, string>(
        Array.from(viewportMapping.entries()).map(
          ([labelmapId, info]) => [info.originalImageId, labelmapId]
        )
      )
    : undefined;

  const resolveByFrameAndInstance = (
    frameNumber?: number,
    instanceId?: string
  ): string | null => {
    if (!viewportMapping || typeof frameNumber !== "number") {
      return null;
    }
    for (const [labelmapId, info] of viewportMapping.entries()) {
      const frameMatches = info.frameNumber === frameNumber;
      const instanceMatches =
        !instanceId || !info.instanceId || info.instanceId === instanceId;
      if (frameMatches && instanceMatches) {
        return labelmapId;
      }
    }
    return null;
  };

  // Additional fallback: match by instanceId only (useful for database snapshots from different sessions)
  const resolveByInstanceIdOnly = (instanceId?: string): string | null => {
    if (!viewportMapping || !instanceId) {
      return null;
    }
    for (const [labelmapId, info] of viewportMapping.entries()) {
      if (info.instanceId === instanceId) {
        return labelmapId;
      }
    }
    return null;
  };

  // Additional fallback: match by frame index (0-based position in viewport mapping)
  const resolveByFrameIndex = (frameNumber?: number): string | null => {
    if (!viewportMapping || typeof frameNumber !== "number") {
      return null;
    }
    const entries = Array.from(viewportMapping.entries());
    // Try 1-based frame number first (common in DICOM)
    if (frameNumber >= 1 && frameNumber <= entries.length) {
      return entries[frameNumber - 1]?.[0] ?? null;
    }
    // Try 0-based index
    if (frameNumber >= 0 && frameNumber < entries.length) {
      return entries[frameNumber]?.[0] ?? null;
    }
    return null;
  };

  let changedSlices = 0;
  const modifiedSliceIds: string[] = [];

  // Clear all labelmap buffers for this viewport before applying snapshot to avoid bleed across frames
  if (viewportMapping && viewportMapping.size > 0) {
    debugLog('restoreSegmentationSnapshot: Clearing', viewportMapping.size, 'labelmap buffers');
    for (const labelmapId of viewportMapping.keys()) {
      const cachedImage = cache.getImage(labelmapId);
      const targetPixels =
        cachedImage && typeof cachedImage.getPixelData === "function"
          ? cachedImage.getPixelData()
          : (cachedImage as { pixelData?: Uint8Array } | null)?.pixelData;
      if (targetPixels) {
        targetPixels.fill(0);
      }
    }
  } else {
    debugLog('restoreSegmentationSnapshot: No viewport mapping found, will use direct imageId matching');
  }

  const framesWithData = snapshot.imageData.filter(d => d.pixelData.some(p => p !== 0)).length;
  console.log('[Segmentation] restoreSegmentationSnapshot: Processing', snapshot.imageData.length, 'frames,', framesWithData, 'with data');
  
  // Log viewport mapping for debugging
  if (viewportMapping) {
    console.log('[Segmentation] viewportMapping has', viewportMapping.size, 'entries');
    // Log first few entries for debugging
    const entries = Array.from(viewportMapping.entries()).slice(0, 3);
    entries.forEach(([id, info]) => {
      console.log('[Segmentation]   mapping entry:', { 
        labelmapId: id.substring(0, 30) + '...', 
        frameNumber: info.frameNumber, 
        instanceId: info.instanceId?.substring(0, 8) || 'none'
      });
    });
  } else {
    console.log('[Segmentation] WARNING: No viewportMapping found for restoration!');
  }

  snapshot.imageData.forEach(
    ({ imageId, pixelData, originalImageId, frameNumber, instanceId }) => {
      // Try multiple strategies in order of reliability
      const matchByOriginalId = originalImageId && reverseOriginalToLabelmap?.get(originalImageId);
      const matchByFrameAndInstance = resolveByFrameAndInstance(frameNumber, instanceId);
      const matchByInstanceOnly = resolveByInstanceIdOnly(instanceId);
      const matchByFrameIndex = resolveByFrameIndex(frameNumber);
      
      let targetImageId = matchByOriginalId || matchByFrameAndInstance || matchByInstanceOnly || matchByFrameIndex || imageId;
      
      // Log matching strategy for frames with data
      const nonZeroPixels = pixelData.filter(p => p !== 0).length;
      if (nonZeroPixels > 0) {
        const matchStrategy = matchByOriginalId ? 'originalId' : 
                              matchByFrameAndInstance ? 'frameAndInstance' : 
                              matchByInstanceOnly ? 'instanceOnly' : 
                              matchByFrameIndex ? 'frameIndex' : 'directImageId';
        console.log('[Segmentation] Frame', frameNumber, 'match strategy:', matchStrategy, 
          'instanceId:', instanceId?.substring(0, 8) || 'none',
          'targetId:', targetImageId?.substring(0, 40) || 'none');
      }

      const cachedImage = targetImageId
        ? cache.getImage(targetImageId)
        : null;
      
      if (!cachedImage) {
        if (nonZeroPixels > 0) {
          debugLog('restoreSegmentationSnapshot: FAILED to find cache for frame', frameNumber, 'targetId:', targetImageId);
        }
        return;
      }

      const targetPixels =
        typeof cachedImage.getPixelData === "function"
          ? cachedImage.getPixelData()
          : (cachedImage as { pixelData?: Uint8Array }).pixelData;

      if (!targetPixels || targetPixels.length !== pixelData.length) {
        if (nonZeroPixels > 0) {
          debugLog('restoreSegmentationSnapshot: Size mismatch for frame', frameNumber, 
            'expected:', pixelData.length, 'got:', targetPixels?.length);
        }
        return;
      }

      targetPixels.set(pixelData);
      changedSlices += 1;
      modifiedSliceIds.push(targetImageId);
      
      if (nonZeroPixels > 0) {
        debugLog('restoreSegmentationSnapshot: Restored frame', frameNumber, 'with', nonZeroPixels, 'pixels to', targetImageId);
      }
    }
  );

  debugLog('restoreSegmentationSnapshot: Restored', changedSlices, 'of', snapshot.imageData.length, 'frames');

  if (changedSlices === 0) {
    debugLog('restoreSegmentationSnapshot: No frames were changed!');
    return false;
  }

  // Only dispatch event if segmentation exists to prevent Cornerstone internal errors
  if (isSegmentationValid(snapshot.segmentationId)) {
    try {
      eventTarget.dispatchEvent(
        new CustomEvent(ToolEnums.Events.SEGMENTATION_DATA_MODIFIED, {
          detail: {
            segmentationId: snapshot.segmentationId,
            modifiedSlicesToUse: modifiedSliceIds,
            reason: options?.reason,
          },
        })
      );
    } catch (error) {
      console.warn('[Segmentation] Failed to dispatch SEGMENTATION_DATA_MODIFIED event:', error);
    }
    
    // Explicitly render the viewport to ensure segmentation appears
    if (options?.viewportId) {
      try {
        const renderingEngineId = options.viewportId.replace('viewport-', 'renderingEngine_viewport-');
        const renderingEngine = getRenderingEngine(renderingEngineId);
        if (renderingEngine) {
          renderingEngine.renderViewports([options.viewportId]);
          debugLog('restoreSegmentationSnapshot: Triggered viewport render for', options.viewportId);
        }
      } catch (renderError) {
        debugLog('restoreSegmentationSnapshot: Failed to trigger render:', renderError);
      }
    }
  } else {
    debugLog('restoreSegmentationSnapshot: Skipping event dispatch - segmentation not found:', snapshot.segmentationId);
  }

  return true;
}

export function clearSegmentationData(
  segmentationId: string,
  options?: { reason?: string; viewportId?: string }
): boolean {
  console.log("[Segmentation] clearSegmentationData called:", { segmentationId, options });
  
  if (!segmentationId) {
    console.log("[Segmentation] clearSegmentationData: No segmentationId");
    return false;
  }

  let modified = 0;
  
  // First, try to use viewportImageMappings if viewportId is provided (most reliable)
  if (options?.viewportId) {
    const viewportMapping = viewportImageMappings.get(options.viewportId);
    if (viewportMapping && viewportMapping.size > 0) {
      console.log("[Segmentation] clearSegmentationData: Using viewportImageMappings with", viewportMapping.size, "entries");
      for (const labelmapId of viewportMapping.keys()) {
        const cachedImage = cache.getImage(labelmapId);
        if (!cachedImage) {
          continue;
        }
        const targetPixels =
          typeof cachedImage.getPixelData === "function"
            ? cachedImage.getPixelData()
            : (cachedImage as { pixelData?: Uint8Array }).pixelData;
        if (!targetPixels) {
          continue;
        }
        targetPixels.fill(0);
        modified += 1;
      }
    }
  }
  
  // Fallback: try labelmapData.imageIds if viewportImageMappings didn't work
  if (modified === 0) {
    const labelmapData = safeGetLabelmapData(segmentationId);
    const imageIds =
      labelmapData &&
      "imageIds" in labelmapData &&
      Array.isArray(labelmapData.imageIds)
        ? (labelmapData.imageIds as string[])
        : [];

    console.log("[Segmentation] clearSegmentationData: Using labelmapData.imageIds with", imageIds.length, "entries");

    imageIds.forEach((imageId) => {
      const cachedImage = imageId ? cache.getImage(imageId) : null;
      if (!cachedImage) {
        return;
      }
      const targetPixels =
        typeof cachedImage.getPixelData === "function"
          ? cachedImage.getPixelData()
          : (cachedImage as { pixelData?: Uint8Array }).pixelData;
      if (!targetPixels) {
        return;
      }
      targetPixels.fill(0);
      modified += 1;
    });
  }
  
  // Second fallback: try viewportLabelmapImageIds
  if (modified === 0 && options?.viewportId) {
    const labelmapImageIds = viewportLabelmapImageIds.get(options.viewportId);
    if (labelmapImageIds && labelmapImageIds.length > 0) {
      console.log("[Segmentation] clearSegmentationData: Using viewportLabelmapImageIds with", labelmapImageIds.length, "entries");
      labelmapImageIds.forEach((imageId) => {
        const cachedImage = imageId ? cache.getImage(imageId) : null;
        if (!cachedImage) {
          return;
        }
        const targetPixels =
          typeof cachedImage.getPixelData === "function"
            ? cachedImage.getPixelData()
            : (cachedImage as { pixelData?: Uint8Array }).pixelData;
        if (!targetPixels) {
          return;
        }
        targetPixels.fill(0);
        modified += 1;
      });
    }
  }

  console.log("[Segmentation] clearSegmentationData: Cleared", modified, "labelmap images");

  if (modified === 0) {
    console.log("[Segmentation] clearSegmentationData: No imageIds found to clear");
    return false;
  }

  // Trigger segmentation modified event
  eventTarget.dispatchEvent(
    new CustomEvent(ToolEnums.Events.SEGMENTATION_DATA_MODIFIED, {
      detail: {
        segmentationId,
        reason: options?.reason ?? "layer-switch-clear",
      },
    })
  );

  // Explicitly render the viewport to ensure segmentation clears visually
  if (options?.viewportId) {
    try {
      const renderingEngineId = options.viewportId.replace('viewport-', 'renderingEngine_viewport-');
      const renderingEngine = getRenderingEngine(renderingEngineId);
      if (renderingEngine) {
        renderingEngine.renderViewports([options.viewportId]);
        debugLog('clearSegmentationData: Triggered viewport render for', options.viewportId);
      }
    } catch (renderError) {
      debugLog('clearSegmentationData: Failed to trigger render:', renderError);
    }
  }

  return true;
}

// type SerializedSegmentationSlice = {
//   imageId: string;
//   pixelData: number[];
// };

// export interface SerializedSegmentationMapEntry {
//   segmentationId: string;
//   capturedAt: number;
//   segmentationMap: SerializedSegmentationSlice[];
// }

// const DB_NAME = "SegmentationDatabase";
// const DB_VERSION = 1;
// const STORE_NAME = "segmentations";

// // IndexedDB wrapper with error handling
// class SegmentationDB {
//   private dbPromise: Promise<IDBDatabase> | null = null;

//   private async getDB(): Promise<IDBDatabase> {
//     if (!this.isBrowserEnvironment()) {
//       throw new Error("IndexedDB not available");
//     }

//     if (this.dbPromise) {
//       return this.dbPromise;
//     }

//     this.dbPromise = new Promise((resolve, reject) => {
//       const request = indexedDB.open(DB_NAME, DB_VERSION);

//       request.onerror = () => {
//         this.dbPromise = null;
//         reject(new Error("Failed to open IndexedDB"));
//       };

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;

//         // Create object store if it doesn't exist
//         if (!db.objectStoreNames.contains(STORE_NAME)) {
//           const store = db.createObjectStore(STORE_NAME, {
//             keyPath: "segmentationId",
//           });

//           // Create index on capturedAt for sorting/querying by date
//           store.createIndex("capturedAt", "capturedAt", { unique: false });
//         }
//       };
//     });

//     return this.dbPromise;
//   }

//   private isBrowserEnvironment(): boolean {
//     return typeof window !== "undefined" && !!window.indexedDB;
//   }

//   async readAll(): Promise<SerializedSegmentationMapEntry[]> {
//     if (!this.isBrowserEnvironment()) {
//       return [];
//     }

//     try {
//       const db = await this.getDB();
//       return new Promise((resolve, reject) => {
//         const transaction = db.transaction(STORE_NAME, "readonly");
//         const store = transaction.objectStore(STORE_NAME);
//         const request = store.getAll();

//         request.onsuccess = () => {
//           const entries = request.result || [];
//           resolve(
//             entries.filter(
//               (entry) => entry && typeof entry.segmentationId === "string"
//             )
//           );
//         };

//         request.onerror = () => {
//           reject(new Error("Failed to read segmentations"));
//         };
//       });
//     } catch (error) {
//       console.warn("[Segmentation] Failed to read stored segmentations", error);
//       return [];
//     }
//   }

//   async readOne(
//     segmentationId: string
//   ): Promise<SerializedSegmentationMapEntry | null> {
//     if (!this.isBrowserEnvironment() || !segmentationId) {
//       return null;
//     }

//     try {
//       const db = await this.getDB();
//       return new Promise((resolve, reject) => {
//         const transaction = db.transaction(STORE_NAME, "readonly");
//         const store = transaction.objectStore(STORE_NAME);
//         const request = store.get(segmentationId);

//         request.onsuccess = () => {
//           resolve(request.result || null);
//         };

//         request.onerror = () => {
//           reject(new Error("Failed to read segmentation"));
//         };
//       });
//     } catch (error) {
//       console.warn(
//         `[Segmentation] Failed to read segmentation ${segmentationId}`,
//         error
//       );
//       return null;
//     }
//   }

//   async write(entry: SerializedSegmentationMapEntry): Promise<void> {
//     if (!this.isBrowserEnvironment()) {
//       console.log("[SegmentationDB] Not browser environment");
//       return;
//     }

//     try {
//       const db = await this.getDB();
//       return new Promise((resolve, reject) => {
//         const transaction = db.transaction(STORE_NAME, "readwrite");
//         const store = transaction.objectStore(STORE_NAME);
//         const request = store.put(entry);

//         request.onsuccess = () => {
//           resolve();
//         };

//         request.onerror = () => {
//           reject(new Error("Failed to write segmentation"));
//         };
//       });
//     } catch (error) {
//       console.warn("[Segmentation] Failed to persist segmentation", error);
//     }
//   }

//   async delete(segmentationId: string): Promise<void> {
//     if (!this.isBrowserEnvironment() || !segmentationId) {
//       return;
//     }

//     try {
//       const db = await this.getDB();
//       return new Promise((resolve, reject) => {
//         const transaction = db.transaction(STORE_NAME, "readwrite");
//         const store = transaction.objectStore(STORE_NAME);
//         const request = store.delete(segmentationId);

//         request.onsuccess = () => {
//           resolve();
//         };

//         request.onerror = () => {
//           reject(new Error("Failed to delete segmentation"));
//         };
//       });
//     } catch (error) {
//       console.warn(
//         `[Segmentation] Failed to delete segmentation ${segmentationId}`,
//         error
//       );
//     }
//   }

//   async clear(): Promise<void> {
//     if (!this.isBrowserEnvironment()) {
//       return;
//     }

//     try {
//       const db = await this.getDB();
//       return new Promise((resolve, reject) => {
//         const transaction = db.transaction(STORE_NAME, "readwrite");
//         const store = transaction.objectStore(STORE_NAME);
//         const request = store.clear();

//         request.onsuccess = () => {
//           resolve();
//         };

//         request.onerror = () => {
//           reject(new Error("Failed to clear segmentations"));
//         };
//       });
//     } catch (error) {
//       console.warn("[Segmentation] Failed to clear all segmentations", error);
//     }
//   }
// }

// // Singleton instance
// const segmentationDB = new SegmentationDB();

// // Serialization helpers
// const serializeSnapshotForStorage = (
//   snapshot: SegmentationSnapshot
// ): SerializedSegmentationMapEntry => ({
//   segmentationId: snapshot.segmentationId,
//   capturedAt: snapshot.capturedAt,
//   segmentationMap: snapshot.imageData.map(({ imageId, pixelData }) => ({
//     imageId,
//     pixelData: Array.from(pixelData),
//   })),
// });

// const deserializeSnapshotFromStorage = (
//   entry: SerializedSegmentationMapEntry
// ): SegmentationSnapshot => ({
//   segmentationId: entry.segmentationId,
//   capturedAt: entry.capturedAt,
//   imageData: entry.segmentationMap.map(({ imageId, pixelData }) => ({
//     imageId,
//     pixelData: Uint8Array.from(pixelData ?? []),
//   })),
// });

// // Public API
// export const saveSegmentationSnapshotToStorage = async (
//   snapshot: SegmentationSnapshot | null
// ): Promise<void> => {
//   if (!snapshot?.segmentationId) {
//     console.log("[Segmentation] No snapshot found to save");
//     return;
//   }

//   const serialized = serializeSnapshotForStorage(snapshot);
//   await segmentationDB.write(serialized);

//   console.log(
//     `[Segmentation] Saved snapshot ${snapshot.segmentationId} to IndexedDB`
//   );
// };

// export const loadSegmentationSnapshotFromStorage = async (
//   segmentationId: string
// ): Promise<SegmentationSnapshot | null> => {
//   if (!segmentationId) {
//     return null;
//   }

//   const entry = await segmentationDB.readOne(segmentationId);
//   if (!entry) {
//     return null;
//   }

//   return deserializeSnapshotFromStorage(entry);
// };

// export const loadAllSegmentationSnapshotsFromStorage = async (): Promise<
//   SegmentationSnapshot[]
// > => {
//   const entries = await segmentationDB.readAll();
//   return entries.map(deserializeSnapshotFromStorage);
// };

// export const deleteSegmentationFromStorage = async (
//   segmentationId: string
// ): Promise<void> => {
//   await segmentationDB.delete(segmentationId);
//   console.log(
//     `[Segmentation] Deleted snapshot ${segmentationId} from IndexedDB`
//   );
// };

// export const clearAllSegmentationsFromStorage = async (): Promise<void> => {
//   await segmentationDB.clear();
//   console.log("[Segmentation] Cleared all snapshots from IndexedDB");
// };

// // Optional: Export DB instance for advanced usage
// export { segmentationDB };
//index db to test
