"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { RequestProcedure } from "@/interfaces/image-dicom/request-procedure.interface";
import {
  useCreateRequestProcedureMutation,
  useUpdateRequestProcedureMutation,
} from "@/store/requestProcedureAPi";
import { Building } from "lucide-react";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { useGetAllBodyPartsQuery } from "@/store/bodyPartApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Props interface
interface RequestProcedureFormModalProps {
  procedure: RequestProcedure | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestProcedureFormModal({
  procedure,
  isOpen,
  onClose,
  onSuccess,
}: RequestProcedureFormModalProps) {
  const isEdit = !!procedure;
  const [createRequestProcedure] = useCreateRequestProcedureMutation();
  const [updateRequestProcedure] = useUpdateRequestProcedureMutation();
  const { data: modalities } = useGetAllImagingModalityQuery();
  const { data: bodyParts } = useGetAllBodyPartsQuery();

  const [formData, setFormData] = useState({
    name: "",
    modalityId: "",
    bodyPartId: "",
    description: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (procedure) {
      setFormData({
        name: procedure.name || "",
        modalityId: procedure.modalityId || "",
        bodyPartId: procedure.bodyPartId || "",
        description: procedure.description || "",
        isActive: procedure.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        modalityId: "",
        bodyPartId: "",
        description: "",
        isActive: true,
      });
    }
  }, [procedure, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Procedure name is required");
      return;
    }
    if (!formData.modalityId.trim()) {
      toast.error("Modality ID is required");
      return;
    }
    if (!formData.bodyPartId.trim()) {
      toast.error("Body Part ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && procedure) {
        const payload = {
          name: formData.name,
          modalityId: formData.modalityId,
          bodyPartId: formData.bodyPartId,
          description: formData.description,
          isActive: formData.isActive,
        };
        await updateRequestProcedure({
          id: procedure.id,
          body: payload,
        }).unwrap();
        toast.success("Procedure updated successfully");
      } else {
        const payload = {
          name: formData.name,
          modalityId: formData.modalityId,
          bodyPartId: formData.bodyPartId,
          description: formData.description,
          isActive: formData.isActive,
        };
        await createRequestProcedure(payload).unwrap();
        toast.success("Procedure created successfully");
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} procedure`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Procedure" : "Create New Procedure"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {/* Basic Information */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Basic Information
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Procedure Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., CT Abdomen"
                    className="text-foreground"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="modalityId" className="text-foreground">
                      Modality *
                    </Label>
                    <Select
                      value={formData.modalityId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, modalityId: value })
                      }
                      
                    >
                      <SelectTrigger id="modalityId" className="text-foreground">
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {modalities?.data?.map((modality) => (
                          <SelectItem key={modality.id} value={modality.id}>
                            {modality.modalityName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="bodyPartId" className="text-foreground">
                      Body Part *
                    </Label>
                    <Select
                      value={formData.bodyPartId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bodyPartId: value })
                      }
                    >
                      <SelectTrigger id="bodyPartId" className="text-foreground">
                        <SelectValue placeholder="Select body part" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyParts?.data?.map((bodyPart) => (
                          <SelectItem key={bodyPart.id} value={bodyPart.id}>
                            {bodyPart.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Procedure description..."
                    rows={4}
                    className="text-foreground"
                  />
                </div>
              </div>
            </section>

            {/* Status */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Status
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label
                  htmlFor="isActive"
                  className="text-foreground cursor-pointer"
                >
                  Active
                </Label>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Update Procedure"
              : "Create Procedure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
