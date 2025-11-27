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
  imageData: Array<{ imageId: string; pixelData: Uint8Array }>;
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
    snapshot: unknown
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
    snapshot: unknown
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
  snapshot: SegmentationSnapshot | null | undefined,
  options?: { reason?: string }
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
