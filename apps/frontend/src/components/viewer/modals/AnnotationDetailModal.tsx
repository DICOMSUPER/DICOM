'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Annotation } from '@cornerstonejs/tools/types';
import { ImageAnnotation } from '@/interfaces/image-dicom/image-annotation.interface';
import { Info } from 'lucide-react';

interface AnnotationDetailModalProps {
  annotation: Annotation | null;
  dbAnnotation: ImageAnnotation | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnotationDetailModal({
  annotation,
  dbAnnotation,
  isOpen,
  onClose,
}: AnnotationDetailModalProps) {
  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const statusBadgeStyle = (status: string | undefined) => {
    switch ((status || '').toLowerCase()) {
      case 'final':
        return 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200';
      case 'draft':
        return 'border-amber-500/50 bg-amber-500/20 text-amber-200';
      case 'reviewed':
        return 'border-blue-500/30 bg-blue-500/15 text-blue-200';
      default:
        return 'border-slate-600/60 bg-slate-800 text-slate-200';
    }
  };

  const formatStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';
    return status
      .split(/[_\s]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const resolveColorCode = (color: unknown): string | undefined => {
    if (!color) return undefined;

    if (typeof color === 'string') {
      return color;
    }

    if (Array.isArray(color) && color.length >= 3) {
      const [r, g, b, a] = color;
      if (
        typeof r === 'number' &&
        typeof g === 'number' &&
        typeof b === 'number'
      ) {
        if (typeof a === 'number') {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    if (typeof color === 'object' && color !== null) {
      const candidate = color as Record<string, unknown>;
      const r = candidate.r ?? candidate.red;
      const g = candidate.g ?? candidate.green;
      const b = candidate.b ?? candidate.blue;
      const a = candidate.a ?? candidate.alpha;

      if (
        typeof r === 'number' &&
        typeof g === 'number' &&
        typeof b === 'number'
      ) {
        if (typeof a === 'number') {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    return undefined;
  };

  if (!annotation) {
    return null;
  }

  const metadata = annotation.metadata as Record<string, unknown> | undefined;
  const annotationType =
    (metadata?.toolName as string) ||
    (metadata?.annotationType as string) ||
    'Unknown';

  const rawTextContent =
    dbAnnotation?.textContent ||
    (annotation.data as Record<string, unknown> | undefined)?.label;

  let textContent: string | undefined;
  if (typeof rawTextContent === 'string') {
    textContent = rawTextContent;
  } else if (typeof rawTextContent === 'number') {
    textContent = String(rawTextContent);
  } else if (rawTextContent != null) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[1000px] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden border-slate-800 bg-slate-950/95 text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-800 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Info className="h-5 w-5" />
            Annotation Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {!annotation ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <div className="space-y-4 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6 border border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm border border-slate-700">
                      {annotationType}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-white leading-tight">
                        {annotationType} Annotation
                      </p>
                      {status && (
                        <div className="mt-3">
                          <Badge
                            variant="outline"
                            className={`px-3 py-1 text-xs capitalize ${statusBadgeStyle(
                              status
                            )}`}
                          >
                            {formatStatusLabel(status)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {colorCode && (
                    <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/95 px-4 py-2">
                      <span
                        className="h-4 w-4 rounded-full border border-slate-800"
                        style={{ backgroundColor: colorCode }}
                      />
                      <span className="text-sm text-slate-200">{colorCode}</span>
                    </div>
                  )}
                </div>
              </section>

              {textContent && (
                <section className="rounded-2xl p-6 shadow border-slate-800 border space-y-4 bg-slate-900/50">
                  <div className="flex items-center gap-2 text-lg font-semibold text-white">
                    Text Content
                  </div>
                  <div className="rounded-lg border border-slate-800/60 bg-slate-900/90 px-4 py-3 text-sm text-slate-200">
                    {textContent}
                  </div>
                </section>
              )}

              <section className="rounded-2xl p-6 shadow border-slate-800 border space-y-4 bg-slate-900/50">
                <div className="flex items-center gap-2 text-lg font-semibold text-white">
                  Frame Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {sliceIndex !== undefined && (
                    <>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Slice Index</p>
                        <p className="text-base font-medium text-white">{sliceIndex}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Frame Number</p>
                        <p className="text-base font-medium text-white">{sliceIndex + 1}</p>
                      </div>
                    </>
                  )}
                  {referencedImageId && (
                    <div className="col-span-2">
                      <p className="text-sm text-slate-400 mb-1">Referenced Image ID</p>
                      <p className="text-xs font-medium text-white break-all">
                        {referencedImageId}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {dbAnnotation && (
                <>
                  <section className="rounded-2xl p-6 shadow border-slate-800 border space-y-4 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-lg font-semibold text-white">
                      Annotation Metadata
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Annotation Date</p>
                        <p className="text-base text-white">
                          {formatDate(dbAnnotation.annotationDate)}
                        </p>
                      </div>
                      {dbAnnotation.reviewDate && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Review Date</p>
                          <p className="text-base text-white">
                            {formatDate(dbAnnotation.reviewDate)}
                          </p>
                        </div>
                      )}
                      {dbAnnotation.annotationType && (
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Type</p>
                          <p className="text-base text-white">
                            {dbAnnotation.annotationType}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {dbAnnotation.notes && (
                    <section className="rounded-2xl p-6 shadow border-slate-800 border space-y-4 bg-slate-900/50">
                      <div className="flex items-center gap-2 text-lg font-semibold text-white">
                        Notes
                      </div>
                      <div className="rounded-lg border border-slate-800/60 bg-slate-900/90 px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap">
                        {dbAnnotation.notes}
                      </div>
                    </section>
                  )}
                </>
              )}

              <section className="rounded-2xl p-6 shadow border-slate-800 border space-y-4 bg-slate-900/50">
                <div className="flex items-center gap-2 text-lg font-semibold text-white">
                  Technical Details
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Annotation UID</p>
                    <p className="text-xs text-white break-all">
                      {annotation.annotationUID || '—'}
                    </p>
                  </div>
                  {dbAnnotation?.id && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Database ID</p>
                      <p className="text-xs text-white break-all">
                        {dbAnnotation.id}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

