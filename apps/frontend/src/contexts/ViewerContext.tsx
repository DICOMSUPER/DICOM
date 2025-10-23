"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { DicomSeries } from '@/services/imagingApi';

export type ToolType = 
  | 'WindowLevel'
  | 'Zoom' 
  | 'Pan'
  | 'StackScroll'
  | 'Length'
  | 'Height'
  | 'Probe'
  | 'RectangleROI'
  | 'EllipticalROI'
  | 'CircleROI'
  | 'Bidirectional'
  | 'Angle'
  | 'CobbAngle'
  | 'ArrowAnnotate'
  | 'SplineROI'
  | 'Magnify'
  | 'ETDRSGrid'
  | 'ReferenceLines'
  | 'Reset'
  | 'Invert'
  | 'Rotate'
  | 'FlipH'
  | 'FlipV';

export type GridLayout = '1x1' | '1x2' | '2x1' | '2x2' | '1x3' | '3x1';

export interface ViewportTransform {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  pan: { x: number; y: number };
}

export interface ViewerState {
  activeTool: ToolType;
  layout: GridLayout;
  activeViewport: number;
  isToolActive: boolean;
  viewportSeries: Map<number, DicomSeries>;
  viewportTransforms: Map<number, ViewportTransform>;
  viewportIds: Map<number, string>;
  renderingEngineIds: Map<number, string>;
  history: ViewerState[];
  historyIndex: number;
}

export interface ViewerContextType {
  state: ViewerState;
  setActiveTool: (tool: ToolType) => void;
  setLayout: (layout: GridLayout) => void;
  setActiveViewport: (viewport: number) => void;
  resetView: () => void;
  rotateViewport: (degrees: number) => void;
  flipViewport: (direction: 'horizontal' | 'vertical') => void;
  invertViewport: () => void;
  clearAnnotations: () => void;
  setViewportSeries: (viewport: number, series: DicomSeries) => void;
  getViewportSeries: (viewport: number) => DicomSeries | undefined;
  getViewportTransform: (viewport: number) => ViewportTransform;
  setViewportId: (viewport: number, viewportId: string) => void;
  getViewportId: (viewport: number) => string | undefined;
  setRenderingEngineId: (viewport: number, renderingEngineId: string) => void;
  getRenderingEngineId: (viewport: number) => string | undefined;
}

const defaultTransform: ViewportTransform = {
  rotation: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

const defaultState: ViewerState = {
  activeTool: 'WindowLevel',
  layout: '1x1',
  activeViewport: 0,
  isToolActive: false,
  viewportSeries: new Map(),
  viewportTransforms: new Map(),
  viewportIds: new Map(),
  renderingEngineIds: new Map(),
  history: [],
  historyIndex: -1,
};

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ViewerState>(defaultState);

  // Helper to save state to history before making changes
  const saveToHistory = (newState: ViewerState) => {
    const history = state.history.slice(0, state.historyIndex + 1);
    history.push(newState);
    return {
      ...newState,
      history,
      historyIndex: history.length - 1,
    };
  };

  const setActiveTool = (tool: ToolType) => {
    setState(prev => ({ 
      ...prev, 
      activeTool: tool,
      isToolActive: true 
    }));
    console.log('Tool activated:', tool);
  };

  const setLayout = (layout: GridLayout) => {
    setState(prev => saveToHistory({ ...prev, layout }));
    console.log('Layout changed:', layout);
  };

  const setActiveViewport = (viewport: number) => {
    setState(prev => ({ ...prev, activeViewport: viewport }));
    console.log('Active viewport changed:', viewport);
  };

  const getViewportTransform = (viewport: number): ViewportTransform => {
    return state.viewportTransforms.get(viewport) || defaultTransform;
  };

  const setViewportId = useCallback((viewport: number, viewportId: string) => {
    setState(prev => {
      const newViewportIds = new Map(prev.viewportIds);
      newViewportIds.set(viewport, viewportId);
      return { ...prev, viewportIds: newViewportIds };
    });
  }, []);

  const getViewportId = useCallback((viewport: number): string | undefined => {
    return state.viewportIds.get(viewport);
  }, [state.viewportIds]);

  const setRenderingEngineId = useCallback((viewport: number, renderingEngineId: string) => {
    setState(prev => {
      const newRenderingEngineIds = new Map(prev.renderingEngineIds);
      newRenderingEngineIds.set(viewport, renderingEngineId);
      return { ...prev, renderingEngineIds: newRenderingEngineIds };
    });
  }, []);

  const getRenderingEngineId = useCallback((viewport: number): string | undefined => {
    return state.renderingEngineIds.get(viewport);
  }, [state.renderingEngineIds]);

  const updateViewportTransform = (viewport: number, transform: Partial<ViewportTransform>) => {
    const current = getViewportTransform(viewport);
    const updated = { ...current, ...transform };
    const newTransforms = new Map(state.viewportTransforms);
    newTransforms.set(viewport, updated);
    
    setState(prev => saveToHistory({
      ...prev,
      viewportTransforms: newTransforms,
    }));
  };

  const resetView = () => {
    console.log('Reset view for viewport:', state.activeViewport);
    updateViewportTransform(state.activeViewport, defaultTransform);
    
    // Dispatch event to Cornerstone.js for actual viewport reset
    window.dispatchEvent(new CustomEvent('resetView'));
  };

  const rotateViewport = (degrees: number) => {
    console.log('Rotate viewport:', state.activeViewport, 'by', degrees, 'degrees');
    
    // Dispatch event to Cornerstone.js for actual viewport rotation
    // Use actual viewport ID from context state or fallback to Cornerstone.js standard ID
    const viewportId = state.viewportIds.get(state.activeViewport) || state.activeViewport.toString();
    window.dispatchEvent(new CustomEvent('rotateViewport', { 
      detail: { degrees, viewportId } 
    }));
    
    // Note: Don't update context state here - let Cornerstone.js handle the actual rotation
    // The context state is just for UI tracking, not the actual viewport state
  };

  const flipViewport = (direction: 'horizontal' | 'vertical') => {
    console.log('Flip viewport:', state.activeViewport, direction);
    
    // Dispatch event to Cornerstone.js for actual viewport flip
    // Use actual viewport ID from context state or fallback to Cornerstone.js standard ID
    const viewportId = state.viewportIds.get(state.activeViewport) || state.activeViewport.toString();
    window.dispatchEvent(new CustomEvent('flipViewport', { 
      detail: { direction, viewportId } 
    }));
    
    // Note: Don't update context state here - let Cornerstone.js handle the actual flip
    // The context state is just for UI tracking, not the actual viewport state
  };

  const invertViewport = () => {
    console.log('Invert viewport:', state.activeViewport);
    // Dispatch event to trigger color map inversion
    window.dispatchEvent(new CustomEvent('invertColorMap'));
  };


  const setViewportSeries = useCallback((viewport: number, series: DicomSeries) => {
    setState(prev => {
      const newViewportSeries = new Map(prev.viewportSeries);
      newViewportSeries.set(viewport, series);
      return { ...prev, viewportSeries: newViewportSeries };
    });
    console.log('Series assigned to viewport:', viewport, series.seriesDescription);
  }, []);

  const getViewportSeries = useCallback((viewport: number): DicomSeries | undefined => {
    return state.viewportSeries.get(viewport);
  }, [state.viewportSeries]);

  const clearAnnotations = () => {
    console.log('Clear annotations requested from context');
    // Dispatch custom event that ViewPortMain will listen to
    // Include active viewport ID to target specific viewport or fallback to Cornerstone.js standard ID
    const activeViewportId = state.viewportIds.get(state.activeViewport) || state.activeViewport.toString();
    window.dispatchEvent(new CustomEvent('clearAnnotations', {
      detail: { activeViewportId }
    }));
  };

  const value: ViewerContextType = {
    state,
    setActiveTool,
    setLayout,
    setActiveViewport,
    resetView,
    rotateViewport,
    flipViewport,
    invertViewport,
    clearAnnotations,
    setViewportSeries,
    getViewportSeries,
    getViewportTransform,
    setViewportId,
    getViewportId,
    setRenderingEngineId,
    getRenderingEngineId,
  };

  return (
    <ViewerContext.Provider value={value}>
      {children}
    </ViewerContext.Provider>
  );
};

export const useViewer = () => {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error('useViewer must be used within a ViewerProvider');
  }
  return context;
};