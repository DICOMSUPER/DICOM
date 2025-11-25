"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { getEncounterTypeBadge } from "@/utils/status-badge";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Stethoscope,
  Clock,
  AlertCircle,
  Activity,
  FileText,
} from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { TableCellEnhanced, TableRowEnhanced } from "../ui/table-enhanced";
import { Badge } from "../ui/badge";
import { PriorityBadge } from "../ui/priority-badge";

interface EncounterTableProps {
  encounters: PatientEncounter[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (encounter: PatientEncounter) => void;
  onEditEncounter?: (encounter: PatientEncounter) => void;
  onDeleteEncounter?: (encounter: PatientEncounter) => void;
}

export function EncounterTable({
  encounters,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  onViewDetails,
  onEditEncounter,
  onDeleteEncounter,
}: EncounterTableProps) {
  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return { date: "N/A", time: "" };
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const formatEncounterType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const getEncounterTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "emergency":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "inpatient":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "outpatient":
        return <Stethoscope className="w-4 h-4 text-green-500" />;
      default:
        return <Stethoscope className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEncounterTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-700 border-red-200";
      case "inpatient":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "outpatient":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const headers = [
    "Patient Info",
    "Type & Priority",
    "Status",
    "Chief Complaint",
    "Date & Time",
    "Assigned Physician",
    "Order #",
    "Actions",
  ];

  return (
    <DataTable<PatientEncounter>
      rowKey={(encounter) => encounter.id}
      data={encounters}
      isLoading={isLoading}
      isEmpty={encounters.length === 0}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    >
      {encounters.map((encounter) => {
        const dateTime = formatDateTime(encounter?.encounterDate);

        return (
          <TableRowEnhanced key={encounter.id}>
            {/* Patient Info */}
            <TableCellEnhanced>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground">
                    {encounter?.patient?.firstName}{" "}
                    {encounter?.patient?.lastName}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <span className="font-mono">
                      ID: {encounter?.patient?.patientCode}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {encounter?.patient?.gender} •{" "}
                    {encounter?.patient?.bloodType}
                  </div>
                </div>
              </div>
            </TableCellEnhanced>

            {/* Type & Priority */}
            <TableCellEnhanced>
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getEncounterTypeColor(
                    encounter.encounterType
                  )}`}
                >
                  {getEncounterTypeIcon(encounter.encounterType)}
                  {formatEncounterType(encounter.encounterType)}
                </div>
                {encounter.priority && (
                  <div className="flex items-center gap-1">
                    <PriorityBadge priority={encounter.priority} />
                  </div>
                )}
              </div>
            </TableCellEnhanced>

            {/* Status */}
            <TableCellEnhanced>
              <StatusBadge status={encounter.status} />
            </TableCellEnhanced>

            {/* Chief Complaint */}
            <TableCellEnhanced>
              <div className="max-w-[200px]">
                {encounter.chiefComplaint ? (
                  <div className="flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground line-clamp-2">
                      {encounter.chiefComplaint}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">
                    No complaint recorded
                  </span>
                )}
                {encounter.notes && (
                  <div className="text-xs text-gray-600 mt-1.5 line-clamp-1">
                    <span className="text-gray-500">Note:</span>{" "}
                    {encounter.notes}
                  </div>
                )}
              </div>
            </TableCellEnhanced>

            {/* Date & Time */}
            <TableCellEnhanced>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {dateTime.date}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {dateTime.time}
                </div>
              </div>
            </TableCellEnhanced>

            {/* Assigned Physician */}
            <TableCellEnhanced>
              {encounter?.assignedPhysician ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    Dr. {encounter?.assignedPhysician?.lastName}{" "}
                    {encounter?.assignedPhysician?.firstName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {encounter?.assignedPhysician?.employeeId}
                  </div>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs text-gray-600 border-gray-300"
                >
                  Unassigned
                </Badge>
              )}
            </TableCellEnhanced>

            {/* Order Number */}
            <TableCellEnhanced>
              <div className="flex items-center justify-center">
                <Badge
                  variant="default"
                  className="font-mono text-xs bg-slate-700 hover:bg-slate-700"
                >
                  #{encounter.orderNumber}
                </Badge>
              </div>
            </TableCellEnhanced>

            {/* Actions */}
            <TableCellEnhanced isLast>
              <div className="flex items-center gap-1">
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(encounter)}
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {/* {onEditEncounter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditEncounter(encounter)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                    title="Edit Encounter"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                )}
                {onDeleteEncounter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEncounter(encounter)}
                    className="h-8 w-8 p-0 hover:bg-red-50"
                    title="Delete Encounter"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )} */}
              </div>
            </TableCellEnhanced>
          </TableRowEnhanced>
        );
      })}
    </DataTable>
  );
}
