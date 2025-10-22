"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DicomSeries } from '@/services/imagingApi';

export type ToolType = 
  | 'WindowLevel'
  | 'Zoom' 
  | 'Pan'
  | 'StackScroll'
  | 'Length'
  | 'Probe'
  | 'RectangleROI'
  | 'EllipticalROI'
  | 'CircleROI'
  | 'Bidirectional'
  | 'Angle'
  | 'CobbAngle'
  | 'ArrowAnnotate'
  | 'Magnify'
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
  draggedSeries: DicomSeries | null;
  dropTargetViewport: number | null;
  viewportSeries: Map<number, DicomSeries>;
  viewportTransforms: Map<number, ViewportTransform>;
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
  setDraggedSeries: (series: DicomSeries | null) => void;
  setDropTargetViewport: (viewport: number | null) => void;
  setViewportSeries: (viewport: number, series: DicomSeries) => void;
  getViewportSeries: (viewport: number) => DicomSeries | undefined;
  getViewportTransform: (viewport: number) => ViewportTransform;
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
  draggedSeries: null,
  dropTargetViewport: null,
  viewportSeries: new Map(),
  viewportTransforms: new Map(),
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
  };

  const rotateViewport = (degrees: number) => {
    console.log('Rotate viewport:', state.activeViewport, 'by', degrees, 'degrees');
    
    // Dispatch event to Cornerstone.js for actual viewport rotation
    window.dispatchEvent(new CustomEvent('rotateViewport', { 
      detail: { degrees, viewportId: 'CT_VIEWPORT' } 
    }));
    
    // Update context state for UI consistency
    const current = getViewportTransform(state.activeViewport);
    const newRotation = (current.rotation + degrees) % 360;
    updateViewportTransform(state.activeViewport, { rotation: newRotation });
  };

  const flipViewport = (direction: 'horizontal' | 'vertical') => {
    console.log('Flip viewport:', state.activeViewport, direction);
    
    // Dispatch event to Cornerstone.js for actual viewport flip
    window.dispatchEvent(new CustomEvent('flipViewport', { 
      detail: { direction, viewportId: 'CT_VIEWPORT' } 
    }));
    
    // Update context state for UI consistency
    const current = getViewportTransform(state.activeViewport);
    if (direction === 'horizontal') {
      updateViewportTransform(state.activeViewport, { flipH: !current.flipH });
    } else {
      updateViewportTransform(state.activeViewport, { flipV: !current.flipV });
    }
  };

  const invertViewport = () => {
    console.log('Invert viewport:', state.activeViewport);
    // This will trigger color inversion in the viewport component
  };

  const setDraggedSeries = (series: DicomSeries | null) => {
    setState(prev => ({ ...prev, draggedSeries: series }));
  };

  const setDropTargetViewport = (viewport: number | null) => {
    setState(prev => ({ ...prev, dropTargetViewport: viewport }));
  };

  const setViewportSeries = (viewport: number, series: DicomSeries) => {
    setState(prev => {
      const newViewportSeries = new Map(prev.viewportSeries);
      newViewportSeries.set(viewport, series);
      return { ...prev, viewportSeries: newViewportSeries };
    });
    console.log('Series assigned to viewport:', viewport, series.seriesDescription);
  };

  const getViewportSeries = (viewport: number): DicomSeries | undefined => {
    return state.viewportSeries.get(viewport);
  };

  const clearAnnotations = () => {
    console.log('Clear annotations requested from context');
    // Dispatch custom event that ViewPortMain will listen to
    window.dispatchEvent(new CustomEvent('clearAnnotations'));
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
    setDraggedSeries,
    setDropTargetViewport,
    setViewportSeries,
    getViewportSeries,
    getViewportTransform,
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