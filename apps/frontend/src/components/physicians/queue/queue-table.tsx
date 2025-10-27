"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  X,
  Phone,
  User,
  Clock,
  ArrowUpDown,
  Eye,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { QueuePriorityLevel, QueueStatus } from "@/enums/patient.enum";

import { formatDate, formatTime } from "@/lib/formatTimeDate";
import type { QueueAssignment } from "@/interfaces/patient/queue-assignment.interface";
import Pagination, {
  type PaginationMeta,
} from "@/components/common/PaginationV1";
import { TableSkeleton } from "@/components/ui/table-skeleton";

interface QueueTableProps {
  queueItems: QueueAssignment[];
  onStartServing: (id: string) => void;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onViewDetails: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isUpdating: boolean;
  isLoading: boolean;
}

const columnHelper = createColumnHelper<QueueAssignment>();

export function QueueTable({
  queueItems,
  onStartServing,
  onComplete,
  onSkip,
  onViewDetails,
  pagination,
  onPageChange,
  isUpdating,
  isLoading,
}: QueueTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.WAITING:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Waiting</span>
          </div>
        );
      case QueueStatus.COMPLETED:
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Completed
            </span>
          </div>
        );
      case QueueStatus.IN_PROGRESS:
        return (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Serving</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            <span className="text-sm font-medium text-slate-600">{status}</span>
          </div>
        );
    }
  };

  const getRowClassName = (priority: QueuePriorityLevel) => {
    const baseClass = "transition-all duration-200 hover:shadow-md";
    
    switch (priority) {
      case QueuePriorityLevel.URGENT:
        return `bg-gradient-to-r from-amber-50 to-transparent hover:from-amber-100 hover:to-transparent border-l-4 border-amber-500 ${baseClass}`;
      case QueuePriorityLevel.STAT:
        return `bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 hover:to-transparent border-l-4 border-red-500 ${baseClass}`;
      case QueuePriorityLevel.ROUTINE:
        return `hover:bg-slate-50 border-l-4 border-transparent ${baseClass}`;
      default:
        return `hover:bg-slate-50 border-l-4 border-transparent ${baseClass}`;
    }
  };

  const getPriorityLevel = (level: QueuePriorityLevel) => {
    switch (level) {
      case QueuePriorityLevel.ROUTINE:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full w-fit">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Routine
            </span>
          </div>
        );
      case QueuePriorityLevel.URGENT:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Urgent
            </span>
          </div>
        );
      case QueuePriorityLevel.STAT:
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
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Unknown
            </span>
          </div>
        );
    }
  };

  const columns = [
    columnHelper.accessor("queueNumber", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Queue #
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-bold text-lg text-slate-900 text-center">
          {row.original.queueNumber}
        </div>
      ),
    }),

    columnHelper.display({
      id: "patient",
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Name
        </div>
      ),

      cell: ({ row }) => {
        const patient = row.original.encounter.patient;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                {patient?.firstName} {patient?.lastName}
              </span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("assignmentDate", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-center font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1 text-center">
          <span className="font-semibold text-slate-900 text-sm">
            {formatDate(row.original.assignmentDate)}
          </span>
          <div className="flex justify-center items-center gap-4 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(row.original.assignmentDate)}</span>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("encounter.encounterType", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Type
        </div>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
        >
          {row.original.encounter.encounterType}
        </Badge>
      ),
    }),

    columnHelper.accessor("priority", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Priority
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {getPriorityLevel(row?.original?.priority)}
        </div>
      ),
    }),

    columnHelper.display({
      id: "queue_status",
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Status
        </div>
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.display({
      id: "actions",
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const queueItem = row.original;
        return (
          <div className="flex items-center gap-2">
            {queueItem.status === QueueStatus.WAITING && (
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium text-xs transition-colors bg-transparent"
                onClick={() => onStartServing(queueItem.id)}
                disabled={isUpdating}
              >
                Start
              </Button>
            )}
            {queueItem.status === QueueStatus.IN_PROGRESS && (
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium text-xs transition-colors bg-transparent"
                onClick={() => onComplete(queueItem.id)}
              >
                Complete
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-slate-100 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onViewDetails(queueItem.encounterId)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {(queueItem.status === QueueStatus.WAITING ||
                  queueItem.status === QueueStatus.IN_PROGRESS) && (
                  <DropdownMenuItem
                    onClick={() => onSkip(queueItem.id)}
                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Skip
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: queueItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  if (queueItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 text-lg font-semibold">
            No queue items found
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-slate-50 to-slate-50 border-b-2 border-slate-200 hover:bg-slate-50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-6 py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={columns.length} />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={getRowClassName(row.original.priority)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Pagination
        pagination={pagination}
        onPageChange={onPageChange}
        showInfo={true}
      />
    </div>
  );
}
