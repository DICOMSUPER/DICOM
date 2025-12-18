'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Clock } from 'lucide-react';
import { ShiftTemplate } from '@/common/interfaces/user/shift-template.interface';
import { DataTable } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';
import { SortConfig } from '@/components/ui/data-table';

interface ShiftTemplateTableProps {
  templates: ShiftTemplate[];
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  isLoading?: boolean;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onViewDetails?: (template: ShiftTemplate) => void;
  onEditTemplate?: (template: ShiftTemplate) => void;
  onDeleteTemplate?: (template: ShiftTemplate) => void;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export const ShiftTemplateTable: React.FC<ShiftTemplateTableProps> = ({
  templates,
  getStatusBadge,
  isLoading = false,
  emptyStateIcon = <Clock className="h-12 w-12 text-foreground" />,
  emptyStateTitle = "No shift templates found",
  emptyStateDescription = "Create a shift template to see it listed here.",
  onViewDetails,
  onEditTemplate,
  onDeleteTemplate,
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}) => {

  const getShiftTypeLabel = (type?: string) => {
    if (!type) return '—';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (time?: string) => {
    if (!time) return '—';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const columns = [
    {
      header: 'Template Name',
      sortable: true,
      sortField: 'shift_name',
      cell: (template: ShiftTemplate) => (
        <div className="font-medium text-blue-600">
          {template.shift_name || '—'}
        </div>
      ),
    },
    {
      header: 'Shift Type',
      sortable: false,
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground">{getShiftTypeLabel(template.shift_type)}</div>
      ),
    },
    {
      header: 'Start Time',
      sortable: true,
      sortField: 'start_time',
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground">{formatTime(template.start_time)}</div>
      ),
    },
    {
      header: 'End Time',
      sortable: true,
      sortField: 'end_time',
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground">{formatTime(template.end_time)}</div>
      ),
    },
    {
      header: 'Break Time',
      sortable: false,
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground">
          {template.break_start_time && template.break_end_time
            ? `${formatTime(template.break_start_time)} - ${formatTime(template.break_end_time)}`
            : '—'}
        </div>
      ),
    },
    {
      header: 'Description',
      sortable: false,
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground max-w-xs truncate">{template.description || '—'}</div>
      ),
    },
    {
      header: 'Status',
      sortable: false,
      cell: (template: ShiftTemplate) => getStatusBadge(template.is_active ?? true),
    },
    {
      header: 'Created At',
      sortable: true,
      sortField: 'createdAt',
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground text-sm">{formatDateTime(template.createdAt)}</div>
      ),
    },
    {
      header: 'Updated At',
      sortable: true,
      sortField: 'updatedAt',
      cell: (template: ShiftTemplate) => (
        <div className="text-foreground text-sm">{formatDateTime(template.updatedAt)}</div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (template: ShiftTemplate) => (
        <div className="flex items-center gap-2 justify-center">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(template)}
              className="h-8 text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}
          {onEditTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTemplate(template)}
              className="h-8 text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDeleteTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteTemplate(template)}
              className="h-8 text-xs font-medium border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<ShiftTemplate>
      columns={columns}
      data={templates}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowKey={(template) => template.shift_template_id}
      page={page}
      limit={limit}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};

