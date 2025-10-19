import {
  Layout,
  Grid,
  Maximize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  Undo,
  Move,
  ZoomIn,
  Contrast,
  RotateCw,
  FlipHorizontal,
  Ruler,
  Circle,
  Square,
  Type,
  Redo,
  X,
  Save,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViewerLeftSidebarProps {
  seriesLayout: string;
  onSeriesLayoutChange: (layout: string) => void;
  imageLayout: string;
  onImageLayoutChange: (layout: string) => void;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  imageLocalizer: boolean;
  onImageLocalizerChange: (checked: boolean) => void;
  scrollMode: string;
  onScrollModeChange: (mode: string) => void;
}

const tools = [
  { id: "refresh", icon: RefreshCw, label: "Refresh" },
  { id: "undo", icon: Undo, label: "Undo" },
  { id: "move", icon: Move, label: "Pan" },
  { id: "zoom", icon: ZoomIn, label: "Zoom" },
  { id: "contrast", icon: Contrast, label: "Window/Level" },
  { id: "rotate", icon: RotateCw, label: "Rotate" },
  { id: "flip", icon: FlipHorizontal, label: "Flip" },
  { id: "ruler", icon: Ruler, label: "Measure" },
  { id: "circle", icon: Circle, label: "Circle ROI" },
  { id: "square", icon: Square, label: "Rectangle ROI" },
  { id: "text", icon: Type, label: "Text" },
  { id: "redo", icon: Redo, label: "Redo" },
  { id: "delete", icon: X, label: "Delete" },
  { id: "save", icon: Save, label: "Save" },
];

const seriesLayouts = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
  { id: "3x3", icon: Layout, label: "3x3" },
];

const imageLayouts = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
  { id: "3x3", icon: Layout, label: "3x3" },
];

export default function ViewerLeftSidebar({
  seriesLayout,
  onSeriesLayoutChange,
  imageLayout,
  onImageLayoutChange,
  selectedTool,
  onToolSelect,
  isPlaying,
  onPlayToggle,
  imageLocalizer,
  onImageLocalizerChange,
  scrollMode,
  onScrollModeChange,
}: ViewerLeftSidebarProps) {
  return (
    <div className="h-full border-r border-slate-800 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Layout Section */}
        <div className="mb-6">
        <h3 className="text-white font-semibold mb-3">Layout</h3>
        
        {/* Series Layout */}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm mb-2">Series Layout:</label>
          <div className="flex gap-2">
            {seriesLayouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => onSeriesLayoutChange(layout.id)}
                className={`p-2 rounded-lg transition-colors ${
                  seriesLayout === layout.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
                title={layout.label}
              >
                <layout.icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Image Layout */}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm mb-2">Image Layout:</label>
          <div className="flex gap-2">
            {imageLayouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => onImageLayoutChange(layout.id)}
                className={`p-2 rounded-lg transition-colors ${
                  imageLayout === layout.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
                title={layout.label}
              >
                <layout.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Tools Section */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3">Image Tools</h3>
        <div className="flex gap-2 flex-wrap">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`p-2 rounded-lg transition-colors ${
                selectedTool === tool.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
              title={tool.label}
            >
              <tool.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Image Play Section */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3">Image Play</h3>
        <div className="flex items-center gap-2 mb-3">
          <button className="p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={onPlayToggle}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors">
            <SkipForward size={16} />
          </button>
          <span className="text-slate-300 text-sm ml-2">10 FPS</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="imageLocalizer"
            checked={imageLocalizer}
            onCheckedChange={onImageLocalizerChange}
          />
          <Label htmlFor="imageLocalizer" className="text-slate-300 text-sm">
            Image Localizer
          </Label>
        </div>

        <div>
          <Label className="block text-slate-300 text-sm mb-2">Series Compare:</Label>
          <Select defaultValue="All">
            <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="All" className="text-white hover:bg-slate-700">All</SelectItem>
              <SelectItem value="CT" className="text-white hover:bg-slate-700">CT</SelectItem>
              <SelectItem value="MRI" className="text-white hover:bg-slate-700">MRI</SelectItem>
              <SelectItem value="X-Ray" className="text-white hover:bg-slate-700">X-Ray</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-slate-300 text-sm mb-2">Scroll Options:</Label>
          <RadioGroup value={scrollMode} onValueChange={onScrollModeChange} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="index" id="index" />
              <Label htmlFor="index" className="text-slate-300 text-sm">
                Scroll by Index
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="position" id="position" />
              <Label htmlFor="position" className="text-slate-300 text-sm">
                Scroll by Position
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="text-slate-300 text-sm">
                Manual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zoom" id="zoom" />
              <Label htmlFor="zoom" className="text-slate-300 text-sm">
                Zoom/Pan/Rotate
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ww" id="ww" />
              <Label htmlFor="ww" className="text-slate-300 text-sm">
                WW WL
              </Label>
            </div>
          </RadioGroup>
        </div>
        </div>
      </div>
    </div>
  );
}

