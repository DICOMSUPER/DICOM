import {
  Layout,
  Grid,
  Maximize2,
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
  MousePointer,
  Target,
  ArrowRight,
  RotateCcw as RotateCcwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useViewer } from "@/contexts/ViewerContext";

interface ViewerLeftSidebarProps {
  seriesLayout: string;
  onSeriesLayoutChange: (layout: string) => void;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
}

const seriesLayouts = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
  { id: "3x3", icon: Layout, label: "3x3" },
];

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

// Transform tools
const transformTools = [
  { id: "rotate-cw", icon: RotateCw, label: "Rotate Right", action: "rotate" },
  { id: "rotate-ccw", icon: RotateCcw, label: "Rotate Left", action: "rotate" },
  { id: "flip-h", icon: FlipHorizontal, label: "Flip Horizontal", action: "flip" },
  { id: "flip-v", icon: FlipVertical, label: "Flip Vertical", action: "flip" },
];

// Action tools
const actionTools = [
  { id: "reset", icon: RefreshCw, label: "Reset View", action: "reset" },
  { id: "clear", icon: Trash2, label: "Clear Annotations", action: "clear" },
  { id: "invert", icon: MousePointer, label: "Invert Colors", action: "invert" },
];


// Advanced tools
const advancedTools = [
  { id: "Magnify", icon: Maximize2, label: "Magnify", shortcut: "M" },
  { id: "ETDRSGrid", icon: Grid, label: "ETDRS Grid", shortcut: "E" },
  { id: "ReferenceLines", icon: Grid, label: "Reference Lines", shortcut: "Shift+R" },
];

export default function ViewerLeftSidebar({
  seriesLayout,
  onSeriesLayoutChange,
  selectedTool,
  onToolSelect,
}: ViewerLeftSidebarProps) {
  const { rotateViewport, flipViewport, resetView, clearAnnotations, invertViewport } = useViewer();

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

  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
  };

  const handleTransformAction = (action: string, toolId: string) => {
    switch (action) {
      case 'rotate':
        rotateViewport(toolId === 'rotate-cw' ? 90 : -90);
        break;
      case 'flip':
        flipViewport(toolId === 'flip-h' ? 'horizontal' : 'vertical');
        break;
      case 'reset':
        resetView();
        break;
      case 'clear':
        clearAnnotations();
        break;
      case 'invert':
        invertViewport();
        break;
    }
  };
  return (
    <TooltipProvider>
      <div className="h-full border-r border-slate-800 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Viewport Layout Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Viewport Layout</h3>
            <p className="text-slate-400 text-xs mb-3">
              Chọn số lượng viewport hiển thị
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {seriesLayouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => onSeriesLayoutChange(layout.id)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 ${
                    seriesLayout === layout.id
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                  title={layout.label}
                >
                  <layout.icon size={16} />
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navigation Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {navigationTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex items-center gap-2 ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-teal-700 text-white">
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">{tool.shortcut}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Measurement Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Measurement Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {measurementTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex items-center gap-2 ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-teal-700 text-white">
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">{tool.shortcut}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Transform Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Transform Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {transformTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTransformAction(tool.action, tool.id)}
                      className="h-10 px-3 transition-all duration-200 rounded-lg flex items-center gap-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-teal-700 text-white">
                    {tool.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Action Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {actionTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTransformAction(tool.action, tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex items-center gap-2 ${
                        tool.id === 'clear'
                          ? "bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-300"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-teal-700 text-white">
                    {tool.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>


          {/* Advanced Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Advanced Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {advancedTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex items-center gap-2 ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-teal-700 text-white">
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">{tool.shortcut}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-teal-300 text-xs font-semibold mb-2">Hướng dẫn:</h4>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• Kéo thả series vào viewport</li>
              <li>• Sử dụng tools từ sidebar hoặc toolbar</li>
              <li>• Scroll để navigate frames</li>
            </ul>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
