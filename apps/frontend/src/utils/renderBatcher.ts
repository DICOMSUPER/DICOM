/**
 * Render batching utility to prevent excessive viewport.render() calls
 * that cause slow requestAnimationFrame handlers in Cornerstone.js
 */

type Viewport = { render?: () => void };

class RenderBatcher {
  private pendingRenders = new Set<Viewport>();
  private rafId: number | null = null;
  private timeoutId: number | null = null;
  private readonly batchDelay = 16; // ~60fps - reduced for smoother camera transformations
  private lastFlushTime = 0;

  /**
   * Schedule a viewport to be rendered in the next batch
   */
  scheduleRender(viewport: Viewport | null | undefined): void {
    if (!viewport || typeof viewport.render !== "function") {
      return;
    }

    this.pendingRenders.add(viewport);

    const now = performance.now();
    const timeSinceLastFlush = now - this.lastFlushTime;

    // If we just flushed recently, use timeout to debounce more aggressively
    if (timeSinceLastFlush < this.batchDelay) {
      if (this.timeoutId === null) {
        this.timeoutId = window.setTimeout(() => {
          this.timeoutId = null;
          if (this.rafId === null) {
            this.rafId = requestAnimationFrame(() => {
              this.flush();
            });
          }
        }, this.batchDelay - timeSinceLastFlush);
      }
    } else if (this.rafId === null) {
      // Schedule immediate RAF if enough time has passed
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Immediately render all pending viewports and clear the queue
   */
  flush(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const viewports = Array.from(this.pendingRenders);
    this.pendingRenders.clear();
    this.lastFlushTime = performance.now();

    // Render all pending viewports
    viewports.forEach((viewport) => {
      try {
        if (viewport && typeof viewport.render === "function") {
          viewport.render();
        }
      } catch (error) {
        console.warn("Error rendering viewport:", error);
      }
    });
  }

  /**
   * Cancel any pending renders
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingRenders.clear();
  }
}

// Create a singleton instance
export const renderBatcher = new RenderBatcher();

/**
 * Batched render function - use this instead of direct viewport.render()
 */
export function batchedRender(viewport: Viewport | null | undefined): void {
  renderBatcher.scheduleRender(viewport);
}

/**
 * Immediate render - use only when you need synchronous rendering
 */
export function immediateRender(viewport: Viewport | null | undefined): void {
  if (viewport && typeof viewport.render === "function") {
    try {
      viewport.render();
    } catch (error) {
      console.warn("Error rendering viewport:", error);
    }
  }
}

