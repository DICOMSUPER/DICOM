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
import { PatientCondition } from "@/interfaces/patient/patient-condition.interface";
import {
  ClinicalStatus,
  ConditionVerificationStatus,
} from "@/enums/patient-workflow.enum";
import {
  Edit,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../ui/button";

interface PatientConditionListProps {
  conditions: PatientCondition[];
  onEdit?: (condition: PatientCondition) => void;
  onAdd?: () => void;
  canEdit?: boolean;
}

export function PatientConditionList({
  conditions,
  onEdit,
  onAdd,
  canEdit = false,
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

  const getStatusBadgeVariant = (status?: ClinicalStatus) => {
    switch (status) {
      case ClinicalStatus.ACTIVE:
        return "destructive";
      case ClinicalStatus.INACTIVE:
        return "secondary";
      case ClinicalStatus.RECURRENCE:
        return "destructive";
      case ClinicalStatus.REMISSION:
        return "outline";
      case ClinicalStatus.RESOLVED:
        return "default";
      default:
        return "outline";
    }
  };

  const getVerificationBadgeVariant = (
    status?: ConditionVerificationStatus
  ) => {
    switch (status) {
      case ConditionVerificationStatus.CONFIRMED:
        return "default";
      case ConditionVerificationStatus.PROVISIONAL:
        return "secondary";
      case ConditionVerificationStatus.DIFFERENTIAL:
        return "outline";
      case ConditionVerificationStatus.UNCONFIRMED:
        return "destructive";
      case ConditionVerificationStatus.REFUTED:
        return "destructive";
      case ConditionVerificationStatus.ENTERED_IN_ERROR:
        return "destructive";
      default:
        return "outline";
    }
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
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Medical Conditions
          </CardTitle>
          <CardDescription>
            No medical conditions recorded for this patient
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Medical Conditions ({conditions.length})
            </CardTitle>
            <CardDescription>
              Patient&quot; recorded medical conditions and diagnoses
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className=" h-[25vh] overflow-y-auto">
          {conditions.map((condition) => (
            <Card
              key={condition.id}
              className="border border-border hover:shadow-sm transition-shadow"
            >
              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() =>
                  setExpandedCondition(
                    expandedCondition === condition.id ? null : condition.id
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(condition.clinicalStatus)}
                    <div>
                      <h4 className="font-medium text-foreground">
                        {condition.codeDisplay || condition.code}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {condition.code}{" "}
                        {condition.codeSystem && `(${condition.codeSystem})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {condition.clinicalStatus && (
                      <Badge
                        variant={getStatusBadgeVariant(
                          condition.clinicalStatus
                        )}
                      >
                        {condition.clinicalStatus}
                      </Badge>
                    )}
                    {condition.verificationStatus && (
                      <Badge
                        variant={getVerificationBadgeVariant(
                          condition.verificationStatus
                        )}
                      >
                        {condition.verificationStatus.replace("-", " ")}
                      </Badge>
                    )}
                    {canEdit && onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(condition);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedCondition === condition.id && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {(condition.severity ||
                      condition.stageSummary ||
                      condition.bodySite) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {condition.severity && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">
                              Severity:
                            </span>
                            <p className="text-sm text-foreground">
                              {condition.severity}
                            </p>
                          </div>
                        )}
                        {condition.stageSummary && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">
                              Stage:
                            </span>
                            <p className="text-sm text-foreground">
                              {condition.stageSummary}
                            </p>
                          </div>
                        )}
                        {condition.bodySite && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-foreground">
                              {condition.bodySite}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Recorded: {formatDate(condition.recordedDate)}
                      </span>
                    </div>

                    {condition.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Notes:
                        </span>
                        <p className="text-sm text-foreground mt-1">
                          {condition.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
