/**
 * Rendering Engine Cache - OHIF Pattern
 * Reduces expensive getRenderingEngine calls
 */

import { getRenderingEngine, type RenderingEngine } from '@cornerstonejs/core';

class RenderingEngineCache {
  private cache = new Map<string, RenderingEngine>();
  private lastAccessTime = new Map<string, number>();
  private readonly CACHE_TTL = 5000; // 5 seconds

  get(engineId: string): RenderingEngine | undefined {
    // Check if cached and still valid
    const cached = this.cache.get(engineId);
    const lastAccess = this.lastAccessTime.get(engineId);
    
    if (cached && lastAccess && Date.now() - lastAccess < this.CACHE_TTL) {
      this.lastAccessTime.set(engineId, Date.now());
      return cached;
    }

    // Fetch fresh
    try {
      const engine = getRenderingEngine(engineId);
      if (engine) {
        this.cache.set(engineId, engine);
        this.lastAccessTime.set(engineId, Date.now());
      }
      return engine;
    } catch {
      return undefined;
    }
  }

  invalidate(engineId: string): void {
    this.cache.delete(engineId);
    this.lastAccessTime.delete(engineId);
  }

  invalidateAll(): void {
    this.cache.clear();
    this.lastAccessTime.clear();
  }

  // Periodic cleanup of stale entries
  cleanup(): void {
    const now = Date.now();
    for (const [engineId, lastAccess] of this.lastAccessTime.entries()) {
      if (now - lastAccess > this.CACHE_TTL) {
        this.cache.delete(engineId);
        this.lastAccessTime.delete(engineId);
      }
    }
  }
}

// Singleton instance
export const renderingEngineCache = new RenderingEngineCache();

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => renderingEngineCache.cleanup(), 10000);
}

export default renderingEngineCache;

