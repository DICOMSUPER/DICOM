"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageAnnotation } from "@/common/interfaces/image-dicom/image-annotation.interface";
import { Tag } from "lucide-react";

interface AnnotationDeleteDialogProps {
  annotation: ImageAnnotation | null;
  onConfirm: () => void;
  onCancel: () => void;
  formatAnnotationType: (type: string) => string;
}

export function AnnotationDeleteDialog({
  annotation,
  onConfirm,
  onCancel,
  formatAnnotationType,
}: AnnotationDeleteDialogProps) {
  return (
    <AlertDialog open={!!annotation} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Annotation</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete this annotation? This action cannot be undone.
          </AlertDialogDescription>
          {annotation && (
            <div className="mt-2 p-2 bg-slate-800 rounded text-xs">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-teal-400" />
                <span className="text-white font-medium">
                  {annotation.annotationType && formatAnnotationType(annotation.annotationType)}
                </span>
              </div>
              {(annotation as any).isLocal ? (
                <div className="text-amber-400 text-[10px] mt-1">
                  Local annotation (not saved to database)
                </div>
              ) : (
                <div className="text-emerald-400 text-[10px] mt-1">Database annotation</div>
              )}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

