'use client';

import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Edit,
  X,
  Phone,
  User,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { QueueStatus } from '@/enums/patient.enum';
import { QueueAssignment } from '@/interfaces/patient/queue.interface';

interface QueueTableProps {
  queueItems: QueueAssignment[];
  onStartServing: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}

const columnHelper = createColumnHelper<QueueAssignment>();

export function QueueTable({
  queueItems,
  onStartServing,
  onEdit,
  onCancel,
}: QueueTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.WAITING:
        return (
          <span className="text-blue-600 font-medium">Waiting</span>
        );
      case QueueStatus.COMPLETED:
        return (
          <span className="text-green-600 font-medium">Completed</span>
        );
      default:
        return <span className="text-gray-700 font-medium">{status}</span>;
    }
  };

  const getPriorityLevel = (level: PriorityLevel) => {
    switch (status) {
      case QueueStatus.WAITING:
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case QueueStatus.COMPLETED:
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const columns = [

    columnHelper.accessor('queue_number', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
            Queue Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.queue_number}
        </div>
      ),
    }),

    columnHelper.display({
      id: 'patient',
      header: 'Name',
      cell: ({ row }) => {
        const patient = row.original.visit.patient;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900">
                {patient.first_name} {patient.last_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{patient.gender === 'Male' ? '♂' : '♀'}</span>
              <span>{patient.insurance_number}</span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.original.visit.patient.phone;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{phone ?? '—'}</span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor('assigned_at', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <span className="font-medium text-gray-900">
            {formatDate(row.original.assigned_at)}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatTime(row.original.assigned_at)}</span>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor('visit.visit_type', {
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-gray-50">
          {row.original.visit.visit_type}
        </Badge>
      ),
    }),

    columnHelper.accessor('priority_level', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Priority Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex text-center items-center gap-2">
          {row.original.priority_level}
        </div>
      ),
    }),

    columnHelper.display({
      id: 'queue_status',
      header: 'Queue Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const queueItem = row.original;
        return (
          <div className="flex items-center gap-2">
            {queueItem.status === QueueStatus.WAITING && (
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => onStartServing(queueItem.queue_id)}
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
                <DropdownMenuItem onClick={() => onEdit(queueItem.queue_id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(queueItem.queue_id)}>
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
  });

  if (queueItems.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No queue items found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}