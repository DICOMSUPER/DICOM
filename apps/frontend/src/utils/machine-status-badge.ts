import { Badge } from "@/components/ui/badge";
import { MachineStatus } from "@/enums/machine-status.enum";

export const getMachineStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    [MachineStatus.ACTIVE]: { label: "Active", variant: "default" },
    [MachineStatus.INACTIVE]: { label: "Inactive", variant: "secondary" },
    [MachineStatus.MAINTENANCE]: { label: "Maintenance", variant: "destructive" },
  };

  const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };

  return (
    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  );
};

export const getMachineStatusBadgeSimple = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    [MachineStatus.ACTIVE]: { label: "Active", className: "bg-green-100 text-green-800" },
    [MachineStatus.INACTIVE]: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
    [MachineStatus.MAINTENANCE]: { label: "Maintenance", className: "bg-yellow-100 text-yellow-800" },
  };

  const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
};

