"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import { Roles } from "@/enums/user.enum";
import {
  Calendar,
  Tag,
  Circle,
  Lock,
  Ruler,
  Layers,
  Image,
  Trash2,
  CheckCircle2,
  FileCheck,
  Save,
} from "lucide-react";
import { AnnotationColorPicker } from "./AnnotationColorPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AnnotationCardProps {
  annotation: ImageAnnotation;
  color: string;
  isHighlight: boolean;
  isLocked: boolean;
  colorPickerOpen: boolean;
  tempColor: string;
  userRole: string;
  onAnnotationClick: (id: string) => void;
  onColorPickerOpen: (id: string, color: string) => void;
  onColorChange: (id: string) => void;
  onLockToggle: (id: string, locked: boolean) => void;
  onDeleteClick: (annotation: ImageAnnotation) => void;
  onColorPickerClose: () => void;
  onTempColorChange: (color: string) => void;
  onStatusChange: (annotation: ImageAnnotation, newStatus: AnnotationStatus) => void;
  onSaveLocal?: (annotation: ImageAnnotation) => void;
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
  userRole,
  onAnnotationClick,
  onColorPickerOpen,
  onColorChange,
  onLockToggle,
  onDeleteClick,
  onColorPickerClose,
  onTempColorChange,
  onStatusChange,
  onSaveLocal,
  formatAnnotationType,
  formatDate,
}: AnnotationCardProps) {
  const statusColors = getStatusColorClasses(annotation.annotationStatus, isHighlight);
  const measurement = getMeasurementDisplay(annotation);
  
  // Check if user is physician
  const isPhysician = userRole === Roles.PHYSICIAN || userRole === Roles.RADIOLOGIST;
  const isLocal = (annotation as any).isLocal;
  const currentStatus = annotation.annotationStatus;
  
  // Determine what status changes are available
  const canMarkAsFinal = isLocal || currentStatus === AnnotationStatus.DRAFT;
  const canMarkAsReviewed = isPhysician && currentStatus === AnnotationStatus.FINAL;
  const canChangeToDraft = false;
  
  // Read-only logic: REVIEWED and FINAL are read-only for edit/delete
  const isReadOnly = currentStatus === AnnotationStatus.REVIEWED;
  const isEditDeleteDisabled = isReadOnly || currentStatus === AnnotationStatus.FINAL;

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
          
          {/* Action buttons - 2x2 grid */}
          <div className="grid grid-cols-2 gap-1">
            {/* Save Button for Local Annotations */}
            {isLocal && onSaveLocal && (
              <div
                role="button"
                tabIndex={0}
                className="h-5 w-5 flex items-center justify-center cursor-pointer rounded hover:bg-teal-700/50 bg-teal-600/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveLocal(annotation);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onSaveLocal(annotation);
                  }
                }}
                title="Save to database"
              >
                <Save className="h-3 w-3 text-teal-400" />
              </div>
            )}
            
            {/* Status Change Dropdown for Saved Annotations */}
            {!isLocal && (canMarkAsFinal || canMarkAsReviewed || canChangeToDraft) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    className="h-5 w-5 flex items-center justify-center cursor-pointer rounded hover:bg-slate-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <FileCheck className="h-3 w-3 text-blue-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700" align="end">
                  {canMarkAsFinal && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(annotation, AnnotationStatus.FINAL);
                      }}
                      className="text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-blue-400" />
                      Mark as Final
                    </DropdownMenuItem>
                  )}
                  {canMarkAsReviewed && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(annotation, AnnotationStatus.REVIEWED);
                      }}
                      className="text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5 mr-2 text-green-400" />
                      Mark as Reviewed (Physician)
                    </DropdownMenuItem>
                  )}
                  {canChangeToDraft && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(annotation, AnnotationStatus.DRAFT);
                        }}
                        className="text-white hover:bg-slate-700 cursor-pointer"
                      >
                        <FileCheck className="h-3.5 w-3.5 mr-2 text-amber-400" />
                        Change to Draft
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!isEditDeleteDisabled && (
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
            )}

            {!isEditDeleteDisabled && !isLocal && currentStatus === AnnotationStatus.DRAFT && (
              <div
                role="button"
                tabIndex={0}
                className="h-5 w-5 flex items-center justify-center cursor-pointer rounded hover:bg-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onLockToggle(annotation.id, !isLocked);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onLockToggle(annotation.id, !isLocked);
                  }
                }}
                title={isLocked ? "Unlock annotation" : "Lock annotation"}
              >
                <Lock
                  className={`h-3 w-3 ${
                    isLocked
                      ? "text-red-500"
                      : "text-slate-400"
                  }`}
                />
              </div>
            )}

            {!isEditDeleteDisabled && (
              <div
                role="button"
                tabIndex={0}
                className="h-5 w-5 flex items-center justify-center cursor-pointer rounded hover:bg-red-900/50 transition-colors group"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(annotation);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeleteClick(annotation);
                  }
                }}
                title="Delete annotation"
              >
                <Trash2 className="h-3 w-3 text-slate-400 group-hover:text-red-400 transition-colors" />
              </div>
            )}
            
            {isReadOnly && (
              <div className="h-4 w-4 flex items-center justify-center" title="Read-only (Reviewed)">
                <Lock className="h-2.5 w-2.5 text-green-500" />
              </div>
            )}
            
            {currentStatus === AnnotationStatus.FINAL && !isReadOnly && (
              <div className="h-4 w-4 flex items-center justify-center" title="Final (Protected)">
                <Lock className="h-2.5 w-2.5 text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

