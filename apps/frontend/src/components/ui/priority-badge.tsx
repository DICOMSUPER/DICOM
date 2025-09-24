import { Badge } from "./badge";
import { AlertTriangle, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
      case "high":
        return {
          className: "bg-red-500 text-white border-red-600 shadow-lg ring-2 ring-red-300",
          icon: AlertTriangle,
          text: "HIGH PRIORITY"
        };
      case "urgent":
        return {
          className: "bg-orange-500 text-white border-orange-600 shadow-md",
          icon: Zap,
          text: "URGENT"
        };
      case "normal":
      case "medium":
        return {
          className: "bg-blue-500 text-white border-blue-600",
          icon: Clock,
          text: "NORMAL"
        };
      case "low":
        return {
          className: "bg-green-500 text-white border-green-600",
          icon: Clock,
          text: "LOW"
        };
      default:
        return {
          className: "bg-gray-500 text-white border-gray-600",
          icon: Clock,
          text: priority.toUpperCase()
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <Badge 
      className={cn(
        "font-bold text-xs px-3 py-1 border-2 flex items-center gap-1.5",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
