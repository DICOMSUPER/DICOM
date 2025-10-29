'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Thermometer } from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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

// Mock interfaces for demo
interface VitalSignsSimplified {
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

interface PatientCondition {
  code: string;
  codeDisplay?: string;
  clinicalStatus?: string;
  severity?: string;
  verificationStatus?: string;
  recordedDate?: string;
  bodySite?: string;
}

interface PatientOverview {
  recentVitalSigns: VitalSignsSimplified;
  recentConditions: PatientCondition[];
}

interface VitalSignDisplay {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  status: 'normal' | 'high' | 'low';
}

const getVitalStatus = (value: number | undefined, type: string): 'normal' | 'high' | 'low' => {
  if (value === undefined) return 'normal';
  
  switch (type) {
    case 'bpSystolic':
      return value > 140 ? 'high' : value < 90 ? 'low' : 'normal';
    case 'bpDiastolic':
      return value > 90 ? 'high' : value < 60 ? 'low' : 'normal';
    case 'heartRate':
      return value > 100 ? 'high' : value < 60 ? 'low' : 'normal';
    case 'temperature':
      return value > 37.5 ? 'high' : value < 36 ? 'low' : 'normal';
    default:
      return 'normal';
  }
};

// Transform vital signs data for display
const transformVitalSigns = (vitalSigns: VitalSignsSimplified | undefined): VitalSignDisplay[] => {
  const vitals: VitalSignDisplay[] = [
    // Blood Pressure - fixed to show systolic/diastolic in correct order
    {
      label: 'Blood Pressure',
      value: (vitalSigns?.bpSystolic && vitalSigns?.bpDiastolic) 
        ? `${vitalSigns.bpSystolic}/${vitalSigns.bpDiastolic}`
        : '_/_',
      unit: 'mmHg',
      icon: <Activity className="h-5 w-5" />,
      status: getVitalStatus(vitalSigns?.bpSystolic, 'bpSystolic'),
    },
    // Heart Rate
    {
      label: 'Heart Rate',
      value: vitalSigns?.heartRate ?? '_',
      unit: 'bpm',
      icon: <Heart className="h-5 w-5" />,
      status: getVitalStatus(vitalSigns?.heartRate, 'heartRate'),
    },
    // Temperature
    {
      label: 'Temperature',
      value: vitalSigns?.temperature ?? '_',
      unit: '°C',
      icon: <Thermometer className="h-5 w-5" />,
      status: getVitalStatus(vitalSigns?.temperature, 'temperature'),
    },
  ];
  
  return vitals;
};

const columnHelper = createColumnHelper<PatientCondition>();

function ConditionsTable({ conditions }: { conditions: PatientCondition[] }) {
  const [sorting, setSorting] = React.useState([]);

  const columns = [
    columnHelper.accessor('codeDisplay', {
      header: 'Condition',
      cell: (info) => (
        <div className="font-medium text-gray-900">
          {info.getValue() || info.row.original.code}
        </div>
      ),
    }),
    columnHelper.accessor('clinicalStatus', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge
            variant="outline"
            className={
              status === 'active'
                ? 'bg-green-50 text-green-700 border-green-200'
                : status === 'resolved'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }
          >
            {status || 'Unknown'}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('severity', {
      header: 'Severity',
      cell: (info) => {
        const severity = info.getValue();
        if (!severity) return <span className="text-gray-400">—</span>;
        return (
          <Badge
            variant="outline"
            className={
              severity === 'severe'
                ? 'bg-red-50 text-red-700 border-red-200'
                : severity === 'moderate'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }
          >
            {severity}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('recordedDate', {
      header: 'Recorded Date',
      cell: (info) => {
        const date = info.getValue();
        return (
          <span className="text-sm text-gray-600">
            {date ? new Date(date).toLocaleDateString() : '—'}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: conditions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    state: { sorting },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No conditions recorded.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function PatientSummaryTab({ overview }: { overview: PatientOverview }) {
  const vitalSignsDisplay = transformVitalSigns(overview.recentVitalSigns);

  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Overview</h2>
        <p className="text-gray-600 text-sm">Overview of patient's health status and recent activities.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Vital Signs</CardTitle>
            <Button variant="link" className="text-blue-600">
              View History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vitalSignsDisplay.map((vital) => (
              <div key={vital.label} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    vital.status === 'normal' ? 'bg-green-50 text-green-600' :
                    vital.status === 'high' ? 'bg-red-50 text-red-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {vital.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{vital.label}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {vital.value}
                      </span>
                      <span className="text-sm text-gray-600">{vital.unit}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`h-2 rounded-full ${
                    vital.status === 'normal' ? 'bg-green-200' :
                    vital.status === 'high' ? 'bg-red-200' :
                    'bg-blue-200'
                  }`}>
                    <div className={`h-full rounded-full ${
                      vital.status === 'normal' ? 'bg-green-500' :
                      vital.status === 'high' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} style={{ width: vital.status === 'normal' ? '80%' : '60%' }}></div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      vital.status === 'normal' ? 'bg-green-50 text-green-700 border-green-200' :
                      vital.status === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }
                  >
                    {vital.status.charAt(0).toUpperCase() + vital.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Conditions</CardTitle>
            <Button variant="link" className="text-blue-600">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ConditionsTable conditions={overview.recentConditions || []} />
        </CardContent>
      </Card>
    </div>
  );
}