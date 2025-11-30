"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui-next/Accordion";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { SegmentationSnapshot } from "@/contexts/viewer-context/segmentation-helper";
import { AnnotationStatus, AnnotationType } from "@/enums/image-dicom.enum";
import { FileText, Layers, Calendar, User, Tag } from "lucide-react";

interface AnnotationsSegmentationsListProps {
  annotations: ImageAnnotation[];
  segmentations: SegmentationSnapshot[];
}

// Predefined color palette for distinct colors
const COLOR_PALETTE = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#A855F7", // Violet
];

// Generate a consistent color for an ID
const getColorForId = (id: string, palette: string[] = COLOR_PALETTE): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

// Parse color code (handles hex, rgb, rgba)
const parseColorCode = (colorCode?: string): string | null => {
  if (!colorCode) return null;
  
  // If it's already a valid hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorCode)) {
    return colorCode;
  }
  
  // If it's rgb or rgba
  if (colorCode.startsWith("rgb")) {
    return colorCode;
  }
  
  return null;
};

export default function AnnotationsSegmentationsList({
  annotations,
  segmentations,
}: AnnotationsSegmentationsListProps) {
  // Generate color map for annotations
  const annotationColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    annotations.forEach((ann) => {
      const color = parseColorCode(ann.colorCode) || getColorForId(ann.id);
      colorMap.set(ann.id, color);
    });
    return colorMap;
  }, [annotations]);

  // Generate color map for segmentations
  const segmentationColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    segmentations.forEach((seg) => {
      const id = seg.segmentationId || `seg-${seg.capturedAt}`;
      colorMap.set(id, getColorForId(id));
    });
    return colorMap;
  }, [segmentations]);
  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const statusBadgeStyle = (status: string | undefined) => {
    switch ((status || "").toLowerCase()) {
      case "final":
        return "border-emerald-500/50 bg-emerald-500/20 text-emerald-200";
      case "draft":
        return "border-amber-500/50 bg-amber-500/20 text-amber-200";
      case "reviewed":
        return "border-blue-500/30 bg-blue-500/15 text-blue-200";
      default:
        return "border-slate-600/60 bg-slate-800 text-slate-200";
    }
  };

  const formatStatusLabel = (status?: string) => {
    if (!status) return "Unknown";
    return status
      .split(/[_\s]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatAnnotationType = (type: string) => {
    return type
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="h-full flex flex-col">
      <Accordion type="multiple" className="w-full" defaultValue={["annotations", "segmentations"]}>
        {/* Annotations Section */}
        <AccordionItem value="annotations" className="border-b border-slate-800">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">
                Annotations
              </span>
              <Badge
                variant="secondary"
                className="bg-teal-900/40 text-teal-200 text-xs px-2 py-0 border border-teal-700/30"
              >
                {annotations.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-2">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {annotations.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-sm">
                  No annotations available
                </div>
              ) : (
                annotations.map((annotation) => {
                  const color = annotationColors.get(annotation.id) || "#3B82F6";
                  return (
                    <div
                      key={annotation.id}
                      className="rounded-lg border-l-4 bg-slate-900/50 p-3 space-y-2 hover:bg-slate-900/80 transition-colors relative overflow-hidden"
                      style={{ 
                        borderLeftColor: color,
                        borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                        borderRight: "1px solid rgba(148, 163, 184, 0.1)",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                      }}
                    >
                      {/* Color accent bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 opacity-50"
                        style={{ backgroundColor: color }}
                      />
                      
                      <div className="flex items-start justify-between gap-2 pt-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-slate-700"
                              style={{ backgroundColor: color }}
                            />
                            <Tag className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-white truncate">
                              {formatAnnotationType(annotation.annotationType)}
                            </span>
                          </div>
                          {annotation.textContent && (
                            <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                              {annotation.textContent}
                            </p>
                          )}
                        </div>
                        {annotation.annotationStatus && (
                          <Badge
                            variant="outline"
                            className={`px-2 py-0.5 text-xs capitalize shrink-0 ${statusBadgeStyle(
                              annotation.annotationStatus
                            )}`}
                          >
                            {formatStatusLabel(annotation.annotationStatus)}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        {annotation.annotationDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate">
                              {formatDate(annotation.annotationDate)}
                            </span>
                          </div>
                        )}
                        {annotation.measurementValue !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Value:</span>
                            <span className="text-slate-300">
                              {annotation.measurementValue}
                              {annotation.measurementUnit && ` ${annotation.measurementUnit}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Color:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-3 w-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-slate-300 font-mono text-[10px]">{color}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Segmentations Section */}
        <AccordionItem value="segmentations" className="border-b border-slate-800">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">
                Segmentations
              </span>
              <Badge
                variant="secondary"
                className="bg-teal-900/40 text-teal-200 text-xs px-2 py-0 border border-teal-700/30"
              >
                {segmentations.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-2">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {segmentations.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-sm">
                  No segmentations available
                </div>
              ) : (
                segmentations.map((segmentation, index) => {
                  const id = segmentation.segmentationId || `seg-${segmentation.capturedAt}`;
                  const color = segmentationColors.get(id) || "#3B82F6";
                  return (
                    <div
                      key={id}
                      className="rounded-lg border-l-4 bg-slate-900/50 p-3 space-y-2 hover:bg-slate-900/80 transition-colors relative overflow-hidden"
                      style={{ 
                        borderLeftColor: color,
                        borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                        borderRight: "1px solid rgba(148, 163, 184, 0.1)",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                      }}
                    >
                      {/* Color accent bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 opacity-50"
                        style={{ backgroundColor: color }}
                      />
                      
                      <div className="flex items-start justify-between gap-2 pt-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-slate-700"
                              style={{ backgroundColor: color }}
                            />
                            <Layers className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-white truncate">
                              {segmentation.segmentationId || `Segmentation ${index + 1}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">
                            {formatDate(new Date(segmentation.capturedAt).toISOString())}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Slices:</span>
                          <span className="text-slate-300">
                            {segmentation.imageData?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Color:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-3 w-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-slate-300 font-mono text-[10px]">{color}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

