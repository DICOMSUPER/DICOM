"use client";

import { DataTable } from "@/components/ui/data-table";
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

  return (
    <DataTable<QueueAssignment>
      columns={[
        {
          header: "Queue #",
          cell: (assignment) => `#${assignment.queueNumber}`,
          className: "font-medium",
        },
        {
          header: "Patient",
          cell: (assignment) => (
            <div className="flex flex-col">
              <span className="font-medium">
                {assignment.encounter.patient.firstName}{" "}
                {assignment.encounter.patient.lastName}
              </span>
              <span className="text-sm text-muted-foreground">
                ID: {assignment.encounter.patient.patientCode}
              </span>
            </div>
          ),
        },
        {
          header: "Priority",
          cell: (assignment) => (
            <PriorityBadge priority={assignment.priority as PriorityLevel} />
          ),
        },
        {
          header: "Room",
          cell: (assignment) => assignment.roomId || "Unassigned",
        },
        {
          header: "Assigned Time",
          cell: (assignment) => formatTime(assignment.assignmentDate),
        },
        {
          header: showWaitTime
            ? "Wait Time"
            : showCompletedTime
            ? "Completed Time"
            : "Status",
          cell: (assignment) => {
            if (showWaitTime) {
              return (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{getWaitTime(assignment.priority)}</span>
                </div>
              );
            }

            if (showCompletedTime) {
              return (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{formatTime(assignment.assignmentDate)}</span>
                </div>
              );
            }

            return <StatusBadge status="in-progress" />;
          },
        },
        {
          header: "Actions",
          cell: (assignment) => (
            <div className="flex justify-end gap-2">
              {onViewDetails && (
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(assignment)}>
                  <Eye className="w-4 h-4 text-teal-600" />
                </Button>
              )}
              {onEditAssignment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditAssignment(assignment)}>
                      <Edit className="w-4 h-4 mr-2 text-teal-600" />
                      Edit
                    </DropdownMenuItem>
                    {onRemoveFromQueue && (
                      <DropdownMenuItem
                        onClick={() => onRemoveFromQueue(assignment)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove from Queue
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ),
        },
      ]}
      data={assignments}
      isLoading={isLoading}
      emptyStateIcon={emptyStateIcon}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      rowClassName={(assignment) =>
        HIGH_PRIORITY_LEVELS.includes(assignment.priority?.toLowerCase() as PriorityLevel)
          ? "bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100"
          : undefined
      }
      rowKey={(assignment) => assignment.id}
    />
  );
}
