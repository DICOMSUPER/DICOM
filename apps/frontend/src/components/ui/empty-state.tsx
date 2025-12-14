import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/common/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("w-full", className)}>
      <Card className="border-dashed border-2 border-border shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
          {icon && (
            <div className="mb-4 text-foreground/60">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-foreground text-center mb-6 max-w-md">
              {description}
            </p>
          )}
          {action && (
            <div className="mt-2">
              {action}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
