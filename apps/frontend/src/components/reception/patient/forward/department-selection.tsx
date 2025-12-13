import React from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";
import { AlertCircle, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Department } from "@/interfaces/user/department.interface";
import { Services } from "@/interfaces/user/service.interface";
import { Room } from "@/interfaces/user/room.interface";

type DepartmentOption = Department & { value: string; label: string };

export default function DepartmentSelection({
  selectedDepartment,
  setSelectedDepartment,
  departmentOptions,
  isLoadingDepartment,
  isError,
  departmentSearch,
  setDepartmentSearch,
  setSelectedService,
  setSelectedRoom,
}: {
  selectedDepartment: Department | null;
  setSelectedDepartment: (department: Department | null) => void;
  departmentOptions: DepartmentOption[];
  isLoadingDepartment: boolean;
  isError?: boolean;
  departmentSearch: string;
  setDepartmentSearch: (search: string) => void;
  setSelectedService: (service: Services | null) => void;
  setSelectedRoom: (room: Room | null) => void;
}) {
  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "44px",
    }),
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
          1
        </span>
        Select Department
      </label>

      {/* Error State */}
      {isError && !isLoadingDepartment && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load departments. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoadingDepartment && (
        <div className="flex items-center gap-2 text-foreground text-sm p-4 border border-border rounded-lg bg-muted/50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Loading departments...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingDepartment && !isError && departmentOptions.length === 0 && (
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            No departments available. Please contact an administrator.
          </AlertDescription>
        </Alert>
      )}

      {/* Select Component */}
      {!isLoadingDepartment && !isError && departmentOptions.length > 0 && (
        <Select
          className="basic-single"
          classNamePrefix="select"
          value={
            selectedDepartment
              ? ({
                  value: selectedDepartment.id,
                  label: selectedDepartment.departmentName,
                  ...selectedDepartment,
                } as DepartmentOption)
              : null
          }
          onChange={(selectedOption: SingleValue<DepartmentOption>) => {
            setSelectedDepartment(
              selectedOption ? ({ ...selectedOption } as Department) : null
            );
            setSelectedService(null);
            setSelectedRoom(null);
          }}
          onInputChange={(inputValue) => {
            setDepartmentSearch(inputValue);
          }}
          isLoading={isLoadingDepartment}
          options={departmentOptions}
          placeholder="Search and select department..."
          noOptionsMessage={() => "No departments found"}
          isClearable
          isSearchable
          styles={customStyles}
        />
      )}
    </div>
  );
}
