"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import { Roles } from "@/enums/user.enum";
import { AlertTriangle, CheckCircle2, Lock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnnotationStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotation: ImageAnnotation | null;
  targetStatus: AnnotationStatus;
  userRole: string;
  onConfirm: (annotationId: string, newStatus: AnnotationStatus) => Promise<void>;
}

const StatusInfo = {
  [AnnotationStatus.DRAFT]: {
    label: "Draft",
    color: "bg-amber-500",
    description: "Work in progress, can be edited",
    icon: FileText,
  },
  [AnnotationStatus.FINAL]: {
    label: "Final",
    color: "bg-blue-500",
    description: "Submitted for review, can still be edited",
    icon: CheckCircle2,
  },
  [AnnotationStatus.REVIEWED]: {
    label: "Reviewed",
    color: "bg-green-500",
    description: "Approved by physician, read-only",
    icon: Lock,
  },
};

export function AnnotationStatusModal({
  open,
  onOpenChange,
  annotation,
  targetStatus,
  userRole,
  onConfirm,
}: AnnotationStatusModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setConfirmed(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!annotation || !confirmed) return;

    setSubmitting(true);
    try {
      await onConfirm(annotation.id, targetStatus);
      handleClose();
    } catch (error) {
      console.error("Failed to update annotation status:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!annotation) return null;

  const currentStatus = annotation.annotationStatus;
  const CurrentIcon = StatusInfo[currentStatus].icon;
  const TargetIcon = StatusInfo[targetStatus].icon;

  const isPhysician = userRole === Roles.PHYSICIAN || userRole === Roles.RADIOLOGIST;
  const isFromReviewed = currentStatus === AnnotationStatus.REVIEWED;
  const isFinalToDraft = currentStatus === AnnotationStatus.FINAL && targetStatus === AnnotationStatus.DRAFT;

  const canChange = 
    !isFromReviewed &&
    !isFinalToDraft &&
    ((targetStatus === AnnotationStatus.FINAL) ||
     (targetStatus === AnnotationStatus.REVIEWED && isPhysician));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Change Annotation Status
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            You are about to change the status of this annotation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2">
              <CurrentIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Current:</span>
            </div>
            <Badge className={`${StatusInfo[currentStatus].color} text-white`}>
              {StatusInfo[currentStatus].label}
            </Badge>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-teal-400 text-2xl">↓</div>
          </div>

          {/* Target Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-teal-900/20 border border-teal-700">
            <div className="flex items-center gap-2">
              <TargetIcon className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-teal-400">New Status:</span>
            </div>
            <Badge className={`${StatusInfo[targetStatus].color} text-white`}>
              {StatusInfo[targetStatus].label}
            </Badge>
          </div>

          {/* Description */}
          <Alert className="bg-slate-800/50 border-slate-700">
            <AlertDescription className="text-xs text-slate-300">
              {StatusInfo[targetStatus].description}
            </AlertDescription>
          </Alert>

          {/* Warning for reviewed status */}
          {targetStatus === AnnotationStatus.REVIEWED && (
            <Alert className="bg-amber-900/20 border-amber-700">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-xs text-amber-200">
                <strong>Warning:</strong> Once marked as REVIEWED, this annotation becomes read-only and cannot be edited or changed.
              </AlertDescription>
            </Alert>
          )}

          {/* Permission check */}
          {!canChange && (
            <Alert className="bg-red-900/20 border-red-700">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-xs text-red-200">
                <strong>Permission Denied:</strong> {
                  isFromReviewed
                    ? "Reviewed annotations cannot be changed. They are immutable."
                    : isFinalToDraft
                    ? "Final status can only be changed to reviewed, not back to draft."
                    : "Only physicians can mark annotations as REVIEWED."
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Checkbox */}
          {canChange && (
            <div className="flex items-start space-x-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <Checkbox
                id="confirm-status-change"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="confirm-status-change"
                  className="text-sm font-medium leading-none cursor-pointer text-white"
                >
                  I confirm this status change
                </Label>
                <p className="text-xs text-slate-400">
                  {targetStatus === AnnotationStatus.REVIEWED
                    ? "I understand this annotation will become read-only"
                    : "I have reviewed this annotation and confirm the change"}
                </p>
              </div>
            </div>
          )}

          {/* Annotation Info */}
          <div className="text-xs text-slate-400 p-2 rounded bg-slate-800/30">
            <div>Type: {annotation.annotationType}</div>
            {annotation.notes && <div>Notes: {annotation.notes}</div>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!confirmed || submitting || !canChange}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {submitting ? (
              <>
                <span className="mr-2">Updating...</span>
                <span className="animate-spin">⟳</span>
              </>
            ) : (
              `Change to ${StatusInfo[targetStatus].label}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

