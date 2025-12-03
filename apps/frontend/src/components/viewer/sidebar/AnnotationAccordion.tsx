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
import { Database, FileEdit, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useLazyGetAnnotationsBySeriesIdQuery,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} from "@/store/annotationApi";
import { extractApiData } from "@/utils/api";
import type { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useViewerEvents, ViewerEvents } from "@/contexts/ViewerEventContext";
import { annotation } from "@cornerstonejs/tools";
import { eventTarget, getRenderingEngine } from "@cornerstonejs/core";
import type { Annotation } from "@cornerstonejs/tools/types";
import { useViewer } from "@/contexts/ViewerContext";
import { AnnotationCard } from "./AnnotationCard";
import { AnnotationDeleteDialog } from "./AnnotationDeleteDialog";
import {
  getColorForId,
  parseColorCode,
  formatAnnotationType,
  formatDate,
} from "@/utils/annotationUtils";

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
  const [hasUpdates, setHasUpdates] = useState(false);
  const selectedAnnotationIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  
  const { publish } = useViewerEvents();
  const { state } = useViewer();
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
  const [updateAnnotation] = useUpdateAnnotationMutation();
  const [deleteAnnotation] = useDeleteAnnotationMutation();

  // Sync ref with state
  useEffect(() => {
    selectedAnnotationIdRef.current = selectedAnnotationId;
  }, [selectedAnnotationId]);

  // Collect local Cornerstone annotations (draft/unsaved)
  const collectLocalAnnotations = useCallback((): ImageAnnotation[] => {
    if (!selectedSeriesId) {
      console.log('[AnnotationAccordion] No selectedSeriesId, skipping collection');
      return [];
    }

    const localAnnotations: ImageAnnotation[] = [];
    const seenUIDs = new Set<string>();

    console.log('[AnnotationAccordion] Collecting local annotations for series:', selectedSeriesId);
    console.log('[AnnotationAccordion] Available viewports:', state.viewportIds.size);

    state.viewportIds.forEach((viewportId, viewportIndex) => {
      const viewportSeries = state.viewportSeries.get(viewportIndex);
      console.log(`[AnnotationAccordion] Viewport ${viewportIndex} (${viewportId}):`, { 
        seriesId: viewportSeries?.id, 
        matches: viewportSeries?.id === selectedSeriesId 
      });
      
      if (viewportSeries?.id !== selectedSeriesId) return;

      const renderingEngineId = state.renderingEngineIds.get(viewportIndex);
      if (!renderingEngineId) {
        console.log(`[AnnotationAccordion] No rendering engine for viewport ${viewportIndex}`);
        return;
      }

      try {
        const engine = getRenderingEngine(renderingEngineId);
        const viewport = engine?.getViewport(viewportId);
        const element = viewport?.element;
        if (!element) {
          console.log(`[AnnotationAccordion] No element for viewport ${viewportId}`);
          return;
        }

        const allAnnotations = annotation.state.getAllAnnotations();
        console.log(`[AnnotationAccordion] Found ${allAnnotations.length} total Cornerstone annotations`);

        allAnnotations.forEach((ann: Annotation) => {
          const metadata = ann.metadata as any;
          if (metadata?.source === "db") {
            console.log(`[AnnotationAccordion] Skipping database annotation:`, ann.annotationUID);
            return;
          }

          if (!ann.annotationUID) {
            console.warn('[AnnotationAccordion] Local annotation missing annotationUID, skipping', ann);
            return;
          }
          
          if (seenUIDs.has(ann.annotationUID)) {
            console.log(`[AnnotationAccordion] Already seen annotation:`, ann.annotationUID);
            return;
          }
          
          console.log(`[AnnotationAccordion] Adding local annotation:`, ann.annotationUID);
          seenUIDs.add(ann.annotationUID);

          let colorCode: string | undefined;
          try {
            const styles = (annotation.config as any)?.style?.getAnnotationStyles?.(ann.annotationUID);
            if (styles?.color) {
              if (typeof styles.color === "string") {
                colorCode = styles.color;
              } else if (Array.isArray(styles.color)) {
                const [r, g, b] = styles.color;
                colorCode = `rgb(${r}, ${g}, ${b})`;
              }
            }
          } catch (error) {
            // Style API not available
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
              ...ann.data,
              metadata: {
                ...ann.metadata,
                sliceIndex: sliceIndex,
              }
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
        console.error('[AnnotationAccordion] Error collecting local annotations:', error);
      }
    });

    console.log(`[AnnotationAccordion] Collected ${localAnnotations.length} local annotations`);
    return localAnnotations;
  }, [selectedSeriesId, state.viewportIds, state.viewportSeries, state.renderingEngineIds]);

  // Load annotations function (can be called manually)
  const loadAnnotations = useCallback(async () => {
    if (!selectedSeriesId) {
      setAnnotations([]);
      return;
    }

    setLoading(true);
    isLoadingRef.current = true;
    setHasUpdates(false); // Clear the update indicator when refreshing
    try {
      const response = await fetchAnnotationsBySeries(selectedSeriesId).unwrap();
      const fetchedAnnotations = extractApiData<ImageAnnotation>(response);
      const localAnnotations = collectLocalAnnotations();
      const mergedAnnotations = [...(fetchedAnnotations || []), ...localAnnotations];

      console.log(`[AnnotationAccordion] Loaded ${fetchedAnnotations?.length || 0} database + ${localAnnotations.length} local annotations`);
      
      // Preserve selectedAnnotationId if the annotation still exists
      const currentSelectedId = selectedAnnotationIdRef.current;
      if (currentSelectedId) {
        const stillExists = mergedAnnotations.some(ann => ann.id === currentSelectedId);
        if (!stillExists) {
          // Annotation was deleted, clear selection
          selectedAnnotationIdRef.current = null;
          setSelectedAnnotationId(null);
          publish(ViewerEvents.DESELECT_ANNOTATION);
        }
      }
      
      setAnnotations(mergedAnnotations);

      // Set up colors and lock states
      const colorMap = new Map<string, string>();
      const lockMap = new Map<string, boolean>();
      
      mergedAnnotations.forEach((ann) => {
        // Set colors
        if (ann.colorCode) {
          const parsed = parseColorCode(ann.colorCode);
          if (parsed) colorMap.set(ann.id, parsed);
        }
        
        // Set lock state: database annotations are locked by default
        const isLocal = (ann as any)?.isLocal;
        if (!isLocal) {
          // Database annotation - locked by default
          lockMap.set(ann.id, true);
        }
      });
      
      setAnnotationColors(colorMap);
      setAnnotationLockedMap(lockMap);
    } catch (error) {
      console.error("Failed to load annotations:", error);
      const localAnnotations = collectLocalAnnotations();
      
      const currentSelectedId = selectedAnnotationIdRef.current;
      if (currentSelectedId) {
        const stillExists = localAnnotations.some(ann => ann.id === currentSelectedId);
        if (!stillExists) {
          selectedAnnotationIdRef.current = null;
          setSelectedAnnotationId(null);
          publish(ViewerEvents.DESELECT_ANNOTATION);
        }
      }
      
      // Set lock state for local annotations (not locked by default)
      const lockMap = new Map<string, boolean>();
      localAnnotations.forEach((ann) => {
        lockMap.set(ann.id, false); // Local annotations start unlocked
      });
      setAnnotationLockedMap(lockMap);
      
      setAnnotations(localAnnotations);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedSeriesId, fetchAnnotationsBySeries, collectLocalAnnotations, publish]);

  // Load annotations on mount and when dependencies change
  useEffect(() => {
    loadAnnotations();

    // Subscribe to Cornerstone annotation events
    const annotationEventHandler = () => {
      // Instead of auto-loading, set a flag to show "updates available"
      if (!isLoadingRef.current) {
        console.log('[AnnotationAccordion] New annotation event detected - updates available');
        setHasUpdates(true);
      }
    };

    const eventNames = [
      "ANNOTATION_COMPLETED",
      "ANNOTATION_MODIFIED",
      "ANNOTATION_REMOVED",
    ];

    eventNames.forEach((eventName) => {
      eventTarget.addEventListener(eventName, annotationEventHandler as EventListener);
    });

    return () => {
      eventNames.forEach((eventName) => {
        eventTarget.removeEventListener(eventName, annotationEventHandler as EventListener);
      });
    };
  }, [loadAnnotations]);

  // Compute display colors
  const displayColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    annotations.forEach((ann) => {
      const providedColor = annotationColors.get(ann.id);
      const color = providedColor || parseColorCode(ann.colorCode) || getColorForId(ann.id);
      colorMap.set(ann.id, color);
    });
    return colorMap;
  }, [annotations, annotationColors]);

  const handleAnnotationClick = useCallback(
    (annotationId: string) => {
      console.log('[handleAnnotationClick] Clicked:', annotationId);
      console.log('[handleAnnotationClick] Current selected:', selectedAnnotationId);
      
      // Always select the clicked annotation (don't toggle)
      selectedAnnotationIdRef.current = annotationId;
      setSelectedAnnotationId(annotationId);

      const annotation = annotations.find((a) => a.id === annotationId);
      console.log('[handleAnnotationClick] Found annotation:', annotation ? {
        id: annotation.id,
        isLocal: (annotation as any).isLocal,
        annotationType: annotation.annotationType
      } : 'NOT FOUND');
      
      if (annotation) {
        const annotationUID = annotation.annotationData?.annotationUID || 
                              (annotation as any)?.annotationUID || 
                              annotation.annotationId ||
                              annotation.id; // For local annotations, id IS the UID
        console.log('[Click] Publishing SELECT_ANNOTATION:', {
          annotationId: annotation.id,
          annotationUID: annotationUID,
          instanceId: annotation.instanceId,
          isLocal: (annotation as any).isLocal,
        });
        publish(ViewerEvents.SELECT_ANNOTATION, {
          annotationId: annotation.id,
          annotationUID: annotationUID,
          instanceId: annotation.instanceId,
        });
      }
      
      console.log('[handleAnnotationClick] New selected (state):', annotationId);
      console.log('[handleAnnotationClick] New selected (ref):', selectedAnnotationIdRef.current);
    },
    [annotations, selectedAnnotationId, publish]
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
    } catch (error) {
          console.error("Failed to update annotation color in database:", error);
          setAnnotationColors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(annotationId);
        return newMap;
      });
        }
      } else {
        console.log(`Color updated for local annotation ${annotationUID}, will be saved when submitted`);
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
        console.warn('Cannot lock/unlock reviewed/final annotations - they are read-only');
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

    // Prevent deletion of reviewed/final annotations (they're read-only)
    if (annotationToDelete.annotationStatus === 'reviewed' as any || 
        annotationToDelete.annotationStatus === 'final' as any) {
      console.warn('Cannot delete reviewed/final annotations - they are read-only');
      setAnnotationToDelete(null);
      return;
    }

    const isLocal = (annotationToDelete as any)?.isLocal;
    const annotationUID = 
      annotationToDelete.annotationData?.annotationUID || 
      (annotationToDelete as any)?.annotationUID || 
      annotationToDelete.annotationId;

    try {
      if (isLocal) {
        if (annotationUID) {
          annotation.state.removeAnnotation(annotationUID);
          console.log(`Removed local annotation: ${annotationUID}`);
          
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
      } else {
        await deleteAnnotation(annotationToDelete.id).unwrap();
        console.log(`Deleted database annotation: ${annotationToDelete.id}`);
      }

      setAnnotations(prev => prev.filter(a => a.id !== annotationToDelete.id));
      
      if (selectedAnnotationId === annotationToDelete.id) {
        selectedAnnotationIdRef.current = null;
        setSelectedAnnotationId(null);
        publish(ViewerEvents.DESELECT_ANNOTATION);
      }
    } catch (error) {
      console.error('Failed to delete annotation:', error);
    } finally {
      setAnnotationToDelete(null);
    }
  }, [annotationToDelete, deleteAnnotation, selectedAnnotationId, publish, state.viewportIds, state.renderingEngineIds]);

  // Group annotations
  const groupedAnnotations = useMemo(() => {
    const database: ImageAnnotation[] = [];
    const draft: ImageAnnotation[] = [];
    
    console.log('[groupedAnnotations] Total annotations:', annotations.length);
    console.log('[groupedAnnotations] Current selectedAnnotationId:', selectedAnnotationId);

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
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-5 w-5 p-0 hover:bg-slate-700 ${hasUpdates ? 'text-amber-400' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadAnnotations();
                    }}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3 w-3 ${hasUpdates ? 'text-amber-400' : 'text-slate-400'} ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  {hasUpdates && !loading && (
                    <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                  )}
                </div>
                {hasUpdates && !loading && (
                  <span className="text-[10px] text-amber-400 font-medium">
                    Updates available
                  </span>
                )}
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
                          onAnnotationClick={handleAnnotationClick}
                          onColorPickerOpen={handleColorPickerOpen}
                          onColorChange={handleColorChange}
                          onLockToggle={handleLockToggle}
                          onDeleteClick={handleDeleteClick}
                          onColorPickerClose={() => setColorPickerOpen(null)}
                          onTempColorChange={setTempColor}
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
                          onAnnotationClick={handleAnnotationClick}
                          onColorPickerOpen={handleColorPickerOpen}
                          onColorChange={handleColorChange}
                          onLockToggle={handleLockToggle}
                          onDeleteClick={handleDeleteClick}
                          onColorPickerClose={() => setColorPickerOpen(null)}
                          onTempColorChange={setTempColor}
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
    </>
  );
}

