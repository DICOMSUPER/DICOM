"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface AnnotationColorPickerProps {
  annotationId: string;
  currentColor: string;
  isOpen: boolean;
  tempColor: string;
  onOpen: (id: string, color: string) => void;
  onClose: () => void;
  onColorChange: (id: string) => void;
  onTempColorChange: (color: string) => void;
}

const COLOR_PALETTE = [
  // Primary Colors
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981",
  "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E",
  
  // Darker Variants
  "#DC2626", "#EA580C", "#D97706", "#CA8A04", "#65A30D", "#16A34A", "#059669",
  "#0D9488", "#0891B2", "#0284C7", "#2563EB", "#4F46E5", "#7C3AED", "#9333EA",
  "#C026D3", "#DB2777", "#E11D48",
  
  // Lighter/Pastel Variants
  "#FCA5A5", "#FDBA74", "#FCD34D", "#FDE047", "#BEF264", "#86EFAC", "#6EE7B7",
  "#5EEAD4", "#7DD3FC", "#93C5FD", "#A5B4FC", "#C4B5FD", "#DDD6FE", "#E9D5FF",
  "#F9A8D4", "#FDA4AF",
  
  // Neutral Options
  "#FFFFFF", "#F5F5F5", "#E5E5E5", "#D4D4D4", "#A3A3A3", "#737373",
  "#525252", "#404040", "#262626", "#171717", "#0A0A0A",
  "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155", "#1E293B",
];

export function AnnotationColorPicker({
  annotationId,
  currentColor,
  isOpen,
  tempColor,
  onOpen,
  onClose,
  onColorChange,
  onTempColorChange,
}: AnnotationColorPickerProps) {
  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(annotationId, currentColor);
          }}
        >
          <Palette className="h-3 w-3 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 bg-slate-800 border-slate-700 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={tempColor}
              onChange={(e) => onTempColorChange(e.target.value)}
              placeholder="#3B82F6"
              className="flex-1 bg-slate-900 border-slate-600 text-white text-xs"
            />
            <Button
              size="sm"
              onClick={() => onColorChange(annotationId)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
            >
              Apply
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Primary Colors</p>
              <div className="grid grid-cols-7 gap-1">
                {COLOR_PALETTE.slice(0, 17).map((paletteColor) => (
                  <button
                    key={paletteColor}
                    onClick={() => onTempColorChange(paletteColor)}
                    className={`h-6 w-6 rounded border hover:border-white transition-all ${
                      tempColor === paletteColor
                        ? "border-white ring-1 ring-white/50"
                        : "border-slate-600"
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    title={paletteColor}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Darker Variants</p>
              <div className="grid grid-cols-7 gap-1">
                {COLOR_PALETTE.slice(17, 34).map((paletteColor) => (
                  <button
                    key={paletteColor}
                    onClick={() => onTempColorChange(paletteColor)}
                    className={`h-6 w-6 rounded border hover:border-white transition-all ${
                      tempColor === paletteColor
                        ? "border-white ring-1 ring-white/50"
                        : "border-slate-600"
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    title={paletteColor}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Pastel Colors</p>
              <div className="grid grid-cols-7 gap-1">
                {COLOR_PALETTE.slice(34, 50).map((paletteColor) => (
                  <button
                    key={paletteColor}
                    onClick={() => onTempColorChange(paletteColor)}
                    className={`h-6 w-6 rounded border hover:border-white transition-all ${
                      tempColor === paletteColor
                        ? "border-white ring-1 ring-white/50"
                        : "border-slate-600"
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    title={paletteColor}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Neutral Colors</p>
              <div className="grid grid-cols-8 gap-1">
                {COLOR_PALETTE.slice(50).map((paletteColor) => (
                  <button
                    key={paletteColor}
                    onClick={() => onTempColorChange(paletteColor)}
                    className={`h-6 w-6 rounded border hover:border-white transition-all ${
                      tempColor === paletteColor
                        ? "border-white ring-1 ring-white/50"
                        : "border-slate-600"
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    title={paletteColor}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

