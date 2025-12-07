"use client";

import React from "react";
import { toast as showToast } from "@/components/common/Toast";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const content = (
      <div>
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
    );

    const type = variant === "destructive" ? "error" : "success";
    showToast(content, { type, durationSeconds: 4 });
  };

  return { toast };
}

