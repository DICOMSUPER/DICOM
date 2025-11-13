"use client";

import Pagination, {
  type PaginationMeta,
} from "@/components/common/PaginationV1";
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
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  DiagnosisStatus,
  EncounterPriorityLevel,
  EncounterStatus,
} from "@/enums/patient-workflow.enum";
import {
  DiagnosisReport,
  PatientEncounter,
} from "@/interfaces/patient/patient-workflow.interface";
import { formatDate, formatTime } from "@/lib/formatTimeDate";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  MoreHorizontal,
  Phone,
  User,
  Zap,
} from "lucide-react";
import React from "react";

interface DiagnosisReportTableProps {
  reportItems: DiagnosisReport[];
  onViewDetails: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isFetching: boolean;
}

const columnHelper = createColumnHelper<DiagnosisReport>();

export function DiagnosisReportTable({
  reportItems,
  onViewDetails,
  pagination,
  onPageChange,
  isLoading,
  isFetching,
}: DiagnosisReportTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getStatusBadge = (status: DiagnosisStatus) => {
    switch (status) {
      case DiagnosisStatus.ACTIVE:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Active</span>
          </div>
        );
      case DiagnosisStatus.RESOLVED:
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Resolved
            </span>
          </div>
        );
      case DiagnosisStatus.RULED_OUT:
        return (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Ruled Out
            </span>
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

  const getRowClassName = (priority: EncounterPriorityLevel) => {
    const baseClass = "transition-all duration-200 hover:shadow-md";

    switch (priority) {
      case EncounterPriorityLevel.URGENT:
        return `bg-gradient-to-r from-amber-50 to-transparent hover:from-amber-100 hover:to-transparent border-l-4 border-amber-500 ${baseClass}`;
      case EncounterPriorityLevel.STAT:
        return `bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 hover:to-transparent border-l-4 border-red-500 ${baseClass}`;
      case EncounterPriorityLevel.ROUTINE:
        return `hover:bg-slate-50 border-l-4 border-transparent ${baseClass}`;
      default:
        return `hover:bg-slate-50 border-l-4 border-transparent ${baseClass}`;
    }
  };



  const columns = [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          ID
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-bold text-lg text-slate-900 text-center">
          {row.original.id.substring(0, 5)}
        </div>
      ),
    }),

    columnHelper.accessor("diagnosisName", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Diagnosis Name
        </div>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {row.original.diagnosisName}
            </span>
          </div>
        </div>
      ),
    }),

    columnHelper.display({
      id: "patient",
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Patient
        </div>
      ),
      cell: ({ row }) => {
        const encounter = row.original.encounter;
        const patient = encounter?.patient;
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

    columnHelper.accessor("diagnosisDate", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-center font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Diagnosis Date
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1 text-center">
          <span className="font-semibold text-slate-900 text-sm">
            {formatDate(row.original.diagnosisDate)}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("diagnosisType", {
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
          {row.original.diagnosisType}
        </Badge>
      ),
    }),

    columnHelper.accessor("diagnosisStatus", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Status
        </div>
      ),
      cell: ({ row }) => getStatusBadge(row.original.diagnosisStatus),
    }),

    columnHelper.display({
        id: "actions",
        header: () => (
          <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
            Actions
          </div>
        ),
        cell: ({ row }) => {
          const reportItem = row.original;
          return (
            <div className="flex items-center gap-2">
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
                    onClick={() => onViewDetails(reportItem.id)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
  ];

  const table = useReactTable({
    data: reportItems,
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-50 border-b-2 border-slate-200">
              {columns.map((_, index) => (
                <TableHead key={index} className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeleton rows={5} columns={columns.length} />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (reportItems.length === 0 && !isLoading && !isFetching) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 text-lg font-semibold">
            No diagnosis reports found
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`hover:bg-slate-50 transition-all duration-200 ${
                    isFetching ? "opacity-60" : "opacity-100"
                  }`}
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
              ))}
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
