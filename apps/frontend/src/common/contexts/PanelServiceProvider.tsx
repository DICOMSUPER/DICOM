"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PanelService, { PanelPosition, PanelData } from '@/services/PanelService';

interface PanelServiceContextValue {
  panelService: PanelService;
  leftPanels: PanelData[];
  rightPanels: PanelData[];
  hasLeftPanels: boolean;
  hasRightPanels: boolean;
}

const PanelServiceContext = createContext<PanelServiceContextValue | null>(null);

export function usePanelService() {
  const context = useContext(PanelServiceContext);
  if (!context) {
    throw new Error('usePanelService must be used within PanelServiceProvider');
  }
  return context;
}

interface PanelServiceProviderProps {
  children: ReactNode;
  defaultLeftPanels?: PanelData[];
  defaultRightPanels?: PanelData[];
}

export function PanelServiceProvider({ 
  children, 
  defaultLeftPanels = [],
  defaultRightPanels = []
}: PanelServiceProviderProps) {
  const [panelService] = useState(() => new PanelService());
  const [leftPanels, setLeftPanels] = useState<PanelData[]>(defaultLeftPanels);
  const [rightPanels, setRightPanels] = useState<PanelData[]>(defaultRightPanels);

  useEffect(() => {
    // Set default panels
    if (defaultLeftPanels.length > 0) {
      panelService.setPanels('left', defaultLeftPanels);
    }
    if (defaultRightPanels.length > 0) {
      panelService.setPanels('right', defaultRightPanels);
    }
  }, []);

  useEffect(() => {
    // Subscribe to panel changes
    const unsubscribe = panelService.subscribe(
      PanelService.EVENTS.PANELS_CHANGED,
      ({ position, panels }: { position: PanelPosition; panels: PanelData[] }) => {
        if (position === 'left') {
          setLeftPanels(panels);
        } else if (position === 'right') {
          setRightPanels(panels);
        }
      }
    );

    return () => {
      unsubscribe.unsubscribe();
    };
  }, [panelService]);

  const value: PanelServiceContextValue = {
    panelService,
    leftPanels,
    rightPanels,
    hasLeftPanels: leftPanels.length > 0,
    hasRightPanels: rightPanels.length > 0,
  };

  return (
    <PanelServiceContext.Provider value={value}>
      {children}
    </PanelServiceContext.Provider>
  );
}
