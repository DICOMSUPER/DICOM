"use client";

import * as React from "react";
import { cn } from "@/common/lib/utils";

interface ChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type?: "bar" | "line" | "pie";
  className?: string;
}

export function Chart({ data, type = "bar", className }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  if (type === "bar") {
    return (
      <div className={cn("space-y-2", className)}>
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{item.label}</span>
              <span className="text-foreground">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  item.color || "bg-blue-500"
                )}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "line") {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className={cn("relative h-32", className)}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            className="text-blue-500"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="currentColor"
                className="text-blue-500"
              />
            );
          })}
        </svg>
      </div>
    );
  }

  if (type === "pie") {
    let cumulativePercentage = 0;
    const radius = 40;
    const centerX = 50;
    const centerY = 50;

    return (
      <div className={cn("relative h-32", className)}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          {data.map((item, index) => {
            const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            cumulativePercentage += percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || `hsl(${index * 120}, 70%, 50%)`}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {data.reduce((sum, d) => sum + d.value, 0)}
            </div>
            <div className="text-xs text-foreground">Total</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
