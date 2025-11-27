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
import { Skeleton } from '@/components/ui/skeleton';
import { BodyPart } from '@/interfaces/imaging/body-part.interface';
import { Activity, Calendar } from 'lucide-react';

interface BodyPartViewModalProps {
  bodyPart: BodyPart | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (bodyPart: BodyPart) => void;
}

export function BodyPartViewModal({
  bodyPart,
  isOpen,
  onClose,
  onEdit,
}: BodyPartViewModalProps) {

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return '—';
    const date = typeof dateValue === 'string' || dateValue instanceof Date ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] max-w-[800px] sm:max-w-[50vw] max-h-[75vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Body Part Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {!bodyPart ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-8 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                      <Activity className="h-3.5 w-3.5 text-foreground" />
                      Body Part
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-foreground leading-tight">
                        {bodyPart.name}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Overview Section */}
              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="h-5 w-5 text-foreground" />
                  Body Part Overview
                </div>
                <div className="grid gap-4 md:grid-cols-1">
                  <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Activity className="h-4 w-4 text-foreground" />
                      Name
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {bodyPart.name}
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-6">
                  {/* Description */}
                  {bodyPart.description && (
                    <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Activity className="h-5 w-5 text-foreground" />
                        Description
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                        {bodyPart.description}
                      </p>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Timestamps */}
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="h-5 w-5 text-foreground" />
                      Timestamps
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Created At</p>
                        <p className="text-base font-semibold text-foreground">
                          {formatDateTime(bodyPart.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Updated At</p>
                        <p className="text-base font-semibold text-foreground">
                          {formatDateTime(bodyPart.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && bodyPart && (
            <Button variant="default" onClick={() => onEdit(bodyPart)}>
              Edit Body Part
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

