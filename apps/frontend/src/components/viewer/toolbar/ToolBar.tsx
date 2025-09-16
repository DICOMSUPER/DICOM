"use client";

import React, { useState } from "react";
import { Layers, User, Undo, Redo } from "lucide-react";
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

const ToolBar = () => {
  const [selectedTool, setSelectedTool] =
    useState<DropdownToolItemsProps | null>(null);

  const handleToolSelect = (tool: DropdownToolItemsProps) => {
    setSelectedTool(tool);
    console.log("Selected tool:", tool);
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
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownTool
                  list={lengthToolsMenu}
                  onItemSelect={handleToolSelect}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Length Tools
            </TooltipContent>
          </Tooltip> */}
          <div>
            <DropdownTool
              list={lengthToolsMenu}
              onItemSelect={handleToolSelect}
              tooltip="Length Tools"
            />
          </div>

          {mainTools.map((tool, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-12 w-12 p-0 hover:bg-slate-700/50 text-white hover:text-blue-300 transition-colors"
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
          ))}
          {/* 
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownTool
                  list={shapeToolsMenu}
                  onItemSelect={handleToolSelect}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              Shape Tools
            </TooltipContent>
          </Tooltip> */}
          <div>
            <DropdownTool
              list={shapeToolsMenu}
              onItemSelect={handleToolSelect}
              tooltip="Reset View"
            />
          </div>
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
