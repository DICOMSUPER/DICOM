"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Paintbrush,
  CircleDot,
  Square,
  Globe,
  Eraser,
  Trash2,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/common/lib/utils";

interface SegmentationControlsProps {
  onToolSelect: (toolName: string) => void;
  activeTool?: string;
  activeSegmentIndex?: number;
  onSegmentChange?: (segmentIndex: number) => void;
}

interface Segment {
  index: number;
  color: string;
  label: string;
  visible: boolean;
  opacity: number;
}

const SegmentationControls: React.FC<SegmentationControlsProps> = ({
  onToolSelect,
  activeTool,
  activeSegmentIndex = 1,
  onSegmentChange,
}) => {
  const [segments, setSegments] = useState<Segment[]>([
    { index: 1, color: "#FF0000", label: "Segment 1", visible: true, opacity: 0.5 },
    { index: 2, color: "#00FF00", label: "Segment 2", visible: true, opacity: 0.5 },
    { index: 3, color: "#0000FF", label: "Segment 3", visible: true, opacity: 0.5 },
  ]);

  const [brushSize, setBrushSize] = useState(15);

  const segmentationTools = [
    { name: "Brush", icon: Paintbrush, tooltip: "Brush Tool (S)", toolId: "Brush" },
    { name: "CircleScissors", icon: CircleDot, tooltip: "Circle Scissors (G)", toolId: "CircleScissors" },
    { name: "RectangleScissors", icon: Square, tooltip: "Rectangle Scissors (X)", toolId: "RectangleScissors" },
    { name: "SphereScissors", icon: Globe, tooltip: "Sphere Scissors (Shift+S)", toolId: "SphereScissors" },
    { name: "Eraser", icon: Eraser, tooltip: "Eraser (Shift+Z)", toolId: "Eraser" },
  ];

  const handleToolClick = (toolId: string) => {
    onToolSelect(toolId);
  };

  const handleSegmentClick = (segmentIndex: number) => {
    onSegmentChange?.(segmentIndex);
  };

  const toggleSegmentVisibility = (segmentIndex: number) => {
    setSegments(prev => prev.map(seg =>
      seg.index === segmentIndex
        ? { ...seg, visible: !seg.visible }
        : seg
    ));
  };

  const addNewSegment = () => {
    const maxIndex = Math.max(...segments.map(s => s.index));
    const colors = ["#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080"];
    const newColor = colors[segments.length % colors.length];

    setSegments(prev => [...prev, {
      index: maxIndex + 1,
      color: newColor,
      label: `Segment ${maxIndex + 1}`,
      visible: true,
      opacity: 0.5
    }]);
  };

  const deleteSegment = (segmentIndex: number) => {
    if (segments.length > 1) {
      setSegments(prev => prev.filter(seg => seg.index !== segmentIndex));
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-3">
        {/* Segmentation Tools Section */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            <span>Segmentation Tools</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {segmentationTools.map((tool) => (
              <Tooltip key={tool.toolId}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToolClick(tool.toolId)}
                    className={cn(
                      "h-10 w-10 p-0 transition-all",
                      activeTool === tool.toolId
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    )}
                  >
                    <tool.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white">
                  {tool.tooltip}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Brush Size Control */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Brush size</span>
              <span className="text-blue-400 font-medium">{brushSize}px</span>
            </div>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Segments List Section */}
        <div className="space-y-2 border-t border-slate-700 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-300">Segments</div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addNewSegment}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white">
                Add new segment
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {segments.map((segment) => (
              <div
                key={segment.index}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                  activeSegmentIndex === segment.index
                    ? "bg-blue-600/30 border border-blue-500"
                    : "bg-slate-700/50 hover:bg-slate-700 border border-transparent"
                )}
                onClick={() => handleSegmentClick(segment.index)}
              >
                {/* Color Indicator */}
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />

                {/* Label */}
                <span className="text-xs text-slate-200 flex-1 truncate">
                  {segment.label}
                </span>

                {/* Visibility Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSegmentVisibility(segment.index);
                  }}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  {segment.visible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>

                {/* Delete Button */}
                {segments.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSegment(segment.index);
                    }}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clear All Segmentation Button */}
        <div className="border-t border-slate-700 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToolSelect("ClearSegmentation")}
            className="w-full bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white border-slate-600 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Segmentation
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SegmentationControls;

