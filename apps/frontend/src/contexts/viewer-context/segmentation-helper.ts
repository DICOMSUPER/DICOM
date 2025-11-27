import type { MutableRefObject } from "react";
import { cache, eventTarget, imageLoader } from "@cornerstonejs/core";
import { segmentation, Enums as ToolEnums } from "@cornerstonejs/tools";

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
  /** Optional human‑readable label or tool name. */
  label?: string;
  /** Serialized snapshot of the segmentation state for this entry. */
  snapshot: unknown;
}

interface SegmentationHistoryStacks {
  undoStack: SegmentationHistoryEntry[];
  redoStack: SegmentationHistoryEntry[];
}

export interface SegmentationSnapshot {
  segmentationId: string;
  imageData: Array<{ imageId: string; pixelData: Uint8Array }>;
  capturedAt: number;
}

export interface SegmentationHistoryHelpers {
  ensureStacks: (viewport: number) => SegmentationHistoryStacks;
  recordEntry: (viewport: number, entry: SegmentationHistoryEntry) => void;
  updateEntry: (viewport: number, id: string, snapshot: unknown) => void;
  removeEntry: (viewport: number, id: string) => void;
  clearViewportHistory: (viewport: number) => void;
  consumeUndo: (viewport: number) => SegmentationHistoryEntry | null;
  consumeRedo: (viewport: number) => SegmentationHistoryEntry | null;
}

const segmentationIdForViewport = (viewportId: string) => `seg_${viewportId}`;
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
      console.warn(
        `[Segmentation] Failed to remove labelmap image ${imageId}`,
        error
      );
    }
  });

  viewportLabelmapImageIds.delete(viewportId);
  viewportReferenceImageIds.delete(viewportId);
};

const ensureLabelmapImagesForViewport = async (
  viewportId: string,
  referenceImageIds: string[]
): Promise<string[]> => {
  const existingReferenceIds = viewportReferenceImageIds.get(viewportId);
  if (!imageSetsMatch(existingReferenceIds, referenceImageIds)) {
    disposeLabelmapImages(viewportId);
  }

  const prefix = labelmapPrefixForViewport(viewportId);
  const derivedImageIds: string[] = [];

  for (let index = 0; index < referenceImageIds.length; index += 1) {
    const referencedImageId = referenceImageIds[index];
    const derivedImageId = `${prefix}:${index + 1}`;

    if (!cache.getImageLoadObject(derivedImageId)) {
      try {
        await imageLoader.loadAndCacheImage(referencedImageId);
        imageLoader.createAndCacheDerivedImage(referencedImageId, {
          imageId: derivedImageId,
          targetBuffer: { type: "Uint8Array" },
        });
      } catch (error) {
        console.error(
          "[Segmentation] Failed to prepare labelmap image",
          referencedImageId,
          error
        );
        throw error;
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

const safelyRemoveSegmentation = (segmentationId: string) => {
  if (!segmentationId) {
    return;
  }
  try {
    segmentation.removeSegmentation(segmentationId);
  } catch (error) {
    console.warn(
      `[Segmentation] Failed to remove segmentation ${segmentationId}`,
      error
    );
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
  ref: MutableRefObject<Map<number, SegmentationHistoryStacks>>
): SegmentationHistoryHelpers => {
  const ensureStacks = (viewport: number): SegmentationHistoryStacks => {
    const current = ref.current.get(viewport);
    if (current) {
      return current;
    }
    const stacks: SegmentationHistoryStacks = { undoStack: [], redoStack: [] };
    ref.current.set(viewport, stacks);
    return stacks;
  };

  const recordEntry = (
    viewport: number,
    entry: SegmentationHistoryEntry
  ): void => {
    if (!entry.id) {
      return;
    }
    const stacks = ensureStacks(viewport);
    const existingIndex = stacks.undoStack.findIndex(
      (candidate) => candidate.id === entry.id
    );
    if (existingIndex !== -1) {
      stacks.undoStack.splice(existingIndex, 1);
    }
    stacks.undoStack.push({ ...entry });
    stacks.redoStack = [];
  };

  const updateEntry = (
    viewport: number,
    id: string,
    snapshot: unknown
  ): void => {
    if (!id) {
      return;
    }
    const stacks = ensureStacks(viewport);
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

  const removeEntry = (viewport: number, id: string): void => {
    if (!id) {
      return;
    }
    const stacks = ensureStacks(viewport);
    const removeFrom = (stack: SegmentationHistoryEntry[]) => {
      const index = stack.findIndex((candidate) => candidate.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
      }
    };
    removeFrom(stacks.undoStack);
    removeFrom(stacks.redoStack);
  };

  const clearViewportHistory = (viewport: number): void => {
    ref.current.delete(viewport);
  };

  const consumeUndo = (viewport: number): SegmentationHistoryEntry | null => {
    const stacks = ref.current.get(viewport);
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

  const consumeRedo = (viewport: number): SegmentationHistoryEntry | null => {
    const stacks = ref.current.get(viewport);
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
    ensureStacks,
    recordEntry,
    updateEntry,
    removeEntry,
    clearViewportHistory,
    consumeUndo,
    consumeRedo,
  };
};

/**
 * Create (if needed) and attach a labelmap segmentation to a single viewport.
 * This is the stack-analogue of the tutorial's volume-based code.
 */
export async function ensureViewportLabelmapSegmentation(options: {
  viewportId: string;
  imageIds: string[];
}) {
  const { viewportId, imageIds } = options;

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
    imageIds
  );

  if (!segmentation.state.getSegmentation(segmentationId)) {
    segmentation.addSegmentations([
      {
        segmentationId,
        representation: {
          // Labelmap segmentation
          type: ToolEnums.SegmentationRepresentations.Labelmap,
          // For stack viewports we can base it on imageIds rather than a volumeId
          data: {
            imageIds: labelmapImageIds,
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
  segmentationId: string
): SegmentationSnapshot | null {
  if (!segmentationId) {
    return null;
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
    return null;
  }

  const imageData: Array<{ imageId: string; pixelData: Uint8Array }> = [];

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

    imageData.push({ imageId, pixelData: clone });
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

export function restoreSegmentationSnapshot(
  snapshot: SegmentationSnapshot | null | undefined
): boolean {
  if (!snapshot?.segmentationId || !snapshot.imageData?.length) {
    return false;
  }

  let changedSlices = 0;
  const modifiedSliceIds: string[] = [];

  snapshot.imageData.forEach(({ imageId, pixelData }) => {
    const cachedImage = imageId ? cache.getImage(imageId) : null;
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
    modifiedSliceIds.push(imageId);
  });

  if (changedSlices === 0) {
    return false;
  }

  eventTarget.dispatchEvent(
    new CustomEvent(ToolEnums.Events.SEGMENTATION_DATA_MODIFIED, {
      detail: {
        segmentationId: snapshot.segmentationId,
        modifiedSlicesToUse: modifiedSliceIds,
      },
    })
  );

  return true;
}
