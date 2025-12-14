"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui-next/Accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import { SegmentationSnapshot } from "@/common/contexts/viewer-context/segmentation-helper";
import { AnnotationStatus, AnnotationType } from "@/common/enums/image-dicom.enum";
import { FileText, Layers, Calendar, Tag, Palette, Circle, Lock } from "lucide-react";

interface AnnotationsSegmentationsListProps {
  annotations: ImageAnnotation[];
  segmentations: SegmentationSnapshot[];
  selectedAnnotationId?: string | null;
  selectedSegmentationId?: string | null;
  onAnnotationSelect?: (annotationId: string | null) => void;
  onSegmentationSelect?: (segmentationId: string | null) => void;
  onAnnotationColorChange?: (annotationId: string, color: string) => void;
  onSegmentationColorChange?: (segmentationId: string, color: string) => void;
  onAnnotationLockToggle?: (annotationId: string, locked: boolean) => void;
  annotationColorMap?: Map<string, string>;
  segmentationColorMap?: Map<string, string>;
  annotationLockedMap?: Map<string, boolean>;
}

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

const getColorForId = (id: string, palette: string[] = COLOR_PALETTE): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

const parseColorCode = (colorCode?: string): string | null => {
  if (!colorCode) return null;
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorCode)) {
    return colorCode;
  }
  if (colorCode.startsWith("rgb")) {
    return colorCode;
  }
  return null;
};

export default function AnnotationsSegmentationsList({
  annotations,
  segmentations,
  selectedAnnotationId,
  selectedSegmentationId,
  onAnnotationSelect,
  onSegmentationSelect,
  onAnnotationColorChange,
  onSegmentationColorChange,
  onAnnotationLockToggle,
  annotationColorMap,
  segmentationColorMap,
  annotationLockedMap,
}: AnnotationsSegmentationsListProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState<{
    type: 'annotation' | 'segmentation';
    id: string;
  } | null>(null);
  const [tempColor, setTempColor] = useState<string>('');

  const annotationColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    annotations.forEach((ann) => {
      const providedColor = annotationColorMap?.get(ann.id);
      const color = providedColor || parseColorCode(ann.colorCode) || getColorForId(ann.id);
      colorMap.set(ann.id, color);
    });
    return colorMap;
  }, [annotations, annotationColorMap]);

  const segmentationColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    segmentations.forEach((seg) => {
      const id = seg.segmentationId || `seg-${seg.capturedAt}`;
      const providedColor = segmentationColorMap?.get(id);
      const color = providedColor || getColorForId(id);
      colorMap.set(id, color);
    });
    return colorMap;
  }, [segmentations, segmentationColorMap]);

  const handleAnnotationClick = useCallback((annotationId: string) => {
    if (onAnnotationSelect) {
      onAnnotationSelect(selectedAnnotationId === annotationId ? null : annotationId);
    }
  }, [onAnnotationSelect, selectedAnnotationId]);

  const handleSegmentationClick = useCallback((segmentationId: string) => {
    if (onSegmentationSelect) {
      onSegmentationSelect(selectedSegmentationId === segmentationId ? null : segmentationId);
    }
  }, [onSegmentationSelect, selectedSegmentationId]);

  const handleColorPickerOpen = useCallback((type: 'annotation' | 'segmentation', id: string, currentColor: string) => {
    setColorPickerOpen({ type, id });
    setTempColor(currentColor);
  }, []);

  const handleColorChange = useCallback(() => {
    if (!colorPickerOpen || !tempColor) return;
    
    const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(tempColor);
    if (!isValidColor) return;

    if (colorPickerOpen.type === 'annotation' && onAnnotationColorChange) {
      onAnnotationColorChange(colorPickerOpen.id, tempColor);
    } else if (colorPickerOpen.type === 'segmentation' && onSegmentationColorChange) {
      onSegmentationColorChange(colorPickerOpen.id, tempColor);
    }
    
    setColorPickerOpen(null);
    setTempColor('');
  }, [colorPickerOpen, tempColor, onAnnotationColorChange, onSegmentationColorChange]);
  const formatDate = useCallback((value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  }, []);

  const formatAnnotationType = useCallback((type: string) => {
    return type
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const getMeasurementDisplay = useCallback((annotation: ImageAnnotation) => {
    // First try to get from annotation metadata (converted measurement)
    const metadata = annotation.annotationData?.metadata as Record<string, unknown> | undefined;
    if (metadata?.measurementValue !== undefined && metadata?.measurementUnit) {
      return {
        value: metadata.measurementValue as number,
        unit: metadata.measurementUnit as string,
      };
    }
    
    // Fallback to stored measurementValue/measurementUnit
    if (annotation.measurementValue !== undefined) {
      return {
        value: annotation.measurementValue,
        unit: annotation.measurementUnit || "px",
      };
    }
    
    return null;
  }, []);

  const getStatusColorClasses = useCallback((status: AnnotationStatus | undefined, isHighlight: boolean) => {
    if (!status) {
      return {
        circle: isHighlight ? 'text-teal-400 fill-teal-400' : 'text-slate-400 fill-slate-400',
        dot: isHighlight ? 'bg-teal-400' : 'bg-slate-400',
      };
    }
    if (status === AnnotationStatus.FINAL) {
      return { circle: 'text-emerald-400 fill-emerald-400', dot: 'bg-emerald-400' };
    }
    if (status === AnnotationStatus.DRAFT) {
      return { circle: 'text-amber-400 fill-amber-400', dot: 'bg-amber-400' };
    }
    if (status === AnnotationStatus.REVIEWED) {
      return { circle: 'text-blue-400 fill-blue-400', dot: 'bg-blue-400' };
    }
    return {
      circle: isHighlight ? 'text-teal-400 fill-teal-400' : 'text-slate-400 fill-slate-400',
      dot: isHighlight ? 'bg-teal-400' : 'bg-slate-400',
    };
  }, []);

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
                  const isHighlight = selectedAnnotationId === annotation.id;
                  return (
                    <div
                      key={annotation.id}
                      onClick={() => handleAnnotationClick(annotation.id)}
                      className={`rounded-lg border-l-4 p-3 space-y-2 transition-all cursor-pointer relative overflow-hidden ${
                        isHighlight
                          ? 'bg-slate-800/90 border-slate-400 shadow-lg shadow-slate-900/50 ring-2 ring-offset-2 ring-offset-slate-900'
                          : 'bg-slate-900/50 hover:bg-slate-900/80'
                      }`}
                      style={{ 
                        borderLeftColor: color,
                        borderLeftWidth: isHighlight ? '6px' : '4px',
                        borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                        borderRight: "1px solid rgba(148, 163, 184, 0.1)",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                      }}
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 opacity-50"
                        style={{ backgroundColor: color }}
                      />
                      
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                        {annotation.annotationStatus && (() => {
                          const statusColors = getStatusColorClasses(annotation.annotationStatus, isHighlight);
                          return (
                            <div className="relative">
                              <Circle className={`h-3 w-3 ${statusColors.circle}`} />
                              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                            </div>
                          );
                        })()}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-slate-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onAnnotationLockToggle) {
                              const isLocked = annotationLockedMap?.get(annotation.id) || false;
                              onAnnotationLockToggle(annotation.id, !isLocked);
                            }
                          }}
                        >
                          <Lock 
                            className={`h-3 w-3 ${
                              annotationLockedMap?.get(annotation.id) 
                                ? 'text-amber-400 fill-amber-400' 
                                : 'text-slate-400'
                            }`}
                          />
                        </Button>
                      </div>
                      
                      <div className="flex items-start justify-between gap-2 pt-1 pr-16">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="h-3.5 w-3.5 rounded-full shrink-0 border border-slate-700"
                              style={{ backgroundColor: color }}
                            />
                            <Tag className="h-3.5 w-3.5 text-teal-400 shrink-0" />
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
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        {annotation.annotationDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span className="truncate">
                              {formatDate(annotation.annotationDate)}
                            </span>
                          </div>
                        )}
                        {(() => {
                          const measurement = getMeasurementDisplay(annotation);
                          return measurement ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Measurement:</span>
                              <span className="text-slate-200 font-medium">
                                {measurement.value.toFixed(1)} {measurement.unit}
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Color:</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-3 w-3 rounded-full border border-slate-700"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-slate-300 font-mono text-[10px]">{color}</span>
                          </div>
                        </div>
                        <Popover
                          open={colorPickerOpen?.type === 'annotation' && colorPickerOpen?.id === annotation.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setColorPickerOpen(null);
                              setTempColor('');
                            } else {
                              handleColorPickerOpen('annotation', annotation.id, color);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Palette className="h-3 w-3 text-slate-400" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-white">Change Color</div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-8 w-8 rounded border border-slate-600 shrink-0"
                                  style={{ backgroundColor: tempColor || color }}
                                />
                                <Input
                                  type="text"
                                  value={tempColor || color}
                                  onChange={(e) => setTempColor(e.target.value)}
                                  placeholder="#3B82F6"
                                  className="flex-1 bg-slate-900 border-slate-600 text-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleColorChange}
                                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                                >
                                  Apply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setColorPickerOpen(null);
                                    setTempColor('');
                                  }}
                                  className="flex-1 border-slate-600 text-slate-300"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
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
                  const isHighlight = selectedSegmentationId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => handleSegmentationClick(id)}
                      className={`rounded-lg border-l-4 p-3 space-y-2 transition-all cursor-pointer relative overflow-hidden ${
                        isHighlight
                          ? 'bg-slate-800/90 border-slate-400 shadow-lg shadow-slate-900/50 ring-2 ring-offset-2 ring-offset-slate-900'
                          : 'bg-slate-900/50 hover:bg-slate-900/80'
                      }`}
                      style={{ 
                        borderLeftColor: color,
                        borderLeftWidth: isHighlight ? '6px' : '4px',
                        borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                        borderRight: "1px solid rgba(148, 163, 184, 0.1)",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                      }}
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 opacity-50"
                        style={{ backgroundColor: color }}
                      />
                      
                      <div className="absolute top-3 right-3 z-10">
                        <div className="relative">
                          <Circle 
                            className={`h-3 w-3 ${
                              isHighlight
                                ? 'text-teal-400 fill-teal-400'
                                : 'text-slate-400 fill-slate-400'
                            }`}
                          />
                          <div 
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${
                              isHighlight
                                ? 'bg-teal-400'
                                : 'bg-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between gap-2 pt-1 pr-16">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="h-3.5 w-3.5 rounded-full shrink-0 border border-slate-700"
                              style={{ backgroundColor: color }}
                            />
                            <Layers className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                            <span className="text-sm font-medium text-white truncate">
                              {segmentation.segmentationId || `Segmentation ${index + 1}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="truncate">
                            {formatDate(new Date(segmentation.capturedAt).toISOString())}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Slices:</span>
                          <span className="text-slate-200">
                            {segmentation.imageData?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Color:</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-3 w-3 rounded-full border border-slate-700"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-slate-300 font-mono text-[10px]">{color}</span>
                          </div>
                        </div>
                        <Popover
                          open={colorPickerOpen?.type === 'segmentation' && colorPickerOpen?.id === id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setColorPickerOpen(null);
                              setTempColor('');
                            } else {
                              handleColorPickerOpen('segmentation', id, color);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Palette className="h-3 w-3 text-slate-400" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 bg-slate-800 border-slate-700" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-white">Change Color</div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-8 w-8 rounded border border-slate-600 shrink-0"
                                  style={{ backgroundColor: tempColor || color }}
                                />
                                <Input
                                  type="text"
                                  value={tempColor || color}
                                  onChange={(e) => setTempColor(e.target.value)}
                                  placeholder="#3B82F6"
                                  className="flex-1 bg-slate-900 border-slate-600 text-white"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleColorChange}
                                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                                >
                                  Apply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setColorPickerOpen(null);
                                    setTempColor('');
                                  }}
                                  className="flex-1 border-slate-600 text-slate-300"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
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

