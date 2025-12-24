"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreatePatientConditionDto,
  UpdatePatientConditionDto,
  PatientCondition,
} from "@/common/interfaces/patient/patient-condition.interface";
import {
  ClinicalStatus,
  ConditionVerificationStatus,
} from "@/common/enums/patient-workflow.enum";
import { Plus, X, Save, Edit } from "lucide-react";

interface PatientConditionFormProps {
  patientId: string;
  conditions?: PatientCondition[];
  onSave: (conditions: CreatePatientConditionDto[]) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function PatientConditionForm({
  patientId,
  conditions = [],
  onSave,
  onCancel,
  isEditing = false,
}: PatientConditionFormProps) {
  const [formConditions, setFormConditions] = useState<
    CreatePatientConditionDto[]
  >(
    conditions.map((condition) => ({
      patientId: condition.patientId,
      code: condition.code,
      codeSystem: condition.codeSystem,
      codeDisplay: condition.codeDisplay,
      clinicalStatus: condition.clinicalStatus,
      verificationStatus: condition.verificationStatus,
      severity: condition.severity,
      stageSummary: condition.stageSummary,
      bodySite: condition.bodySite,
      recordedDate: condition.recordedDate.toISOString().split("T")[0],
      notes: condition.notes,
    }))
  );

  const addCondition = () => {
    setFormConditions((prev) => [
      ...prev,
      {
        patientId,
        code: "",
        codeSystem: "",
        codeDisplay: "",
        clinicalStatus: undefined,
        verificationStatus: undefined,
        severity: "",
        stageSummary: "",
        bodySite: "",
        recordedDate: new Date().toISOString().split("T")[0],
        notes: "",
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setFormConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof CreatePatientConditionDto,
    value: any
  ) => {
    setFormConditions((prev) =>
      prev.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      )
    );
  };

  const handleSave = () => {
    const validConditions = formConditions.filter(
      (condition) => condition.code.trim() !== ""
    );
    onSave(validConditions);
  };

  const getStatusBadgeVariant = (status?: ClinicalStatus) => {
    switch (status) {
      case ClinicalStatus.ACTIVE:
        return "default";
      case ClinicalStatus.INACTIVE:
        return "secondary";
      case ClinicalStatus.RECURRENT:
        return "destructive";
      case ClinicalStatus.REMISSION:
        return "outline";
      case ClinicalStatus.RESOLVED:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Patient Conditions
            </CardTitle>
            <CardDescription>
              Manage patient medical conditions and diagnoses
            </CardDescription>
          </div>
          <Button onClick={addCondition} size="sm">
            <Plus className="w-4 h-4" />
            Add Condition
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {formConditions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg font-medium mb-2">No conditions added</div>
            <div className="text-sm">
              Click "Add Condition" to add medical conditions
            </div>
          </div>
        ) : (
          formConditions.map((condition, index) => (
            <Card key={index} className="border border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Condition {index + 1}</Badge>
                    {condition.clinicalStatus && (
                      <Badge
                        variant={getStatusBadgeVariant(
                          condition.clinicalStatus
                        )}
                      >
                        {condition.clinicalStatus}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Condition Code *
                    </label>
                    <Input
                      placeholder="e.g., I10, E11.9"
                      value={condition.code}
                      onChange={(e) =>
                        updateCondition(index, "code", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Code System
                    </label>
                    <Input
                      placeholder="e.g., ICD-10, SNOMED"
                      value={condition.codeSystem || ""}
                      onChange={(e) =>
                        updateCondition(index, "codeSystem", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Display Name
                    </label>
                    <Input
                      placeholder="e.g., Essential hypertension"
                      value={condition.codeDisplay || ""}
                      onChange={(e) =>
                        updateCondition(index, "codeDisplay", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Clinical Status
                    </label>
                    <Select
                      value={condition.clinicalStatus || "no-status"}
                      onValueChange={(value) =>
                        updateCondition(
                          index,
                          "clinicalStatus",
                          value === "no-status" ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="border-border">
                        <SelectItem value="no-status">No status</SelectItem>
                        {Object.values(ClinicalStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status?.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Verification Status
                    </label>
                    <Select
                      value={condition.verificationStatus || "no-verification"}
                      onValueChange={(value) =>
                        updateCondition(
                          index,
                          "verificationStatus",
                          value === "no-verification" ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification" />
                      </SelectTrigger>
                      <SelectContent className="border-border">
                        <SelectItem value="no-verification">
                          No verification
                        </SelectItem>
                        {Object.values(ConditionVerificationStatus).map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1).replace("-", " ")}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Severity
                    </label>
                    <Input
                      placeholder="e.g., Mild, Moderate, Severe"
                      value={condition.severity || ""}
                      onChange={(e) =>
                        updateCondition(index, "severity", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Stage Summary
                    </label>
                    <Input
                      placeholder="e.g., Stage 1, Early stage"
                      value={condition.stageSummary || ""}
                      onChange={(e) =>
                        updateCondition(index, "stageSummary", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Body Site
                    </label>
                    <Input
                      placeholder="e.g., Left arm, Chest"
                      value={condition.bodySite || ""}
                      onChange={(e) =>
                        updateCondition(index, "bodySite", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Recorded Date
                    </label>
                    <Input
                      type="date"
                      value={condition.recordedDate || ""}
                      onChange={(e) =>
                        updateCondition(index, "recordedDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Additional notes about this condition..."
                    value={condition.notes || ""}
                    onChange={(e) =>
                      updateCondition(index, "notes", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            {isEditing ? "Update Conditions" : "Save Conditions"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
