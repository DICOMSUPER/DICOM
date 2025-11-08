"use client";
import React from 'react';
import { GripVertical, Activity, ImageIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DicomSeries } from '@/interfaces/image-dicom/dicom-series.interface';
import dynamic from 'next/dynamic';

const DicomThumbnail = dynamic(() => import('./DicomThumbnail'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-10 h-10 bg-slate-900">
      <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
    </div>
  )
});

interface SeriesCardProps {
  series: DicomSeries;
  isSelected: boolean;
  thumbnailPath?: string;
  loadingThumbnail?: boolean;
  viewMode?: 'grid' | 'list';
  onSeriesClick: (series: DicomSeries) => void;
}

export default function SeriesCard({
  series,
  isSelected,
  thumbnailPath,
  loadingThumbnail = false,
  viewMode = 'grid',
  onSeriesClick,
}: SeriesCardProps) {
  const modality = 'CT'; // Could be dynamic from series data
  const finalThumbnailPath = thumbnailPath;

  // List view component
  if (viewMode === 'list') {
    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded cursor-move transition-all duration-200 ${
          isSelected
            ? 'bg-linear-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/50'
            : 'bg-linear-to-r from-slate-800 to-slate-750 hover:from-slate-600 hover:to-slate-500 text-slate-200 hover:shadow-md'
        } border-l-4 ${
          isSelected ? 'border-slate-400' : 'border-slate-600'
        } group hover:border-slate-400`}
        onClick={() => onSeriesClick(series)}
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-12 aspect-square rounded overflow-hidden">
          {loadingThumbnail ? (
            <div className="w-full h-full bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
            </div>
          ) : finalThumbnailPath ? (
            <DicomThumbnail 
              imageId={`wadouri:${finalThumbnailPath}`}
              className="w-full h-full"
              alt={series.seriesDescription}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              {series.numberOfInstances ? (
                <div className="text-lg font-bold text-slate-400">
                  {series.seriesNumber || '?'}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center px-2">
                  <span className="text-xs font-semibold text-teal-300 tracking-wide uppercase">
                    No Instances
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Series is empty
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GripVertical className={`h-3 w-3 ${isSelected ? 'text-slate-200' : 'text-slate-500'} group-hover:text-slate-300 transition-colors`} />
            <Badge variant="secondary" className={`${isSelected ? 'bg-slate-600 text-slate-100' : 'bg-teal-600 text-white'} text-xs font-semibold px-2 py-0.5`}>
              {modality}
            </Badge>
            <span className="text-sm font-bold">Series {series.seriesNumber}</span>
            <Badge variant="outline" className={`${isSelected ? 'text-green-200 border-green-300' : 'text-emerald-400 border-emerald-500'} text-xs flex items-center gap-1`}>
              <Activity className="h-3 w-3" />
              {series.numberOfInstances}
            </Badge>
          </div>
          
          <div className={`text-sm font-medium ${isSelected ? 'text-slate-100' : 'text-white'} truncate`}>
            {series.seriesDescription || 'No description available'}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span>Body: {series.bodyPartExamined || 'N/A'}</span>
            <span>Date: {series.seriesDate || 'N/A'}</span>
            <span>Time: {series.seriesTime || 'N/A'}</span>
          </div>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="shrink-0 w-3 h-3 bg-teal-400 rounded-full animate-pulse shadow-lg shadow-teal-400/50"></div>
        )}
      </div>
    );
  }

  // Grid view component
  return (
    <div
      className={`rounded cursor-move transition-all duration-200 ${
        isSelected
          ? 'bg-linear-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/50'
          : 'bg-linear-to-r from-slate-800 to-slate-750 hover:from-slate-600 hover:to-slate-500 text-slate-200 hover:shadow-md'
      } p-4 mb-2 border-l-4 ${
        isSelected ? 'border-slate-400' : 'border-slate-600'
      } group hover:border-slate-400`}
      onClick={() => onSeriesClick(series)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className={`h-4 w-4 ${isSelected ? 'text-slate-200' : 'text-slate-500'} group-hover:text-slate-300 transition-colors`} />
          <Badge variant="secondary" className={`${isSelected ? 'bg-slate-600 text-slate-100' : 'bg-teal-600 text-white'} text-xs font-semibold px-2 py-1`}>
            {modality}
          </Badge>
          <span className="text-sm font-bold">Series {series.seriesNumber}</span>
          <Badge variant="outline" className={`${isSelected ? 'text-green-200 border-green-300' : 'text-emerald-400 border-emerald-500'} text-xs flex items-center gap-1`}>
            <Activity className="h-3 w-3" />
            {series.numberOfInstances}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <div className={`text-sm mb-3 font-medium ${isSelected ? 'text-slate-100' : 'text-white'}`}>
        {series.seriesDescription || 'No description available'}
      </div>

      {/* DICOM Thumbnail */}
      <div className={`rounded-lg overflow-hidden mb-3 border-2 aspect-square ${
        isSelected ? 'border-teal-400' : 'border-slate-600'
      } relative group/preview transition-all duration-200`}>
        {loadingThumbnail ? (
          <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-slate-900 to-slate-800">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            <span className="ml-2 text-xs text-slate-400">Loading preview...</span>
          </div>
        ) : finalThumbnailPath ? (
          <DicomThumbnail 
            imageId={`wadouri:${finalThumbnailPath}`}
            className="w-full h-full"
            alt={series.seriesDescription}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-linear-to-br from-slate-900 to-slate-800">
            {series.numberOfInstances ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className={`text-4xl font-bold mb-1 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`}>
                  {series.seriesNumber || '?'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ImageIcon size={14} />
                  <span>{series.numberOfInstances || 0} images</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-sm font-semibold text-teal-300 uppercase tracking-wide">
                  No Instances Found
                </span>
                <span className="text-xs text-slate-400 mt-2">
                  This series does not contain any images.
                </span>
              </div>
            )}
          </div>
        )}
        
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-teal-400 rounded-full animate-pulse shadow-lg shadow-teal-400/50"></div>
        )}
      </div>

      {/* Always visible metadata */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Body Part:</span>
          <span className="text-white">{series.bodyPartExamined || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Protocol:</span>
          <span className="text-white">{series.protocolName || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date:</span>
          <span className="text-white">{series.seriesDate || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Time:</span>
          <span className="text-white">{series.seriesTime || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Series UID:</span>
          <span className="text-white text-xs font-mono truncate max-w-32" title={series.seriesInstanceUid}>
            {series.seriesInstanceUid || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Created:</span>
          <span className="text-white">
            {series.createdAt ? new Date(series.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}