"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/common/enums/image-dicom.enum";
import { Calendar, Tag, Circle, Ruler, Layers, Image, User } from "lucide-react";

interface AnnotationDetailModalProps {
  annotation: ImageAnnotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotatorName?: string | null;
  reviewerName?: string | null;
  formatAnnotationType: (type: string) => string;
  formatDate: (value?: string) => string;
  color?: string;
}

const getStatusColorClasses = (status: AnnotationStatus | undefined) => {
  if (!status) {
    return { text: "text-slate-400", label: "Local", bg: "bg-slate-400" };
  }
  if (status === AnnotationStatus.FINAL) {
    return { text: "text-emerald-400", label: "Final", bg: "bg-emerald-400" };
  }
  if (status === AnnotationStatus.DRAFT) {
    return { text: "text-amber-400", label: "Draft", bg: "bg-amber-400" };
  }
  if (status === AnnotationStatus.REVIEWED) {
    return { text: "text-blue-400", label: "Reviewed", bg: "bg-blue-400" };
  }
  return { text: "text-slate-400", label: "Unknown", bg: "bg-slate-400" };
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

export function AnnotationDetailModal({
  annotation,
  open,
  onOpenChange,
  annotatorName,
  reviewerName,
  formatAnnotationType,
  formatDate,
  color = "#64748b",
}: AnnotationDetailModalProps) {
  if (!annotation) return null;

  const statusColors = getStatusColorClasses(annotation.annotationStatus);
  const measurement = getMeasurementDisplay(annotation);
  const metadata = annotation.annotationData?.metadata as Record<string, unknown> | undefined;
  const sliceIndex = metadata?.sliceIndex as number | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full border border-slate-600"
              style={{ backgroundColor: color }}
            />
            Annotation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Type and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium">
                {formatAnnotationType(annotation.annotationType)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle className={`h-3 w-3 ${statusColors.text} fill-current`} />
              <span className={`text-sm font-medium ${statusColors.text}`}>
                {statusColors.label}
              </span>
            </div>
          </div>

          {/* Text Content */}
          {annotation.textContent && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-sm text-slate-300">{annotation.textContent}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Date */}
            {annotation.annotationDate && (
              <div className="bg-slate-800/30 rounded-md p-2">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">Date</span>
                </div>
                <span className="text-slate-200">{formatDate(annotation.annotationDate)}</span>
              </div>
            )}

            {/* Measurement */}
            {measurement && measurement.value != null && (
              <div className="bg-slate-800/30 rounded-md p-2">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Ruler className="h-3 w-3" />
                  <span className="text-xs">Measurement</span>
                </div>
                <span className="text-slate-200 font-medium">
                  {measurement.value.toFixed(1)} {measurement.unit}
                </span>
              </div>
            )}

            {/* Instance */}
            {!(annotation as any).isLocal && (
              <div className="bg-slate-800/30 rounded-md p-2">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Image className="h-3 w-3" />
                  <span className="text-xs">Instance</span>
                </div>
                <span className="text-slate-200">
                  {annotation.instance?.instanceNumber ||
                    annotation.instanceId?.slice(0, 8) ||
                    "—"}
                </span>
              </div>
            )}

            {/* Frame */}
            {sliceIndex !== undefined && (
              <div className="bg-slate-800/30 rounded-md p-2">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Layers className="h-3 w-3" />
                  <span className="text-xs">Frame</span>
                </div>
                <span className="text-slate-200">{sliceIndex + 1}</span>
              </div>
            )}
          </div>

          {/* People Info */}
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Annotator</span>
              </div>
              <span className="text-slate-200">
                {annotatorName || annotation.annotatorId || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Reviewer</span>
              </div>
              <span className="text-slate-200">
                {reviewerName || (annotation as any).reviewerId || "—"}
              </span>
            </div>
            {annotation.reviewDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Reviewed</span>
                </div>
                <span className="text-slate-200">
                  {formatDate(annotation.reviewDate as any)}
                </span>
              </div>
            )}
          </div>

          {/* Color Code */}
          <div className="flex items-center justify-between text-sm border-t border-slate-700 pt-3">
            <span className="text-slate-400">Color Code</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-slate-600"
                style={{ backgroundColor: annotation.colorCode || color }}
              />
              <span className="text-slate-200 font-mono text-xs">
                {annotation.colorCode || color || "—"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
