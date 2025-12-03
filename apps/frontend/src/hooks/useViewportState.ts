/**
 * useViewportState Hook - Based on OHIF Viewer patterns
 * React hook for managing viewport lifecycle state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import viewportStateManager, { ViewportStateData } from '@/utils/viewportStateManager';
import { ViewportStatus } from '@/types/viewport-state';

export function useViewportState(viewportId: string | null | undefined) {
  const [state, setState] = useState<ViewportStateData | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize viewport state on mount
  useEffect(() => {
    if (!viewportId) return;

    // Initialize if not already
    if (!isInitializedRef.current) {
      viewportStateManager.initialize(viewportId);
      isInitializedRef.current = true;
    }

    // Subscribe to state changes
    const unsubscribe = viewportStateManager.subscribe(viewportId, (newState) => {
      setState(newState);
    });

    // Get initial state
    const initialState = viewportStateManager.getState(viewportId);
    if (initialState) {
      setState(initialState);
    }

    return () => {
      unsubscribe();
    };
  }, [viewportId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewportId && isInitializedRef.current) {
        // Don't dispose immediately, let the parent manage lifecycle
        isInitializedRef.current = false;
      }
    };
  }, [viewportId]);

  const transition = useCallback(
    (newStatus: ViewportStatus, data?: Partial<ViewportStateData>) => {
      if (!viewportId) return false;
      return viewportStateManager.transition(viewportId, newStatus, data);
    },
    [viewportId]
  );

  const setImageData = useCallback(
    (imageData: any) => {
      if (!viewportId) return false;
      return viewportStateManager.setImageData(viewportId, imageData);
    },
    [viewportId]
  );

  const setError = useCallback(
    (error: Error) => {
      if (!viewportId) return;
      viewportStateManager.setError(viewportId, error);
    },
    [viewportId]
  );

  const startLoading = useCallback(() => {
    if (!viewportId) return false;
    return viewportStateManager.startLoading(viewportId);
  }, [viewportId]);

  const canRender = useCallback(() => {
    if (!viewportId) return false;
    return viewportStateManager.canRender(viewportId);
  }, [viewportId]);

  const isReady = useCallback(() => {
    if (!viewportId) return false;
    return viewportStateManager.isReady(viewportId);
  }, [viewportId]);

  const hasImageData = useCallback(() => {
    if (!viewportId) return false;
    return viewportStateManager.hasImageData(viewportId);
  }, [viewportId]);

  return {
    state,
    status: state?.status ?? ViewportStatus.INITIALIZING,
    imageData: state?.imageData ?? null,
    error: state?.error ?? null,
    transition,
    setImageData,
    setError,
    startLoading,
    canRender,
    isReady,
    hasImageData,
  };
}

