/**
 * Viewport State Manager - Based on OHIF Viewer patterns
 * Centralized viewport lifecycle management with proper state transitions
 */

import { ViewportStatus, isValidTransition, NON_RENDERABLE_STATES } from '@/types/viewport-state';

export interface ViewportStateData {
  status: ViewportStatus;
  imageData: any | null;
  error: Error | null;
  lastTransition: number;
}

class ViewportStateManager {
  private states = new Map<string, ViewportStateData>();
  private listeners = new Map<string, Set<(state: ViewportStateData) => void>>();

  /**
   * Initialize a viewport with INITIALIZING state
   */
  initialize(viewportId: string): void {
    if (this.states.has(viewportId)) {
      const current = this.states.get(viewportId)!;
      if (current.status !== ViewportStatus.DISPOSED) {
        console.warn(`Viewport ${viewportId} already exists with status ${current.status}`);
        return;
      }
    }

    this.setState(viewportId, {
      status: ViewportStatus.INITIALIZING,
      imageData: null,
      error: null,
      lastTransition: Date.now(),
    });
  }

  /**
   * Transition viewport to a new state with validation
   */
  transition(viewportId: string, newStatus: ViewportStatus, data?: Partial<ViewportStateData>): boolean {
    const current = this.states.get(viewportId);
    
    if (!current) {
      console.warn(`Cannot transition viewport ${viewportId}: not initialized`);
      return false;
    }

    // Check if transition is valid
    if (!isValidTransition(current.status, newStatus)) {
      console.warn(
        `Invalid viewport state transition for ${viewportId}: ${current.status} -> ${newStatus}`
      );
      return false;
    }

    // Apply transition
    const newState: ViewportStateData = {
      ...current,
      ...data,
      status: newStatus,
      lastTransition: Date.now(),
    };

    this.setState(viewportId, newState);
    return true;
  }

  /**
   * Get current viewport state
   */
  getState(viewportId: string): ViewportStateData | null {
    return this.states.get(viewportId) ?? null;
  }

  /**
   * Check if viewport can be rendered
   */
  canRender(viewportId: string): boolean {
    const state = this.states.get(viewportId);
    if (!state) return false;
    return !NON_RENDERABLE_STATES.includes(state.status);
  }

  /**
   * Check if viewport is ready for interactions
   */
  isReady(viewportId: string): boolean {
    const state = this.states.get(viewportId);
    return state?.status === ViewportStatus.READY;
  }

  /**
   * Check if viewport is loading
   */
  isLoading(viewportId: string): boolean {
    const state = this.states.get(viewportId);
    return state?.status === ViewportStatus.LOADING;
  }

  /**
   * Check if viewport has image data
   */
  hasImageData(viewportId: string): boolean {
    const state = this.states.get(viewportId);
    return state?.imageData != null;
  }

  /**
   * Set error state
   */
  setError(viewportId: string, error: Error): void {
    this.transition(viewportId, ViewportStatus.ERROR, { error });
  }

  /**
   * Set image data and transition to READY
   */
  setImageData(viewportId: string, imageData: any): boolean {
    return this.transition(viewportId, ViewportStatus.READY, { imageData, error: null });
  }

  /**
   * Start loading
   */
  startLoading(viewportId: string): boolean {
    return this.transition(viewportId, ViewportStatus.LOADING, { error: null });
  }

  /**
   * Dispose viewport (cleanup)
   */
  dispose(viewportId: string): void {
    const current = this.states.get(viewportId);
    if (!current) return;

    // Mark as disposing first
    if (current.status !== ViewportStatus.DISPOSING) {
      this.transition(viewportId, ViewportStatus.DISPOSING);
    }

    // Notify listeners one last time
    this.notifyListeners(viewportId);

    // Clean up listeners
    this.listeners.delete(viewportId);

    // Mark as disposed
    this.setState(viewportId, {
      status: ViewportStatus.DISPOSED,
      imageData: null,
      error: null,
      lastTransition: Date.now(),
    });

    // Remove from states after a delay to allow any pending operations to check state
    setTimeout(() => {
      this.states.delete(viewportId);
    }, 1000);
  }

  /**
   * Subscribe to viewport state changes
   */
  subscribe(viewportId: string, callback: (state: ViewportStateData) => void): () => void {
    if (!this.listeners.has(viewportId)) {
      this.listeners.set(viewportId, new Set());
    }

    this.listeners.get(viewportId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(viewportId)?.delete(callback);
    };
  }

  /**
   * Set state and notify listeners
   */
  private setState(viewportId: string, state: ViewportStateData): void {
    this.states.set(viewportId, state);
    this.notifyListeners(viewportId);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(viewportId: string): void {
    const state = this.states.get(viewportId);
    if (!state) return;

    const listeners = this.listeners.get(viewportId);
    if (!listeners) return;

    listeners.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error(`Error in viewport state listener for ${viewportId}:`, error);
      }
    });
  }

  /**
   * Get all viewport states (for debugging)
   */
  getAllStates(): Map<string, ViewportStateData> {
    return new Map(this.states);
  }

  /**
   * Clear all states (for cleanup)
   */
  clearAll(): void {
    this.states.clear();
    this.listeners.clear();
  }
}

// Export singleton instance
export const viewportStateManager = new ViewportStateManager();
export default viewportStateManager;

