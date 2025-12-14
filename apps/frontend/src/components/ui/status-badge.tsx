import { Badge } from "@/components/ui/badge";
import {
  Clock,
  UserCheck,
  Activity,
  CheckCircle2,
  XCircle,
  LogOut,
  AlertCircle,
  CheckCircle,
  Play,
} from "lucide-react";
import { cn } from "@/common/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case "active":
        return {
          className: "bg-green-500 text-white border-green-600 shadow-md",
          icon: CheckCircle,
          text: "ACTIVE",
        };
      case "in-progress":
      case "in_progress":
        return {
          className: "bg-blue-500 text-white border-blue-600 shadow-md",
          icon: Play,
          text: "IN PROGRESS",
        };
      case "pending":
        return {
          className: "bg-yellow-500 text-white border-yellow-600 shadow-md",
          icon: Clock,
          text: "PENDING",
        };
      case "completed":
        return {
          className: "bg-emerald-500 text-white border-emerald-600",
          icon: CheckCircle,
          text: "COMPLETED",
        };
      case "cancelled":
      case "canceled":
        return {
          className: "bg-red-500 text-white border-red-600",
          icon: XCircle,
          text: "CANCELLED",
        };
      case "urgent":
        return {
          className:
            "bg-red-600 text-white border-red-700 shadow-lg ring-2 ring-red-400",
          icon: AlertCircle,
          text: "URGENT",
        };
      case "waiting":
      case "scheduled":
        return {
          className:
            "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-50",
          icon: Clock,
          text: "Waiting",
        };
      case "arrived":
      case "checked-in":
        return {
          className:
            "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-50",
          icon: UserCheck,
          text: "Arrived",
        };
      case "ongoing":
        return {
          className:
            "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-50",
          icon: Activity,
          text: "In Progress",
        };
      case "finished":
      case "done":
        return {
          className:
            "bg-green-50 text-green-700 border-green-300 hover:bg-green-50",
          icon: CheckCircle2,
          text: "Finished",
        };
      case "left":
      case "departed":
        return {
          className:
            "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100",
          icon: LogOut,
          text: "Cancelled",
        };
      default:
        return {
          className: "bg-gray-500 text-white border-gray-600",
          icon: Clock,
          text: status.toUpperCase(),
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
