/**
 * ViewerEventService - Centralized pub/sub event management for viewer
 * Replaces scattered window.dispatchEvent calls with clean service pattern
 */

type EventCallback = (data: any) => void;

interface Subscription {
  id: string;
  callback: EventCallback;
}

class ViewerEventService {
  public static readonly EVENTS = {
    // Viewport transformation events
    ROTATE_VIEWPORT: 'viewport::rotate',
    RESET_VIEW: 'viewport::resetView',
    INVERT_COLORMAP: 'viewport::invertColorMap',
    REFRESH_VIEWPORT: 'viewport::refresh',
    
    // Annotation events
    CLEAR_ANNOTATIONS: 'annotations::clearAll',
    CLEAR_VIEWPORT_ANNOTATIONS: 'annotations::clearViewport',
    UNDO_ANNOTATION: 'annotations::undo',
    REDO_ANNOTATION: 'annotations::redo',
    SELECT_ANNOTATION: 'annotations::select',
    DESELECT_ANNOTATION: 'annotations::deselect',
    UPDATE_ANNOTATION_COLOR: 'annotations::updateColor',
    LOCK_ANNOTATION: 'annotations::lock',
    TOGGLE_ANNOTATIONS: 'annotations::toggleVisibility',
    
    // Segmentation events
    UNDO_SEGMENTATION: 'segmentation::undo',
    REDO_SEGMENTATION: 'segmentation::redo',
    SELECT_SEGMENTATION: 'segmentation::select',
    DESELECT_SEGMENTATION: 'segmentation::deselect',
    
    // AI events
    DIAGNOSE_VIEWPORT: 'ai::diagnose',
    CLEAR_AI_ANNOTATIONS: 'ai::clearAnnotations',
    AI_DIAGNOSIS_START: 'ai:diagnosis:start',
    AI_DIAGNOSIS_SUCCESS: 'ai:diagnosis:success',
    AI_DIAGNOSIS_ERROR: 'ai:diagnosis:error',
    
    // AI Segmentation events
    AI_SEGMENT_VIEWPORT: 'ai::segmentViewport',
    AI_SEGMENTATION_START: 'ai:segmentation:start',
    AI_SEGMENTATION_SUCCESS: 'ai:segmentation:success',
    AI_SEGMENTATION_ERROR: 'ai:segmentation:error',
  } as const;

  private listeners: Map<string, Subscription[]> = new Map();
  private subscriptionCounter = 0;

  /**
   * Subscribe to an event
   */
  public subscribe(eventName: string, callback: EventCallback): () => void {
    if (!this._isValidEvent(eventName)) {
      console.warn(`Event ${eventName} not supported`);
      return () => {};
    }

    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    const subscription: Subscription = { id: subscriptionId, callback };

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName)!.push(subscription);

    // Return unsubscribe function
    return () => this._unsubscribe(eventName, subscriptionId);
  }

  /**
   * Publish/broadcast an event to all subscribers
   */
  public publish(eventName: string, data?: any): void {
    if (!this._isValidEvent(eventName)) {
      console.warn(`Event ${eventName} not supported`);
      return;
    }

    const subscriptions = this.listeners.get(eventName);
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    subscriptions.forEach(({ callback }) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * Unsubscribe from an event
   */
  private _unsubscribe(eventName: string, subscriptionId: string): void {
    const subscriptions = this.listeners.get(eventName);
    if (!subscriptions) {
      return;
    }

    const filtered = subscriptions.filter(sub => sub.id !== subscriptionId);
    this.listeners.set(eventName, filtered);
  }

  /**
   * Check if an event name is valid
   */
  private _isValidEvent(eventName: string): boolean {
    return Object.values(ViewerEventService.EVENTS).includes(eventName as any);
  }

  /**
   * Clear all subscriptions for an event (useful for cleanup)
   */
  public clearSubscriptions(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get subscription count for debugging
   */
  public getSubscriptionCount(eventName?: string): number {
    if (eventName) {
      return this.listeners.get(eventName)?.length || 0;
    }
    let total = 0;
    this.listeners.forEach(subs => total += subs.length);
    return total;
  }
}

// Export singleton instance
export const viewerEventService = new ViewerEventService();
export const ViewerEvents = ViewerEventService.EVENTS;
export default ViewerEventService;

