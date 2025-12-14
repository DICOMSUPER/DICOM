/**
 * Annotation Cache - OHIF Pattern
 * Caches annotation data to reduce database queries and re-renders
 */

import type { ImageAnnotation } from '@/common/interfaces/image-dicom/image-annotation.interface';

interface CacheEntry {
  data: ImageAnnotation[];
  timestamp: number;
  seriesId: string;
}

class AnnotationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 30000; // 30 seconds
  private readonly MAX_ENTRIES = 50;

  /**
   * Get cached annotations for a series
   */
  get(seriesId: string): ImageAnnotation[] | null {
    const entry = this.cache.get(seriesId);
    
    if (!entry) return null;

    // Check if cache is still valid
    const age = Date.now() - entry.timestamp;
    if (age > this.TTL) {
      this.cache.delete(seriesId);
      return null;
    }

    return entry.data;
  }

  /**
   * Set annotations for a series
   */
  set(seriesId: string, annotations: ImageAnnotation[]): void {
    // Enforce max cache size (LRU-like behavior)
    if (this.cache.size >= this.MAX_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(seriesId, {
      data: annotations,
      timestamp: Date.now(),
      seriesId,
    });
  }

  /**
   * Invalidate cache for a specific series
   */
  invalidate(seriesId: string): void {
    this.cache.delete(seriesId);
  }

  /**
   * Invalidate all cache entries
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Update a single annotation in cache
   */
  updateAnnotation(seriesId: string, annotationId: string, updates: Partial<ImageAnnotation>): void {
    const entry = this.cache.get(seriesId);
    if (!entry) return;

    const updatedData = entry.data.map((ann) =>
      ann.id === annotationId ? { ...ann, ...updates } : ann
    );

    this.cache.set(seriesId, {
      ...entry,
      data: updatedData,
      timestamp: Date.now(), // Reset TTL
    });
  }

  /**
   * Add annotation to cache
   */
  addAnnotation(seriesId: string, annotation: ImageAnnotation): void {
    const entry = this.cache.get(seriesId);
    if (!entry) {
      // Initialize cache if doesn't exist
      this.cache.set(seriesId, {
        data: [annotation],
        timestamp: Date.now(),
        seriesId,
      });
      return;
    }

    this.cache.set(seriesId, {
      ...entry,
      data: [...entry.data, annotation],
      timestamp: Date.now(),
    });
  }

  /**
   * Remove annotation from cache
   */
  removeAnnotation(seriesId: string, annotationId: string): void {
    const entry = this.cache.get(seriesId);
    if (!entry) return;

    this.cache.set(seriesId, {
      ...entry,
      data: entry.data.filter((ann) => ann.id !== annotationId),
      timestamp: Date.now(),
    });
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [seriesId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(seriesId);
      }
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const annotationCache = new AnnotationCache();

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => annotationCache.cleanup(), 60000); // Every minute
}

export default annotationCache;

