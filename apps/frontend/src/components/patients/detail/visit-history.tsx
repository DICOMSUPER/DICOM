'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, Download, Activity, Eye, ArrowUpDown } from 'lucide-react';
import { PatientEncounter } from '@/common/interfaces/patient/patient-workflow.interface';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatTime } from '@/common/lib/formatTimeDate';
import { useRouter } from 'next/navigation';
import { modalStyles, formatStatus } from '@/common/utils/format-status';

interface EncounterHistoryTabProps {
  encounterHistory: PatientEncounter[];
}

const columnHelper = createColumnHelper<PatientEncounter>();

export function EncounterHistoryTab({ encounterHistory }: EncounterHistoryTabProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const router = useRouter();

  const getEncounterTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      outpatient: 'bg-blue-50 text-blue-700 border-blue-200',
      inpatient: 'bg-purple-50 text-purple-700 border-purple-200',
      emergency: 'bg-red-50 text-red-700 border-red-200',
      follow_up: 'bg-green-50 text-green-700 border-green-200',
    };
    return typeColors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };


  const handleViewDetail = (id: string) => {
    router.push(`/physician/encounter/${id}`);
  }

  const columns = [
    columnHelper.accessor('encounterDate', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Encounter Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {formatDate(row.original.encounterDate)}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            {formatTime(row.original.encounterDate)}
          </div>
        </div>
      ),
    }),

    columnHelper.accessor('encounterType', {
      header: 'Encounter Type',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getEncounterTypeBadge(row.original.encounterType)}
        >
          {formatStatus(row.original.encounterType)}
        </Badge>
      ),
    }),

    columnHelper.accessor('chiefComplaint', {
      header: 'Chief Complaint',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">
            {row.original.chiefComplaint || '—'}
          </p>
        </div>
      ),
    }),


    columnHelper.accessor('symptoms', {
      header: 'Symptoms',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-600 line-clamp-2">
            {row.original.symptoms || '—'}
          </p>
        </div>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleViewDetail(row.original.id)}
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: encounterHistory || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Empty state
  if (!encounterHistory || encounterHistory.length === 0) {
    return (
      <div className={modalStyles.section}>
        <div className={modalStyles.sectionHeader}>
          <div className={modalStyles.sectionIconContainer}>
            <Activity className={modalStyles.sectionIcon} />
          </div>
          <h3 className={modalStyles.sectionTitle}>Encounter History</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-teal-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No encounters found</p>
          <p className="text-gray-400 text-sm mt-2">
            This patient has no recorded encounters yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={modalStyles.section}>
      <div className={modalStyles.sectionHeader}>
        <div className={modalStyles.sectionIconContainer}>
          <Activity className={modalStyles.sectionIcon} />
        </div>
        <h3 className={modalStyles.sectionTitle}>Encounter History</h3>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-slate-50">
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
                  className="hover:bg-slate-50 transition-colors"
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className={modalStyles.gridCard}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className={modalStyles.gridCardValue}>
                {encounterHistory.filter(e => e.encounterType === 'outpatient').length}
              </div>
              <div className="text-sm text-slate-600">Outpatient Visits</div>
            </div>
          </div>
        </div>

        <div className={modalStyles.gridCard}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className={modalStyles.gridCardValue}>
                {encounterHistory.filter(e => e.encounterType === 'inpatient').length}
              </div>
              <div className="text-sm text-slate-600">Inpatient Visits</div>
            </div>
          </div>
        </div>

        <div className={modalStyles.gridCard}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className={modalStyles.gridCardValue}>
                {encounterHistory.length}
              </div>
              <div className="text-sm text-slate-600">Total Encounters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}