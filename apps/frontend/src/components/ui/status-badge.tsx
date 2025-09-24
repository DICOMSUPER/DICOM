import { Badge } from "./badge";
import { CheckCircle, Clock, AlertCircle, XCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          className: "bg-green-500 text-white border-green-600 shadow-md",
          icon: CheckCircle,
          text: "ACTIVE"
        };
      case "in-progress":
      case "in_progress":
        return {
          className: "bg-blue-500 text-white border-blue-600 shadow-md",
          icon: Play,
          text: "IN PROGRESS"
        };
      case "pending":
        return {
          className: "bg-yellow-500 text-white border-yellow-600 shadow-md",
          icon: Clock,
          text: "PENDING"
        };
      case "completed":
        return {
          className: "bg-emerald-500 text-white border-emerald-600",
          icon: CheckCircle,
          text: "COMPLETED"
        };
      case "cancelled":
      case "canceled":
        return {
          className: "bg-red-500 text-white border-red-600",
          icon: XCircle,
          text: "CANCELLED"
        };
      case "urgent":
        return {
          className: "bg-red-600 text-white border-red-700 shadow-lg ring-2 ring-red-400",
          icon: AlertCircle,
          text: "URGENT"
        };
      default:
        return {
          className: "bg-gray-500 text-white border-gray-600",
          icon: Clock,
          text: status.toUpperCase()
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      className={cn(
        "font-semibold text-xs px-3 py-1 border-2 flex items-center gap-1.5",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
