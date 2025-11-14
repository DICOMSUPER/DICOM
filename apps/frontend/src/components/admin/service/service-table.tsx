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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Services } from "@/interfaces/user/service.interface";
import { formatDate } from "@/lib/formatTimeDate";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye, MoreHorizontal, User } from "lucide-react";
import React from "react";

interface ServiceTableProps {
  serviceItems: Services[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isFetching: boolean;
}

const columnHelper = createColumnHelper<Services>();

export function ServiceTable({
  serviceItems,
  onViewDetails,
  onDelete,
  onEdit,
  pagination,
  onPageChange,
  isLoading,
  isFetching,
}: ServiceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
    }
  };
  const columns = [
    columnHelper.accessor("serviceCode", {
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
          {row.original.serviceCode}
        </div>
      ),
    }),

    columnHelper.accessor("serviceName", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Service Name
        </div>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {row.original.serviceName}
            </span>
          </div>
        </div>
      ),
    }),
    // description column
    columnHelper.accessor("description", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Description
        </div>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <span className="text-slate-700 text-sm">
            {row.original.description || "-"}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-center font-semibold text-xs text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          Created At
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1 text-center">
          <span className="font-semibold text-slate-900 text-sm">
            {formatDate(row.original.createdAt)}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("isActive", {
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Status
        </div>
      ),
      cell: ({ row }) => getStatusBadge(row.original.isActive),
    }),

    columnHelper.display({
      id: "actions",
      header: () => (
        <div className="font-semibold text-xs text-slate-600 uppercase tracking-widest">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const serviceItem = row.original;
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
                  onClick={() => onViewDetails(serviceItem.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  onClick={() => onEdit(serviceItem.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(serviceItem.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Delete Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: serviceItems,
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

  if (serviceItems.length === 0 && !isLoading && !isFetching) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 text-lg font-semibold">
            No services found
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
