"use client";

import React, { useState } from "react";
import { Layers, User, Undo, Redo, Grid, RotateCw, FlipHorizontal, FlipVertical, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DropdownTool, { DropdownToolItemsProps } from "./tools/DropdownTool";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
  annotationToolsMenu,
  lengthToolsMenu,
  mainTools,
  shapeToolsMenu,
} from "@/constants/lengthToolsMenu";
import { useViewer, ToolType, GridLayout } from "@/contexts/ViewerContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ToolBar = () => {
  const { state, setActiveTool, setLayout, resetView, rotateViewport, flipViewport, invertViewport } = useViewer();
  const [selectedTool, setSelectedTool] = useState<DropdownToolItemsProps | null>(null);

  const handleToolSelect = (tool: DropdownToolItemsProps) => {
    setSelectedTool(tool);
    // Map dropdown tool items to ToolType
    const toolMap: Record<string, ToolType> = {
      'Length': 'Length',
      'Probe': 'Probe',
      'Rectangle ROI': 'RectangleROI',
      'Elliptical ROI': 'EllipticalROI',
      'Circle ROI': 'CircleROI',
      'Bidirectional': 'Bidirectional',
      'Angle': 'Angle',
      'Cobb Angle': 'CobbAngle',
      'Arrow Annotate': 'ArrowAnnotate',
      'Magnify': 'Magnify',
      'Reset': 'Reset',
      'Invert': 'Invert'
    };
    
    const mappedTool = toolMap[tool.item];
    if (mappedTool) {
      setActiveTool(mappedTool);
    }
    console.log("Selected tool:", tool);
  };

  const handleMainToolClick = (toolName: string) => {
    const toolMap: Record<string, ToolType> = {
      'Window/Level': 'WindowLevel',
      'Zoom': 'Zoom',
      'Pan': 'Pan',
      'Stack Scroll': 'StackScroll',
      'Reset': 'Reset'
    };
    
    const mappedTool = toolMap[toolName];
    if (mappedTool) {
      setActiveTool(mappedTool);
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-slate-900 border-b border-slate-700 w-full h-16 flex items-center px-4">
        {/* Logo */}
        <div className="flex flex-1  mr-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3 flex items-center">
            <span className="ml-2 text-white font-semibold text-lg">
              AnhsapperViewer
            </span>
          </div>
        </div>

        {/* Main Tools */}
        <div className="flex gap-2 mr-8">
          {/* Length Tools Dropdown */}
          <div>
            <DropdownTool
              list={lengthToolsMenu}
              onItemSelect={handleToolSelect}
              tooltip="Length Tools"
            />
          </div>

          {/* Main Interactive Tools */}
          {mainTools.map((tool, index) => {
            const isActive = state.activeTool === tool.tooltip.replace('/', '').replace(' ', '');
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMainToolClick(tool.tooltip)}
                    className={`h-12 w-12 p-0 hover:bg-slate-700/50 transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-white hover:text-blue-300'
                    }`}
                  >
                    <tool.icon className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-800 border-slate-600 text-white"
                >
                  {tool.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Shape Tools Dropdown */}
          <div>
            <DropdownTool
              list={shapeToolsMenu}
              onItemSelect={handleToolSelect}
              tooltip="Shape Tools"
            />
          </div>

          {/* Layout Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
                  >
                    <Grid className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-800 border-slate-600 text-white"
                >
                  Layout: {state.layout}
                </TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-600">
              <DropdownMenuItem 
                onClick={() => setLayout('1x1')}
                className="text-white hover:bg-slate-700"
              >
                1x1
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('1x2')}
                className="text-white hover:bg-slate-700"
              >
                1x2
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('2x1')}
                className="text-white hover:bg-slate-700"
              >
                2x1
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('2x2')}
                className="text-white hover:bg-slate-700"
              >
                2x2
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('1x3')}
                className="text-white hover:bg-slate-700"
              >
                1x3
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLayout('3x1')}
                className="text-white hover:bg-slate-700"
              >
                3x1
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Transform Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => rotateViewport(90)}
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <RotateCw className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Rotate Right
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => rotateViewport(-90)}
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Rotate Left
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => flipViewport('horizontal')}
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <FlipHorizontal className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Flip Horizontal
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => flipViewport('vertical')}
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <FlipVertical className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Flip Vertical
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetView}
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <RefreshCw className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Reset View
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Dropdown Tools */}

        {/* Navigation Tools */}
        <div className="flex-1 gap-2 mr-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <Undo className="h-6 w-6"  />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Undo
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <Redo className="h-6 w-6" size={40} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Redo
            </TooltipContent>
          </Tooltip>
        </div>

        {/* User Profile */}
        <div className="ml-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
              >
                <User className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              User Profile
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Selected Tool Display (Optional) */}
        {selectedTool && (
          <div className="absolute top-20 left-4 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-white text-sm shadow-lg">
            Selected: {selectedTool.item}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ToolBar;
