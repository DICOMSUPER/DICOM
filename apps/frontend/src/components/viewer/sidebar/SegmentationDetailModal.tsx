"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SegmentationLayerData } from "@/common/contexts/ViewerContext";
import { Layers, Calendar, User, Database, Palette } from "lucide-react";

interface SegmentationDetailModalProps {
  layer: SegmentationLayerData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segmentatorName?: string | null;
  reviewerName?: string | null;
}

export function SegmentationDetailModal({
  layer,
  open,
  onOpenChange,
  segmentatorName,
  reviewerName,
}: SegmentationDetailModalProps) {
  if (!layer) return null;

  const meta: any = layer.metadata;
  const isFromDatabase = meta.origin === "database";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            Segmentation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Layer Name and Origin */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              {meta.name || `Layer ${meta.id?.slice(0, 8)}`}
            </span>
            <div className="flex items-center gap-1.5">
              {isFromDatabase ? (
                <>
                  <Database className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Saved</span>
                </>
              ) : (
                <span className="text-sm font-medium text-amber-400">Local</span>
              )}
            </div>
          </div>

          {/* Notes */}
          {meta.notes && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-sm text-slate-300">{meta.notes}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Status */}
            <div className="bg-slate-800/30 rounded-md p-2">
              <span className="text-xs text-slate-400 block mb-1">Status</span>
              <span className="text-slate-200 font-medium">
                {meta.segmentationStatus || "—"}
              </span>
            </div>

            {/* Frame */}
            <div className="bg-slate-800/30 rounded-md p-2">
              <span className="text-xs text-slate-400 block mb-1">Frame</span>
              <span className="text-slate-200">
                {meta.frame != null ? meta.frame : "—"}
              </span>
            </div>

            {/* Snapshots */}
            <div className="bg-slate-800/30 rounded-md p-2">
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <Layers className="h-3 w-3" />
                <span className="text-xs">Snapshots</span>
              </div>
              <span className="text-slate-200">{layer.snapshots?.length || 0}</span>
            </div>

            {/* Color */}
            {meta.colorCode && (
              <div className="bg-slate-800/30 rounded-md p-2">
                <div className="flex items-center gap-1 text-slate-400 mb-1">
                  <Palette className="h-3 w-3" />
                  <span className="text-xs">Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-slate-600"
                    style={{ backgroundColor: meta.colorCode }}
                  />
                  <span className="text-slate-200 font-mono text-xs">{meta.colorCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* People Info */}
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Segmentator</span>
              </div>
              <span className="text-slate-200">
                {segmentatorName || meta.segmentatorId || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Reviewer</span>
              </div>
              <span className="text-slate-200">
                {reviewerName || meta.reviewerId || "—"}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t border-slate-700 pt-3 space-y-2">
            {meta.segmentationDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Segmentation Date</span>
                </div>
                <span className="text-slate-200">{meta.segmentationDate}</span>
              </div>
            )}
            {meta.reviewDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Review Date</span>
                </div>
                <span className="text-slate-200">{meta.reviewDate}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
