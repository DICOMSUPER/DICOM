/**
 * Batched Event Dispatcher - OHIF Pattern
 * Batches rapid state changes to reduce re-renders
 */

type EventCallback = () => void;

class BatchedEventDispatcher {
  private pending = new Set<EventCallback>();
  private rafId: number | null = null;

  /**
   * Schedule a callback to run in the next frame
   * Multiple calls in the same frame are automatically deduplicated
   */
  schedule(callback: EventCallback): void {
    this.pending.add(callback);

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Execute all pending callbacks
   */
  private flush(): void {
    this.rafId = null;
    
    const callbacks = Array.from(this.pending);
    this.pending.clear();

    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in batched event callback:', error);
      }
    });
  }

  /**
   * Cancel all pending callbacks
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pending.clear();
  }
}

// Singleton instance
export const batchedEventDispatcher = new BatchedEventDispatcher();
export default batchedEventDispatcher;

