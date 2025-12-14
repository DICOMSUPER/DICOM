'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import ViewportGridService from '@/services/ViewportGridService';
import DisplaySetService from '@/services/DisplaySetService';

interface ServicesContextType {
  viewportGridService: ViewportGridService;
  displaySetService: DisplaySetService;
}

const ServicesContext = createContext<ServicesContextType | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => ({
    viewportGridService: new ViewportGridService(),
    displaySetService: new DisplaySetService(),
  }), []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return context;
}
