"use client";
import { useState } from "react";
import { 
  Layers, 
  Search, 
  Move, 
  ScanLine, 
  Camera, 
  Grid as GridIcon,
  RotateCw, 
  RotateCcw,
  FlipHorizontal, 
  FlipVertical,
  RefreshCw,
  Undo,
  Redo,
  Trash2,
  User,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshButton } from "@/components/ui/refresh-button";
import DropdownTool from "@/components/viewer/toolbar/tools/DropdownTool";
import { lengthToolsMenu, shapeToolsMenu } from "@/constants/lengthToolsMenu";
import { Label } from "@/components/ui/label";

interface ViewerHeaderProps {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  autoOpen: boolean;
  onAutoOpenChange: (checked: boolean) => void;
  onDeleteStudy?: () => void;
  layout?: string;
  onLayoutChange?: (layout: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function ViewerHeader({
  selectedTool,
  onToolSelect,
  autoOpen,
  onAutoOpenChange,
  onDeleteStudy,
  layout = "1x1",
  onLayoutChange,
  isCollapsed = false,
  onToggleCollapse,
  loading = false,
  onRefresh,
}: ViewerHeaderProps) {
  const [selectedDropdownTool, setSelectedDropdownTool] = useState<any>(null);

  const mainTools = [
    { id: "zoom", icon: Search, label: "Zoom" },
    { id: "pan", icon: Move, label: "Pan" },
    { id: "windowLevel", icon: ScanLine, label: "Window/Level" },
    { id: "capture", icon: Camera, label: "Capture" },
  ];

  const handleDropdownToolSelect = (tool: any) => {
    setSelectedDropdownTool(tool);
    onToolSelect(tool.item.toLowerCase().replace(/\s+/g, ''));
  };

  return (
    <TooltipProvider>
      <div className={`bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'h-0 border-0' : 'h-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">2D Viewer</span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-700" />

        {/* Advanced Tools */}
        <div className="flex gap-2">
          {/* Length Tools Dropdown */}
          <DropdownTool
            list={lengthToolsMenu}
            onItemSelect={handleDropdownToolSelect}
            tooltip="Length Tools"
          />

          {/* Main Tools */}
          {mainTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToolSelect(tool.id)}
                  className={`h-10 w-10 p-0 transition-colors ${
                    selectedTool === tool.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <tool.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                {tool.label}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Shape Tools Dropdown */}
          <DropdownTool
            list={shapeToolsMenu}
            onItemSelect={handleDropdownToolSelect}
            tooltip="Shape Tools"
          />

          {/* Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <GridIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                  Layout: {layout}
                </TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-600">
              {['1x1', '1x2', '2x1', '2x2', '1x3', '3x1'].map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => onLayoutChange?.(l)}
                  className="text-white hover:bg-slate-700"
                >
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-700" />

        {/* Transform Tools */}
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                <RotateCw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rotate Right</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rotate Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                <FlipHorizontal className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flip Horizontal</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                <FlipVertical className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flip Vertical</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <Undo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <Redo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>

          {/* Refresh Data */}
          {onRefresh && (
            <RefreshButton
              onRefresh={onRefresh}
              loading={loading}
              showText={true}
              variant="ghost"
              size="sm"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 h-9"
            />
          )}

          {/* Delete Study */}
          <Button
            onClick={onDeleteStudy}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white h-9"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Study
          </Button>

          {/* Auto Open */}
          <div className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
            <Checkbox
              id="autoOpen"
              checked={autoOpen}
              onCheckedChange={onAutoOpenChange}
              className="rounded"
            />
            <Label htmlFor="autoOpen" className="text-slate-300 text-sm">
              Tự động mở
            </Label>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-700" />

          {/* User */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white">
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>User Profile</TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-700" />

          {/* Toggle Header Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleCollapse}
                className="h-10 w-10 p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCollapsed ? 'Show Header' : 'Hide Header'}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

