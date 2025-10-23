"use client";
import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SeriesFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterModality: string;
  onModalityChange: (modality: string) => void;
  onClose?: () => void;
}

export default function SeriesFilter({
  searchQuery,
  onSearchChange,
  filterModality,
  onModalityChange,
  onClose,
}: SeriesFilterProps) {
  return (
    <div className="p-4 border-b-2 border-teal-800/30 bg-gradient-to-r from-slate-800 to-slate-850 shadow-inner">
      <div className="space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-900/30 rounded-lg border border-teal-700/30">
            <Search className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <Input
            placeholder="Tìm kiếm series..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 bg-slate-900/70 border-teal-700/30 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
          />
        </div>

        {/* Modality Filter */}
        <div className="flex items-center gap-2">
          <span className="text-teal-300 text-xs font-semibold whitespace-nowrap">Modality:</span>
          <Select value={filterModality} onValueChange={onModalityChange}>
            <SelectTrigger className="h-9 w-full bg-slate-900/70 border-teal-700/30 text-white focus:ring-teal-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="All" className="text-white hover:bg-slate-700">Tất cả</SelectItem>
              <SelectItem value="CT" className="text-white hover:bg-slate-700">CT Scan</SelectItem>
              <SelectItem value="MRI" className="text-white hover:bg-slate-700">MRI</SelectItem>
              <SelectItem value="X-Ray" className="text-white hover:bg-slate-700">X-Ray</SelectItem>
              <SelectItem value="US" className="text-white hover:bg-slate-700">Ultrasound</SelectItem>
            </SelectContent>
          </Select>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 text-white hover:text-red-400 hover:bg-red-900/20 transition-colors rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

