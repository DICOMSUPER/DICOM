"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetModalityMachineByIdQuery } from "@/store/modalityMachineApi";
import { getRoomStatusBadge, getMachineStatusBadge } from "@/utils/status-badge";
import { formatDate } from "@/lib/formatTimeDate";
import { Monitor, Calendar, Building2 } from "lucide-react";
import { Room } from "@/interfaces/user/room.interface";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";

interface ModalityMachineViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string | null;
  onEdit?: (machineId: string) => void;
  rooms?: Room[];
}

export function ModalityMachineViewModal({
  isOpen,
  onClose,
  machineId,
  onEdit,
  rooms = [],
}: ModalityMachineViewModalProps) {
  const { data, isLoading } = useGetModalityMachineByIdQuery(machineId || '', {
    skip: !machineId || !isOpen,
  });

  const machine = data?.data?.data ?? data?.data as ModalityMachine | undefined;

  const assignedRoom = machine?.roomId 
    ? rooms.find((room) => room.id === machine.roomId)
    : undefined;

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Modality Machine Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {isLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : !machine ? (
            <div className="space-y-4 py-6">
              <p className="text-foreground/60">Machine not found</p>
            </div>
          ) : (
          <div className="space-y-4 pr-4 pb-2">
            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <Monitor className="h-3.5 w-3.5" />
                    {machine.name || 'Unnamed Machine'}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {machine.name || '—'}
                    </p>
                    {machine.modality && (
                      <p className="mt-3 text-sm text-foreground">
                        {machine.modality.modalityName} ({machine.modality.modalityCode})
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  {getMachineStatusBadge(machine.status)}
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Monitor className="h-5 w-5" />
                Basic Information
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Monitor className="h-4 w-4" />
                    Machine Name
                  </div>
                  <p className="text-base font-semibold text-blue-600">{machine.name || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Monitor className="h-4 w-4" />
                    Imaging Modality
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {machine.modality?.modalityName || '—'} ({machine.modality?.modalityCode || '—'})
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Monitor className="h-4 w-4" />
                    Manufacturer
                  </div>
                  <p className="text-base font-semibold text-foreground">{machine.manufacturer || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Monitor className="h-4 w-4" />
                    Model
                  </div>
                  <p className="text-base font-semibold text-foreground">{machine.model || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Monitor className="h-4 w-4" />
                    Serial Number
                  </div>
                  <p className="text-base font-semibold text-foreground">{machine.serialNumber || '—'}</p>
                </div>
              </div>
            </section>

            {assignedRoom && (
              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="h-5 w-5" />
                  Assigned Room
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Building2 className="h-4 w-4" />
                      Room Code
                    </div>
                    <p className="text-base font-semibold text-foreground">{assignedRoom.roomCode || '—'}</p>
                  </div>
                  {assignedRoom.roomType && (
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Building2 className="h-4 w-4" />
                        Room Type
                      </div>
                      <p className="text-base font-semibold text-foreground">{assignedRoom.roomType || '—'}</p>
                    </div>
                  )}
                  {assignedRoom.floor != null && (
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Building2 className="h-4 w-4" />
                        Floor
                      </div>
                      <p className="text-base font-semibold text-foreground">{assignedRoom.floor}</p>
                    </div>
                  )}
                  {assignedRoom.department && (
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Building2 className="h-4 w-4" />
                        Department
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {assignedRoom.department.departmentName || '—'}
                      </p>
                    </div>
                  )}
                  {assignedRoom.status && (
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Building2 className="h-4 w-4" />
                        Status
                      </div>
                      <div>{getRoomStatusBadge(assignedRoom.status)}</div>
                    </div>
                  )}
                  {assignedRoom.capacity && (
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Building2 className="h-4 w-4" />
                        Capacity
                      </div>
                      <p className="text-base font-semibold text-foreground">{assignedRoom.capacity}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                Timestamps
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Created At</p>
                  <p className="text-base font-semibold text-foreground">
                    {machine.createdAt ? formatDate(machine.createdAt) : '—'}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Updated At</p>
                  <p className="text-base font-semibold text-foreground">
                    {machine.updatedAt ? formatDate(machine.updatedAt) : '—'}
                  </p>
                </div>
              </div>
            </section>
          </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && machine && (
            <Button variant="default" onClick={() => onEdit(machine.id)}>
              Edit Machine
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

