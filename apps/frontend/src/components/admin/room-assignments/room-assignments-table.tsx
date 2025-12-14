'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Building2, CalendarClock } from 'lucide-react';
import { EmployeeRoomAssignment } from '@/common/interfaces/user/employee-room-assignment.interface';
import { DataTable } from '@/components/ui/data-table';
import { ClipboardList } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatRole } from '@/common/utils/role-formatter';
import { SortConfig } from '@/components/ui/data-table';
import { formatDateTime } from '@/common/utils/format-status';

interface RoomAssignmentsTableProps {
  assignments: EmployeeRoomAssignment[];
  onEdit: (assignment: EmployeeRoomAssignment) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isLoading?: boolean;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function RoomAssignmentsTable({
  assignments,
  onEdit,
  onDelete,
  isDeleting,
  isLoading = false,
  onSort,
  initialSort,
}: RoomAssignmentsTableProps) {
  return (
    <DataTable<EmployeeRoomAssignment>
      columns={[
        {
          header: 'Employee',
          sortable: false,
          cell: (assignment) => (
            <div className="flex flex-col items-start gap-2">
              <div className="font-medium text-foreground">
                {assignment.employee?.firstName} {assignment.employee?.lastName}
              </div>
              <div className="text-xs text-foreground capitalize">
                {formatRole(assignment.employee?.role)}
              </div>
            </div>
          ),
        },
        {
          header: 'Contact',
          sortable: false,
          cell: (assignment) => (
            <p className="text-sm text-foreground">
              {assignment.employee?.email || 'No email available'}
            </p>
          ),
        },
        {
          header: 'Room',
          sortable: false,
          cell: (assignment) => (
            <div className="text-foreground">
              {assignment.roomSchedule?.room?.roomCode || '—'}
            </div>
          ),
        },
        {
          header: 'Work Date',
          sortable: true,
          sortField: 'workDate',
          cell: (assignment) => (
            <div className="text-foreground">
              {assignment.roomSchedule?.work_date
                ? format(new Date(assignment.roomSchedule.work_date), 'MM/dd/yyyy')
                : '—'}
            </div>
          ),
        },
        {
          header: 'Shift',
          sortable: false,
          cell: (assignment) => (
            <div className="text-foreground">
              {assignment.roomSchedule?.shift_template?.shift_name || '—'}
            </div>
          ),
        },
        {
          header: 'Status',
          headerClassName: 'text-center',
          sortable: false,
          cell: (assignment) => (
            <div className="flex justify-center">
              <StatusBadge status={assignment.isActive ? 'active' : 'inactive'} />
            </div>
          ),
        },
        {
          header: 'Created',
          sortable: true,
          sortField: 'createdAt',
          cell: (assignment) => (
            <div className="text-foreground text-sm">{formatDateTime(assignment.createdAt)}</div>
          ),
        },
        {
          header: 'Updated',
          sortable: true,
          sortField: 'updatedAt',
          cell: (assignment) => (
            <div className="text-foreground text-sm">{formatDateTime(assignment.updatedAt)}</div>
          ),
        },
        {
          header: 'Actions',
          headerClassName: 'text-center',
          cell: (assignment) => (
            <div className="flex justify-center gap-2 text-center">
              <Button variant="ghost" size="sm" onClick={() => onEdit(assignment)}>
                <Edit className="h-4 w-4 text-teal-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(assignment.id)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        },
      ]}
      data={assignments}
      isLoading={isLoading}
      emptyStateIcon={<ClipboardList className="h-12 w-12 text-foreground" />}
      emptyStateTitle="No assignments"
      emptyStateDescription="Create an assignment to see it listed here."
      onSort={onSort}
      initialSort={initialSort}
    />
  );
}

