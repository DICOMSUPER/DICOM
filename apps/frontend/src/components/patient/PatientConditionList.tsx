"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientCondition } from "@/common/interfaces/patient/patient-condition.interface";
import {
  ClinicalStatus,
} from "@/common/enums/patient-workflow.enum";
import {
  Edit,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

interface PatientConditionListProps {
  conditions: PatientCondition[];
  onView?: (condition: PatientCondition) => void;
  onAdd?: () => void;
}

export function PatientConditionList({
  conditions,
  onView,
  onAdd,
}: PatientConditionListProps) {
  const [expandedCondition, setExpandedCondition] = useState<string | null>(
    null
  );

  const getStatusIcon = (status?: ClinicalStatus) => {
    switch (status) {
      case ClinicalStatus.ACTIVE:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case ClinicalStatus.INACTIVE:
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case ClinicalStatus.RESOLVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeClass = (status?: ClinicalStatus) => {
    switch (status) {
      case ClinicalStatus.ACTIVE:
        return "bg-red-100 text-red-700 border-red-200";
      case ClinicalStatus.INACTIVE:
        return "bg-gray-100 text-gray-700 border-gray-200";
      case ClinicalStatus.RESOLVED:
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-muted text-foreground border-border";
    }
  };


  const formatStatus = (status: string) => {
    return status
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (conditions.length === 0) {
    return (
      <div className="rounded-2xl p-6 shadow border-border border">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <AlertCircle className="h-5 w-5" />
          Medical Conditions
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Medical Conditions
          </h3>
          <p className="text-sm text-foreground text-center max-w-md">
            No medical conditions have been recorded for this patient yet. Conditions will appear here once they are added to the patient&apos;s record.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow border-border border flex flex-col gap-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <AlertCircle className="h-5 w-5" />
        Medical Conditions ({conditions.length})
      </div>
      <p className="text-sm text-foreground">
        Patient&apos;s recorded medical conditions and diagnoses
      </p>

      <div className="flex flex-col gap-3 max-h-[25vh] overflow-y-auto">
        {conditions.map((condition) => (
          <Card
            key={condition.id}
            className="border border-border hover:shadow-lg cursor-pointer hover:border-primary/60 transition-all duration-200 bg-card"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(condition.clinicalStatus)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {condition.codeDisplay || condition.code}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {condition.code}{" "}
                      {condition.codeSystem && `(${condition.codeSystem})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {condition.clinicalStatus && (
                    <Badge
                      className={`${getStatusBadgeClass(
                        condition.clinicalStatus
                      )} px-2 py-0.5 text-xs font-semibold border`}
                    >
                      {formatStatus(condition.clinicalStatus)}
                    </Badge>
                  )}

                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-border hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(condition);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1.5" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>


          </Card>
        ))}
      </div>
    </div>
  );
}
