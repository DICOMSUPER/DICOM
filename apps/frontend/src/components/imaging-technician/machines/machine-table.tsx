"use client";

import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor } from "lucide-react";
import React, { useState } from "react";
import { ModalityMachine } from "@/common/interfaces/image-dicom/modality-machine.interface";
import { MachineStatus } from "@/common/enums/machine-status.enum";
import { formatDateTime } from "@/common/utils/format-status";

interface MachineTableProps {
  machines: ModalityMachine[];
  onUpdateStatus: (id: string, status: MachineStatus) => void;
  isLoading: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  page?: number;
  limit?: number;
  total?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function MachineTable({
  machines,
  onUpdateStatus,
  isLoading,
  emptyStateIcon = <Monitor className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No machines found",
  emptyStateDescription = "No machines match your search criteria. Try adjusting your filters or search terms.",
  page = 1,
  limit = 10,
  total,
  onSort,
  initialSort,
}: MachineTableProps) {
  const [pendingStatus, setPendingStatus] = useState<
    Record<string, MachineStatus>
  >({});

  const machineStatusArray = Object.values(MachineStatus);

  const columns = [
    {
      header: "Machine Name",
      sortable: true,
      sortField: "name",
      cell: (machine: ModalityMachine) => (
        <div className="font-semibold text-foreground">{machine.name || "—"}</div>
      ),
    },
    {
      header: "Modality",
      sortable: false,
      cell: (machine: ModalityMachine) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">
            {machine.modality?.modalityCode || "—"}
          </div>
          <div className="text-foreground">
            {machine.modality?.modalityName || "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Manufacturer",
      sortable: true,
      sortField: "manufacturer",
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground">{machine.manufacturer || "—"}</div>
      ),
    },
    {
      header: "Model",
      sortable: true,
      sortField: "model",
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground">{machine.model || "—"}</div>
      ),
    },
    {
      header: "Serial Number",
      sortable: true,
      sortField: "serialNumber",
      cell: (machine: ModalityMachine) => (
        <div className="font-mono text-xs text-foreground">
          {machine.serialNumber || "—"}
        </div>
      ),
    },
    {
      header: "Status",
      headerClassName: "text-center",
      sortable: false,
      cell: (machine: ModalityMachine) => {
        const currentStatus =
          pendingStatus[machine.id] ?? (machine.status as MachineStatus);
        const hasPendingChange = currentStatus !== machine.status;

        const getStatusStyles = (status: MachineStatus) => {
          switch (status) {
            case MachineStatus.ACTIVE:
              return {
                bg: "bg-emerald-50 hover:bg-emerald-100",
                text: "text-emerald-700",
                dot: "bg-emerald-500",
                border: "border-emerald-200",
              };
            case MachineStatus.INACTIVE:
              return {
                bg: "bg-slate-50 hover:bg-slate-100",
                text: "text-slate-600",
                dot: "bg-slate-400",
                border: "border-slate-200",
              };
            case MachineStatus.MAINTENANCE:
              return {
                bg: "bg-amber-50 hover:bg-amber-100",
                text: "text-amber-700",
                dot: "bg-amber-500",
                border: "border-amber-200",
              };

            default:
              return {
                bg: "bg-gray-50 hover:bg-gray-100",
                text: "text-gray-600",
                dot: "bg-gray-400",
                border: "border-gray-200",
              };
          }
        };

        const formatStatusLabel = (status: MachineStatus) => {
          return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        };

        const styles = getStatusStyles(currentStatus);

        return (
          <div className="flex items-center justify-center gap-2">
            <Select
              value={currentStatus}
              onValueChange={(value: MachineStatus) => {
                setPendingStatus((prev) => {
                  if (value === machine.status) {
                    const updated = { ...prev };
                    delete updated[machine.id];
                    return updated;
                  }
                  return {
                    ...prev,
                    [machine.id]: value,
                  };
                });
              }}
            >
              <SelectTrigger
                className={`w-[150px] h-8 text-xs font-medium border ${styles.border} ${styles.bg} ${styles.text} focus:ring-1 focus:ring-offset-0`}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="border-border">
                {machineStatusArray.map((status) => {
                  const itemStyles = getStatusStyles(status);
                  return (
                    <SelectItem
                      key={status}
                      value={status}
                      className={`${itemStyles.text} cursor-pointer`}
                    >
                      {formatStatusLabel(status)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {hasPendingChange && (
              <Button
                size="sm"
                onClick={() => {
                  const nextStatus = pendingStatus[machine.id];
                  if (!nextStatus) return;
                  onUpdateStatus(machine.id, nextStatus);
                  setPendingStatus((prev) => {
                    const updated = { ...prev };
                    delete updated[machine.id];
                    return updated;
                  });
                }}
                className="h-7 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Save
              </Button>
            )}
          </div>
        );
      },
    },
    {
      header: "Created Date",
      sortable: true,
      sortField: "createdAt",
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground text-sm">
          {formatDateTime(machine.createdAt)}
        </div>
      ),
    },
    {
      header: "Last Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground text-sm">
          {formatDateTime(machine.updatedAt)}
        </div>
      ),
    },
  ];

  return (
    <DataTable<ModalityMachine>
      columns={columns}
      data={machines}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(machine) => machine.id}
      page={page}
      limit={limit}
      total={total}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}

