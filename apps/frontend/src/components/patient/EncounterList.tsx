"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Calendar,
  Clock,
  Eye,
  DoorOpen,
  AlertCircle,
  User,
  Hash,
  FileText,
  Activity,
  UserPlus,
  CalendarClock,
  Loader2,
  Inbox,
} from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { useGetAllServiceRoomsQuery } from "@/store/serviceRoomApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import { EncounterPriorityLevel } from "@/enums/patient-workflow.enum";
import {
  getPriorityColor,
  getStatusBadgeClass,
  getEncounterTypeBadgeClass,
} from "@/utils/patient/[id]/color";
import { cn } from "@/lib/utils";

interface EncounterListProps {
  encounters: PatientEncounter[];
  loading?: boolean;
  onEdit?: (encounter: PatientEncounter) => void;
  onView?: (encounter: PatientEncounter) => void;
  onCreate?: () => void;
  page: number;
  totalPages: number;
}

const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatStatus = (status: string) => {
  return status
    .split(/[-_]/)
    .map((word) => capitalizeFirst(word))
    .join(" ");
};

const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { dateStr, timeStr };
};

const formatShortDateTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function EncounterList({
  encounters,
  loading = false,
  onView,
}: EncounterListProps) {
  const { data: ServiceRoomData, isLoading: isLoadingServiceRooms } =
    useGetAllServiceRoomsQuery({});

  if (loading) {
    return (
      <div className="rounded-2xl p-6 shadow border-border border">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Stethoscope className="h-5 w-5" />
          Recent Encounters
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-foreground">
            Loading encounters...
          </p>
          <p className="text-xs text-foreground mt-1">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <div className="rounded-2xl p-6 shadow border-border border">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Stethoscope className="h-5 w-5" />
          Recent Encounters
        </div>
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
            <Inbox className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No recent encounters</p>
          <p className="text-xs text-slate-400 mt-1">No encounters found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow border-border border flex flex-col gap-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Stethoscope className="h-5 w-5" />
        Recent Encounters
      </div>

      <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto">
        {encounters.map((encounter) => {
          const serviceRoom = ServiceRoomData?.data.find(
            (sr) => sr.id === encounter.serviceRoomId
          );
          const { dateStr, timeStr } = encounter.encounterDate
            ? formatDateTime(encounter.encounterDate)
            : { dateStr: "N/A", timeStr: "N/A" };

          return (
            <EncounterCard
              key={encounter.id}
              encounter={encounter}
              serviceRoom={serviceRoom}
              dateStr={dateStr}
              timeStr={timeStr}
              onView={onView}
            />
          );
        })}
      </div>
    </div>
  );
}

interface EncounterCardProps {
  encounter: PatientEncounter;
  serviceRoom?: any;
  dateStr: string;
  timeStr: string;
  onView?: (encounter: PatientEncounter) => void;
}

function EncounterCard({
  encounter,
  serviceRoom,
  dateStr,
  timeStr,
  onView,
}: EncounterCardProps) {
  const { data: physicianData } = useGetUserByIdQuery(
    encounter.assignedPhysicianId || "",
    { skip: !encounter.assignedPhysicianId }
  );
  const { data: createdByData } = useGetUserByIdQuery(
    encounter.createdBy || "",
    { skip: !encounter.createdBy }
  );
  const physician = physicianData?.data;
  const createdBy = createdByData?.data;

  return (
    <Card
      className={cn(
        "border border-border hover:shadow-lg cursor-pointer hover:border-primary/60 transition-all duration-200 bg-card p-0"
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header Row: Order Number and Status Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {encounter.orderNumber && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md border border-border">
                <Hash className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Order #{encounter.orderNumber}
                </span>
              </div>
            )}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded border border-border">
              <span className="text-[10px] font-mono text-gray-500">
                ID: {encounter.id.slice(0, 8)}...
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {encounter.priority && (
              <Badge
                className={cn(
                  "px-2 py-0.5 text-xs font-semibold border",
                  getPriorityColor(encounter.priority)
                )}
              >
                {encounter.priority === EncounterPriorityLevel.STAT && (
                  <AlertCircle className="w-3 h-3 mr-0.5" />
                )}
                {formatStatus(encounter.priority)}
              </Badge>
            )}
            <Badge
              className={cn(
                "px-2 py-0.5 text-xs font-semibold border",
                getStatusBadgeClass(encounter.status)
              )}
            >
              {formatStatus(encounter.status)}
            </Badge>
            <Badge
              className={cn(
                "px-2 py-0.5 text-xs font-semibold border",
                getEncounterTypeBadgeClass(encounter.encounterType)
              )}
            >
              {formatStatus(encounter.encounterType)}
            </Badge>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md border border-border">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-900">{dateStr}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md border border-border">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-900">{timeStr}</span>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Chief Complaint - Always show */}
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-md border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-amber-900 uppercase tracking-wide mb-0.5">
                Chief Complaint
              </p>
              <p className="text-xs text-amber-800 leading-snug line-clamp-2">
                {encounter.chiefComplaint || (
                  <span className="text-amber-600 italic">Not provided</span>
                )}
              </p>
            </div>
          </div>

          {/* Symptoms - Always show */}
          <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-md border border-blue-200">
            <Activity className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-blue-900 uppercase tracking-wide mb-0.5">
                Symptoms
              </p>
              <p className="text-xs text-blue-800 leading-snug line-clamp-2">
                {encounter.symptoms || (
                  <span className="text-blue-600 italic">Not provided</span>
                )}
              </p>
            </div>
          </div>

          {/* Location - Always show */}
          <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-md border border-primary/20">
            <DoorOpen className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide mb-0.5">
                Location
              </p>
              {serviceRoom ? (
                <>
                  <p className="text-xs font-medium text-foreground truncate">
                    {serviceRoom?.room?.roomCode || "No room"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {serviceRoom?.service?.serviceName ||
                      serviceRoom?.service?.serviceCode ||
                      "No service"}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500 italic">Not assigned</p>
              )}
            </div>
          </div>

          {/* Assigned Physician - Always show */}
          <div className="flex items-start gap-2 p-2.5 bg-emerald-50 rounded-md border border-emerald-200">
            <User className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-emerald-900 uppercase tracking-wide mb-0.5">
                Physician
              </p>
              {physician ? (
                <>
                  <p className="text-xs font-medium text-emerald-800 truncate">
                    Dr. {physician.firstName} {physician.lastName}
                  </p>
                  {physician.role && (
                    <p className="text-[10px] text-emerald-600 truncate">
                      {formatStatus(physician.role)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-emerald-700 italic">Not assigned</p>
              )}
            </div>
          </div>

          {/* Created By - Always show */}
          {createdBy && (
            <div className="flex items-start gap-2 p-2.5 bg-indigo-50 rounded-md border border-indigo-200">
              <UserPlus className="h-3.5 w-3.5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-indigo-900 uppercase tracking-wide mb-0.5">
                  Created By
                </p>
                <p className="text-xs font-medium text-indigo-800 truncate">
                  {createdBy.firstName} {createdBy.lastName}
                </p>
                {createdBy.role && (
                  <p className="text-[10px] text-indigo-600 truncate">
                    {formatStatus(createdBy.role)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timestamps - Always show */}
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <CalendarClock className="h-3.5 w-3.5 text-slate-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-900 uppercase tracking-wide mb-0.5">
                Timestamps
              </p>
              {encounter.createdAt && (
                <p className="text-[10px] text-slate-600">
                  Created: {formatShortDateTime(encounter.createdAt)}
                </p>
              )}
              {encounter.updatedAt && (
                <p className="text-[10px] text-slate-600">
                  Updated: {formatShortDateTime(encounter.updatedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Notes - Always show */}
          <div className="flex items-start gap-2 p-2.5 bg-purple-50 rounded-md border border-purple-200 sm:col-span-2">
            <FileText className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-purple-900 uppercase tracking-wide mb-0.5">
                Notes
              </p>
              <p className="text-xs text-purple-800 leading-snug line-clamp-2">
                {encounter.notes || (
                  <span className="text-purple-600 italic">No notes</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onView && (
          <div className="flex justify-end border-t border-border/30 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 border-border hover:bg-gray-50"
              onClick={() => onView(encounter)}
            >
              <Eye className="w-3 h-3 mr-1.5" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
