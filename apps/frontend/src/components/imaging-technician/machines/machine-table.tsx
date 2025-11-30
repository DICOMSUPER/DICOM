"use client";

import { Button } from "@/components/ui/button";
import { DataTable, SortConfig } from "@/components/ui/data-table";
import { Monitor } from "lucide-react";
import React, { useState } from "react";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";
import { MachineStatus } from "@/enums/machine-status.enum";
import { formatDate } from "@/lib/formatTimeDate";

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
        return (
          <div className="flex items-center gap-2">
            <select
              name="status"
              value={currentStatus}
              onChange={(e) => {
                const nextStatus = e.target.value as MachineStatus;
                setPendingStatus((prev) => {
                  if (nextStatus === machine.status) {
                    const updated = { ...prev };
                    delete updated[machine.id];
                    return updated;
                  }
                  return {
                    ...prev,
                    [machine.id]: nextStatus,
                  };
                });
              }}
              className="px-2 py-1 border rounded text-sm"
            >
              {machineStatusArray.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
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
          {formatDate(machine.createdAt)}
        </div>
      ),
    },
    {
      header: "Last Updated",
      sortable: true,
      sortField: "updatedAt",
      cell: (machine: ModalityMachine) => (
        <div className="text-foreground text-sm">
          {formatDate(machine.updatedAt)}
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

