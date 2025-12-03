"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import {
  Calendar,
  Tag,
  Circle,
  Lock,
  Ruler,
  Layers,
  Image,
  Trash2,
} from "lucide-react";
import { AnnotationColorPicker } from "./AnnotationColorPicker";

interface AnnotationCardProps {
  annotation: ImageAnnotation;
  color: string;
  isHighlight: boolean;
  isLocked: boolean;
  colorPickerOpen: boolean;
  tempColor: string;
  onAnnotationClick: (id: string) => void;
  onColorPickerOpen: (id: string, color: string) => void;
  onColorChange: (id: string) => void;
  onLockToggle: (id: string, locked: boolean) => void;
  onDeleteClick: (annotation: ImageAnnotation) => void;
  onColorPickerClose: () => void;
  onTempColorChange: (color: string) => void;
  formatAnnotationType: (type: string) => string;
  formatDate: (value?: string) => string;
}

const getStatusColorClasses = (status: AnnotationStatus | undefined, isHighlight: boolean) => {
  if (!status) {
    return {
      circle: isHighlight ? "text-teal-400 fill-teal-400" : "text-slate-400 fill-slate-400",
      dot: isHighlight ? "bg-teal-400" : "bg-slate-400",
      text: "text-slate-400",
      label: "Local",
    };
  }
  if (status === AnnotationStatus.FINAL) {
    return {
      circle: "text-emerald-400 fill-emerald-400",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      label: "Final",
    };
  }
  if (status === AnnotationStatus.DRAFT) {
    return {
      circle: "text-amber-400 fill-amber-400",
      dot: "bg-amber-400",
      text: "text-amber-400",
      label: "Draft",
    };
  }
  if (status === AnnotationStatus.REVIEWED) {
    return {
      circle: "text-blue-400 fill-blue-400",
      dot: "bg-blue-400",
      text: "text-blue-400",
      label: "Reviewed",
    };
  }
  return {
    circle: isHighlight ? "text-teal-400 fill-teal-400" : "text-slate-400 fill-slate-400",
    dot: isHighlight ? "bg-teal-400" : "bg-slate-400",
    text: isHighlight ? "text-teal-400" : "text-slate-400",
    label: "Local",
  };
};

const getMeasurementDisplay = (annotation: ImageAnnotation) => {
  const metadata = annotation.annotationData?.metadata as Record<string, unknown> | undefined;
  if (metadata?.measurementValue !== undefined && metadata?.measurementUnit) {
    return {
      value: metadata.measurementValue as number,
      unit: metadata.measurementUnit as string,
    };
  }
  
  if (annotation.measurementValue !== undefined) {
    return {
      value: annotation.measurementValue,
      unit: annotation.measurementUnit || "px",
    };
  }
  
  return null;
};

export function AnnotationCard({
  annotation,
  color,
  isHighlight,
  isLocked,
  colorPickerOpen,
  tempColor,
  onAnnotationClick,
  onColorPickerOpen,
  onColorChange,
  onLockToggle,
  onDeleteClick,
  onColorPickerClose,
  onTempColorChange,
  formatAnnotationType,
  formatDate,
}: AnnotationCardProps) {
  const statusColors = getStatusColorClasses(annotation.annotationStatus, isHighlight);
  const measurement = getMeasurementDisplay(annotation);

  // Debug highlight state
  if (isHighlight) {
    console.log('[AnnotationCard] Rendering highlighted card:', annotation.id, {
      isLocal: (annotation as any).isLocal,
      color: color,
      annotationType: annotation.annotationType
    });
  }

  return (
    <div
      key={annotation.id}
      onClick={() => onAnnotationClick(annotation.id)}
      className={`rounded-lg border-l-4 p-3 space-y-2 transition-all cursor-pointer relative ${
        isHighlight
          ? "bg-teal-900/40 border-teal-400 shadow-lg ring-2 ring-teal-500/50"
          : "bg-slate-900/50 hover:bg-slate-900/80"
      }`}
      style={{
        borderLeftColor: isHighlight ? "#14b8a6" : color,
        borderLeftWidth: isHighlight ? "6px" : "4px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0 border border-slate-700"
              style={{ backgroundColor: color }}
            />
            <Tag className="h-3 w-3 text-teal-400 shrink-0" />
            <span className="text-xs font-medium text-white truncate">
              {formatAnnotationType(annotation.annotationType)}
            </span>
          </div>
          
          {annotation.textContent && (
            <p className="text-xs text-slate-300 line-clamp-1 ml-6">
              {annotation.textContent}
            </p>
          )}
          
          {/* Instance and Frame Info */}
          <div className="flex items-center gap-3 ml-6 text-[10px] text-slate-400">
            {!(annotation as any).isLocal && (
              <div className="flex items-center gap-1">
                <Image className="h-2.5 w-2.5" />
                <span>
                  Instance:{" "}
                  {annotation.instance?.instanceNumber ||
                    annotation.instanceId?.slice(0, 8) ||
                    "unknown"}
                </span>
              </div>
            )}
            {(() => {
              const metadata = annotation.annotationData?.metadata as any;
              const sliceIndex = metadata?.sliceIndex;
              if (sliceIndex !== undefined) {
                return (
                  <div className="flex items-center gap-1">
                    <Layers className="h-2.5 w-2.5" />
                    <span>Frame: {sliceIndex + 1}</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div className="flex items-center gap-3 ml-6 text-xs text-slate-400">
            {annotation.annotationDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                <span className="truncate text-xs">
                  {formatDate(annotation.annotationDate)}
                </span>
              </div>
            )}
            {measurement && measurement.value != null && (
              <div className="flex items-center gap-1">
                <Ruler className="h-2.5 w-2.5" />
                <span className="text-xs text-slate-300 font-medium">
                  {measurement.value.toFixed(1)} {measurement.unit}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Status indicator on top */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Circle className={`h-2.5 w-2.5 ${statusColors.circle}`} />
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full ${statusColors.dot}`}
              />
            </div>
            <span className={`text-xs font-medium ${statusColors.text}`}>
              {statusColors.label}
            </span>
          </div>
          
          {/* Palette and Lock icons side by side */}
          <div className="flex items-center gap-1.5">
            <AnnotationColorPicker
              annotationId={annotation.id}
              currentColor={color}
              isOpen={colorPickerOpen}
              tempColor={tempColor}
              onOpen={onColorPickerOpen}
              onClose={onColorPickerClose}
              onColorChange={onColorChange}
              onTempColorChange={onTempColorChange}
            />

            {/* Hide lock icon for reviewed/final annotations (read-only) */}
            {annotation.annotationStatus !== AnnotationStatus.REVIEWED && 
             annotation.annotationStatus !== AnnotationStatus.FINAL && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-slate-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onLockToggle(annotation.id, !isLocked);
                }}
              >
                <Lock
                  className={`h-2.5 w-2.5 ${
                    isLocked
                      ? "text-red-500 stroke-red-500"
                      : "text-slate-400"
                  }`}
                  strokeWidth={isLocked ? 2.5 : 2}
                />
              </Button>
            )}

            {/* Hide delete icon for reviewed/final annotations (read-only) */}
            {annotation.annotationStatus !== AnnotationStatus.REVIEWED && 
             annotation.annotationStatus !== AnnotationStatus.FINAL && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-slate-700 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(annotation);
                }}
              >
                <Trash2 className="h-2.5 w-2.5 text-slate-400" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

