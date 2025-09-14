"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List, Grid3X3, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Study {
  id: string;
  date: string;
  type: string;
  series: number;
  images: {
    id: string;
    type: string;
    seriesNumber: string;
    imageNumber: string;
    thumbnail: string;
    hasWarning?: boolean;
  }[];
}

const mockStudies: Study[] = [
  {
    id: '01-Jan-2024',
    date: 'Jan 1, 2024',
    type: 'CT\\MR\\CR\\US\\DS\\DR\\SR',
    series: 27,
    images: [
      { id: '1', type: 'MR', seriesNumber: 'S:0', imageNumber: '1', thumbnail: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', hasWarning: true },
      { id: '2', type: 'CR', seriesNumber: 'S:0', imageNumber: '1', thumbnail: 'https://images.pexels.com/photos/7089391/pexels-photo-7089391.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { id: '3', type: 'CT', seriesNumber: 'S:1', imageNumber: '1', thumbnail: 'https://images.pexels.com/photos/7089334/pexels-photo-7089334.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', hasWarning: true },
      { id: '4', type: 'CR', seriesNumber: 'S:1', imageNumber: '1', thumbnail: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { id: '5', type: 'DR', seriesNumber: 'S:1', imageNumber: '1', thumbnail: 'https://images.pexels.com/photos/7089391/pexels-photo-7089391.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', hasWarning: true },
      { id: '6', type: 'CT', seriesNumber: 'S:2', imageNumber: '1', thumbnail: 'https://images.pexels.com/photos/7089334/pexels-photo-7089334.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    ]
  }
];

interface StudiesPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const StudiesPanel = ({ isCollapsed, onToggleCollapse }: StudiesPanelProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="h-12 flex items-center justify-center border-b border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="writing-mode-vertical text-blue-400 text-sm font-medium transform rotate-180">
            Studies
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <h2 className="text-blue-400 font-medium">Studies</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            {viewMode === 'list' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {mockStudies.map((study) => (
            <div key={study.id} className="space-y-3">
              {/* Study Header */}
              <div className="flex items-center gap-2 text-sm">
               
                <span className="text-white font-medium">{study.id}</span>
                <span className="text-slate-400 text-xs">{study.type}</span>
                <span className="text-slate-500 text-xs ml-auto">{study.series}</span>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-2 gap-2">
                {study.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.thumbnail}
                        alt={`${image.type} scan`}
                        className="w-full h-full object-cover"
                      />
                      {image.hasWarning && (
                        <div className="absolute top-1 left-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                        {image.type}
                      </div>
                    </div>
                    <div className="p-2 text-xs text-slate-400">
                      <div>{image.seriesNumber} □ {image.imageNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StudiesPanel;