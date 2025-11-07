"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List, Grid3X3, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DicomSeries } from '@/interfaces/image-dicom/dicom-series.interface';
import { DicomStudy } from '@/interfaces/image-dicom/dicom-study.interface';

interface StudiesPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSeriesSelect?: (series: DicomSeries) => void;
  studies?: DicomStudy[];
  series?: DicomSeries[];
  showSeriesOnly?: boolean;
}

const StudiesPanel = ({ isCollapsed, onToggleCollapse, onSeriesSelect, studies = [], series = [], showSeriesOnly = false }: StudiesPanelProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterModality, setFilterModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSeriesClick = (series: DicomSeries) => {
    setSelectedSeries(series.id);
    onSeriesSelect?.(series);
  };

  // Filter series based on search and modality
  const filteredSeries = series.filter(s => {
    const matchesSearch = searchQuery === '' || (s.seriesDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'All' || (typeof s.modality === 'string' ? s.modality === filterModality : (s.modality as any)?.modalityCode === filterModality);
    return matchesSearch && matchesModality;
  });

  return (
    <TooltipProvider>
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col  h-100 overflow-y-auto">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-slate-700">
          <div className="ml-8 flex items-center gap-2">
            <h2 className="text-blue-400 font-medium text-sm">
              {showSeriesOnly ? 'Series' : 'Studies'}
            </h2>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
              {showSeriesOnly ? series.length : studies.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilter(!showFilter)}
                  className={`h-7 w-7 p-0 transition-colors ${
                    showFilter ? 'text-blue-300 bg-slate-800' : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800'
                  }`}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                Filter Studies
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
                >
                  {viewMode === 'list' ? <Grid3X3 className="h-3 w-3" /> : <List className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                {viewMode === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <div className="p-3 border-b border-slate-700 bg-slate-800/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search studies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Modality:</span>
                <Select value={filterModality} onValueChange={setFilterModality}>
                  <SelectTrigger className="h-8 w-24 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="All" className="text-white hover:bg-slate-700">All</SelectItem>
                    <SelectItem value="CT" className="text-white hover:bg-slate-700">CT</SelectItem>
                    <SelectItem value="MRI" className="text-white hover:bg-slate-700">MRI</SelectItem>
                    <SelectItem value="X-Ray" className="text-white hover:bg-slate-700">X-Ray</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilter(false)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {showSeriesOnly ? (
              // Show series directly when showSeriesOnly is true
              filteredSeries.length > 0 ? (
                <div className="space-y-1">
                  {filteredSeries.map((series) => (
                    <div
                      key={series.id}
                      onClick={() => handleSeriesClick(series)}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedSeries === series.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
                            {typeof series.modality === 'string' ? series.modality : (series.modality as any)?.modalityCode || 'Unknown'}
                          </Badge>
                          <span className="text-sm font-medium">Series</span>
                        </div>
                        <div className="text-xs text-slate-400">{series.numberOfInstances} instances</div>
                      </div>
                      <div className="text-sm text-slate-300 mb-2">{series.seriesDescription || 'No description'}</div>
                      <div className="w-full h-20 bg-slate-700 rounded flex items-center justify-center">
                        <span className="text-xs text-slate-500">Preview</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-sm">No series available</div>
                  <div className="text-xs mt-1">Load series to view them here</div>
                </div>
              )
            ) : (
              // Show studies with their series when showSeriesOnly is false
              studies.length > 0 ? studies.map((study) => (
                <div key={study.id} className="space-y-2">
                  {/* Study Header */}
                  <div className="px-2 py-1 bg-slate-800 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{study.studyDate}</span>
                      <span className="text-blue-400 text-xs">{typeof study.modality === 'string' ? study.modality : (study.modality as any)?.modalityCode || 'Unknown'}</span>
                    </div>
                    <div className="text-slate-300 text-xs truncate">{study.studyDescription || 'No description'}</div>
                    <div className="text-slate-500 text-xs">{study.numberOfSeries} series</div>
                  </div>

                  {/* Series List - Show series from the series prop that belong to this study */}
                  <div className="space-y-1">
                    {filteredSeries.filter(s => s.id.startsWith(study.id)).map((series) => (
                      <div
                        key={series.id}
                        onClick={() => handleSeriesClick(series)}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedSeries === series.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
                              {typeof series.modality === 'string' ? series.modality : (series.modality as any)?.modalityCode || 'Unknown'}
                            </Badge>
                            <span className="text-xs font-medium">Series</span>
                          </div>
                          <div className="text-xs text-slate-400">{series.numberOfInstances} instances</div>
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-1">{series.seriesDescription || 'No description'}</div>
                        <div className="mt-2 w-16 h-12 bg-slate-700 rounded flex items-center justify-center">
                          <span className="text-xs text-slate-500">Preview</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-sm">No studies available</div>
                  <div className="text-xs mt-1">Load studies to view them here</div>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export { StudiesPanel };
export default StudiesPanel;