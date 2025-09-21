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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Eye,
  Edit,
  Trash2,
  FileText,
  ArrowUpDown,
} from 'lucide-react';
import { Patient } from '@/interfaces/patient/patient.interface';

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient: (id: string) => void;
  onEditPatient: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onViewRecords: (id: string) => void;
}

const columnHelper = createColumnHelper<Patient>();

export function PatientsTable({
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
  onViewRecords,
}: PatientsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const calcAge = (dob: Date) => {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const columns = [
    columnHelper.display({
      id: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        const fullName = `${patient.first_name} ${patient.last_name}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {getInitials(patient.first_name, patient.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{fullName}</div>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA = `${rowA.original.first_name} ${rowA.original.last_name}`;
        const nameB = `${rowB.original.first_name} ${rowB.original.last_name}`;
        return nameA.localeCompare(nameB);
      },
    }),

    columnHelper.display({
      id: 'age_gender',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Age/Gender
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="text-gray-600">
            {calcAge(patient.date_of_birth)} • {patient.gender}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const ageA = calcAge(rowA.original.date_of_birth);
        const ageB = calcAge(rowB.original.date_of_birth);
        return ageA - ageB;
      },
    }),

    columnHelper.accessor('is_active', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        const statusLabel = patient.is_active ? 'Active' : 'Inactive';
        return (
          <Badge
            variant={patient.is_active ? 'default' : 'secondary'}
            className={
              patient.is_active
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }
          >
            {statusLabel}
          </Badge>
        );
      },
    }),

    columnHelper.accessor('created_at', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium text-xs text-gray-500 uppercase tracking-wider hover:text-gray-700"
        >
          Last Visit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="text-gray-600">
            {patient.created_at ? formatDate(new Date(patient.created_at)) : 'N/A'}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: 'condition',
      header: 'Condition',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="text-gray-600">
            {patient.medical_history_id ?? '—'}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: 'doctor',
      header: 'Doctor',
      cell: () => (
        <div className="text-gray-600">—</div>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewPatient(patient.patient_id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewRecords(patient.patient_id)}>
                <FileText className="mr-2 h-4 w-4" />
                Medical Records
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditPatient(patient.patient_id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeletePatient(patient.patient_id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: patients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No patients found</p>
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