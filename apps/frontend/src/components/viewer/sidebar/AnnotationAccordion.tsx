"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
} from "@/components/ui-next/Accordion";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/enums/image-dicom.enum";
import { Database, FileEdit, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useLazyGetAnnotationsBySeriesIdQuery,
  useCreateAnnotationMutation,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} from "@/store/annotationApi";
import { useLazyGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { extractApiData } from "@/utils/api";
import type { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useViewerEvents, ViewerEvents } from "@/contexts/ViewerEventContext";
import { annotation, Enums as ToolEnums } from "@cornerstonejs/tools";
import { eventTarget, getRenderingEngine } from "@cornerstonejs/core";
import type { Annotation } from "@cornerstonejs/tools/types";
import { useViewer } from "@/contexts/ViewerContext";
import { AnnotationCard } from "./AnnotationCard";
import { AnnotationDeleteDialog } from "./AnnotationDeleteDialog";
import { AnnotationStatusModal } from "../modals/AnnotationStatusModal";
import { SaveAnnotationModal } from "../modals/SaveAnnotationModal";
import {
  getColorForId,
  parseColorCode,
  formatAnnotationType,
  formatDate,
} from "@/utils/annotationUtils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";

interface AnnotationAccordionProps {
  selectedSeriesId?: string | null;
  seriesList?: DicomSeries[];
}

export default function AnnotationAccordion({
  selectedSeriesId,
  seriesList = [],
}: AnnotationAccordionProps) {
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>("");
  const [annotationColors, setAnnotationColors] = useState<Map<string, string>>(new Map());
  const [annotationLockedMap, setAnnotationLockedMap] = useState<Map<string, boolean>>(new Map());
  const [annotationToDelete, setAnnotationToDelete] = useState<ImageAnnotation | null>(null);
  const selectedAnnotationIdRef = useRef<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [annotationToChangeStatus, setAnnotationToChangeStatus] = useState<ImageAnnotation | null>(null);
  const [targetStatus, setTargetStatus] = useState<AnnotationStatus>(AnnotationStatus.FINAL);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { publish } = useViewerEvents();
  const { state, reloadAnnotationsForSeries } = useViewer();
  const user = useSelector((state: RootState) => state.auth.user);
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();
  const [createAnnotation] = useCreateAnnotationMutation();
  const [updateAnnotation] = useUpdateAnnotationMutation();
  const [deleteAnnotation] = useDeleteAnnotationMutation();

  useEffect(() => {
    selectedAnnotationIdRef.current = selectedAnnotationId;
  }, [selectedAnnotationId]);

  const collectLocalAnnotations = useCallback((): ImageAnnotation[] => {
    if (!selectedSeriesId) return [];

    const localAnnotations: ImageAnnotation[] = [];
    const seenUIDs = new Set<string>();

    state.viewportIds.forEach((viewportId, viewportIndex) => {
      const viewportSeries = state.viewportSeries.get(viewportIndex);
      if (viewportSeries?.id !== selectedSeriesId) return;

      const renderingEngineId = state.renderingEngineIds.get(viewportIndex);
      if (!renderingEngineId) return;

      try {
        const engine = getRenderingEngine(renderingEngineId);
        const viewport = engine?.getViewport(viewportId);
        const element = viewport?.element;
        if (!element) return;

        const allAnnotations = annotation.state.getAllAnnotations();

        allAnnotations.forEach((ann: Annotation) => {
          const metadata = ann.metadata as any;
          if (metadata?.source === "db") return;
          if (!ann.annotationUID) return;
          if (seenUIDs.has(ann.annotationUID)) return;
          
          seenUIDs.add(ann.annotationUID);

          let colorCode: string | undefined;
          
          if (ann.metadata) {
            const metadata = ann.metadata as any;
            const metadataColor = metadata.color || metadata.segmentColor || metadata.annotationColor;
            if (metadataColor) {
              if (typeof metadataColor === "string") {
                colorCode = metadataColor;
              } else if (Array.isArray(metadataColor) && metadataColor.length >= 3) {
                const [r, g, b, a] = metadataColor;
                colorCode = a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
              }
            }
          }
          
          if (!colorCode && ann.data) {
            const data = ann.data as any;
            if (data.color) {
              if (typeof data.color === "string") {
                colorCode = data.color;
              } else if (Array.isArray(data.color) && data.color.length >= 3) {
                const [r, g, b, a] = data.color;
                colorCode = a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
              }
            }
          }
          
          if (!colorCode && ann.annotationUID) {
            try {
              const styles = (annotation.config as any)?.style?.getAnnotationStyles?.(ann.annotationUID);
              if (styles?.color) {
                if (typeof styles.color === "string") {
                  colorCode = styles.color;
                } else if (Array.isArray(styles.color) && styles.color.length >= 3) {
                  const [r, g, b, a] = styles.color;
                  colorCode = a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
                }
              }
            } catch (error) {}
          }


          const referencedImageId = (ann.data as any)?.referencedImageId || ann.metadata?.referencedImageId;
          let sliceIndex = metadata?.sliceIndex;
          
          if (sliceIndex === undefined && referencedImageId) {
            const match = referencedImageId.match(/frame=(\d+)/i);
            if (match) {
              sliceIndex = parseInt(match[1], 10);
            }
          }

          localAnnotations.push({
            id: ann.annotationUID,
            annotationUID: ann.annotationUID,
            instanceId: metadata?.instanceId || "unknown",
            annotationType: metadata?.toolName || "UNKNOWN",
            annotationData: {
              annotationUID: ann.annotationUID,
              metadata: {
                ...ann.metadata,
                sliceIndex: sliceIndex,
              },
              data: ann.data,
            },
            coordinates: (ann.data as any)?.handles,
            measurementValue: (ann.data as any)?.measurementValue,
            measurementUnit: (ann.data as any)?.measurementUnit,
            textContent: (ann.data as any)?.label || (ann.data as any)?.text,
            colorCode: colorCode,
            annotationStatus: "DRAFT" as any,
            annotatorId: "local",
            annotationDate: new Date().toISOString(),
            isLocal: true,
          } as any);
        });
      } catch (error) {
        console.error('Error collecting local annotations:', error);
      }
    });

    return localAnnotations;
  }, [selectedSeriesId, state.viewportIds, state.viewportSeries, state.renderingEngineIds]);

  const loadAnnotations = useCallback(async () => {
    if (!selectedSeriesId) {
      setAnnotations([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchAnnotationsBySeries(selectedSeriesId).unwrap();
      const fetchedAnnotations = extractApiData<ImageAnnotation>(response);
      const localAnnotations = collectLocalAnnotations();
      const mergedAnnotations = [...(fetchedAnnotations || []), ...localAnnotations];

      if (selectedAnnotationIdRef.current) {
        const stillExists = mergedAnnotations.some(ann => ann.id === selectedAnnotationIdRef.current);
        if (!stillExists) {
          selectedAnnotationIdRef.current = null;
          setSelectedAnnotationId(null);
          publish(ViewerEvents.DESELECT_ANNOTATION);
        }
      }
      
      setAnnotations(mergedAnnotations);

      const colorMap = new Map<string, string>();
      const lockMap = new Map<string, boolean>();
      
      mergedAnnotations.forEach((ann) => {
        if (ann.colorCode) {
          const parsed = parseColorCode(ann.colorCode);
          if (parsed) colorMap.set(ann.id, parsed);
        }
        
        if (!(ann as any)?.isLocal) {
          lockMap.set(ann.id, true);
        }
      });
      
      setAnnotationColors(colorMap);
      setAnnotationLockedMap(lockMap);
    } catch (error) {
      console.error("Failed to load annotations:", error);
      const localAnnotations = collectLocalAnnotations();
      
      if (selectedAnnotationIdRef.current) {
        const stillExists = localAnnotations.some(ann => ann.id === selectedAnnotationIdRef.current);
        if (!stillExists) {
          selectedAnnotationIdRef.current = null;
          setSelectedAnnotationId(null);
          publish(ViewerEvents.DESELECT_ANNOTATION);
        }
      }
      
      setAnnotations(localAnnotations);
    } finally {
      setLoading(false);
    }
  }, [selectedSeriesId, fetchAnnotationsBySeries, collectLocalAnnotations, publish]);

  useEffect(() => {
    loadAnnotations();
    
    const handleAnnotationEvent = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        loadAnnotations();
      }, 500);
    };
    
    const eventNames = [
      ToolEnums.Events.ANNOTATION_COMPLETED,
      ToolEnums.Events.ANNOTATION_MODIFIED,
      ToolEnums.Events.ANNOTATION_REMOVED,
    ];
    
    eventNames.forEach((eventName) => {
      eventTarget.addEventListener(eventName, handleAnnotationEvent as EventListener);
    });
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      eventNames.forEach((eventName) => {
        eventTarget.removeEventListener(eventName, handleAnnotationEvent as EventListener);
      });
    };
  }, [loadAnnotations]);

  const displayColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    annotations.forEach((ann) => {
      const color = annotationColors.get(ann.id) || getColorForId(ann.id);
      colorMap.set(ann.id, color);
    });
    return colorMap;
  }, [annotations, annotationColors]);

  const handleAnnotationClick = useCallback(
    (annotationId: string) => {
      selectedAnnotationIdRef.current = annotationId;
      setSelectedAnnotationId(annotationId);

      const annotation = annotations.find((a) => a.id === annotationId);
      
      if (annotation) {
        const annotationUID = annotation.annotationData?.annotationUID || 
                              (annotation as any)?.annotationUID || 
                              annotation.annotationId ||
                              annotation.id;
        publish(ViewerEvents.SELECT_ANNOTATION, {
          annotationId: annotation.id,
          annotationUID: annotationUID,
          instanceId: annotation.instanceId,
        });
      }
    },
    [annotations, publish]
  );

  const handleColorPickerOpen = useCallback((id: string, currentColor: string) => {
    setColorPickerOpen(id);
    setTempColor(currentColor);
  }, []);

  const handleColorChange = useCallback(
    async (annotationId: string) => {
    if (!tempColor) return;
    
    const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(tempColor);
    if (!isValidColor) return;

      setAnnotationColors((prev) => {
      const newMap = new Map(prev);
      newMap.set(annotationId, tempColor);
      return newMap;
    });
    
      const annotationItem = annotations.find((a) => a.id === annotationId);
      if (!annotationItem) return;

      const isLocal = (annotationItem as any)?.isLocal;
      const annotationUID =
        annotationItem?.annotationData?.annotationUID ||
        (annotationItem as any)?.annotationUID ||
        annotationItem?.annotationId;

      if (annotationUID) {
        publish(ViewerEvents.UPDATE_ANNOTATION_COLOR, {
          annotationId: annotationItem.id,
          annotationUID: annotationUID,
          colorCode: tempColor,
          instanceId: annotationItem.instanceId,
        });
      }

      if (!isLocal) {
    try {
      await updateAnnotation({
        id: annotationId,
        data: { colorCode: tempColor },
      }).unwrap();
      
      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId 
          ? { ...ann, colorCode: tempColor }
          : ann
      ));
    } catch (error) {
      console.error("Failed to update annotation color in database:", error);
      setAnnotationColors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(annotationId);
        return newMap;
      });
        }
      }
    
    setColorPickerOpen(null);
      setTempColor("");
    },
    [tempColor, annotations, updateAnnotation, publish]
  );

  const handleLockToggle = useCallback(
    (annotationId: string, locked: boolean) => {
      const annotation = annotations.find((a) => a.id === annotationId);
      
      // Prevent lock/unlock for reviewed/final annotations (they're read-only)
      if (annotation?.annotationStatus === 'reviewed' as any || 
          annotation?.annotationStatus === 'final' as any) {
        return;
      }
      
      setAnnotationLockedMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(annotationId, locked);
        return newMap;
      });
    
      if (annotation) {
        publish(ViewerEvents.LOCK_ANNOTATION, {
          annotationId: annotation.id,
          annotationUID: annotation.annotationData?.annotationUID || annotation.annotationId,
          locked,
          instanceId: annotation.instanceId,
        });
      }
    },
    [annotations, publish]
  );

  const handleDeleteClick = useCallback((annotation: ImageAnnotation) => {
    setAnnotationToDelete(annotation);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!annotationToDelete) return;

    if (annotationToDelete.annotationStatus === AnnotationStatus.REVIEWED) {
      toast.error('Cannot delete reviewed annotations - they are read-only');
      setAnnotationToDelete(null);
      return;
    }

    const isLocal = (annotationToDelete as any)?.isLocal;
    const annotationUID = 
      annotationToDelete.annotationData?.annotationUID || 
      (annotationToDelete as any)?.annotationUID || 
      annotationToDelete.annotationId;

    if (isLocal) {
      if (annotationUID) {
        annotation.state.removeAnnotation(annotationUID);
        
        state.viewportIds.forEach((viewportId, viewportIndex) => {
          const renderingEngineId = state.renderingEngineIds.get(viewportIndex);
          if (renderingEngineId) {
            try {
              const engine = getRenderingEngine(renderingEngineId);
              const viewport = engine?.getViewport(viewportId);
              viewport?.render();
            } catch (error) {
              console.error('Error re-rendering viewport:', error);
            }
          }
        });
      }
      
      setAnnotations(prev => prev.filter(a => a.id !== annotationToDelete.id));
      
      if (selectedAnnotationId === annotationToDelete.id) {
        selectedAnnotationIdRef.current = null;
        setSelectedAnnotationId(null);
        publish(ViewerEvents.DESELECT_ANNOTATION);
      }
      
      toast.success('Draft annotation deleted');
      setAnnotationToDelete(null);
    } else {
      try {
        await deleteAnnotation(annotationToDelete.id);
      } catch (error) {
        console.log('Delete API call details:', error);
      }
      
      if (selectedSeriesId) {
        await reloadAnnotationsForSeries(selectedSeriesId);
      }
      
      setAnnotations(prev => prev.filter(a => a.id !== annotationToDelete.id));
      
      if (selectedAnnotationId === annotationToDelete.id) {
        selectedAnnotationIdRef.current = null;
        setSelectedAnnotationId(null);
        publish(ViewerEvents.DESELECT_ANNOTATION);
      }
      
      toast.success('Annotation deleted successfully');
      setAnnotationToDelete(null);
    }
  }, [annotationToDelete, deleteAnnotation, selectedAnnotationId, publish, state.viewportIds, state.renderingEngineIds, selectedSeriesId, reloadAnnotationsForSeries]);

  const handleStatusChange = useCallback((annotation: ImageAnnotation, newStatus: AnnotationStatus) => {
    setAnnotationToChangeStatus(annotation);
    setTargetStatus(newStatus);
    setStatusModalOpen(true);
  }, []);

  const handleStatusChangeConfirm = useCallback(async (annotationId: string, newStatus: AnnotationStatus) => {
    try {
      const currentAnnotation = annotations.find(ann => ann.id === annotationId);
      
      if (currentAnnotation?.annotationStatus === AnnotationStatus.REVIEWED) {
        toast.error('Reviewed annotations cannot be changed');
        throw new Error('Invalid status transition: reviewed annotations are immutable');
      }
      
      if (currentAnnotation?.annotationStatus === AnnotationStatus.FINAL && 
          newStatus === AnnotationStatus.DRAFT) {
        toast.error('Final status can only be changed to reviewed, not back to draft');
        throw new Error('Invalid status transition: final can only be changed to reviewed');
      }

      await updateAnnotation({
        id: annotationId,
        data: {
          annotationStatus: newStatus,
        },
      }).unwrap();

      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId 
          ? { ...ann, annotationStatus: newStatus }
          : ann
      ));

      toast.success(`Annotation status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update annotation status:', error);
      toast.error('Failed to update annotation status');
      throw error;
    }
  }, [updateAnnotation, annotations]);

  // State for save annotation modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [annotationToSave, setAnnotationToSave] = useState<ImageAnnotation | null>(null);
  const [saveAsStatus, setSaveAsStatus] = useState<AnnotationStatus>(AnnotationStatus.DRAFT);
  
  // Handle clicking save button - open modal
  const handleSaveLocalAnnotation = useCallback((annotation: ImageAnnotation) => {
    setAnnotationToSave(annotation);
    setSaveAsStatus(AnnotationStatus.DRAFT);
    setSaveModalOpen(true);
  }, []);
  
  // Handle actual save after confirmation
  const handleSaveConfirm = useCallback(async (status: AnnotationStatus) => {
    if (!annotationToSave || !selectedSeriesId) return;
    
    try {
      let instanceId = annotationToSave.instanceId;
      
      // If instanceId is missing or 'unknown', fetch the first instance from series
      if (!instanceId || instanceId === 'unknown') {
        try {
          const response = await fetchInstancesByReference({
            id: selectedSeriesId,
            type: "series",
            params: { page: 1, limit: 1 },
          }).unwrap();

          const instances = extractApiData<any>(response);
          if (instances && Array.isArray(instances) && instances.length > 0) {
            const firstInstance = instances[0];
            if (firstInstance && typeof firstInstance === 'object' && 'id' in firstInstance) {
              instanceId = firstInstance.id as string;
            }
          }
        } catch (error) {
          console.error('Failed to fetch instance:', error);
          throw new Error('Could not determine instance ID for annotation');
        }
      }

      if (!instanceId || instanceId === 'unknown') {
        throw new Error('Valid instance ID is required to save annotation');
      }

      const annotationData = {
        seriesId: selectedSeriesId,
        instanceId: instanceId,
        annotationType: annotationToSave.annotationType,
        annotationData: annotationToSave.annotationData,
        coordinates: (annotationToSave.annotationData as any)?.data?.handles,
        annotationStatus: status,
        measurementValue: annotationToSave.measurementValue,
        measurementUnit: annotationToSave.measurementUnit,
        textContent: annotationToSave.textContent,
        colorCode: annotationToSave.colorCode,
        annotatorId: user?.id || 'local',
        userId: user?.id,
      };

      await createAnnotation(annotationData).unwrap();
      
      const annotationUID = annotationToSave.annotationData?.annotationUID || 
                            (annotationToSave as any)?.annotationUID || 
                            annotationToSave.id;
      
      if (annotationUID) {
        annotation.state.removeAnnotation(annotationUID);
      }
      
      await reloadAnnotationsForSeries(selectedSeriesId);
      
      toast.success(`Annotation saved as ${status}`);
      setSaveModalOpen(false);
      setAnnotationToSave(null);
    } catch (error) {
      console.error('Failed to save annotation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save annotation');
      throw error;
    }
  }, [annotationToSave, selectedSeriesId, user?.id, createAnnotation, fetchInstancesByReference, reloadAnnotationsForSeries]);

  // Group annotations
  const groupedAnnotations = useMemo(() => {
    const database: ImageAnnotation[] = [];
    const draft: ImageAnnotation[] = [];

    annotations.forEach((ann) => {
      const isLocal = (ann as any)?.isLocal;

      if (isLocal === true) {
        draft.push(ann);
      } else {
      const metadata = ann.annotationData?.metadata as Record<string, unknown> | undefined;
      const source = typeof metadata?.source === "string" ? metadata.source.toLowerCase() : "";
      
      if (source === "db") {
          database.push(ann);
        } else {
          const hasDbFields = !!(ann as any).createdAt || !!(ann as any).updatedAt;
          if (hasDbFields || ann.annotatorId !== "local") {
        database.push(ann);
      } else {
        draft.push(ann);
          }
        }
      }
    });

    return { database, draft };
  }, [annotations]);

  const getSeriesInfo = (seriesId: string) => {
    return seriesList.find((s) => s.id === seriesId);
  };

  const seriesInfo = getSeriesInfo(selectedSeriesId || "");
  const { database, draft } = groupedAnnotations;
  const totalAnnotations = database.length + draft.length;

  return (
    <>
    <Accordion type="single" collapsible className="w-full" defaultValue="annotations">
      <AccordionItem value="annotations" className="border-b border-slate-800">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2 w-full">
              <Layers className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-xs font-semibold text-white truncate">
                {seriesInfo ? `Series ${seriesInfo.seriesNumber}` : "Annotations"}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div
                  role="button"
                  tabIndex={0}
                  className={`h-5 w-5 p-0 flex items-center justify-center cursor-pointer rounded hover:bg-slate-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!loading) loadAnnotations();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!loading) loadAnnotations();
                    }
                  }}
                  title="Refresh annotations"
                >
                  <RefreshCw className={`h-3 w-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {totalAnnotations}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
          {loading ? (
              <div className="text-center text-slate-500 py-4 text-xs">Loading...</div>
            ) : !selectedSeriesId ? (
            <div className="text-center text-slate-500 py-4 text-xs">
                Please select a series to view annotations
            </div>
          ) : totalAnnotations === 0 ? (
            <div className="text-center text-slate-500 py-4 text-xs">
              No annotations in this series
            </div>
          ) : (
            <div className="space-y-3">
              {database.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Database className="h-3 w-3 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">
                      Saved ({database.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                      {database.map((ann) => (
                        <AnnotationCard
                          key={ann.id}
                          annotation={ann}
                          color={displayColors.get(ann.id) || "#3B82F6"}
                          isHighlight={selectedAnnotationId === ann.id}
                          isLocked={annotationLockedMap.get(ann.id) ?? true}
                          colorPickerOpen={colorPickerOpen === ann.id}
                          tempColor={tempColor}
                          userRole={user?.role || ""}
                          onAnnotationClick={handleAnnotationClick}
                          onColorPickerOpen={handleColorPickerOpen}
                          onColorChange={handleColorChange}
                          onLockToggle={handleLockToggle}
                          onDeleteClick={handleDeleteClick}
                          onColorPickerClose={() => setColorPickerOpen(null)}
                          onTempColorChange={setTempColor}
                          onStatusChange={handleStatusChange}
                          onSaveLocal={handleSaveLocalAnnotation}
                          formatAnnotationType={formatAnnotationType}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                </div>
              )}
              
              {draft.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <FileEdit className="h-3 w-3 text-amber-400" />
                    <span className="text-xs font-medium text-amber-300">
                      Drafts ({draft.length})
                    </span>
                  </div>
                    <div className="space-y-1.5">
                      {draft.map((ann) => {
                        const isHighlight = selectedAnnotationId === ann.id;
                        return (
                        <AnnotationCard
                          key={ann.id}
                          annotation={ann}
                          color={displayColors.get(ann.id) || "#3B82F6"}
                          isHighlight={isHighlight}
                          isLocked={annotationLockedMap.get(ann.id) || false}
                          colorPickerOpen={colorPickerOpen === ann.id}
                          tempColor={tempColor}
                          userRole={user?.role || ""}
                          onAnnotationClick={handleAnnotationClick}
                          onColorPickerOpen={handleColorPickerOpen}
                          onColorChange={handleColorChange}
                          onLockToggle={handleLockToggle}
                          onDeleteClick={handleDeleteClick}
                          onColorPickerClose={() => setColorPickerOpen(null)}
                          onTempColorChange={setTempColor}
                          onStatusChange={handleStatusChange}
                          onSaveLocal={handleSaveLocalAnnotation}
                          formatAnnotationType={formatAnnotationType}
                          formatDate={formatDate}
                        />
                      )})}
                    </div>
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>

      <AnnotationDeleteDialog
        annotation={annotationToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAnnotationToDelete(null)}
        formatAnnotationType={formatAnnotationType}
      />

      <AnnotationStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        annotation={annotationToChangeStatus}
        targetStatus={targetStatus}
        userRole={user?.role || ""}
        onConfirm={handleStatusChangeConfirm}
      />

      <SaveAnnotationModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        annotation={annotationToSave}
        onConfirm={handleSaveConfirm}
      />
    </>
  );
}

