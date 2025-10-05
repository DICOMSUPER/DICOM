"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List, Grid3X3, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SeriesImage {
  id: string;
  instanceNumber: number;
  thumbnail?: string;
}

interface Series {
  id: string;
  seriesNumber: string;
  modality: string;
  description: string;
  instanceCount: number;
  thumbnail: string;
  images: SeriesImage[];
}

interface Study {
  id: string;
  date: string;
  description: string;
  modality: string;
  seriesCount: number;
  series: Series[];
}

const mockStudies: Study[] = [
  {
    id: '22-May-2014',
    date: '22-May-2014',
    description: 'DFCI CT CHEST W CONTRAST 6023',
    modality: 'CT',
    seriesCount: 381,
    series: [
      {
        id: 'series-1',
        seriesNumber: '2.0',
        modality: 'CT',
        description: 'Lung 5.0 Lung I+ CE',
        instanceCount: 2,
        thumbnail: '/api/placeholder/80/80',
        images: Array.from({ length: 55 }, (_, i) => ({
          id: `img-${i}`,
          instanceNumber: i + 1
        }))
      },
      {
        id: 'series-2',
        seriesNumber: '4.0',
        modality: 'CT',
        description: 'Body 4.0 Lung I+/C...',
        instanceCount: 51,
        thumbnail: '/api/placeholder/80/80',
        images: Array.from({ length: 51 }, (_, i) => ({
          id: `img-${i}`,
          instanceNumber: i + 1
        }))
      },
      {
        id: 'series-3',
        seriesNumber: '4.0',
        modality: 'CT',
        description: 'Body 4.0 Lung I+/S...',
        instanceCount: 81,
        thumbnail: '/api/placeholder/80/80',
        images: Array.from({ length: 81 }, (_, i) => ({
          id: `img-${i}`,
          instanceNumber: i + 1
        }))
      },
      {
        id: 'series-4',
        seriesNumber: '5.0',
        modality: 'CT',
        description: 'Body 5.0 Lung I+ CE',
        instanceCount: 55,
        thumbnail: '/api/placeholder/80/80',
        images: Array.from({ length: 55 }, (_, i) => ({
          id: `img-${i}`,
          instanceNumber: i + 1
        }))
      }
    ]
  },
  {
    id: '25-Mar-2014',
    date: '25-Mar-2014',
    description: 'DFCI CT CHEST W CONTRAST 6023',
    modality: 'CT',
    seriesCount: 249,
    series: [
      {
        id: 'series-5',
        seriesNumber: '2.0',
        modality: 'CT',
        description: 'Chest CT',
        instanceCount: 125,
        thumbnail: '/api/placeholder/80/80',
        images: Array.from({ length: 125 }, (_, i) => ({
          id: `img-${i}`,
          instanceNumber: i + 1
        }))
      }
    ]
  }
];

interface StudiesPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface StudiesPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSeriesSelect?: (series: Series) => void;
}

const StudiesPanel = ({ isCollapsed, onToggleCollapse, onSeriesSelect }: StudiesPanelProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  const handleSeriesClick = (series: Series) => {
    setSelectedSeries(series.id);
    onSeriesSelect?.(series);
  };

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
      <div className="h-12 flex items-center justify-between px-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <h2 className="text-blue-400 font-medium text-sm">Studies</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <Filter className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            {viewMode === 'list' ? <Grid3X3 className="h-3 w-3" /> : <List className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {mockStudies.map((study) => (
            <div key={study.id} className="space-y-2">
              {/* Study Header */}
              <div className="px-2 py-1 bg-slate-800 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{study.date}</span>
                  <span className="text-blue-400 text-xs">{study.modality}</span>
                </div>
                <div className="text-slate-300 text-xs truncate">{study.description}</div>
                <div className="text-slate-500 text-xs">{study.seriesCount}</div>
              </div>

              {/* Series List */}
              <div className="space-y-1">
                {study.series.map((series) => (
                  <div
                    key={series.id}
                    onClick={() => handleSeriesClick(series)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors hover:bg-slate-800 ${
                      selectedSeries === series.id ? 'bg-blue-900 border border-blue-600' : 'bg-slate-800/50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                        <div className="w-8 h-8 bg-slate-300 rounded-sm opacity-30"></div>
                      </div>
                    </div>

                    {/* Series Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="bg-blue-600 text-white text-xs px-1 py-0.5 h-auto">
                          {series.modality}
                        </Badge>
                        <span className="text-white text-xs font-medium">{series.seriesNumber}</span>
                        <span className="text-slate-400 text-xs">□ {series.instanceCount}</span>
                      </div>
                      <div className="text-slate-300 text-xs truncate">{series.description}</div>
                      <div className="text-slate-500 text-xs">S:{series.seriesNumber.split('.')[0]} □ {series.instanceCount}</div>
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