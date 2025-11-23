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
import { useGetRoomByIdQuery } from "@/store/roomsApi";
import { getRoomStatusBadge } from "@/utils/status-badge";
import { getMachineStatusBadge } from "@/utils/machine-status-badge";
import { formatDate } from "@/lib/formatTimeDate";
import { Monitor, Calendar, Building2 } from "lucide-react";

interface ModalityMachineViewModalProps {
  open: boolean;
  onClose: () => void;
  machineId: string;
  onEdit?: (machineId: string) => void;
}

export function ModalityMachineViewModal({
  open,
  onClose,
  machineId,
  onEdit,
}: ModalityMachineViewModalProps) {
  const { data, isLoading } = useGetModalityMachineByIdQuery(machineId, {
    skip: !machineId || !open,
  });

  const machine = data?.data;
  const { data: roomData } = useGetRoomByIdQuery(machine?.roomId || "", {
    skip: !machine?.roomId || !open,
  });

  const room = roomData?.data;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  if (!machine) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle className="text-2xl font-semibold">
              Modality Machine Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Monitor className="h-5 w-5 text-foreground" />
                Basic Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Machine Name
                  </div>
                  <div className="text-base font-semibold text-blue-600">
                    {machine.name || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Imaging Modality
                  </div>
                  <div className="text-base font-semibold">
                    {machine.modality?.modalityName || "—"} (
                    {machine.modality?.modalityCode || "—"})
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Manufacturer
                  </div>
                  <div className="text-base">
                    {machine.manufacturer || (
                      <span className="text-foreground/60 italic">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Model
                  </div>
                  <div className="text-base">
                    {machine.model || (
                      <span className="text-foreground/60 italic">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Serial Number
                  </div>
                  <div className="text-base">
                    {machine.serialNumber || (
                      <span className="text-foreground/60 italic">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </div>
                  <div>{getMachineStatusBadge(machine.status)}</div>
                </div>
              </div>
            </section>

            {machine.roomId && (
              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Building2 className="h-5 w-5 text-foreground" />
                  Assigned Room
                </div>

                {room ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Room Code
                      </div>
                      <div className="text-base font-semibold text-blue-600">
                        {room.roomCode || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Room Type
                      </div>
                      <div className="text-base">
                        {room.roomType || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Floor
                      </div>
                      <div className="text-base">
                        {room.floor ?? "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Department
                      </div>
                      <div className="text-base">
                        {room.department?.departmentName || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Room Status
                      </div>
                      <div>
                        {room.status
                          ? getRoomStatusBadge(room.status)
                          : "—"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-foreground/30" />
                    <p className="text-foreground/60">
                      Room information not available
                    </p>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Calendar className="h-5 w-5 text-foreground" />
                Timestamps
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Created At
                  </div>
                  <div className="text-base">
                    {machine.createdAt ? formatDate(machine.createdAt) : "—"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Updated At
                  </div>
                  <div className="text-base">
                    {machine.updatedAt ? formatDate(machine.updatedAt) : "—"}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 border-t border-gray-100 shrink-0 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button type="button" onClick={() => onEdit(machineId)}>
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

