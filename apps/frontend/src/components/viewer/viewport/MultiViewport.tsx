"use client";

import React, { useState } from 'react';
import { Grid, Maximize2, RotateCw, FlipHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dynamic from 'next/dynamic';
import { useViewer } from '@/common/contexts/ViewerContext';

const CornerstoneViewport = dynamic(
  () => import('./CornerstoneViewport'),
  { ssr: false }
);

type GridLayout = '1x1' | '1x2' | '2x1' | '2x2' | '1x3' | '3x1';

interface ViewportProps {
  selectedSeries?: any;
}

interface Series {
  id: string;
  imageIds?: string[];
}

const MultiViewport = ({ selectedSeries }: ViewportProps) => {
  const { state, setActiveViewport, setLayout } = useViewer();

  const getGridClass = (layout: GridLayout) => {
    switch (layout) {
      case '1x1': return 'grid-cols-1 grid-rows-1';
      case '1x2': return 'grid-cols-1 grid-rows-2';
      case '2x1': return 'grid-cols-2 grid-rows-1';
      case '2x2': return 'grid-cols-2 grid-rows-2';
      case '1x3': return 'grid-cols-1 grid-rows-3';
      case '3x1': return 'grid-cols-3 grid-rows-1';
      default: return 'grid-cols-1 grid-rows-1';
    }
  };

  const getViewportCount = (layout: GridLayout) => {
    const [cols, rows] = layout.split('x').map(Number);
    return cols * rows;
  };

  const viewportCount = getViewportCount(state.layout);

  // No default images - will be populated from selected series
  const sampleImageIds: string[] = [];

  return (
    <div className=" flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                <Grid className="h-4 w-4 mr-2" />
                Layout: {state.layout}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLayout('1x1')}>1x1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('1x2')}>1x2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('2x1')}>2x1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('2x2')}>2x2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('1x3')}>1x3</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout('3x1')}>3x1</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Viewport Grid */}
      <div className={`flex-1 grid gap-1 p-1 ${getGridClass(state.layout)}`}>
        {Array.from({ length: viewportCount }, (_, index) => (
          <CornerstoneViewport
            key={`viewport-${index}`}
            viewportId={`viewport-${index}`}
            isActive={state.activeViewport === index}
            onClick={() => setActiveViewport(index)}
            imageIds={index === 0 ? sampleImageIds : undefined} // Only first viewport has data for demo
          />
        ))}
      </div>
    </div>
  );
};

export default MultiViewport;