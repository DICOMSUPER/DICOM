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
import { Skeleton } from "@/components/ui/skeleton";
import { BodyPart } from "@/common/interfaces/imaging/body-part.interface";
import { Activity, Calendar } from "lucide-react";
import { modalStyles } from "@/common/utils/format-status";

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
    if (!dateValue) return "—";
    const date =
      typeof dateValue === "string" || dateValue instanceof Date
        ? new Date(dateValue)
        : null;
    if (!date || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] max-w-[800px] sm:max-w-[50vw] h-[75vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        {/* Fixed Header */}
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            Body Part Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto px-6 py-4">
          {!bodyPart ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Section */}
              <section className={modalStyles.heroSection}>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className={modalStyles.heroLabel}>
                      <Activity className="h-3.5 w-3.5 inline mr-1" />
                      Body Part
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {bodyPart.name}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Activity className={modalStyles.gridCardIcon} />
                    Name
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {bodyPart.name}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Calendar className={modalStyles.gridCardIcon} />
                    Created
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {formatDateTime(bodyPart.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {bodyPart.description && (
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Activity className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Description</h3>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <p className={modalStyles.infoCardValue}>{bodyPart.description}</p>
                  </div>
                </section>
              )}

              {/* Timestamps */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Calendar className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Timestamps</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Created At
                    </div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(bodyPart.createdAt)}
                    </p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Updated At
                    </div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(bodyPart.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {onEdit && bodyPart && (
            <Button onClick={() => onEdit(bodyPart)} className={modalStyles.primaryButton}>
              Edit Body Part
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
