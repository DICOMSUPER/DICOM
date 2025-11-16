import { Department } from "@/interfaces/user/department.interface";
import { Room } from "@/interfaces/user/room.interface";
import { Services } from "@/interfaces/user/service.interface";
import React from "react";

export default function StepIndicator({
  selectedDepartment,
  selectedService,
  selectedRoom,
}: {
  selectedDepartment: Department | null;
  selectedService: Services | null;
  selectedRoom: Room | null;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            selectedDepartment
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          1
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            selectedService
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          2
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            selectedRoom
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          3
        </div>
      </div>
    </div>
  );
}
