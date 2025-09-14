"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DropdownToolItemsProps {
  item: string;
  icon?: React.ComponentType<any>;
}

export interface DropdownToolProps {
  list: DropdownToolItemsProps[];
  defaultIcon?: React.ComponentType<any>;
  onItemSelect?: (item: DropdownToolItemsProps) => void;
  tooltip?: string;
}

const DropdownTool = ({
  list,
  defaultIcon,
  onItemSelect,
  tooltip = "Select Tool",
}: DropdownToolProps) => {
  const [selectedItem, setSelectedItem] =
    useState<DropdownToolItemsProps | null>(list[0] || null);

  const handleItemClick = (item: DropdownToolItemsProps) => {
    setSelectedItem(item);
    onItemSelect?.(item);
  };

  const IconComponent = selectedItem?.icon || defaultIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 group">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 w-12 p-0 hover:bg-slate-700/50 relative"
              >
                {IconComponent && (
                  <IconComponent className="h-6 w-6 text-white group-hover:text-blue-300 transition-colors" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-slate-800 border-slate-600 text-white"
            >
              {tooltip}
            </TooltipContent>
          </Tooltip>

          <ChevronDown className="h-3 w-3 text-white/60 group-hover:text-blue-300 transition-colors" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56 bg-slate-800 border-slate-700 shadow-xl"
      >
        {list.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-3 px-3 py-3 text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
            >
              {ItemIcon && <ItemIcon className="h-5 w-5 text-blue-300" />}
              <span className="font-medium">{item.item}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownTool;
