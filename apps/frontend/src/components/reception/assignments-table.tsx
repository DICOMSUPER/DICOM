"use client";

import { DataTable } from "@/components/ui/data-table";
import { TableRowEnhanced, TableCellEnhanced } from "@/components/ui/table-enhanced";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { HIGH_PRIORITY_LEVELS, PriorityLevel } from "@/common/enums/priority.enum";
import { getEncounterStatusBadge } from "@/common/utils/status-badge";

interface Assignment {
  id: string;
  patient: {
    firstName: string;
    lastName: string;
    patientCode: string;
    phoneNumber: string;
  };
  physician: {
    firstName: string;
    lastName: string;
    specialty: string;
  };
  room: {
    name: string;
    floor: string;
  };
  priority: string;
  assignmentDate: Date;
  status: string;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (assignment: Assignment) => void;
  onEditAssignment?: (assignment: Assignment) => void;
  onRemoveAssignment?: (assignment: Assignment) => void;
  onMarkComplete?: (assignment: Assignment) => void;
}

export function AssignmentsTable({
  assignments,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  onViewDetails,
  onEditAssignment,
  onRemoveAssignment,
  onMarkComplete,
}: AssignmentsTableProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const headers = [
    "Patient",
    "Physician",
    "Room",
    "Priority",
    "Assigned Time",
    "Status",
    "Actions"
  ];

  return (
    <DataTable
      headers={headers}
      isLoading={isLoading}
      isEmpty={assignments.length === 0}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    >
      {assignments.map((assignment) => (
        <TableRowEnhanced 
          key={assignment.id}
          className={HIGH_PRIORITY_LEVELS.includes(assignment.priority?.toLowerCase() as PriorityLevel) ? 'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100' : ''}
        >
          <TableCellEnhanced>
            <div>
              <div className="font-medium">
                {assignment.patient.firstName} {assignment.patient.lastName}
              </div>
              <div className="text-sm text-foreground">
                {assignment.patient.patientCode} • {assignment.patient.phoneNumber}
              </div>
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div>
              <div className="font-medium">
                {assignment.physician.firstName} {assignment.physician.lastName}
              </div>
              <div className="text-sm text-foreground">
                {assignment.physician.specialty}
              </div>
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div>
              <div className="font-medium">{assignment.room.name}</div>
              <div className="text-sm text-foreground">
                {assignment.room.floor}
              </div>
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <PriorityBadge priority={assignment.priority} />
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {formatTime(assignment.assignmentDate)}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            {getEncounterStatusBadge(assignment.status)}
          </TableCellEnhanced>
          <TableCellEnhanced isLast>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(assignment)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEditAssignment && (
                  <DropdownMenuItem onClick={() => onEditAssignment(assignment)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Assignment
                  </DropdownMenuItem>
                )}
                {onMarkComplete && (
                  <DropdownMenuItem onClick={() => onMarkComplete(assignment)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                {onRemoveAssignment && (
                  <DropdownMenuItem onClick={() => onRemoveAssignment(assignment)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Assignment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCellEnhanced>
        </TableRowEnhanced>
      ))}
    </DataTable>
  );
}
