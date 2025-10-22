"use client";
import { 
  Search, 
  Move, 
  ScanLine, 
  Ruler, 
  Circle, 
  Square, 
  RotateCw, 
  RotateCcw,
  FlipHorizontal, 
  FlipVertical,
  RefreshCw,
  Trash2,
  Grid as GridIcon,
  ChevronDown,
  MousePointer,
  Target,
  ArrowRight,
  Minus,
  Plus,
  Crosshair,
  Rotate3D,
  Maximize2,
  RotateCcw as RotateCcwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useViewer } from "@/contexts/ViewerContext";

interface UnifiedToolbarProps {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  layout?: string;
  onLayoutChange?: (layout: string) => void;
  onDeleteStudy?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function UnifiedToolbar({
  selectedTool,
  onToolSelect,
  layout = "1x1",
  onLayoutChange,
  onDeleteStudy,
  onRefresh,
  loading = false,
}: UnifiedToolbarProps) {
  const { rotateViewport, flipViewport, resetView, clearAnnotations } = useViewer();

  // Basic navigation tools
  const navigationTools = [
    { id: "WindowLevel", icon: ScanLine, label: "Window/Level", shortcut: "W" },
    { id: "Pan", icon: Move, label: "Pan", shortcut: "P" },
    { id: "Zoom", icon: Search, label: "Zoom", shortcut: "Z" },
    { id: "Probe", icon: Target, label: "Probe", shortcut: "I" },
  ];

  // Measurement tools
  const measurementTools = [
    { id: "Length", icon: Ruler, label: "Length", shortcut: "L" },
    { id: "Height", icon: Ruler, label: "Height", shortcut: "H" },
    { id: "CircleROI", icon: Circle, label: "Circle ROI", shortcut: "C" },
    { id: "RectangleROI", icon: Square, label: "Rectangle ROI", shortcut: "R" },
    { id: "Bidirectional", icon: ArrowRight, label: "Bidirectional", shortcut: "B" },
    { id: "Angle", icon: RotateCcwIcon, label: "Angle", shortcut: "A" },
    { id: "ArrowAnnotate", icon: ArrowRight, label: "Arrow", shortcut: "Shift+A" },
    { id: "CobbAngle", icon: RotateCcwIcon, label: "Cobb Angle", shortcut: "Shift+C" },
    { id: "SplineROI", icon: Circle, label: "Spline ROI", shortcut: "S" },
  ];

  // Advanced tools
  const advancedTools = [
    { id: "Magnify", icon: Maximize2, label: "Magnify", shortcut: "M" },
    { id: "ETDRSGrid", icon: GridIcon, label: "ETDRS Grid", shortcut: "E" },
    { id: "ReferenceLines", icon: GridIcon, label: "Reference Lines", shortcut: "Shift+R" },
  ];

  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
  };

  // Map tool names for display
  const getToolDisplayName = (toolId: string) => {
    const toolMapping: Record<string, string> = {
      'WindowLevel': 'WindowLevel',
      'Pan': 'Pan', 
      'Zoom': 'Zoom',
      'Probe': 'Probe',
      'Length': 'Length',
      'Height': 'Height',
      'CircleROI': 'CircleROI',
      'EllipticalROI': 'EllipticalROI',
      'RectangleROI': 'RectangleROI',
      'Bidirectional': 'Bidirectional',
      'Angle': 'Angle',
      'ArrowAnnotate': 'ArrowAnnotate',
      'CobbAngle': 'CobbAngle',
      'SplineROI': 'SplineROI',
      'Rotate': 'PlanarRotate',
      'Magnify': 'Magnify',
      'ETDRSGrid': 'ETDRSGrid',
      'ReferenceLines': 'ReferenceLines',
    };
    return toolMapping[toolId] || toolId;
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    rotateViewport(direction === 'cw' ? 90 : -90);
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    flipViewport(direction);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
        
        {/* Navigation Tools */}
        <div className="flex items-center gap-1">
          {navigationTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToolSelect(tool.id)}
                  className={`h-8 w-8 p-0 transition-all duration-200 rounded-lg ${
                    selectedTool === getToolDisplayName(tool.id)
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                      : "text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                  }`}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
                <div className="text-center">
                  <div>{tool.label}</div>
                  <div className="text-xs text-slate-400">{tool.shortcut}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-600" />

        {/* Measurement Tools Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
                >
                  <Ruler className="h-4 w-4 mr-1" />
                  <span className="text-xs">Measure</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Measurement Tools
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="bg-slate-800 border-teal-700/50 w-48">
            {measurementTools.map((tool) => (
              <DropdownMenuItem
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`transition-colors flex items-center gap-2 ${
                  selectedTool === getToolDisplayName(tool.id)
                    ? "bg-teal-600 text-white"
                    : "text-white hover:bg-teal-600 hover:text-white"
                }`}
              >
                <tool.icon className="h-4 w-4 text-white" />
                <span>{tool.label}</span>
                <span className="text-xs text-slate-400 ml-auto">{tool.shortcut}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-slate-600" />

        {/* Transform Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRotate('cw')}
                className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Rotate Right (90°)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRotate('ccw')}
                className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Rotate Left (-90°)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFlip('horizontal')}
                className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Flip Horizontal
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFlip('vertical')}
                className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Flip Vertical
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-slate-600" />

        {/* Action Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => resetView()}
                className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Reset View
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearAnnotations()}
                className="h-8 w-8 p-0 text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition-all rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Clear Annotations
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-slate-600" />

        {/* Layout Selector */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
                >
                  <span className="text-xs font-semibold">{layout}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Viewport Layout
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="bg-slate-800 border-teal-700/50">
            {['1x1', '1x2', '2x1', '2x2', '1x3', '3x1'].map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => onLayoutChange?.(l)}
                className="text-white hover:bg-teal-600 hover:text-white transition-colors"
              >
                <span className="font-semibold">{l}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Advanced Tools Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-400 hover:bg-slate-700 hover:text-teal-300 transition-all rounded-lg"
                >
                  <MousePointer className="h-4 w-4 mr-1" />
                  <span className="text-xs">More</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-slate-800 border-teal-700 text-white">
              Advanced Tools
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="bg-slate-800 border-teal-700/50 w-48">
            {advancedTools.map((tool) => (
              <DropdownMenuItem
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`transition-colors flex items-center gap-2 ${
                  selectedTool === getToolDisplayName(tool.id)
                    ? "bg-teal-600 text-white"
                    : "text-white hover:bg-teal-600 hover:text-white"
                }`}
              >
                <tool.icon className="h-4 w-4" />
                <span>{tool.label}</span>
                <span className="text-xs text-slate-400 ml-auto">{tool.shortcut}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuItem
              onClick={onDeleteStudy}
              className="text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Study</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
