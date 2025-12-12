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
import { RequestProcedure } from '@/interfaces/image-dicom/request-procedure.interface';
import { Building, Calendar, Users, Activity } from 'lucide-react';
import { formatStatus, modalStyles, getStatusBadgeColor } from '@/utils/format-status';

interface RequestProcedureViewModalProps {
  procedure: RequestProcedure | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (procedure: RequestProcedure) => void;
}

export function RequestProcedureViewModal({
  procedure,
  isOpen,
  onClose,
  onEdit,
}: RequestProcedureViewModalProps) {
  if (!procedure) return null;

  const getStatusBadge = (isActive: boolean) => {
    const colorKey = getStatusBadgeColor(isActive);
    return (
      <Badge className={`${modalStyles.badge[colorKey]} px-3 py-1 text-xs font-medium border flex items-center gap-1.5`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

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
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Request Procedure Details</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {/* Hero Section */}
            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <Building className="h-3.5 w-3.5" />
                    {procedure.modality?.modalityName}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {procedure.name}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {procedure.bodyPart?.name || '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  {getStatusBadge(procedure?.isActive as boolean)}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Modality Name</p>
                    <p className="text-lg font-semibold text-foreground">{procedure.modality?.modalityName}</p>
                    <p className="text-xs text-foreground">Identifier</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Body Part Name</p>
                    <p className="text-lg font-semibold text-foreground">
                      {procedure.bodyPart?.name}
                    </p>
                    <p className="text-xs text-foreground">Assigned body part</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Status</p>
                    {getStatusBadge(procedure?.isActive as boolean)}
                  </div>
                </div>
              </div>
            </section>

            {/* Overview Section */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Request Procedure Overview
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building className="h-4 w-4" />
                    Modality Name
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {procedure.modality?.modalityName}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Users className="h-4 w-4" />
                    Body Part Name
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {procedure.bodyPart?.name}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Status</p>
                  {getStatusBadge(procedure?.isActive as boolean)}
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                {/* Description */}
                {procedure.description && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Building className="h-5 w-5" />
                      Description
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                      {procedure.description}
                    </p>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                {/* Timestamps */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5" />
                    Timestamps
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Created At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(procedure.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Updated At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(procedure.updatedAt)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="default" onClick={() => onEdit(procedure)}>
              Edit Procedure
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
