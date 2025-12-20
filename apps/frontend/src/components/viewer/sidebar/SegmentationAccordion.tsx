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
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useViewer } from "@/common/contexts/ViewerContext";
import type { SegmentationLayerData } from "@/common/contexts/ViewerContext";
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
import { SegmentationDetailModal } from "./SegmentationDetailModal";
import { SegmentationCard } from "./SegmentationCard";
import { AccordionLoading, AccordionError, AccordionEmpty } from "./SidebarCommon";
import { SaveSegmentationModal } from "../modals/SaveSegmentationModal";
import { SegmentationStatusModal } from "../modals/SegmentationStatusModal";
import { AnnotationStatus } from "@/common/enums/image-dicom.enum";
import { Roles } from "@/common/enums/user.enum";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useUpdateImageSegmentationLayerMutation } from "@/store/imageSegmentationLayerApi";

interface SegmentationAccordionProps {
  onSaveLayer: (layerId: string, status?: AnnotationStatus) => void;
  onDeleteLayer: (layerId: string) => void;
  onUpdateLayerMetadata: (layerId: string, updates: { name?: string; notes?: string }) => void;
  onRefresh?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  seriesId?: string | null;
  userRole?: string;
}

export default function SegmentationAccordion({
  onSaveLayer,
  onDeleteLayer,
  onUpdateLayerMetadata,
  onRefresh,
  loading = false,
  refreshing = false,
  error = null,
  seriesId,
  userRole,
}: SegmentationAccordionProps) {
  const [layerToDelete, setLayerToDelete] = useState<SegmentationLayerData | null>(null);
  const [editingLayer, setEditingLayer] = useState<SegmentationLayerData | null>(null);
  const [layerName, setLayerName] = useState("");
  const [layerNotes, setLayerNotes] = useState("");
  const [infoModalLayer, setInfoModalLayer] = useState<SegmentationLayerData | null>(null);

  // Feature Parity State
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>("");
  const [segmentationColors, setSegmentationColors] = useState<Map<string, string>>(new Map());
  const [segmentationLockedMap, setSegmentationLockedMap] = useState<Map<string, boolean>>(new Map());
  const [segmentationStatusMap, setSegmentationStatusMap] = useState<Map<string, AnnotationStatus>>(new Map());

  // Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [layerToSave, setLayerToSave] = useState<SegmentationLayerData | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [layerToUpdateStatus, setLayerToUpdateStatus] = useState<SegmentationLayerData | null>(null);
  const [targetStatus, setTargetStatus] = useState<AnnotationStatus>(AnnotationStatus.FINAL);

  const user = useSelector((state: RootState) => state.auth.user);
  const [updateImageSegmentationLayer] = useUpdateImageSegmentationLayerMutation();

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

  // Initialize status/colors from layer metadata
  useEffect(() => {
    const newStatusMap = new Map<string, AnnotationStatus>();
    const newColorMap = new Map<string, string>();
    const newLockMap = new Map<string, boolean>();

    layers.forEach(layer => {
      // Status Logic: Read from segmentationStatus field
      let status = AnnotationStatus.DRAFT;
      if (layer.metadata.origin === "database") {
        // Use proper segmentationStatus field from database
        const dbStatus = layer.metadata.segmentationStatus;
        if (dbStatus === 'final' || dbStatus === AnnotationStatus.FINAL) {
          status = AnnotationStatus.FINAL;
        } else if (dbStatus === 'reviewed' || dbStatus === AnnotationStatus.REVIEWED) {
          status = AnnotationStatus.REVIEWED;
        } else {
          status = AnnotationStatus.DRAFT;
        }
      }
      // If local, always Draft
      newStatusMap.set(layer.metadata.id, status);

      // Color Logic: Read from colorCode field, fallback to default blue
      const colorCode = layer.metadata.colorCode || "#3b82f6";
      newColorMap.set(layer.metadata.id, colorCode);

      // Lock Logic (Read-only if Reviewed)
      if (status === AnnotationStatus.REVIEWED) {
        newLockMap.set(layer.metadata.id, true);
      }
    });

    setSegmentationStatusMap(newStatusMap);
    setSegmentationColors(newColorMap);
    setSegmentationLockedMap(newLockMap);
  }, [layers]);

  const selectedLayerId = useMemo(() => {
    return state.selectedSegmentationLayer;
  }, [state.selectedSegmentationLayer]);

  const activeSeries = useMemo(() => {
    return state.viewportSeries.get(state.activeViewport);
  }, [state.viewportSeries, state.activeViewport]);

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

  // --- Feature Handlers ---

  const handleColorPickerOpen = useCallback((id: string, currentColor: string) => {
    setColorPickerOpen(id);
    setTempColor(currentColor);
  }, []);

  const handleColorChange = useCallback(async (layerId: string) => {
    if (!tempColor) return;
    setSegmentationColors(prev => new Map(prev).set(layerId, tempColor));
    setColorPickerOpen(null);

    // Save color to DB if database layer
    const layer = layers.find(l => l.metadata.id === layerId);
    if (layer?.metadata.origin === 'database') {
      try {
        await updateImageSegmentationLayer({
          id: layerId,
          updateImageSegmentationLayerDto: {
            colorCode: tempColor,
          }
        }).unwrap();
        toast.success("Layer color updated");
        onRefresh?.();
      } catch (error) {
        console.error("Failed to update layer color:", error);
        toast.error("Failed to update layer color");
      }
    } else {
      toast.success("Layer color updated (Local)");
    }
  }, [tempColor, layers, updateImageSegmentationLayer, onRefresh]);

  const handleLockToggle = useCallback((layerId: string, locked: boolean) => {
    setSegmentationLockedMap(prev => new Map(prev).set(layerId, locked));
  }, []);

  const handleSaveLayerClick = useCallback((layer: SegmentationLayerData) => {
    setLayerToSave(layer);
    setSaveModalOpen(true);
  }, []);

  const handleSaveConfirm = useCallback(async (status: AnnotationStatus) => {
    if (layerToSave) {
      onSaveLayer(layerToSave.metadata.id, status);
      setSaveModalOpen(false);
      setLayerToSave(null);
    }
  }, [layerToSave, onSaveLayer]);

  const handleStatusChangeClick = useCallback((layerId: string, status: AnnotationStatus) => {
    const layer = layers.find(l => l.metadata.id === layerId);
    if (layer) {
      setLayerToUpdateStatus(layer);
      setTargetStatus(status);
      setStatusModalOpen(true);
    }
  }, [layers]);

  const handleStatusConfirm = useCallback(async (layerId: string, status: AnnotationStatus) => {
    const layer = layers.find(l => l.metadata.id === layerId);
    if (!layer) return;

    const currentStatus = segmentationStatusMap.get(layerId);

    // Validation rules matching annotation logic
    if (currentStatus === AnnotationStatus.REVIEWED) {
      toast.error('Reviewed segmentations cannot be changed');
      throw new Error('Invalid status transition: reviewed segmentations are immutable');
    }

    if (currentStatus === AnnotationStatus.FINAL && status === AnnotationStatus.DRAFT) {
      toast.error('Final status can only be changed to reviewed, not back to draft');
      throw new Error('Invalid status transition: final can only be changed to reviewed');
    }

    if (status === AnnotationStatus.REVIEWED && user?.role !== Roles.PHYSICIAN) {
      toast.error('Only physicians can mark as reviewed');
      return;
    }

    try {
      // Optimistic update
      setSegmentationStatusMap(prev => new Map(prev).set(layerId, status));

      if (layer.metadata.origin === 'database') {
        // Call API to update segmentationStatus field
        await updateImageSegmentationLayer({
          id: layerId,
          updateImageSegmentationLayerDto: {
            segmentationStatus: status as any, // SegmentationStatus enum matches AnnotationStatus values
          }
        }).unwrap();
        toast.success(`Status updated to ${status}`);
        onRefresh?.(); // Refetch to sync
      } else {
        // Local only - just update local state
        toast.success(`Status updated to ${status} (Local)`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
      toast.error("Failed to update status");
    }
    setStatusModalOpen(false);
  }, [layers, updateImageSegmentationLayer, onRefresh]);

  const isGloballyVisible = isSegmentationVisible();

  const infoMeta: any = infoModalLayer?.metadata;
  const { data: segmentatorUser } = useGetUserByIdQuery(infoMeta?.segmentatorId!, {
    skip: !infoMeta?.segmentatorId,
  });
  const { data: reviewerUser } = useGetUserByIdQuery(infoMeta?.reviewerId!, {
    skip: !infoMeta?.reviewerId,
  });

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

                {/* Refresh Button */}
                {onRefresh && (
                  <div
                    role="button"
                    tabIndex={0}
                    className={`h-5 w-5 p-0 flex items-center justify-center cursor-pointer rounded hover:bg-slate-700 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!refreshing) {
                        onRefresh();
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !refreshing) {
                        e.stopPropagation();
                        e.preventDefault();
                        onRefresh();
                      }
                    }}
                    title="Refresh Segmentation Layers"
                  >
                    <RefreshCw className={`h-3 w-3 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                  </div>
                )}

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
            {loading ? (
              <AccordionLoading message="Loading segmentation layers..." />
            ) : error ? (
              <AccordionError
                message="Error Loading Layers"
                error={error}
                onRetry={onRefresh}
                isRetrying={refreshing}
              />
            ) : !seriesId ? (
              <AccordionEmpty
                icon={Layers}
                title="No Series Selected"
                description="Please select a series to view segmentation layers"
              />
            ) : layers.length === 0 ? (
              <AccordionEmpty
                icon={Layers}
                title="No Segmentation Layers"
                description="Create a layer to start segmenting"
                action={
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
                }
              />
            ) : (() => {
              // Group layers by origin (database vs local)
              const databaseLayers = layers.filter(l => l.metadata.origin === 'database');
              const localLayers = layers.filter(l => l.metadata.origin !== 'database');

              return (
                <div className="space-y-3">
                  {databaseLayers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Database className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">
                          Saved ({databaseLayers.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {databaseLayers.map((layer) => (
                          <SegmentationCard
                            key={layer.metadata.id}
                            layer={layer}
                            isSelected={selectedLayerId === layer.metadata.id}
                            isVisible={state.segmentationLayerVisibility.get(layer.metadata.id) ?? true}
                            status={segmentationStatusMap.get(layer.metadata.id) || AnnotationStatus.DRAFT}
                            color={segmentationColors.get(layer.metadata.id) || "#3b82f6"}
                            isLocked={segmentationLockedMap.get(layer.metadata.id) || false}
                            colorPickerOpen={colorPickerOpen === layer.metadata.id}
                            tempColor={tempColor}
                            onSelect={selectSegmentationLayer}
                            onEdit={handleEditLayer}
                            onToggleVisibility={toggleSegmentationLayerVisibility}
                            onSave={() => handleSaveLayerClick(layer)}
                            onInfo={(l) => setInfoModalLayer(l)}
                            onDelete={handleDeleteClick}
                            onColorPickerOpen={handleColorPickerOpen}
                            onColorPickerClose={() => setColorPickerOpen(null)}
                            onColorChange={handleColorChange}
                            onTempColorChange={setTempColor}
                            onLockToggle={handleLockToggle}
                            onStatusChange={handleStatusChangeClick}
                            userRole={user?.role}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {localLayers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Edit3 className="h-3 w-3 text-amber-400" />
                        <span className="text-xs font-medium text-amber-300">
                          Local ({localLayers.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {localLayers.map((layer) => (
                          <SegmentationCard
                            key={layer.metadata.id}
                            layer={layer}
                            isSelected={selectedLayerId === layer.metadata.id}
                            isVisible={state.segmentationLayerVisibility.get(layer.metadata.id) ?? true}
                            status={segmentationStatusMap.get(layer.metadata.id) || AnnotationStatus.DRAFT}
                            color={segmentationColors.get(layer.metadata.id) || "#3b82f6"}
                            isLocked={segmentationLockedMap.get(layer.metadata.id) || false}
                            colorPickerOpen={colorPickerOpen === layer.metadata.id}
                            tempColor={tempColor}
                            onSelect={selectSegmentationLayer}
                            onEdit={handleEditLayer}
                            onToggleVisibility={toggleSegmentationLayerVisibility}
                            onSave={() => handleSaveLayerClick(layer)}
                            onInfo={(l) => setInfoModalLayer(l)}
                            onDelete={handleDeleteClick}
                            onColorPickerOpen={handleColorPickerOpen}
                            onColorPickerClose={() => setColorPickerOpen(null)}
                            onColorChange={handleColorChange}
                            onTempColorChange={setTempColor}
                            onLockToggle={handleLockToggle}
                            onStatusChange={handleStatusChangeClick}
                            userRole={user?.role}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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
                <span className="block mt-2 p-2 bg-slate-800 rounded text-xs">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-blue-400" />
                    <span className="text-white font-medium">
                      {layerToDelete.metadata.name || `Layer ${layerToDelete.metadata.id.slice(0, 8)}`}
                    </span>
                  </span>
                  {layerToDelete.metadata.origin === "database" ? (
                    <span className="block text-emerald-400 text-[10px] mt-1">Database layer</span>
                  ) : (
                    <span className="block text-amber-400 text-[10px] mt-1">Local layer (not saved to database)</span>
                  )}
                </span>
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
                className="bg-slate-800 border-slate-700 text-white resize-none placeholder-white"
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

      {/* Segmentation Detail Modal */}
      <SegmentationDetailModal
        layer={infoModalLayer}
        open={!!infoModalLayer}
        onOpenChange={(open) => !open && setInfoModalLayer(null)}
        segmentatorName={
          segmentatorUser?.data
            ? [segmentatorUser.data.firstName, segmentatorUser.data.lastName]
              .filter(Boolean)
              .join(" ")
              .trim()
            : undefined
        }
        reviewerName={
          reviewerUser?.data
            ? [reviewerUser.data.firstName, reviewerUser.data.lastName]
              .filter(Boolean)
              .join(" ")
              .trim()
            : undefined
        }
      />

      <SaveSegmentationModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        layer={layerToSave}
        onConfirm={handleSaveConfirm}
      />

      <SegmentationStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        layer={layerToUpdateStatus}
        targetStatus={targetStatus}
        onConfirm={handleStatusConfirm}
      />
    </>
  );
}

