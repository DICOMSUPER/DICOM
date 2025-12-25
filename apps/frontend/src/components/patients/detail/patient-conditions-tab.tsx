"use client";

import { CreatePatientConditionDto } from "@/common/interfaces/patient/patient-condition.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetConditionsByPatientIdQuery,
  useUpdateConditionMutation,
} from "@/store/patientConditionApi";
import { Edit, FileText, Plus, Stethoscope, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PatientConditionsTabProps {
  patientId: string;
}

const CLINICAL_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  // { value: "recurrent", label: "Recurrence" },
  // { value: "relapse", label: "Relapse" },
  { value: "inactive", label: "Inactive" },
  // { value: "remission", label: "Remission" },
  { value: "resolved", label: "Resolved" },
];

export function PatientConditionsTab({ patientId }: PatientConditionsTabProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<any>(null);

  const [formData, setFormData] = useState<Partial<CreatePatientConditionDto>>({
    code: "",
    codeSystem: "",
    codeDisplay: "",
    clinicalStatus: undefined,
    bodySite: "",
    notes: "",
  });

  const {
    data: conditionsData,
    isLoading,
    refetch,
  } = useGetConditionsByPatientIdQuery(patientId);
  // const [createCondition, { isLoading: isCreating }] = useCreateConditionMutation();
  const [updateCondition, { isLoading: isUpdating }] =
    useUpdateConditionMutation();
  // const [deleteCondition, { isLoading: isDeleting }] = useDeleteConditionMutation();

  const conditions = conditionsData?.data || [];

  const resetForm = () => {
    setFormData({
      code: "",
      codeSystem: "",
      codeDisplay: "",
      clinicalStatus: undefined,
      bodySite: "",
      notes: "",
    });
  };

  // const handleCreate = async () => {
  //   try {
  //     if (!formData.code || !formData.codeDisplay) {
  //       toast.error("Code and Code Display are required");
  //       return;
  //     }

  //     await createCondition({
  //       patientId,
  //       code: formData.code,
  //       codeSystem: formData.codeSystem,
  //       codeDisplay: formData.codeDisplay,
  //       clinicalStatus: formData.clinicalStatus,
  //       verificationStatus: formData.verificationStatus,
  //       severity: formData.severity,
  //       stageSummary: formData.stageSummary,
  //       bodySite: formData.bodySite,
  //       recordedDate: new Date().toISOString(),
  //       notes: formData.notes,
  //     }).unwrap();

  //     toast.success("Condition created successfully");
  //     setIsCreateDialogOpen(false);
  //     resetForm();
  //     refetch();
  //   } catch (error: any) {
  //     toast.error(error?.data?.message || "Failed to create condition");
  //   }
  // };

  const handleEdit = (condition: any) => {
    setSelectedCondition(condition);
    setFormData({
      code: condition.code,
      codeSystem: condition.codeSystem || "",
      codeDisplay: condition.codeDisplay,
      clinicalStatus: condition.clinicalStatus,
      bodySite: condition.bodySite || "",
      notes: condition.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedCondition?.id) return;

      await updateCondition({
        id: selectedCondition.id,
        data: {
          code: formData.code,
          codeSystem: formData.codeSystem,
          codeDisplay: formData.codeDisplay,
          clinicalStatus: formData.clinicalStatus,
          bodySite: formData.bodySite,
          notes: formData.notes,
        },
      }).unwrap();

      toast.success("Condition updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedCondition(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update condition");
    }
  };

  // const handleDelete = async () => {
  //   try {
  //     if (!selectedCondition?.id) return;

  //     await deleteCondition(selectedCondition.id).unwrap();
  //     toast.success("Condition deleted successfully");
  //     setIsDeleteDialogOpen(false);
  //     setSelectedCondition(null);
  //     refetch();
  //   } catch (error: any) {
  //     toast.error(error?.data?.message || "Failed to delete condition");
  //   }
  // };

  const getClinicalStatusColor = (status?: string) => {
    switch (status) {
      case "active":
      case "recurrence":
      case "relapse":
        return "bg-red-100 text-red-700 border-red-200";
      case "inactive":
      case "remission":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getVerificationStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "provisional":
      case "differential":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "unconfirmed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "refuted":
      case "entered-in-error":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Conditions
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage diagnoses and medical conditions for this patient
          </p>
        </div>
      </div>

      {conditions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No conditions recorded
            </h3>
            <p className="text-gray-600 mb-4">
              Start by adding a medical condition or diagnosis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition: any) => (
            <Card
              key={condition.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {condition.codeDisplay || condition.code}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {condition.clinicalStatus && (
                        <Badge
                          variant="outline"
                          className={getClinicalStatusColor(
                            condition.clinicalStatus
                          )}
                        >
                          {condition.clinicalStatus}
                        </Badge>
                      )}


                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Code:</span>{" "}
                        <span className="font-medium">{condition.code}</span>
                        {condition.codeSystem && (
                          <span className="text-gray-500 ml-1">
                            ({condition.codeSystem})
                          </span>
                        )}
                      </div>
                      {condition.bodySite && (
                        <div>
                          <span className="text-gray-600">Body Site:</span>{" "}
                          <span className="font-medium">
                            {condition.bodySite}
                          </span>
                        </div>
                      )}
                      {/* {condition.stageSummary && (
                        <div>
                          <span className="text-gray-600">Stage:</span>{" "}
                          <span className="font-medium">
                            {condition.stageSummary}
                          </span>
                        </div>
                      )} */}
                      <div>
                        <span className="text-gray-600">Recorded:</span>{" "}
                        <span className="font-medium">
                          {new Date(
                            condition.recordedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {condition.notes && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          {condition.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(condition)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            resetForm();
            setSelectedCondition(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Condition
            </DialogTitle>
            <DialogDescription>
              Update the condition details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicalStatus">Clinical Status</Label>
                <Select
                  value={formData.clinicalStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clinicalStatus: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLINICAL_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
{/* 
            <div className="space-y-2">
              <Label htmlFor="stageSummary">Stage Summary</Label>
              <Input
                id="stageSummary"
                value={formData.stageSummary}
                onChange={(e) =>
                  setFormData({ ...formData, stageSummary: e.target.value })
                }
                placeholder="e.g., Stage II"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes about this condition..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedCondition(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Update Condition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
