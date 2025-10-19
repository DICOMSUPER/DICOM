"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List, Grid3X3, Filter, Search, X, FolderOpen, Database, RefreshCw, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DicomStudy, DicomSeries } from '@/services/imagingApi';

interface ViewerRightSidebarProps {
  onSeriesSelect?: (series: DicomSeries) => void;
  studies?: DicomStudy[];
  series?: DicomSeries[];
  showSeriesOnly?: boolean;
  selectedStudy?: DicomStudy | null;
}

const ViewerRightSidebar = ({ onSeriesSelect, studies = [], series = [], showSeriesOnly = false, selectedStudy }: ViewerRightSidebarProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterModality, setFilterModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

  const handleSeriesClick = (series: DicomSeries) => {
    setSelectedSeries(series.id);
    onSeriesSelect?.(series);
  };

  // Helper function to get modality for a series
  const getSeriesModality = (series: DicomSeries) => {
    // If we have selectedStudy (showSeriesOnly mode), use its modality
    if (selectedStudy?.modality?.modalityCode) {
      return selectedStudy.modality.modalityCode;
    }
    
    // Otherwise, try to find the study from studies array
    const study = studies.find(s => s.id === series.studyId);
    return study?.modality?.modalityCode || 'Unknown';
  };

  // Toggle series expansion - keep multiple expanded
  const toggleSeriesExpansion = (seriesId: string) => {
    setExpandedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });
  };

  // Generate preview image URL (placeholder for now)
  const getPreviewImageUrl = (series: DicomSeries) => {
    // This would be replaced with actual DICOM image URL
    return `https://via.placeholder.com/120x80/1e293b/64748b?text=${series.seriesNumber}`;
  };

  // Filter series based on search and modality
  const filteredSeries = series.filter(s => {
    const matchesSearch = searchQuery === '' || (s.seriesDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'All' || getSeriesModality(s) === filterModality;
    return matchesSearch && matchesModality;
  });

  // Series Card Component
  const SeriesCard = ({ series, isExpanded }: { series: DicomSeries; isExpanded: boolean }) => (
    <div 
      className={`rounded cursor-pointer transition-colors ${
        selectedSeries === series.id
          ? 'bg-blue-600 text-white'
          : 'bg-slate-800 hover:bg-slate-900 text-slate-300'
      } p-3 mb-2`}
      onClick={() => handleSeriesClick(series)}
    >
      {/* Series Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
            {getSeriesModality(series)}
          </Badge>
          <span className="text-sm font-medium">Series {series.seriesNumber}</span>
          {series.numberOfInstances > 0 && (
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
              {series.numberOfInstances} images
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSeriesExpansion(series.id);
                  }}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? 'Thu gọn' : 'Mở rộng'} chi tiết</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Series Description */}
      <div className="text-sm mb-3 text-slate-300">
        {series.seriesDescription || 'No description'}
      </div>

      {/* Preview Image */}
      <div className="bg-slate-700 rounded flex items-center justify-center mb-3 h-20">
        <img
          src={getPreviewImageUrl(series)}
          alt={`Series ${series.seriesNumber} preview`}
          className="w-full h-full object-cover rounded"
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden items-center justify-center text-slate-500">
          <ImageIcon size={24} />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-600 pt-3 mt-3">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Body Part:</span>
              <span className="text-slate-300">{series.bodyPartExamined || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="text-slate-300">{series.protocolName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-slate-300">{series.seriesDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time:</span>
              <span className="text-slate-300">{series.seriesTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Series UID:</span>
              <span className="text-slate-300 text-xs font-mono truncate max-w-32" title={series.seriesInstanceUid}>
                {series.seriesInstanceUid || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Study ID:</span>
              <span className="text-slate-300 text-xs font-mono truncate max-w-32" title={series.studyId}>
                {series.studyId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created:</span>
              <span className="text-slate-300">
                {series.createdAt ? new Date(series.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-green-400 text-xs">
                Active
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-full">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
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
                {showSeriesOnly ? 'Filter Series' : 'Filter Studies'}
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
                  placeholder={showSeriesOnly ? "Search series..." : "Search studies..."}
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {showSeriesOnly ? (
              // Show series directly when showSeriesOnly is true
              filteredSeries.length > 0 ? (
                <div className="space-y-1">
                  {filteredSeries.map((series) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      isExpanded={expandedSeries.has(series.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
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
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}>
                    {filteredSeries.filter(s => s.id.startsWith(study.id)).map((series) => (
                      <div
                        key={series.id}
                        onClick={() => handleSeriesClick(series)}
                        className={`rounded cursor-pointer transition-colors ${
                          selectedSeries === series.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-slate-300'
                        } ${viewMode === 'grid' ? 'p-2' : 'p-2'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
                              {getSeriesModality(series)}
                            </Badge>
                            {viewMode === 'list' && <span className="text-xs font-medium">Series</span>}
                          </div>
                          <div className="text-xs text-slate-400">{series.numberOfInstances} instances</div>
                        </div>
                        <div className={`text-slate-400 truncate ${viewMode === 'grid' ? 'text-xs mt-1' : 'text-xs mt-1'}`}>
                          {series.seriesDescription || 'No description'}
                        </div>
                        <div className={`bg-slate-700 rounded flex items-center justify-center ${
                          viewMode === 'grid' ? 'mt-1 w-full h-8' : 'mt-2 w-16 h-12'
                        }`}>
                          <span className="text-xs text-slate-500">Preview</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-500 py-8">
                  <Database className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <div className="text-sm">No studies available</div>
                  <div className="text-xs mt-1">Load studies to view them here</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ViewerRightSidebar;