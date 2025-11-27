"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { eventTarget } from "@cornerstonejs/core";
import { Enums as ToolEnums, annotation } from "@cornerstonejs/tools";
import type { Annotation } from "@cornerstonejs/tools/types";
import { AnnotationStatus, AnnotationType } from "@/enums/image-dicom.enum";
import { useViewer } from "@/contexts/ViewerContext";
import { useLazyGetAnnotationsBySeriesIdQuery } from "@/store/annotationApi";
import { extractApiData } from "@/utils/api";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { AnnotationDetailModal } from "@/components/viewer/modals/AnnotationDetailModal";

interface AnnotationHoverTooltipProps {
  viewportId: string;
  viewportIndex: number;
  element: HTMLDivElement | null;
}

interface HoveredAnnotation {
  annotation: Annotation;
  position: { x: number; y: number };
  dbAnnotation?: ImageAnnotation;
}

export function AnnotationHoverTooltip({
  viewportId,
  viewportIndex,
  element,
}: AnnotationHoverTooltipProps) {
  const { state } = useViewer();
  const [hoveredAnnotation, setHoveredAnnotation] =
    useState<HoveredAnnotation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [fetchAnnotationsBySeries] = useLazyGetAnnotationsBySeriesIdQuery();
  const dbAnnotationsCacheRef = useRef<Map<string, ImageAnnotation>>(new Map());
  const hoveredAnnotationRef = useRef<HoveredAnnotation | null>(null);

  const formatDate = useCallback((value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  }, []);

  const statusBadgeStyle = useCallback((status: string | undefined) => {
    switch ((status || "").toLowerCase()) {
      case "final":
        return "border-emerald-500/50 bg-emerald-500/20 text-emerald-200";
      case "draft":
        return "border-amber-500/50 bg-amber-500/20 text-amber-200";
      case "reviewed":
        return "border-blue-500/30 bg-blue-500/15 text-blue-200";
      default:
        return "border-slate-600/60 bg-slate-800 text-slate-200";
    }
  }, []);

  const formatStatusLabel = useCallback((status?: string) => {
    if (!status) return "Unknown";
    return status
      .split(/[_\s]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const resolveColorCode = useCallback((color: unknown): string | undefined => {
    if (!color) return undefined;

    if (typeof color === "string") {
      return color;
    }

    if (Array.isArray(color) && color.length >= 3) {
      const [r, g, b, a] = color;
      if (
        typeof r === "number" &&
        typeof g === "number" &&
        typeof b === "number"
      ) {
        if (typeof a === "number") {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    if (typeof color === "object" && color !== null) {
      const candidate = color as Record<string, unknown>;
      const r = candidate.r ?? candidate.red;
      const g = candidate.g ?? candidate.green;
      const b = candidate.b ?? candidate.blue;
      const a = candidate.a ?? candidate.alpha;

      if (
        typeof r === "number" &&
        typeof g === "number" &&
        typeof b === "number"
      ) {
        if (typeof a === "number") {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    return undefined;
  }, []);

  const loadDbAnnotation = useCallback(
    async (annotationItem: Annotation) => {
      const metadataRecord = annotationItem.metadata as
        | Record<string, unknown>
        | undefined;
      const dbAnnotationId =
        typeof metadataRecord?.dbAnnotationId === "string"
          ? metadataRecord.dbAnnotationId
          : undefined;

      if (!dbAnnotationId) {
        return undefined;
      }

      if (dbAnnotationsCacheRef.current.has(dbAnnotationId)) {
        return dbAnnotationsCacheRef.current.get(dbAnnotationId);
      }

      const seriesId = state.viewportSeries.get(viewportIndex)?.id;
      if (!seriesId) {
        return undefined;
      }

      try {
        const response = await fetchAnnotationsBySeries(seriesId).unwrap();
        const annotations = extractApiData<ImageAnnotation>(response);
        const found = annotations.find((ann) => ann.id === dbAnnotationId);

        if (found) {
          dbAnnotationsCacheRef.current.set(dbAnnotationId, found);
          return found;
        }
      } catch (error) {
        console.error("Failed to load annotation from database:", error);
      }

      return undefined;
    },
    [fetchAnnotationsBySeries, state.viewportSeries, viewportIndex]
  );

  const getAnnotationCenter = useCallback(
    (annotationItem: Annotation): { x: number; y: number } | null => {
      if (!element) return null;

      const data = annotationItem.data as Record<string, unknown> | undefined;
      const handles = data?.handles as
        | { points?: Array<{ x?: number; y?: number }> }
        | undefined;

      if (handles?.points && handles.points.length > 0) {
        const validPoints = handles.points.filter(
          (p) => typeof p.x === "number" && typeof p.y === "number"
        );
        if (validPoints.length > 0) {
          const sumX = validPoints.reduce((acc, p) => acc + (p.x ?? 0), 0);
          const sumY = validPoints.reduce((acc, p) => acc + (p.y ?? 0), 0);
          const centerX = sumX / validPoints.length;
          const centerY = sumY / validPoints.length;

          const rect = element.getBoundingClientRect();
          return {
            x: rect.left + centerX,
            y: rect.top + centerY,
          };
        }
      }

      return null;
    },
    [element]
  );

  useEffect(() => {
    if (!element) return;

    let hoverTimeout: NodeJS.Timeout | null = null;
    let currentHoveredAnnotation: Annotation | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      if (!element) return;

      mousePositionRef.current = { x: event.clientX, y: event.clientY };

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const toolNames = Object.values(AnnotationType);
      let foundAnnotation: Annotation | null = null;

      for (const toolName of toolNames) {
        const annotations = annotation.state.getAnnotations(toolName, element);
        if (!annotations || annotations.length === 0) continue;

        for (const ann of annotations) {
          const data = ann.data as Record<string, unknown> | undefined;
          const handles = data?.handles as
            | { points?: Array<{ x?: number; y?: number }> }
            | undefined;

          // Check if mouse is near any annotation point
          if (handles?.points && handles.points.length > 0) {
            const isNearPoint = handles.points.some((point) => {
              if (
                typeof point.x === "number" &&
                typeof point.y === "number"
              ) {
                const distance = Math.sqrt(
                  Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
                );
                return distance < 25; // Increased threshold for better detection
              }
              return false;
            });

            if (isNearPoint) {
              foundAnnotation = ann;
              break;
            }

            // For annotations with multiple points (like rectangles, polygons), check if point is inside bounding box
            if (handles.points.length >= 2) {
              const xs = handles.points
                .map((p) => p.x)
                .filter((v): v is number => typeof v === "number");
              const ys = handles.points
                .map((p) => p.y)
                .filter((v): v is number => typeof v === "number");

              if (xs.length > 0 && ys.length > 0) {
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);

                // Check if point is within bounding box with some padding
                if (
                  x >= minX - 10 &&
                  x <= maxX + 10 &&
                  y >= minY - 10 &&
                  y <= maxY + 10
                ) {
                  foundAnnotation = ann;
                  break;
                }
              }
            }
          }

          // Check text box
          const textBox = data?.textBox as
            | { x?: number; y?: number; width?: number; height?: number }
            | undefined;
          if (textBox) {
            const tx = textBox.x ?? 0;
            const ty = textBox.y ?? 0;
            const tw = textBox.width ?? 0;
            const th = textBox.height ?? 0;

            if (
              x >= tx &&
              x <= tx + tw &&
              y >= ty &&
              y <= ty + th
            ) {
              foundAnnotation = ann;
              break;
            }
          }
        }

        if (foundAnnotation) break;
      }

      if (foundAnnotation) {
        // Update position even if it's the same annotation (for mouse movement)
        const isNewAnnotation = foundAnnotation !== currentHoveredAnnotation;
        
        if (isNewAnnotation) {
          currentHoveredAnnotation = foundAnnotation;
        }

        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }

        hoverTimeout = setTimeout(async () => {
          const center = getAnnotationCenter(foundAnnotation!);
          const position = center || {
            x: event.clientX,
            y: event.clientY,
          };

          // Only reload DB annotation if it's a new annotation
          const dbAnn = isNewAnnotation 
            ? await loadDbAnnotation(foundAnnotation!)
            : hoveredAnnotationRef.current?.dbAnnotation;

          const newHoveredAnnotation = {
            annotation: foundAnnotation!,
            position,
            dbAnnotation: dbAnn,
          };
          
          hoveredAnnotationRef.current = newHoveredAnnotation;
          setHoveredAnnotation(newHoveredAnnotation);
        }, isNewAnnotation ? 300 : 100); // Faster update for same annotation
      } else if (!foundAnnotation && currentHoveredAnnotation) {
        currentHoveredAnnotation = null;
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        hoverTimeout = setTimeout(() => {
          hoveredAnnotationRef.current = null;
          setHoveredAnnotation(null);
        }, 200);
      }
    };

    const handleMouseLeave = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      currentHoveredAnnotation = null;
      hoveredAnnotationRef.current = null;
      setHoveredAnnotation(null);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [element, getAnnotationCenter, loadDbAnnotation]);

  if (!hoveredAnnotation || !element) {
    return null;
  }

  const { annotation: annotationItem, dbAnnotation } = hoveredAnnotation;
  const metadata = annotationItem.metadata as Record<string, unknown> | undefined;
  const annotationType =
    (metadata?.toolName as string) ||
    (metadata?.annotationType as string) ||
    "Unknown";
  
  // Safely extract textContent ensuring it's a string
  const rawTextContent = dbAnnotation?.textContent || 
    (annotationItem.data as Record<string, unknown> | undefined)?.label;
  
  // Ensure textContent is a valid string for ReactNode
  let textContent: string | undefined;
  if (typeof rawTextContent === "string") {
    textContent = rawTextContent;
  } else if (typeof rawTextContent === "number") {
    textContent = String(rawTextContent);
  } else if (rawTextContent != null) {
    // If it's an object or other type, try to stringify it
    try {
      textContent = JSON.stringify(rawTextContent);
    } catch {
      textContent = undefined;
    }
  }
  
  const colorCode =
    dbAnnotation?.colorCode ||
    resolveColorCode(metadata?.segmentColor) ||
    undefined;
  const status = dbAnnotation?.annotationStatus;
  const sliceIndex = metadata?.sliceIndex as number | undefined;
  const referencedImageId = metadata?.referencedImageId as string | undefined;

  return (
    <Popover open={!!hoveredAnnotation}>
      <PopoverAnchor
        asChild
        style={{
          position: "fixed",
          left: hoveredAnnotation.position.x,
          top: hoveredAnnotation.position.y,
          pointerEvents: "none",
        }}
      >
        <div />
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="max-w-sm border border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl shadow-teal-500/10 backdrop-blur-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                Annotation Type: {annotationType}
              </p>
              {status && (
                <Badge
                  variant="outline"
                  className={`px-2 py-0.5 text-xs capitalize ${statusBadgeStyle(
                    status
                  )}`}
                >
                  {formatStatusLabel(status)}
                </Badge>
              )}
            </div>
            {colorCode && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Color:
                </span>
                <span className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-2 py-1">
                  <span
                    className="h-3 w-3 rounded-full border border-slate-800"
                    style={{ backgroundColor: colorCode }}
                  />
                  {colorCode}
                </span>
              </div>
            )}
          </div>

          {textContent && (
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/90 px-3 py-2 text-xs text-slate-200">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Text:
              </span>
              <p className="mt-1">{textContent}</p>
            </div>
          )}

          <div className="grid gap-2 text-xs text-slate-300">
            {(sliceIndex !== undefined || referencedImageId) && (
              <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-3 py-2">
                <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                  Frame Details
                </span>
                <div className="mt-1 space-y-1 text-xs text-slate-200">
                  {sliceIndex !== undefined && (
                    <>
                      <p>Slice Index: {sliceIndex}</p>
                      <p>Frame No: {sliceIndex + 1}</p>
                    </>
                  )}
                  {referencedImageId && (
                    <p className="break-all text-[10px]">
                      Image ID: {referencedImageId.substring(0, 50)}
                      {referencedImageId.length > 50 ? "..." : ""}
                    </p>
                  )}
                </div>
              </div>
            )}
            {dbAnnotation && (
              <>
                <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                    Annotated
                  </span>
                  <p className="mt-1 text-xs text-slate-200">
                    {formatDate(dbAnnotation.annotationDate)}
                  </p>
                </div>
                {dbAnnotation.reviewDate && (
                  <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-3 py-2">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                      Reviewed on
                    </span>
                    <p className="mt-1 text-xs text-slate-200">
                      {formatDate(dbAnnotation.reviewDate)}
                    </p>
                  </div>
                )}
                {dbAnnotation.notes && (
                  <div className="rounded-lg border border-slate-800/50 bg-slate-900/90 px-3 py-2">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                      Notes
                    </span>
                    <p className="mt-1 text-xs text-slate-200">
                      {dbAnnotation.notes}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/50">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailModalOpen(true);
              }}
              className="w-full border-slate-700/60 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600"
            >
              <Info className="h-3.5 w-3.5 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </PopoverContent>

      <AnnotationDetailModal
        annotation={hoveredAnnotation?.annotation || null}
        dbAnnotation={hoveredAnnotation?.dbAnnotation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </Popover>
  );
}

