"use client";

import React from "react";
import { AlertTriangle, User, CalendarDays, Clock, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Schedule {
  schedule_id: string;
  employee?: {
    firstName?: string;
    lastName?: string;
  };
  employeeRoomAssignments?: Array<{
    isActive?: boolean;
    employee?: {
      firstName?: string;
      lastName?: string;
    };
  }>;
  work_date?: string;
  actual_start_time?: string;
  actual_end_time?: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onOpenChange,
  schedule,
  onConfirm,
  isDeleting = false,
  title = "Delete Schedule",
  description = "Are you sure you want to delete this schedule? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
  if (!schedule) return null;

  // Helper to get employee names from room assignments
  const getEmployeeNames = (): string => {
    // First try employeeRoomAssignments
    if (schedule.employeeRoomAssignments && schedule.employeeRoomAssignments.length > 0) {
      const activeAssignments = schedule.employeeRoomAssignments
        .filter(a => a.isActive && a.employee)
        .slice(0, 2);
      
      if (activeAssignments.length > 0) {
        const names = activeAssignments
          .map(a => `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.trim())
          .filter(Boolean);
        
        const totalCount = schedule.employeeRoomAssignments.filter(a => a.isActive && a.employee).length;
        const displayNames = names.join(', ');
        
        if (totalCount > 2) {
          return `${displayNames} +${totalCount - 2}`;
        }
        return displayNames;
      }
    }
    
    // Fallback to legacy employee field
    if (schedule.employee?.firstName || schedule.employee?.lastName) {
      return `${schedule.employee.firstName || ''} ${schedule.employee.lastName || ''}`.trim();
    }
    
    return 'Unassigned';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-red-900">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-700">
            <p className="mb-4">{description}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Employee:</span>
                <span className="text-sm font-semibold text-red-800">
                  {getEmployeeNames()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Date:</span>
                <span className="text-sm font-semibold text-red-800">
                  {schedule.work_date ? 
                    format(new Date(schedule.work_date), "MMM dd, yyyy") 
                    : "N/A"}
                </span>
              </div>
              
              {schedule.actual_start_time && schedule.actual_end_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Time:</span>
                  <span className="text-sm font-semibold text-red-800">
                    {schedule.actual_start_time} - {schedule.actual_end_time}
                  </span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Schedule
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
