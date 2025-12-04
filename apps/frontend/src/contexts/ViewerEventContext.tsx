"use client";

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { viewerEventService } from '@/services/ViewerEventService';
import ViewerEventService from '@/services/ViewerEventService';

interface ViewerEventContextValue {
  service: ViewerEventService;
  subscribe: (eventName: string, callback: (data: any) => void) => () => void;
  publish: (eventName: string, data?: any) => void;
}

const ViewerEventContext = createContext<ViewerEventContextValue | null>(null);

export function ViewerEventProvider({ children }: { children: React.ReactNode }) {
  const contextValue = useRef<ViewerEventContextValue>({
    service: viewerEventService,
    subscribe: (eventName, callback) => viewerEventService.subscribe(eventName, callback),
    publish: (eventName, data) => viewerEventService.publish(eventName, data),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      viewerEventService.clearSubscriptions();
    };
  }, []);

  return (
    <ViewerEventContext.Provider value={contextValue.current}>
      {children}
    </ViewerEventContext.Provider>
  );
}

/**
 * Hook to use viewer event service
 */
export function useViewerEvents() {
  const context = useContext(ViewerEventContext);
  if (!context) {
    throw new Error('useViewerEvents must be used within ViewerEventProvider');
  }
  return context;
}

/**
 * Hook to subscribe to a specific event with automatic cleanup
 */
export function useViewerEvent(
  eventName: string,
  callback: (data: any) => void,
  deps: React.DependencyList = []
) {
  const { subscribe } = useViewerEvents();

  useEffect(() => {
    const unsubscribe = subscribe(eventName, callback);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, subscribe, ...deps]);
}

// Export event constants for convenience
export const ViewerEvents = ViewerEventService.EVENTS;

