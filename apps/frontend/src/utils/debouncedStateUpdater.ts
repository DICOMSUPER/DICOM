/**
 * Debounced State Updater - OHIF Pattern  
 * Reduces excessive state updates during rapid changes
 */

type StateUpdate<T> = (current: T) => T;

export class DebouncedStateUpdater<T> {
  private pending: StateUpdate<T>[] = [];
  private timeoutId: number | null = null;
  private readonly delay: number;

  constructor(delay: number = 16) {
    // Default to ~60fps
    this.delay = delay;
  }

  /**
   * Queue a state update
   */
  queue(update: StateUpdate<T>, apply: (updates: StateUpdate<T>[]) => void): void {
    this.pending.push(update);

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.flush(apply);
    }, this.delay);
  }

  /**
   * Apply all pending updates immediately
   */
  flush(apply: (updates: StateUpdate<T>[]) => void): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.pending.length === 0) return;

    const updates = [...this.pending];
    this.pending = [];
    apply(updates);
  }

  /**
   * Cancel all pending updates
   */
  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pending = [];
  }

  /**
   * Check if there are pending updates
   */
  hasPending(): boolean {
    return this.pending.length > 0;
  }
}

/**
 * Create a debounced updater for specific use cases
 */
export function createDebouncedUpdater<T>(delay?: number): DebouncedStateUpdater<T> {
  return new DebouncedStateUpdater<T>(delay);
}

