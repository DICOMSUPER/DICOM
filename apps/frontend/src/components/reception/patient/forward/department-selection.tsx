import React from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";

import { Department } from "@/interfaces/user/department.interface";
import { Services } from "@/interfaces/user/service.interface";
import { Room } from "@/interfaces/user/room.interface";

type DepartmentOption = Department & { value: string; label: string };
export default function DepartmentSelection({
  selectedDepartment,
  setSelectedDepartment,
  departmentOptions,
  isLoadingDepartment,
  departmentSearch,
  setDepartmentSearch,
  setSelectedService,
  setSelectedRoom,
}: {
  selectedDepartment: Department | null;
  setSelectedDepartment: (department: Department | null) => void;
  departmentOptions: DepartmentOption[];
  isLoadingDepartment: boolean;
  departmentSearch: string;
  setDepartmentSearch: (search: string) => void;
  setSelectedService: (service: Services | null) => void;
  setSelectedRoom: (room: Room | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
          1
        </span>
        Select Department
      </label>
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
        isClearable
        isSearchable
      />
    </div>
  );
}
