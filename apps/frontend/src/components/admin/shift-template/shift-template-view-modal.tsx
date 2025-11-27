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
import { ShiftTemplate } from '@/interfaces/user/shift-template.interface';
import { Clock, Edit } from 'lucide-react';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import { formatDate } from '@/lib/formatTimeDate';

interface ShiftTemplateViewModalProps {
  template: ShiftTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (template: ShiftTemplate) => void;
}

export function ShiftTemplateViewModal({ template, isOpen, onClose, onEdit }: ShiftTemplateViewModalProps) {
  const formatTime = (time?: string) => {
    if (!time) return '—';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const getShiftTypeLabel = (type?: string) => {
    if (!type) return '—';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Shift Template Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {!template ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <div className="space-y-4 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {template.shift_name}
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-foreground leading-tight">
                        {template.shift_name}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-foreground">
                        <p>Type: {getShiftTypeLabel(template.shift_type)}</p>
                        <p>Status: {template.is_active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 text-right">
                    {getBooleanStatusBadge(template.is_active ?? true)}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  Time Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground mb-1">Start Time</p>
                    <p className="text-base font-medium text-foreground">{formatTime(template.start_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground mb-1">End Time</p>
                    <p className="text-base font-medium text-foreground">{formatTime(template.end_time)}</p>
                  </div>
                  {template.break_start_time && template.break_end_time && (
                    <>
                      <div>
                        <p className="text-sm text-foreground mb-1">Break Start Time</p>
                        <p className="text-base font-medium text-foreground">{formatTime(template.break_start_time)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground mb-1">Break End Time</p>
                        <p className="text-base font-medium text-foreground">{formatTime(template.break_end_time)}</p>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {template.description && (
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    Description
                  </div>
                  <p className="text-foreground">{template.description}</p>
                </section>
              )}

              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  Metadata
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground mb-1">Created At</p>
                    <p className="text-base text-foreground">{formatDate(template.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground mb-1">Updated At</p>
                    <p className="text-base text-foreground">{formatDate(template.updatedAt)}</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {template && onEdit && (
            <Button
              type="button"
              onClick={() => onEdit(template)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Template
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

