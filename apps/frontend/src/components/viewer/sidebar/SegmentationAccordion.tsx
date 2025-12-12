"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui-next/Accordion";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Database,
  Plus,
  Edit3,
  Info,
} from "lucide-react";
import { useViewer } from "@/contexts/ViewerContext";
import type { SegmentationLayerData } from "@/contexts/ViewerContext";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGetUserByIdQuery } from "@/store/userApi";

interface SegmentationAccordionProps {
  onSaveLayer: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onUpdateLayerMetadata: (layerId: string, updates: { name?: string; notes?: string }) => void;
}

export default function SegmentationAccordion({
  onSaveLayer,
  onDeleteLayer,
  onUpdateLayerMetadata,
}: SegmentationAccordionProps) {
  const [layerToDelete, setLayerToDelete] = useState<SegmentationLayerData | null>(null);
  const [editingLayer, setEditingLayer] = useState<SegmentationLayerData | null>(null);
  const [layerName, setLayerName] = useState("");
  const [layerNotes, setLayerNotes] = useState("");
  const [infoLayerId, setInfoLayerId] = useState<string | null>(null);
  const [infoSegmentatorId, setInfoSegmentatorId] = useState<string | undefined>();
  const [infoReviewerId, setInfoReviewerId] = useState<string | undefined>();

  const {
    state,
    selectSegmentationLayer,
    toggleSegmentationLayerVisibility,
    isSegmentationVisible,
    toggleSegmentationView,
    addSegmentationLayer,
  } = useViewer();

  const layers = useMemo(() => {
    return Array.from(state.segmentationLayers.values());
  }, [state.segmentationLayers]);

  const selectedLayerId = useMemo(() => {
    return state.selectedSegmentationLayer;
  }, [state.selectedSegmentationLayer]);

  const handleEditLayer = useCallback((layer: SegmentationLayerData) => {
    setEditingLayer(layer);
    setLayerName(layer.metadata.name || "");
    setLayerNotes(layer.metadata.notes || "");
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingLayer) {
      onUpdateLayerMetadata(editingLayer.metadata.id, {
        name: layerName,
        notes: layerNotes,
      });
      setEditingLayer(null);
      setLayerName("");
      setLayerNotes("");
    }
  }, [editingLayer, layerName, layerNotes, onUpdateLayerMetadata]);

  const handleDeleteClick = useCallback((layer: SegmentationLayerData) => {
    setLayerToDelete(layer);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (layerToDelete) {
      onDeleteLayer(layerToDelete.metadata.id);
      setLayerToDelete(null);
    }
  }, [layerToDelete, onDeleteLayer]);

  const isGloballyVisible = isSegmentationVisible();

  const { data: segmentatorUser } = useGetUserByIdQuery(infoSegmentatorId!, {
    skip: !infoSegmentatorId,
  });
  const { data: reviewerUser } = useGetUserByIdQuery(infoReviewerId!, {
    skip: !infoReviewerId,
  });

  useEffect(() => {
    if (!infoLayerId) return;
    const layer = layers.find((l) => l.metadata.id === infoLayerId);
    if (!layer) return;
    const meta: any = layer.metadata;
    setInfoSegmentatorId(meta.segmentatorId);
    setInfoReviewerId(meta.reviewerId);
  }, [infoLayerId, layers]);

  return (
    <>
      <Accordion type="single" collapsible className="w-full" defaultValue="segmentations">
        <AccordionItem value="segmentations" className="border-b border-slate-800">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2 w-full">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-white truncate">
                Segmentation Layers
              </span>
              <div className="ml-auto flex items-center gap-2">
                {/* Create New Layer Button */}
                <div
                  role="button"
                  tabIndex={0}
                  className="h-5 w-5 p-0 flex items-center justify-center cursor-pointer rounded hover:bg-teal-700 bg-teal-600/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    addSegmentationLayer();
                    toast.success("New segmentation layer created");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      addSegmentationLayer();
                      toast.success("New segmentation layer created");
                    }
                  }}
                  title="Create New Layer"
                >
                  <Plus className="h-3 w-3 text-teal-300" />
                </div>
                
                {/* Toggle Visibility */}
                <div
                  role="button"
                  tabIndex={0}
                  className="h-5 w-5 p-0 flex items-center justify-center cursor-pointer rounded hover:bg-slate-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSegmentationView();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleSegmentationView();
                    }
                  }}
                  title="Toggle All Layers Visibility"
                >
                  {isGloballyVisible ? (
                    <Eye className="h-3 w-3 text-blue-400" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-slate-400" />
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {layers.length}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            {layers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                <Layers className="h-12 w-12 mb-3 text-slate-600" />
                <div className="text-slate-400 text-sm mb-2">
                  No Segmentation Layers
                </div>
                <div className="text-slate-500 text-xs mb-4">
                  Create a layer to start segmenting
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    addSegmentationLayer();
                    toast.success("New segmentation layer created");
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create First Layer
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {layers.map((layer) => {
                  const layerId = layer.metadata.id;
                  const isSelected = selectedLayerId === layerId;
                  const isVisible = state.segmentationLayerVisibility.get(layerId) ?? true;
                  const isFromDatabase = layer.metadata.origin === "database";
                  const showInfo = infoLayerId === layerId;
                  const meta: any = layer.metadata;

                  return (
                    <div
                      key={layerId}
                      onClick={() => selectSegmentationLayer(layerId)}
                      className={`rounded-lg border-l-4 p-3 space-y-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-blue-900/40 border-blue-400 shadow-lg ring-2 ring-blue-500/50"
                          : "bg-slate-900/50 hover:bg-slate-900/80"
                      }`}
                      style={{
                        borderLeftColor: isSelected ? "#3b82f6" : "#64748b",
                        borderLeftWidth: isSelected ? "6px" : "4px",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-2.5 w-2.5 rounded-full shrink-0 border border-slate-700"
                              style={{ backgroundColor: "#3b82f6" }}
                            />
                            <span className="text-xs font-medium text-white truncate">
                              {layer.metadata.name || `Layer ${layerId.slice(0, 8)}`}
                            </span>
                            {isFromDatabase && (
                              <Database className="h-3 w-3 text-emerald-400" />
                            )}
                          </div>

                          {layer.metadata.notes && (
                            <p className="text-xs text-slate-300 line-clamp-1 ml-6">
                              {layer.metadata.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-3 ml-6 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1">
                              <Layers className="h-2.5 w-2.5" />
                              <span>Snapshots: {layer.snapshots?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            {isFromDatabase ? (
                              <span className="text-xs font-medium text-emerald-400">Saved</span>
                            ) : (
                              <span className="text-xs font-medium text-amber-400">Local</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!isFromDatabase && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLayer(layer);
                                }}
                              >
                                <Edit3 className="h-2.5 w-2.5 text-slate-400" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSegmentationLayerVisibility(layerId);
                              }}
                            >
                              {isVisible ? (
                                <Eye className="h-2.5 w-2.5 text-blue-400" />
                              ) : (
                                <EyeOff className="h-2.5 w-2.5 text-slate-400" />
                              )}
                            </Button>

                            {!isFromDatabase && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-700 text-teal-400 hover:text-teal-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSaveLayer(layerId);
                                }}
                              >
                                <Save className="h-2.5 w-2.5" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInfoLayerId((prev) => (prev === layerId ? null : layerId));
                              }}
                            >
                              <Info className="h-2.5 w-2.5 text-slate-300" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-slate-700 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(layer);
                              }}
                            >
                              <Trash2 className="h-2.5 w-2.5 text-slate-400" />
                            </Button>
                          </div>
                        </div>

                        {showInfo && (
                          <div className="mt-2 rounded-md border border-slate-700/60 bg-slate-900/60 p-2 text-[11px] text-slate-200 space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Status</span>
                              <span className="font-semibold">
                                {meta.segmentationStatus || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Frame</span>
                              <span className="font-semibold">
                                {meta.frame != null ? meta.frame : "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Segmentator</span>
                              <span className="font-semibold">
                                {segmentatorUser?.data
                                  ? [segmentatorUser.data.firstName, segmentatorUser.data.lastName]
                                      .filter(Boolean)
                                      .join(" ")
                                      .trim()
                                  : meta.segmentatorId || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Reviewer</span>
                              <span className="font-semibold">
                                {reviewerUser?.data
                                  ? [reviewerUser.data.firstName, reviewerUser.data.lastName]
                                      .filter(Boolean)
                                      .join(" ")
                                      .trim()
                                  : meta.reviewerId || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Segmentation Date</span>
                              <span className="font-semibold">
                                {meta.segmentationDate || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Review Date</span>
                              <span className="font-semibold">
                                {meta.reviewDate || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Color</span>
                              <span className="font-semibold">
                                {meta.colorCode || "—"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!layerToDelete} onOpenChange={(open) => !open && setLayerToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Segmentation Layer</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this segmentation layer? This action cannot be undone.
              {layerToDelete && (
                  <div className="mt-2 p-2 bg-slate-800 rounded text-xs">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-blue-400" />
                    <span className="text-white font-medium">
                      {layerToDelete.metadata.name || `Layer ${layerToDelete.metadata.id.slice(0, 8)}`}
                    </span>
                  </div>
                  {layerToDelete.metadata.origin === "database" ? (
                    <div className="text-emerald-400 text-[10px] mt-1">Database layer</div>
                  ) : (
                    <div className="text-amber-400 text-[10px] mt-1">Local layer (not saved to database)</div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Layer Dialog */}
      <AlertDialog open={!!editingLayer} onOpenChange={(open) => !open && setEditingLayer(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Edit Segmentation Layer</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Update layer name and notes
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Layer Name</label>
              <Input
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
                placeholder="Enter layer name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Notes</label>
              <Textarea
                value={layerNotes}
                onChange={(e) => setLayerNotes(e.target.value)}
                placeholder="Enter notes"
                className="bg-slate-800 border-slate-700 text-white resize-none"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveEdit}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

