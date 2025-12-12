"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import {
  Phone,
  User,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle2,
  Zap,
  UserStar,
} from "lucide-react";
import { formatDate, formatTime, formatTimeVN } from "@/lib/formatTimeDate";
import Pagination, {
  type PaginationMeta,
} from "@/components/common/PaginationV1";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import {
  EncounterPriorityLevel,
  EncounterStatus,
} from "@/enums/patient-workflow.enum";
import { is } from "date-fns/locale";
import { format } from "date-fns";
import TransferDetailModal from "./transfer-detail-modal";
import { TooltipProvider } from "@/components/ui-next/Tooltip/Tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatStatus } from "@/utils/format-status";

interface PatientEncounterTableProps {
  encounterItems: PatientEncounter[];
  onStartServing: (id: string) => void;
  onComplete: (id: string) => void;
  onViewDetails: (id: string) => void;
  isLoading: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  employeeId: string;
  onTransferPhysician: (encounter: string) => void;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function PatientEncounterTable({
  encounterItems,
  onStartServing,
  onComplete,
  onViewDetails,
  isLoading,
  emptyStateIcon = <User className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No encounters found",
  emptyStateDescription = "No encounters match your search criteria. Try adjusting your filters or search terms.",
  employeeId,
  onTransferPhysician,
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}: PatientEncounterTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [selectedEncounter, setSelectedEncounter] =
    React.useState<PatientEncounter | null>(null);

  const handleShowTransferDetail = (encounter: PatientEncounter) => {
    setSelectedEncounter(encounter);
    setShowTransferModal(true);
  };

  const getStatusBadge = (status: EncounterStatus) => {
    const statusConfig: Record<EncounterStatus, { dotColor: string; textColor: string; animate: boolean }> = {
      [EncounterStatus.WAITING]: { dotColor: "bg-blue-500", textColor: "text-blue-700", animate: true },
      [EncounterStatus.ARRIVED]: { dotColor: "bg-emerald-500", textColor: "text-emerald-700", animate: false },
      [EncounterStatus.FINISHED]: { dotColor: "bg-amber-500", textColor: "text-amber-700", animate: false },
      [EncounterStatus.CANCELLED]: { dotColor: "bg-red-500", textColor: "text-red-700", animate: false },
    };

    const config = statusConfig[status] || { dotColor: "bg-slate-400", textColor: "text-slate-700", animate: false };
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.dotColor} ${config.animate ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {formatStatus(status)}
        </span>
      </div>
    );
  };


  const getPriorityLevel = (level: EncounterPriorityLevel) => {
    switch (level) {
      case EncounterPriorityLevel.ROUTINE:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full w-fit">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Routine
            </span>
          </div>
        );
      case EncounterPriorityLevel.URGENT:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Urgent
            </span>
          </div>
        );
      case EncounterPriorityLevel.STAT:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
              Stat
            </span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full w-fit">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Unknown
            </span>
          </div>
        );
    }
  };

  const columns = [
    {
      header: "Queue #",
      sortable: true,
      sortField: "orderNumber",
      cell: (encounter: PatientEncounter) => (
        <div className="font-bold text-lg text-foreground text-center">
          {encounter.orderNumber}
        </div>
      ),
    },
    {
      header: "Name",
      sortable: false,
      cell: (encounter: PatientEncounter) => {
        const patient = encounter.patient;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {patient?.firstName} {patient?.lastName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Date & Time",
      headerClassName: "text-center",
      sortable: true,
      sortField: "createdAt",
      cell: (encounter: PatientEncounter) => (
        <div className="space-y-1 text-center">
          <span className="font-semibold text-foreground text-sm">
            {formatDate(encounter.createdAt)}
          </span>
          <div className="flex justify-center items-center gap-4 text-xs text-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(encounter.createdAt)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      sortable: false,
      cell: (encounter: PatientEncounter) => (
        <Badge
          variant="outline"
          className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
        >
          {formatStatus(encounter.encounterType)}
        </Badge>
      ),
    },
    {
      header: "Priority",
      sortable: false,
      cell: (encounter: PatientEncounter) => (
        <div className="flex items-center">
          {getPriorityLevel(encounter?.priority as EncounterPriorityLevel)}
        </div>
      ),
    },
    {
      header: "Status",
      sortable: false,
      cell: (encounter: PatientEncounter) => getStatusBadge(encounter.status),
    },
    {
      header: "Actions",
      headerClassName: "text-center",
      cell: (encounter: PatientEncounter) => (
        <div className="flex items-center gap-2 justify-center">
          {encounter.status === EncounterStatus.WAITING && (
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium text-xs transition-colors bg-transparent"
              onClick={() => onStartServing(encounter.id)}
            >
              Start
            </Button>
          )}
          {encounter.status === EncounterStatus.ARRIVED &&
            encounter.assignedPhysicianId === employeeId && (
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium text-xs transition-colors bg-transparent"
                onClick={() => onComplete(encounter.id)}
              >
                Complete
              </Button>
            )}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(encounter.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {encounter.status === EncounterStatus.ARRIVED &&
            encounter.assignedPhysicianId === employeeId &&
            onTransferPhysician && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTransferPhysician(encounter.id)}
                className="h-8 w-8 p-0"
              >
                <Phone className="h-4 w-4 text-blue-600" />
              </Button>
            )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<PatientEncounter>
      columns={columns}
      data={encounterItems}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(encounter) => encounter.id}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}
