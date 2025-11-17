"use client";

import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Stethoscope,
  ClipboardList,
  MapPin,
  X,
  User,
} from "lucide-react";
import {
  formatDate,
  getEncounterTypeColor,
  getEncounterTypeLabel,
  getPriorityColor,
  getStatusColor,
} from "@/utils/patient/[id]/color";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";
import { useGetUserByIdQuery } from "@/store/userApi";

export default function EncounterModal({
  encounter,
  onClose,
}: {
  encounter: PatientEncounter | null;
  onClose: () => void;
}) {
  const { data: serviceRoomData, isLoading: isServiceRoomLoading } =
    useGetServiceRoomByIdQuery(encounter?.serviceRoomId as string, {
      skip: !encounter?.serviceRoomId,
    });

  const { data: physicianData, isLoading: isUserDataLoading } =
    useGetUserByIdQuery(encounter?.assignedPhysicianId as string, {
      skip: !encounter?.assignedPhysicianId,
    });

  const { data: receptionData, isLoading: isReceptionLoading } =
    useGetUserByIdQuery(encounter?.createdBy as string, {
      skip: !encounter?.createdBy,
    });

  if (!encounter) return null;

  const physician = physicianData?.data;
  const reception = receptionData?.data;
  const serviceRoom = serviceRoomData?.data?.data;

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

  const isLoading = isServiceRoomLoading || isUserDataLoading || isReceptionLoading;

  return (
    <Dialog open={!!encounter} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle className="text-xl font-semibold">Encounter Details</DialogTitle>
            <p className="text-sm text-foreground mt-1">
              {encounter.orderNumber && `Order #${encounter.orderNumber}`}
              {encounter.orderNumber && encounter.encounterDate && " • "}
              {encounter.encounterDate && formatDate(encounter.encounterDate)}
            </p>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-foreground">Loading...</div>
            </div>
          ) : (
            <div className="space-y-8 pr-4 pb-2">
              {/* Hero Section */}
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                      <FileText className="h-3.5 w-3.5" />
                      {encounter.orderNumber || encounter.id.slice(0, 8)}
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-foreground leading-tight">
                        {getEncounterTypeLabel(encounter.encounterType)}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {encounter.encounterDate
                            ? formatDate(encounter.encounterDate)
                            : "No date set"}
                        </p>
                        {physician && (
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Dr. {physician.firstName} {physician.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {encounter.priority && (
                        <Badge className={`${getPriorityColor(encounter.priority)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                          {encounter.priority}
                        </Badge>
                      )}
                      <Badge className={`${getStatusColor(encounter.status)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                        {encounter.status}
                      </Badge>
                      <Badge className={`${getEncounterTypeColor(encounter.encounterType)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                        {getEncounterTypeLabel(encounter.encounterType)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Encounter Date</p>
                      <p className="text-lg font-semibold text-foreground">
                        {encounter.encounterDate
                          ? formatDate(encounter.encounterDate)
                          : "Not set"}
                      </p>
                      <p className="text-xs text-foreground">Visit date</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Physician</p>
                      <p className="text-lg font-semibold text-foreground">
                        {physician
                          ? `Dr. ${physician.firstName} ${physician.lastName}`
                          : "Not assigned"}
                      </p>
                      <p className="text-xs text-foreground">Assigned doctor</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground">Service Room</p>
                      <p className="text-lg font-semibold text-foreground">
                        {serviceRoom?.room?.roomCode || "Not assigned"}
                      </p>
                      <p className="text-xs text-foreground">
                        {serviceRoom?.service?.serviceName || "No service"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-6">
                  {/* Encounter Information */}
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="h-5 w-5" />
                      Encounter Overview
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <FileText className="h-4 w-4" />
                          Encounter ID
                        </div>
                        <p className="text-base font-semibold text-foreground font-mono text-xs break-all">
                          {encounter.id}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <FileText className="h-4 w-4" />
                          Order Number
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {encounter.orderNumber || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-4 w-4" />
                          Created By
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {reception
                            ? `${reception.firstName} ${reception.lastName}`
                            : encounter.createdBy || "N/A"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Clinical Details */}
                  {(encounter.chiefComplaint || encounter.symptoms || encounter.vitalSigns) && (
                    <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Stethoscope className="h-5 w-5" />
                        Clinical Details
                      </div>
                      <div className="space-y-4">
                        {encounter.chiefComplaint && (
                          <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <AlertCircle className="h-4 w-4" />
                              Chief Complaint
                            </div>
                            <p className="text-base font-semibold text-foreground">
                              {encounter.chiefComplaint}
                            </p>
                          </div>
                        )}

                        {encounter.symptoms && (
                          <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <ClipboardList className="h-4 w-4" />
                              Symptoms
                            </div>
                            <p className="text-base font-semibold text-foreground">
                              {encounter.symptoms}
                            </p>
                          </div>
                        )}

                        {encounter.vitalSigns && (
                          <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <Activity className="h-4 w-4" />
                              Vital Signs
                            </div>
                            <div className="text-base text-foreground space-y-1">
                              {Object.entries(encounter.vitalSigns).map(([key, value]) => (
                                <p key={key} className="capitalize">
                                  <span className="font-semibold">
                                    {key.replace(/([A-Z])/g, " $1").trim()}:
                                  </span>{" "}
                                  {value !== null && value !== undefined
                                    ? String(value)
                                    : "N/A"}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Additional Information */}
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-5 w-5" />
                      Additional Information
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Assigned Physician</p>
                        <p className="text-base font-semibold text-foreground">
                          {physician
                            ? `Dr. ${physician.firstName} ${physician.lastName}`
                            : encounter.assignedPhysicianId || "Not assigned"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="h-4 w-4" />
                          Service
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {serviceRoom?.service?.serviceName || "Not assigned"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="h-4 w-4" />
                          Room
                        </div>
                        <p className="text-base font-semibold text-foreground">
                          {serviceRoom?.room?.roomCode || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {encounter.notes && (
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Notes</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {encounter.notes}
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-6">
                  {/* Timestamps */}
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="h-5 w-5" />
                      Timestamps
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Created At</p>
                        <p className="text-base font-semibold text-foreground">
                          {formatDateTime(encounter.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Updated At</p>
                        <p className="text-base font-semibold text-foreground">
                          {formatDateTime(encounter.updatedAt)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
