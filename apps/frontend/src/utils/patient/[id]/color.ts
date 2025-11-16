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
  getPriorityColor,
  getEncounterTypeBadgeVariant,
  getEncounterTypeColor,
  formatDate,
  getEncounterTypeLabel,
};
