"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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
  Edit,
  X,
  Phone,
  User,
  Clock,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import {
  QueuePriorityLevel,
  QueueStatus,
} from "@/enums/patient.enum";

import { formatDate, formatTime } from "@/lib/formatTimeDate";
import { QueueAssignment } from "@/interfaces/patient/queue-assignment.interface";
import Pagination, { PaginationMeta } from "@/components/common/PaginationV1";

interface QueueTableProps {
  queueItems: QueueAssignment[];
  onStartServing: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const columnHelper = createColumnHelper<QueueAssignment>();

export function QueueTable({
  queueItems,
  onStartServing,
  onEdit,
  onCancel,
  onViewDetails,
  pagination,
  onPageChange,
}: QueueTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.WAITING:
        return <span className="text-blue-600 font-medium">Waiting</span>;
      case QueueStatus.COMPLETED:
        return <span className="text-green-600 font-medium">Completed</span>;
      default:
        return <span className="text-gray-700 font-medium">{status}</span>;
    }
  };

  const getPriorityLevel = (level: QueuePriorityLevel) => {
    switch (level) {
      case QueuePriorityLevel.ROUTINE:
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-700">Routine</span>
          </div>
        );
      case QueuePriorityLevel.URGENT:
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-700">Urgent</span>
          </div>
        );
      case QueuePriorityLevel.STAT:
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-700">Stat</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-xs text-gray-700">Unknown</span>
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
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Queue Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-center text-gray-900">
          {row.original.queueNumber}
        </div>
      ),
    }),

    columnHelper.display({
      id: "patient",
        header: () => (
    <div className="text-center w-full">Name</div>
  ),
      cell: ({ row }) => {
        const patient = row.original.encounter.patient;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">  
              <span className="font-medium text-gray-900">
                {patient?.firstName} {patient?.lastName}
              </span>
            </div>
            {/* <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{patient.gender === "Male" ? "♂" : "♀"}</span>
              <span>{patient.insuranceNumber}</span>
            </div> */}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "phone",
      header: () => (<div className="text-center w-full">Phone</div>),
      cell: ({ row }) => {
        const phone = row.original.encounter.patient?.phoneNumber;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{phone ?? "—"}</span>
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
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <span className="font-medium text-gray-900">
            {formatDate(row.original.assignmentDate)}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatTime(row.original.assignmentDate)}</span>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("encounter.encounterType", {
      header: "Encounter Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-gray-50">
          {row.original.encounter.encounterType}
        </Badge>
      ),
    }),

    columnHelper.accessor("priority", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Priority Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex text-center items-center gap-2">
          {getPriorityLevel(row?.original?.priority)}
        </div>
      ),
    }),

    columnHelper.display({
      id: "queue_status",
      header:() => (<div className="text-center w-full">Status</div>),
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.display({
      id: "actions",
      header: () => (<div className="text-center w-full">Actions</div>),
      cell: ({ row }) => {
        const queueItem = row.original;
        return (
          <div className="flex items-center gap-2">
            {queueItem.status === QueueStatus.WAITING && (
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => onStartServing(queueItem.id)}
              >
                Start Serving
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(queueItem.encounterId)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(queueItem.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(queueItem.id)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
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

  // ✅ Empty state
  if (queueItems.length === 0 ) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No queue items found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50">
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
                  className="hover:bg-gray-50 transition-colors"
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
        // onLimitChange={onLimitChange}
        // itemName="appointments"
        // limitOptions={[5, 10, 20, 50]}
        showInfo={true}
        // showLimitSelector={true}
      />
    </div>
  );
}
