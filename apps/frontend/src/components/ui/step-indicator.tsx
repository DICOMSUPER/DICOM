import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/common/lib/utils";

export interface Step {
  completed: boolean;
  label?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2 mb-2", className)}>
      <div className="flex items-start flex-1">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isLast = index === steps.length - 1;
          const isCompleted = step.completed;
          const previousCompleted = index > 0 ? steps[index - 1].completed : false;

          return (
            <React.Fragment key={index}>
              {/* Step Circle with Label */}
              <div className="flex flex-col items-center min-w-[60px]">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                    isCompleted
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {step.label && (
                  <span className={cn(
                    "text-xs mt-1 whitespace-nowrap text-center",
                    isCompleted ? "text-primary font-medium" : "text-foreground"
                  )}>
                    {step.label}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative self-center mt-4">
                  <div
                    className={cn(
                      "h-full transition-colors",
                      isCompleted || previousCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

