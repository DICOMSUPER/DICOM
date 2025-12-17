"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/common/enums/image-dicom.enum";
import { Roles } from "@/common/enums/user.enum";
import {
  Calendar,
  Tag,
  Circle,
  Lock,
  Ruler,
  Layers,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  FileCheck,
  Save,
  Info,
  Edit3,
  ShieldCheck
} from "lucide-react";
import { AnnotationColorPicker } from "./AnnotationColorPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLazyGetUserByIdQuery } from "@/store/userApi";
import { AnnotationDetailModal } from "./AnnotationDetailModal";

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

const useUserName = (userId?: string) => {
  const [name, setName] = useState<string | null>(null);
  const [fetchUser, { isFetching }] = useLazyGetUserByIdQuery();

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!userId) return;
      try {
        const res = await fetchUser(userId).unwrap();
        const u: any = res?.data || res?.user || res;
        if (active && u) {
          const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
          setName(full || u.email || u.id || null);
        }
      } catch {
        if (active) setName(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [userId, fetchUser]);

  return { name, isFetching };
};

const getStatusColorClasses = (status: AnnotationStatus | undefined, isHighlight: boolean) => {
  if (!status) {
    return {
      dot: isHighlight ? "bg-teal-400" : "bg-slate-400",
      text: "text-slate-400",
      label: "Local",
      border: "border-slate-500",
      bg: "bg-slate-500/10"
    };
  }
  if (status === AnnotationStatus.FINAL) {
    return {
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      label: "Final",
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/10"
    };
  }
  if (status === AnnotationStatus.DRAFT) {
    return {
      dot: "bg-amber-400",
      text: "text-amber-400",
      label: "Draft",
      border: "border-amber-500/50",
      bg: "bg-amber-500/10"
    };
  }
  if (status === AnnotationStatus.REVIEWED) {
    return {
      dot: "bg-blue-400",
      text: "text-blue-400",
      label: "Reviewed",
      border: "border-blue-500/50",
      bg: "bg-blue-500/10"
    };
  }
  return {
    dot: isHighlight ? "bg-teal-400" : "bg-slate-400",
    text: isHighlight ? "text-teal-400" : "text-slate-400",
    label: "Local",
    border: "border-slate-500",
    bg: "bg-slate-500/10"
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

const AnnotationCard = React.memo(({
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
}: AnnotationCardProps) => {
  const statusColors = getStatusColorClasses(annotation.annotationStatus, isHighlight);
  const measurement = getMeasurementDisplay(annotation);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { name: reviewerName, isFetching: reviewerLoading } = useUserName(annotation.reviewerId);
  const { name: annotatorName, isFetching: annotatorLoading } = useUserName(annotation.annotatorId);

  // Check if user is physician
  const isPhysician = userRole === Roles.PHYSICIAN;
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
      className={`rounded-lg border-l-4 p-3 transition-all cursor-pointer relative group ${isHighlight
        ? "bg-teal-900/40 border-teal-400 shadow-lg ring-1 ring-teal-500/30"
        : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-700"
        }`}
      style={{
        borderLeftColor: isHighlight ? "#14b8a6" : color,
        borderLeftWidth: isHighlight ? "6px" : "4px",
      }}
    >
      {/* Header: Type and Status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="h-3 w-3 rounded-full shrink-0 border border-slate-600 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-slate-100 truncate">
            {formatAnnotationType(annotation.annotationType)}
          </span>
          <Tag className="h-3 w-3 text-slate-500" />
        </div>

        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
          {statusColors.label}
        </div>
      </div>

      {/* Body: Metadata (Text, Measurements, Instance, Date) */}
      <div className="space-y-1.5 mb-3 pl-5">
        {annotation.textContent && (
          <p className="text-xs text-slate-300 line-clamp-1 italic">
            "{annotation.textContent}"
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          {/* Measurements */}
          {measurement && measurement.value != null && (
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Ruler className="h-3 w-3" />
              <span>
                {measurement.value.toFixed(1)} {measurement.unit}
              </span>
            </div>
          )}

          {/* Instance Info */}
          {!(annotation as any).isLocal && (
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3 w-3" />
              <span>
                {annotation.instance?.instanceNumber ||
                  annotation.instanceId?.slice(0, 8) ||
                  "unknown"}
              </span>
            </div>
          )}

          {/* Frame Info */}
          {(() => {
            const metadata = annotation.annotationData?.metadata as any;
            const sliceIndex = metadata?.sliceIndex;
            if (sliceIndex !== undefined) {
              return (
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3" />
                  <span>Frame: {sliceIndex + 1}</span>
                </div>
              );
            }
            return null;
          })()}

          {/* Date */}
          {annotation.annotationDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(annotation.annotationDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Action Icons Row */}
      <div className="flex items-center justify-between border-t border-slate-800/50 pt-2 mt-1">
        {/* Left Group: Status Indicators (Lock) */}
        <div className="flex items-center gap-1">
          {!isEditDeleteDisabled && !isLocal && currentStatus === AnnotationStatus.DRAFT && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle(annotation.id, !isLocked);
              }}
              title={isLocked ? "Unlock annotation" : "Lock annotation"}
            >
              <Lock
                className={`h-3.5 w-3.5 ${isLocked
                  ? "text-red-400"
                  : "text-slate-400"
                  }`}
              />
            </Button>
          )}

          {(isReadOnly || currentStatus === AnnotationStatus.FINAL) && (
            <div className="h-7 w-7 flex items-center justify-center cursor-help" title={isReadOnly ? "Read-only (Reviewed)" : "Protected (Final)"}>
              <Lock className={`h-3.5 w-3.5 ${isReadOnly ? "text-emerald-500" : "text-blue-500"}`} />
            </div>
          )}
        </div>

        {/* Right Group: Actions */}
        <div className="flex items-center gap-1">
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

          {/* Save Button for Local Annotations */}
          {isLocal && onSaveLocal && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-slate-800 text-teal-500 hover:text-teal-400"
              onClick={(e) => {
                e.stopPropagation();
                onSaveLocal(annotation);
              }}
              title="Save to database"
            >
              <Save className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Status Change Dropdown for Saved Annotations */}
          {!isLocal && (canMarkAsFinal || canMarkAsReviewed || canChangeToDraft) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                  title="Change Status"
                >
                  <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-700 text-slate-200" align="end">
                {canMarkAsFinal && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(annotation, AnnotationStatus.FINAL);
                    }}
                    className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer transition-colors gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Mark as Final
                  </DropdownMenuItem>
                )}
                {canMarkAsReviewed && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(annotation, AnnotationStatus.REVIEWED);
                    }}
                    className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer transition-colors gap-2"
                  >
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    Mark as Reviewed
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
                      className="text-slate-200 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer transition-colors gap-2"
                    >
                      <FileCheck className="h-4 w-4 text-amber-400" />
                      Change to Draft
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoModal(true);
            }}
            title="Info"
          >
            <Info className="h-3.5 w-3.5" />
          </Button>

          {!isEditDeleteDisabled && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-slate-800 text-slate-400 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(annotation);
              }}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <AnnotationDetailModal
        annotation={annotation}
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        annotatorName={annotatorLoading ? "Loading..." : annotatorName}
        reviewerName={reviewerLoading ? "Loading..." : reviewerName}
        formatAnnotationType={formatAnnotationType}
        formatDate={formatDate}
        color={color}
      />
    </div>
  );
});

export { AnnotationCard };
