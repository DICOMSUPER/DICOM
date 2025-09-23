import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

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
    <Card className={cn("border-none shadow-none", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        {icon && (
          <div className="mb-4 text-foreground">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-foreground text-center mb-4 max-w-sm">
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
  );
}
