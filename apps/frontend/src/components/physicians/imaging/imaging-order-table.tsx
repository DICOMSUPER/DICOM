"use client";

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
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  MoreHorizontal,
  User,
  Zap,
} from "lucide-react";
import React from "react";

import Pagination, {
  type PaginationMeta,
} from "@/components/common/PaginationV1";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  IImagingOrderForm,
  OrderFormStatus,
} from "@/interfaces/image-dicom/imaging-order-form.interface";
import { formatDate, formatTime } from "@/lib/formatTimeDate";

interface ImagingOrderFormTableProps {
  imagingOrderForm: IImagingOrderForm[];
  onViewDetails: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isUpdating: boolean;
  isLoading: boolean;
}

const columnHelper = createColumnHelper<IImagingOrderForm>();

export function ImagingOrderFormTable({
  imagingOrderForm,
  onViewDetails,
  pagination,
  onPageChange,
  isUpdating,
  isLoading,
}: ImagingOrderFormTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getStatusBadge = (status: OrderFormStatus) => {
    switch (status) {
      case OrderFormStatus.IN_PROGRESS:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">
              In Progress
            </span>
          </div>
        );
      case OrderFormStatus.COMPLETED:
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Completed
            </span>
          </div>
        );
      case OrderFormStatus.CANCELLED:
        return (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Cancelled
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

  const columns = [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Order ID
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-base ml-6 text-slate-900 ">
          {row.original.id.slice(-6).toUpperCase()}
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
        const patient = row.original.patient;
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

    columnHelper.accessor("notes", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Notes
        </div>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
        >
         {(row.original.notes?.trim() || "—")}
        </Badge>
      ),
    }),

    columnHelper.display({
      id: "orderFormStatus",
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Status
        </div>
      ),
      cell: ({ row }) => getStatusBadge(row.original.orderFormStatus),
    }),

    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-center font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Create Date
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
         cell: ({ row }) => (
           <div className="space-y-1 ml-6 ">
             <span className="font-semibold text-slate-900 text-sm">
               {formatDate(row.original.createdAt)}
             </span>
             <div className="flex items-center gap-4 text-xs text-slate-500">
               <Clock className="w-3.5 h-3.5" />
               <span>{formatTime(row.original.createdAt)}</span>
             </div>
           </div>
          ),
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: imagingOrderForm,
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

  if (imagingOrderForm.length === 0) {
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
                  <TableRow key={row.id}>
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
