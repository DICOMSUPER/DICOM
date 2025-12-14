"use client";

import React, { useState, useEffect } from "react";
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
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/common/enums/image-dicom.enum";
import { AlertTriangle, Save, FileText, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SaveAnnotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotation: ImageAnnotation | null;
  onConfirm: (status: AnnotationStatus) => Promise<void>;
}

export function SaveAnnotationModal({
  open,
  onOpenChange,
  annotation,
  onConfirm,
}: SaveAnnotationModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveAsFinal, setSaveAsFinal] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setSaveAsFinal(false);
    }
  }, [open]);

  const handleClose = () => {
    setConfirmed(false);
    setSaveAsFinal(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!annotation || !confirmed) return;

    setSubmitting(true);
    try {
      const status = saveAsFinal ? AnnotationStatus.FINAL : AnnotationStatus.DRAFT;
      await onConfirm(status);
      handleClose();
    } catch (error) {
      console.error("Failed to save annotation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!annotation) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-teal-400" />
            Save Annotation to Database
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose how to save this annotation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">Save as:</Label>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2">
                {saveAsFinal ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">Final</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-white">Draft</span>
                  </>
                )}
              </div>
              <Switch
                checked={saveAsFinal}
                onCheckedChange={setSaveAsFinal}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Status Description */}
            <Alert className="bg-slate-800/50 border-slate-700">
              <AlertDescription className="text-xs text-slate-300">
                {saveAsFinal ? (
                  <>
                    <strong>Final:</strong> Submitted for review. Can still be edited before physician approval.
                  </>
                ) : (
                  <>
                    <strong>Draft:</strong> Work in progress. Can be edited freely.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </div>

          {/* Warning for Final status */}
          {saveAsFinal && (
            <Alert className="bg-amber-900/20 border-amber-700">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-xs text-amber-200">
                <strong>Note:</strong> Once marked as Final and reviewed by a physician, this annotation will become read-only and cannot be modified.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <Checkbox
              id="confirm-save"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="confirm-save"
                className="text-sm font-medium leading-none cursor-pointer text-white"
              >
                I confirm saving this annotation
              </Label>
              <p className="text-xs text-slate-400">
                {saveAsFinal
                  ? "I understand this will be submitted as Final"
                  : "This annotation will be saved as a Draft"}
              </p>
            </div>
          </div>

          {/* Annotation Info */}
          <div className="text-xs text-slate-400 p-2 rounded bg-slate-800/30 space-y-1">
            <div><strong>Type:</strong> {annotation.annotationType}</div>
            {annotation.measurementValue && (
              <div><strong>Measurement:</strong> {annotation.measurementValue} {annotation.measurementUnit}</div>
            )}
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
            disabled={!confirmed || submitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {submitting ? (
              <>
                <span className="mr-2">Saving...</span>
                <span className="animate-spin">⟳</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {saveAsFinal ? "Save as Final" : "Save as Draft"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

