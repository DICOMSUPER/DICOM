/**
 * Viewport State Machine - Based on OHIF Viewer patterns
 * Ensures viewports go through proper lifecycle transitions
 */

export enum ViewportStatus {
  /** Viewport is being created */
  INITIALIZING = 'INITIALIZING',
  /** Viewport element is registered but no image loaded */
  IDLE = 'IDLE',
  /** Image is being fetched and decoded */
  LOADING = 'LOADING',
  /** Image is ready and viewport can be interacted with */
  READY = 'READY',
  /** Viewport encountered an error */
  ERROR = 'ERROR',
  /** Viewport is being cleaned up */
  DISPOSING = 'DISPOSING',
  /** Viewport has been disposed */
  DISPOSED = 'DISPOSED',
}

export interface ViewportState {
  status: ViewportStatus;
  imageData: any | null;
  error: Error | null;
  progress: number;
}

/**
 * Valid state transitions
 */
export const VALID_TRANSITIONS: Record<ViewportStatus, ViewportStatus[]> = {
  [ViewportStatus.INITIALIZING]: [ViewportStatus.IDLE, ViewportStatus.ERROR, ViewportStatus.DISPOSING],
  [ViewportStatus.IDLE]: [ViewportStatus.LOADING, ViewportStatus.DISPOSING, ViewportStatus.ERROR],
  [ViewportStatus.LOADING]: [ViewportStatus.READY, ViewportStatus.ERROR, ViewportStatus.DISPOSING],
  [ViewportStatus.READY]: [ViewportStatus.LOADING, ViewportStatus.DISPOSING, ViewportStatus.ERROR],
  [ViewportStatus.ERROR]: [ViewportStatus.IDLE, ViewportStatus.LOADING, ViewportStatus.DISPOSING],
  [ViewportStatus.DISPOSING]: [ViewportStatus.DISPOSED],
  [ViewportStatus.DISPOSED]: [], // Terminal state
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: ViewportStatus, to: ViewportStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * States where viewport can accept user interactions
 */
export const INTERACTIVE_STATES = [ViewportStatus.READY];

/**
 * States where viewport can be disposed safely
 */
export const DISPOSABLE_STATES = [
  ViewportStatus.IDLE,
  ViewportStatus.READY,
  ViewportStatus.ERROR,
  ViewportStatus.LOADING,
];

/**
 * States where rendering operations should be skipped
 */
export const NON_RENDERABLE_STATES = [
  ViewportStatus.INITIALIZING,
  ViewportStatus.IDLE,
  ViewportStatus.DISPOSING,
  ViewportStatus.DISPOSED,
  ViewportStatus.ERROR,
];

