import { EncounterPriorityLevel } from "@/enums/patient-workflow.enum";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "default";
    case "in-progress":
      return "secondary";
    case "scheduled":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "arrived":
      return "default";
    case "waiting":
      return "secondary";
    case "completed":
      return "outline";
    case "in-progress":
      return "default";
    default:
      return "outline";
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "confirmed":
    case "arrived":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
    case "canceled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "waiting":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "in-progress":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};

const getEncounterTypeBadgeVariant = (type: string) => {
  switch (type?.toLowerCase()) {
    case "emergency":
      return "destructive";
    case "inpatient":
      return "default";
    case "outpatient":
      return "secondary";
    default:
      return "outline";
  }
};
const getEncounterTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "emergency":
      return "destructive";
    case "inpatient":
      return "default";
    case "outpatient":
      return "secondary";
    case "virtual":
      return "outline";
    default:
      return "outline";
  }
};

const getEncounterTypeBadgeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case "emergency":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "inpatient":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "outpatient":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "follow_up":
    case "follow-up":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-muted text-foreground border-border";
  }
};
const getPriorityColor = (priority: EncounterPriorityLevel): string => {
  switch (priority) {
    case EncounterPriorityLevel.STAT:
      return "bg-red-100 text-red-800 border-red-300";
    case EncounterPriorityLevel.URGENT:
      return "bg-orange-100 text-orange-800 border-orange-300";
    case EncounterPriorityLevel.ROUTINE:
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr} at ${timeStr}`;
};

const getEncounterTypeLabel = (type: string) => {
  const labels = {
    emergency: "emergency",
    "follow-up": "follow_up",
    routine: "Routine",
    consultation: "consultation",
    outpatient: "outpatient",
    inpatient: "inpatient",
  };
  return labels[type as keyof typeof labels] || type;
};

export {
  getStatusColor,
  getStatusBadgeVariant,
  getStatusBadgeClass,
  getPriorityColor,
  getEncounterTypeBadgeVariant,
  getEncounterTypeColor,
  getEncounterTypeBadgeClass,
  formatDate,
  getEncounterTypeLabel,
};
