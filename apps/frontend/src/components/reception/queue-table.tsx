"use client";

import { ReceptionTable } from "./reception-table";
import { TableRowEnhanced, TableCellEnhanced } from "@/components/ui/table-enhanced";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle } from "lucide-react";
import { HIGH_PRIORITY_LEVELS, PriorityLevel } from "@/enums/priority.enum";

interface QueueAssignment {
  id: string;
  queueNumber: string;
  encounter: {
    patient: {
      firstName: string;
      lastName: string;
      patientCode: string;
    };
  };
  priority: string;
  roomId?: string;
  assignmentDate: Date;
}

interface QueueTableProps {
  assignments: QueueAssignment[];
  isLoading: boolean;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  onViewDetails?: (assignment: QueueAssignment) => void;
  onEditAssignment?: (assignment: QueueAssignment) => void;
  onRemoveFromQueue?: (assignment: QueueAssignment) => void;
  onStartTreatment?: (assignment: QueueAssignment) => void;
  onMarkComplete?: (assignment: QueueAssignment) => void;
  showWaitTime?: boolean;
  showCompletedTime?: boolean;
}

export function QueueTable({
  assignments,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  onViewDetails,
  onEditAssignment,
  onRemoveFromQueue,
  onStartTreatment,
  onMarkComplete,
  showWaitTime = false,
  showCompletedTime = false,
}: QueueTableProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWaitTime = (priority: string) => {
    switch (priority) {
      case 'urgent': return '5 min';
      case 'high': return '15 min';
      default: return '30 min';
    }
  };

  const headers = [
    "Queue #",
    "Patient",
    "Priority",
    "Room",
    "Assigned Time",
    showWaitTime ? "Wait Time" : showCompletedTime ? "Completed Time" : "Status",
    "Actions"
  ];

  return (
    <ReceptionTable
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
          <TableCellEnhanced className="font-medium">
            #{assignment.queueNumber}
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div>
              <div className="font-medium">
                {assignment.encounter.patient.firstName} {assignment.encounter.patient.lastName}
              </div>
              <div className="text-sm text-foreground">
                {assignment.encounter.patient.patientCode}
              </div>
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <PriorityBadge priority={assignment.priority} />
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {assignment.roomId || 'Unassigned'}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {formatTime(assignment.assignmentDate)}
            </div>
          </TableCellEnhanced>
          <TableCellEnhanced>
            <div className="text-foreground">
              {showWaitTime ? getWaitTime(assignment.priority) : 
               showCompletedTime ? formatTime(assignment.assignmentDate) : 
               assignment.priority}
            </div>
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
                {onStartTreatment && (
                  <DropdownMenuItem onClick={() => onStartTreatment(assignment)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Treatment
                  </DropdownMenuItem>
                )}
                {onMarkComplete && (
                  <DropdownMenuItem onClick={() => onMarkComplete(assignment)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                {onRemoveFromQueue && (
                  <DropdownMenuItem onClick={() => onRemoveFromQueue(assignment)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove from Queue
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCellEnhanced>
        </TableRowEnhanced>
      ))}
    </ReceptionTable>
  );
}
