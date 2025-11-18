import { Department } from "@/interfaces/user/department.interface";
import { Room } from "@/interfaces/user/room.interface";
import { Services } from "@/interfaces/user/service.interface";
import React from "react";
import { Check } from "lucide-react";

export default function StepIndicator({
  selectedDepartment,
  selectedService,
  selectedRoom,
}: {
  selectedDepartment: Department | null;
  selectedService: Services | null;
  selectedRoom: Room | null;
}) {
  const step1Completed = !!selectedDepartment;
  const step2Completed = !!selectedService;
  const step3Completed = !!selectedRoom;

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center flex-1">
        {/* Step 1 */}
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
              step1Completed
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border"
            }`}
          >
            {step1Completed ? (
              <Check className="w-4 h-4" />
            ) : (
              "1"
            )}
          </div>
        </div>

        {/* Connector Line 1 */}
        <div className="flex-1 h-0.5 mx-2 relative">
          <div
            className={`h-full transition-colors ${
              step1Completed ? "bg-primary" : "bg-border"
            }`}
          />
        </div>

        {/* Step 2 */}
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
              step2Completed
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border"
            }`}
          >
            {step2Completed ? (
              <Check className="w-4 h-4" />
            ) : (
              "2"
            )}
          </div>
        </div>

        {/* Connector Line 2 */}
        <div className="flex-1 h-0.5 mx-2 relative">
          <div
            className={`h-full transition-colors ${
              step2Completed ? "bg-primary" : "bg-border"
            }`}
          />
        </div>

        {/* Step 3 */}
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
              step3Completed
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border"
            }`}
          >
            {step3Completed ? (
              <Check className="w-4 h-4" />
            ) : (
              "3"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
