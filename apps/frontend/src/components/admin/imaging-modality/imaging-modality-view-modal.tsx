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
import { useGetImagingModalityByIdQuery } from "@/store/imagingModalityApi";
import { getBooleanStatusBadge } from "@/utils/status-badge";
import { formatDate } from "@/lib/formatTimeDate";
import { Scan, Calendar, Loader2 } from "lucide-react";

interface ImagingModalityViewModalProps {
  open: boolean;
  onClose: () => void;
  modalityId: string;
  onEdit?: (modalityId: string) => void;
}

export function ImagingModalityViewModal({
  open,
  onClose,
  modalityId,
  onEdit,
}: ImagingModalityViewModalProps) {
  const { data, isLoading } = useGetImagingModalityByIdQuery(modalityId, {
    skip: !modalityId || !open,
  });

  const modality = data?.data;

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

  if (!modality) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle className="text-2xl font-semibold">
              Imaging Modality Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Scan className="h-5 w-5 text-foreground" />
                Basic Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Modality Code
                  </div>
                  <div className="text-base font-semibold text-blue-600">
                    {modality.modalityCode || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Modality Name
                  </div>
                  <div className="text-base font-semibold">
                    {modality.modalityName || "—"}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </div>
                  <div className="text-base">
                    {modality.description || (
                      <span className="text-foreground/60 italic">
                        No description provided
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </div>
                  <div>{getBooleanStatusBadge(modality.isActive)}</div>
                </div>
              </div>
            </section>

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
                    {modality.createdAt
                      ? formatDate(modality.createdAt)
                      : "—"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Updated At
                  </div>
                  <div className="text-base">
                    {modality.updatedAt
                      ? formatDate(modality.updatedAt)
                      : "—"}
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
            <Button type="button" onClick={() => onEdit(modalityId)}>
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

