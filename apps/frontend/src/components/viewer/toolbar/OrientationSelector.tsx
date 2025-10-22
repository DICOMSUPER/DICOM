"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface OrientationSelectorProps {
  currentOrientation: string;
  onOrientationChange: (orientation: string) => void;
}

const ORIENTATIONS = [
  { value: 'AXIAL', label: 'Axial (Top-Down)', icon: '⊥' },
  { value: 'SAGITTAL', label: 'Sagittal (Side)', icon: '⊢' },
  { value: 'CORONAL', label: 'Coronal (Front)', icon: '⊤' },
];

export default function OrientationSelector({
  currentOrientation,
  onOrientationChange,
}: OrientationSelectorProps) {
  const current = ORIENTATIONS.find(o => o.value === currentOrientation) || ORIENTATIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
          <span className="mr-2 text-lg">{current.icon}</span>
          {current.label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
        {ORIENTATIONS.map((orientation) => (
          <DropdownMenuItem
            key={orientation.value}
            onClick={() => onOrientationChange(orientation.value)}
            className={`text-white hover:bg-gray-700 cursor-pointer ${
              orientation.value === currentOrientation ? 'bg-gray-700' : ''
            }`}
          >
            <span className="mr-2 text-lg">{orientation.icon}</span>
            {orientation.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

