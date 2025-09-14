"use client";

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';



interface SegmentationsPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SegmentationsPanel = ({ isCollapsed, onToggleCollapse }: SegmentationsPanelProps) => {
  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-l border-slate-700 flex flex-col">
        <div className="h-12 flex items-center justify-center border-b border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="writing-mode-vertical text-blue-400 text-sm font-medium transform rotate-180">
            Segmentations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-70 bg-slate-900 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <h2 className="text-blue-400 font-medium">Segmentations</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">

          
          {/* Add new segmentation button */}
          <Button
            variant="outline"
            className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Add Segmentation
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SegmentationsPanel;