import type { MutableRefObject } from "react";
import { cache, eventTarget, imageLoader } from "@cornerstonejs/core";
import {
  segmentation,
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
// Helper functions for compression
// Safe base64 helpers that also work in non-browser contexts (e.g. SSR)
const getBtoa =
  () =>
    (typeof window !== "undefined" && typeof window.btoa === "function"
      ? window.btoa.bind(window)
      : typeof globalThis !== "undefined" && typeof (globalThis as any).btoa === "function"
        ? (globalThis as any).btoa
        : typeof Buffer !== "undefined"
          ? (input: string) => Buffer.from(input, "binary").toString("base64")
          : null);

const getAtob =
  () =>
    (typeof window !== "undefined" && typeof window.atob === "function"
      ? window.atob.bind(window)
      : typeof globalThis !== "undefined" && typeof (globalThis as any).atob === "function"
        ? (globalThis as any).atob
        : typeof Buffer !== "undefined"
          ? (input: string) => Buffer.from(input, "base64").toString("binary")
          : null);

export const uint8ArrayToBase64 = (bytes: Uint8Array) => {
  const btoaFn = getBtoa();
  if (!btoaFn) {
    console.warn("[Segmentation] No base64 encoder available");
    return "";
  }
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoaFn(binary);
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
        const atobFn = getAtob();
        if (!atobFn) {
          console.warn("[Segmentation] No base64 decoder available, skipping decompress");
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
  const existingReferenceIds = viewportReferenceImageIds.get(viewportId);
  if (!imageSetsMatch(existingReferenceIds, referenceImageIds)) {
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

// Helper functions to extract information from image IDs
const extractFrameNumber = (imageId: string): number => {
  try {
    const frameMatch = imageId.match(/[?&]frame=(\d+)/);
    return frameMatch ? parseInt(frameMatch[1], 10) : 1;
  } catch {
    return 1;
  }
};

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
  const existingSegmentation =
    segmentation.state.getSegmentation(segmentationId);

  if (existingSegmentation) {
    const existingImageIds =
      viewportReferenceImageIds.get(viewportId) ??
      (existingSegmentation.representationData?.Labelmap &&
      "imageIds" in existingSegmentation.representationData.Labelmap
        ? (existingSegmentation.representationData.Labelmap
            .imageIds as string[])
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

  if (
    imageIdReferenceMap &&
    existingSegmentation?.representationData?.Labelmap
  ) {
    (existingSegmentation.representationData.Labelmap as any).imageIdReferenceMap =
      imageIdReferenceMap;
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

  // 2) Attach labelmap representation to this viewport
  await segmentation.addLabelmapRepresentationToViewportMap({
    [viewportId]: [
      {
        segmentationId,
        type: ToolEnums.SegmentationRepresentations.Labelmap,
      },
    ],
  });

  // Also register the representation with the tool group (if available) so tools like Eraser work
  try {
    const segUtilsAny = (csToolsUtilities as any)?.segmentation;
    if (
      toolGroupId &&
      typeof segUtilsAny?.addSegmentationRepresentations === "function"
    ) {
      segUtilsAny.addSegmentationRepresentations(toolGroupId, [
        {
          segmentationId,
          type: ToolEnums.SegmentationRepresentations.Labelmap,
        },
      ]);
    }

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
    console.debug("[Segmentation] Tool-group registration failed", err);
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

  if (!segmentationId) {
    return null;
  }

  const segState = segmentation.state.getSegmentation(segmentationId);

  const labelmapData = segState?.representationData?.Labelmap;

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
    return null;
  }

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
  });

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
  if (!snapshot?.segmentationId || !snapshot.imageData?.length) {
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

  let changedSlices = 0;
  const modifiedSliceIds: string[] = [];

  // Clear all labelmap buffers for this viewport before applying snapshot to avoid bleed across frames
  if (viewportMapping && viewportMapping.size > 0) {
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
  }

  snapshot.imageData.forEach(
    ({ imageId, pixelData, originalImageId, frameNumber, instanceId }) => {
      const targetImageId =
        (originalImageId && reverseOriginalToLabelmap?.get(originalImageId)) ||
        resolveByFrameAndInstance(frameNumber, instanceId) ||
        imageId;

      const cachedImage = targetImageId
        ? cache.getImage(targetImageId)
        : null;
      if (!cachedImage) {
        return;
      }

      const targetPixels =
        typeof cachedImage.getPixelData === "function"
          ? cachedImage.getPixelData()
          : (cachedImage as { pixelData?: Uint8Array }).pixelData;

      if (!targetPixels || targetPixels.length !== pixelData.length) {
        return;
      }

      targetPixels.set(pixelData);
      changedSlices += 1;
      modifiedSliceIds.push(targetImageId);
    }
  );

  if (changedSlices === 0) {
    return false;
  }

  eventTarget.dispatchEvent(
    new CustomEvent(ToolEnums.Events.SEGMENTATION_DATA_MODIFIED, {
      detail: {
        segmentationId: snapshot.segmentationId,
        modifiedSlicesToUse: modifiedSliceIds,
        reason: options?.reason,
      },
    })
  );

  return true;
}

export function clearSegmentationData(
  segmentationId: string,
  options?: { reason?: string }
): boolean {
  if (!segmentationId) {
    return false;
  }

  const segState = segmentation.state.getSegmentation(segmentationId);
  const labelmapData = segState?.representationData?.Labelmap;
  const imageIds =
    labelmapData &&
    "imageIds" in labelmapData &&
    Array.isArray(labelmapData.imageIds)
      ? (labelmapData.imageIds as string[])
      : [];

  if (!imageIds.length) {
    return false;
  }

  let modified = 0;
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

  if (modified === 0) {
    return false;
  }

  eventTarget.dispatchEvent(
    new CustomEvent(ToolEnums.Events.SEGMENTATION_DATA_MODIFIED, {
      detail: {
        segmentationId,
        reason: options?.reason ?? "layer-switch-clear",
      },
    })
  );

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
