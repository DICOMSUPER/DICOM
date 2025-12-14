"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/common/lib/utils";

interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorAlert({
  title = "Something went wrong",
  message,
  className,
}: ErrorAlertProps) {
  return (
    <div
      className={cn(
        "p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-4",
        className
      )}
    >
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <div>
        <p className="text-sm font-semibold text-red-600">{title}</p>
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
}

