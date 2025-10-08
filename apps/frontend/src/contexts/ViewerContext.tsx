"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export interface ViewerState {
  activeTool: ToolType;
  layout: GridLayout;
  activeViewport: number;
  isToolActive: boolean;
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
}

const defaultState: ViewerState = {
  activeTool: 'WindowLevel',
  layout: '1x1',
  activeViewport: 0,
  isToolActive: false,
};

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ViewerState>(defaultState);

  const setActiveTool = (tool: ToolType) => {
    setState(prev => ({ 
      ...prev, 
      activeTool: tool,
      isToolActive: true 
    }));
    console.log('Tool activated:', tool);
  };

  const setLayout = (layout: GridLayout) => {
    setState(prev => ({ ...prev, layout }));
    console.log('Layout changed:', layout);
  };

  const setActiveViewport = (viewport: number) => {
    setState(prev => ({ ...prev, activeViewport: viewport }));
    console.log('Active viewport changed:', viewport);
  };

  const resetView = () => {
    console.log('Reset view for viewport:', state.activeViewport);
    // This will be implemented in the viewport component
  };

  const rotateViewport = (degrees: number) => {
    console.log('Rotate viewport:', state.activeViewport, 'by', degrees, 'degrees');
    // This will be implemented in the viewport component
  };

  const flipViewport = (direction: 'horizontal' | 'vertical') => {
    console.log('Flip viewport:', state.activeViewport, direction);
    // This will be implemented in the viewport component
  };

  const invertViewport = () => {
    console.log('Invert viewport:', state.activeViewport);
    // This will be implemented in the viewport component
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