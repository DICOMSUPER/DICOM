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
      sortable: false,
      cell: (machine: ModalityMachine) => {
        const currentStatus =
          pendingStatus[machine.id] ?? (machine.status as MachineStatus);
        const hasPendingChange = currentStatus !== machine.status;
        
        const getStatusColor = (status: MachineStatus) => {
          switch (status) {
            case MachineStatus.ACTIVE:
              return "text-green-600";
            case MachineStatus.INACTIVE:
              return "text-gray-500";
            case MachineStatus.MAINTENANCE:
              return "text-amber-600";
            case MachineStatus.OUT_OF_SERVICE:
              return "text-red-600";
            default:
              return "text-foreground";
          }
        };
        
        return (
          <div className="flex items-center gap-2">
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
              <SelectTrigger className={`w-[140px] h-8 text-sm ${getStatusColor(currentStatus)}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {machineStatusArray.map((status) => (
                  <SelectItem 
                    key={status} 
                    value={status}
                    className={getStatusColor(status)}
                  >
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
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
                className="h-7 px-2 text-xs"
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
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}

