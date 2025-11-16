"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";

import { RoomSchedule, Employee } from "@/interfaces/schedule/schedule.interface";
import { cn } from "@/lib/utils";
import { formatRole } from "@/utils/role-formatter";

interface AssignEmployeeFormProps {
  schedule?: RoomSchedule;
  employees: Employee[];
  loadingEmployees: boolean;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedEmployeeId: string;
  onSelectedEmployeeChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "PPP");
  } catch {
    return value;
  }
};

const statusBadgeClass = (status?: string) => {
  if (!status) return "bg-muted text-foreground border-border";
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "confirmed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
    case "canceled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "no_show":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};

export function AssignEmployeeForm({
  schedule,
  employees,
  loadingEmployees,
  roleFilter,
  onRoleFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  searchTerm,
  onSearchTermChange,
  selectedEmployeeId,
  onSelectedEmployeeChange,
  onSubmit,
  submitting,
}: AssignEmployeeFormProps) {
  const handleSubmit = () => {
    if (!schedule) {
      toast.error("Please select a schedule before assigning employees");
      return;
    }

    if (!selectedEmployeeId) {
      toast.warning("Pick an employee from the list to continue");
      return;
    }

    onSubmit();
  };

  if (!schedule) {
    return (
      <Card className="border-dashed border border-border">
        <CardContent className="p-6 text-center space-y-3 text-foreground">
          <ShieldQuestion className="h-10 w-10 mx-auto text-foreground/70" />
          <p className="text-sm text-foreground">
            Select a schedule on the left to view its assignments and add team
            members.
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleOptions = Array.from(
    new Set(employees.map((employee) => employee.role).filter(Boolean))
  ) as string[];
  const departmentOptions = Array.from(
    new Set(employees.map((employee) => employee.departmentId).filter(Boolean))
  ) as string[];

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-xl">Assign Employee</CardTitle>
        <p className="text-sm text-foreground">
          Add another team member to{" "}
          <span className="font-semibold text-foreground">
            {schedule.room?.roomCode ?? "a room"}
          </span>{" "}
          on {formatDate(schedule.work_date)}.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2 rounded-md border border-border p-4 bg-muted/50 text-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs uppercase text-foreground">
                Room
              </p>
              <p className="font-semibold">
                {schedule.room?.roomCode ?? "Unassigned room"}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "uppercase",
                statusBadgeClass(schedule.schedule_status)
              )}
            >
              {schedule.schedule_status}
            </Badge>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs uppercase text-foreground">
                Shift
              </p>
              <p className="font-semibold">
                {schedule.shift_template?.shift_name ?? "No shift template"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-foreground">
                Time
              </p>
              <p className="font-semibold">
                {schedule.actual_start_time ?? "--:--"} —{" "}
                {schedule.actual_end_time ?? "--:--"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Filter by role
              </p>
              <Select
                value={roleFilter}
                onValueChange={onRoleFilterChange}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role ?? "unknown"}>
                      {formatRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Filter by department
              </p>
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departmentOptions.map((departmentId) => (
                    <SelectItem key={departmentId} value={departmentId ?? "unknown"}>
                      {departmentId ?? "Unknown dept."}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Search employees
            </p>
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              disabled={loadingEmployees}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Matching employees ({employees.length})
            </p>
            {loadingEmployees && (
              <div className="flex items-center gap-2 text-xs text-foreground/80 mb-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading available employees...
              </div>
            )}
            <Select
              value={selectedEmployeeId}
              onValueChange={onSelectedEmployeeChange}
              disabled={loadingEmployees || employees.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} —{" "}
                    {formatRole(employee.role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employees.length === 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>No employees available</AlertTitle>
                <AlertDescription>
                  Try widening your filters or pick a different role/department.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={
            submitting ||
            loadingEmployees ||
            !selectedEmployeeId ||
            employees.length === 0
          }
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Employee"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

