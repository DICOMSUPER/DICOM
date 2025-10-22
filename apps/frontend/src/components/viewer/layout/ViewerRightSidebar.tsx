"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, List, Filter, Search, X, FolderOpen, Database, RefreshCw, ChevronDown, ChevronUp, Image as ImageIcon, GripVertical, Activity, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DicomSeries, DicomInstance } from '@/services/imagingApi';
import { useViewer } from '@/contexts/ViewerContext';
import { imagingApi } from '@/services/imagingApi';

interface ViewerRightSidebarProps {
  onSeriesSelect?: (series: DicomSeries) => void;
  series?: DicomSeries[];
  studyId?: string;
  onSeriesLoaded?: (series: DicomSeries[]) => void;
}

const ViewerRightSidebar = ({ onSeriesSelect, series = [], studyId, onSeriesLoaded }: ViewerRightSidebarProps) => {
  const { setDraggedSeries } = useViewer();
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterModality, setFilterModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [seriesInstances, setSeriesInstances] = useState<Record<string, DicomInstance[]>>({});
  const [loadingInstances, setLoadingInstances] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleSeriesClick = (series: DicomSeries) => {
    setSelectedSeries(series.id);
    onSeriesSelect?.(series);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, series: DicomSeries) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(series));
    setDraggedSeries(series);
    
    // Create enhanced drag preview with better styling
    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      width: 280px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%);
      border: 2px solid rgb(94, 234, 212);
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(94, 234, 212, 0.3);
      backdrop-filter: blur(10px);
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    dragPreview.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgb(6, 182, 212) 0%, rgb(59, 130, 246) 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-center;
          font-size: 24px;
          font-weight: bold;
          color: white;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        ">
          ${series.seriesNumber || '?'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 14px; font-weight: 600; color: rgb(94, 234, 212); margin-bottom: 4px;">
            Series ${series.seriesNumber}
          </div>
          <div style="font-size: 12px; color: rgb(203, 213, 225); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
            ${series.seriesDescription || 'No description'}
          </div>
          <div style="font-size: 11px; color: rgb(148, 163, 184); display: flex; gap: 8px;">
            <span>📊 ${series.numberOfInstances || 0} imgs</span>
            <span>🏷️ ${series.bodyPartExamined || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(94, 234, 212, 0.3); text-align: center; font-size: 11px; color: rgb(94, 234, 212); font-weight: 500;">
        🖱️ Drop to viewport
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 140, 60);
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 100);
  };

  const handleDragEnd = () => {
    setDraggedSeries(null);
  };

  // Helper function to get modality for a series
  const getSeriesModality = (series: DicomSeries) => {
    // Default modality for now - could be enhanced to fetch from study data
    return 'CT';
  };

  // Load series when studyId changes
  useEffect(() => {
    const loadSeries = async () => {
      if (studyId) {
        setLoading(true);
        try {
          const seriesResponse = await imagingApi.getSeriesByReferenceId(studyId, 'study', { page: 1, limit: 50 });
          console.log('Loaded series for study:', studyId, seriesResponse.data);
          // Pass series data to parent component
          onSeriesLoaded?.(seriesResponse.data);
        } catch (error) {
          console.error('Failed to load series:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSeries();
  }, [studyId, onSeriesLoaded]);

  // Toggle series expansion - keep multiple expanded
  const toggleSeriesExpansion = async (seriesId: string) => {
    const isExpanding = !expandedSeries.has(seriesId);
    
    setExpandedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });

    // Load instances if expanding and not already loaded
    if (isExpanding && !seriesInstances[seriesId]) {
      setLoadingInstances(prev => new Set(prev).add(seriesId));
      try {
        const instances = await imagingApi.getSeriesInstances(seriesId);
        setSeriesInstances(prev => ({
          ...prev,
          [seriesId]: instances
        }));
      } catch (error) {
        console.error('Failed to load instances:', error);
      } finally {
        setLoadingInstances(prev => {
          const newSet = new Set(prev);
          newSet.delete(seriesId);
          return newSet;
        });
      }
    }
  };


  // Filter series based on search and modality
  const filteredSeries = series.filter(s => {
    const matchesSearch = searchQuery === '' || (s.seriesDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'All' || getSeriesModality(s) === filterModality;
    return matchesSearch && matchesModality;
  });

  // Series Card Component with Drag & Drop
  const SeriesCard = ({ series, isExpanded }: { series: DicomSeries; isExpanded: boolean }) => (
    <div 
      draggable={true}
      onDragStart={(e) => handleDragStart(e, series)}
      onDragEnd={handleDragEnd}
      className={`rounded cursor-move transition-all duration-200 ${
        selectedSeries === series.id
          ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/50'
          : 'bg-gradient-to-r from-slate-800 to-slate-750 hover:from-slate-600 hover:to-slate-500 text-slate-200 hover:shadow-md'
      } p-4 mb-2 border-l-4 ${
        selectedSeries === series.id ? 'border-slate-400' : 'border-slate-600'
      } group hover:border-slate-400`}
      onClick={() => handleSeriesClick(series)}
    >
      {/* Drag Handle & Series Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className={`h-4 w-4 ${selectedSeries === series.id ? 'text-slate-200' : 'text-slate-500'} group-hover:text-slate-300 transition-colors`} />
          <Badge variant="secondary" className={`${selectedSeries === series.id ? 'bg-slate-600 text-slate-100' : 'bg-teal-600 text-white'} text-xs font-semibold px-2 py-1`}>
            {getSeriesModality(series)}
          </Badge>
          <span className="text-sm font-bold">Series {series.seriesNumber}</span>
          {series.numberOfInstances > 0 && (
            <Badge variant="outline" className={`${selectedSeries === series.id ? 'text-green-200 border-green-300' : 'text-emerald-400 border-emerald-500'} text-xs flex items-center gap-1`}>
              <Activity className="h-3 w-3" />
              {series.numberOfInstances}
            </Badge>
          )}
        </div>
        {(
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
                    className={`h-7 w-7 p-0 ${selectedSeries === series.id ? 'text-slate-200 hover:text-white' : 'text-white hover:text-white'} transition-colors`}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-700 border-slate-600">
                  <p>{isExpanded ? 'Thu gọn' : 'Mở rộng'} chi tiết</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Series Description */}
      <div className={`text-sm mb-3 font-medium ${selectedSeries === series.id ? 'text-slate-100' : 'text-white'}`}>
        {series.seriesDescription || 'No description available'}
      </div>

      {/* Preview Thumbnail - Simple & Fast */}
      <div className={`rounded-lg overflow-hidden flex items-center justify-center mb-3 h-24 border-2 ${
        selectedSeries === series.id ? 'border-teal-400' : 'border-slate-600'
      } bg-gradient-to-br from-slate-900 to-slate-800 relative group/preview transition-all duration-200`}>
        {/* Series Number Badge */}
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className={`text-4xl font-bold mb-1 ${selectedSeries === series.id ? 'text-teal-400' : 'text-slate-400'}`}>
            {series.seriesNumber || '?'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ImageIcon size={14} />
            <span>{series.numberOfInstances || 0} images</span>
          </div>
        </div>
        
        {/* Drag hint overlay */}
        <div className="absolute inset-0 bg-teal-600/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <GripVertical className="h-6 w-6 text-teal-300" />
            <span className="text-xs text-teal-300 font-semibold">Drag to viewport</span>
          </div>
        </div>
        
        {/* Selected indicator */}
        {selectedSeries === series.id && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-teal-400 rounded-full animate-pulse shadow-lg shadow-teal-400/50"></div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-500 pt-3 mt-3">
          {/* Series Metadata */}
          <div className="space-y-2 text-xs mb-4">
            <div className="flex justify-between">
              <span className="text-white">Body Part:</span>
              <span className="text-white">{series.bodyPartExamined || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Protocol:</span>
              <span className="text-white">{series.protocolName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Date:</span>
              <span className="text-white">{series.seriesDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Time:</span>
              <span className="text-white">{series.seriesTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Series UID:</span>
              <span className="text-white text-xs font-mono truncate max-w-32" title={series.seriesInstanceUid}>
                {series.seriesInstanceUid || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Study ID:</span>
              <span className="text-white text-xs font-mono truncate max-w-32" title={series.studyId}>
                {series.studyId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Created:</span>
              <span className="text-white">
                {series.createdAt ? new Date(series.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Status:</span>
              <span className="text-green-400 text-xs">
                Active
              </span>
            </div>
          </div>

          {/* Instances Section */}
          <div className="border-t border-slate-600 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileImage className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-xs font-semibold text-teal-300">Instances</span>
              </div>
              <Badge variant="outline" className="text-xs text-teal-300 border-teal-500">
                {seriesInstances[series.id]?.length || series.numberOfInstances || 0}
              </Badge>
            </div>

            {/* Loading State */}
            {loadingInstances.has(series.id) && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                <span className="ml-2 text-xs text-white">Loading instances...</span>
              </div>
            )}

            {/* Instances List */}
            {!loadingInstances.has(series.id) && seriesInstances[series.id] && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {seriesInstances[series.id].map((instance, index) => (
                  <div
                    key={instance.id}
                    className="bg-slate-800/50 hover:bg-slate-700/70 rounded p-2 transition-colors cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle instance click - could load image here
                      console.log('Instance clicked:', instance);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-3 w-3 text-white group-hover:text-teal-400 transition-colors" />
                        <span className="text-xs font-medium text-white">
                          Instance #{instance.instanceNumber}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-slate-700 text-white text-[10px] px-1.5 py-0">
                        {index + 1}/{seriesInstances[series.id].length}
                      </Badge>
                    </div>
                    <div className="mt-1 text-[10px] text-white truncate font-mono">
                      {instance.fileName || instance.sopInstanceUid}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loadingInstances.has(series.id) && 
             !seriesInstances[series.id] && 
             series.numberOfInstances === 0 && (
              <div className="text-center py-4 text-slate-500 text-xs">
                <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <p>No instances available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l-2 border-teal-900/30 flex flex-col h-full shadow-2xl">
        {/* Medical-themed Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b-2 border-teal-800/40 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-600/20 rounded-lg border border-teal-500/30">
              <Database className="h-4 w-4 text-teal-400" />
            </div>
             <div>
               <h2 className="text-teal-300 font-bold text-sm tracking-wide">
                 IMAGE SERIES
               </h2>
               <Badge variant="secondary" className="bg-teal-900/40 text-teal-200 text-[10px] mt-0.5 px-1.5 py-0 font-semibold border border-teal-700/30">
                 {series.length} Total
               </Badge>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilter(!showFilter)}
                  className={`h-8 w-8 p-0 transition-all rounded-lg ${
                    showFilter 
                      ? 'text-teal-300 bg-teal-900/40 border border-teal-700/50' 
                      : 'text-white hover:text-teal-300 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
               <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                 Filter Series
               </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        {showFilter && (
          <div className="p-4 border-b-2 border-teal-800/30 bg-gradient-to-r from-slate-800 to-slate-850 shadow-inner">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-900/30 rounded-lg border border-teal-700/30">
                  <Search className="h-3.5 w-3.5 text-teal-400" />
                </div>
                 <Input
                   placeholder="Tìm kiếm series..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="h-9 bg-slate-900/70 border-teal-700/30 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
                 />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-teal-300 text-xs font-semibold whitespace-nowrap">Modality:</span>
                <Select value={filterModality} onValueChange={setFilterModality}>
                  <SelectTrigger className="h-9 w-full bg-slate-900/70 border-teal-700/30 text-white focus:ring-teal-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="All" className="text-white hover:bg-slate-700">Tất cả</SelectItem>
                    <SelectItem value="CT" className="text-white hover:bg-slate-700">CT Scan</SelectItem>
                    <SelectItem value="MRI" className="text-white hover:bg-slate-700">MRI</SelectItem>
                    <SelectItem value="X-Ray" className="text-white hover:bg-slate-700">X-Ray</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilter(false)}
                  className="h-9 w-9 p-0 text-white hover:text-red-400 hover:bg-red-900/20 transition-colors rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

         {/* Content */}
         <div className="flex-1 overflow-y-auto">
           <div className="p-2 space-y-1">
             {loading ? (
               <div className="flex items-center justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                 <span className="ml-2 text-white">Loading series...</span>
               </div>
             ) : filteredSeries.length > 0 ? (
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
             )}
           </div>
         </div>
      </div>
    </TooltipProvider>
  );
};

export default ViewerRightSidebar;