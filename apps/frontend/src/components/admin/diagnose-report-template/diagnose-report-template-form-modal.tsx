"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useToast } from "@/common/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  useCreateReportTemplateMutation,
  useUpdateReportTemplateMutation,
} from "@/store/diagnosisReportTemplateApi";
import { useGetImagingModalityPaginatedQuery } from "@/store/imagingModalityApi";
import { useGetBodyPartsPaginatedQuery } from "@/store/bodyPartApi";
import {
  ReportTemplate,
  CreateReportTemplateDto,
} from "@/common/interfaces/patient/diagnosis-report-template.interface";

interface ReportTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  template: ReportTemplate | null;
  onSuccess: () => void;
}

const ReportTemplateFormModal = ({
  isOpen,
  onClose,
  mode,
  template,
  onSuccess,
}: ReportTemplateFormModalProps) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateReportTemplateDto>();

  const [createTemplate, { isLoading: isCreating }] =
    useCreateReportTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateReportTemplateMutation();

  const { data: modalitiesData } = useGetImagingModalityPaginatedQuery({
    page: 1,
    limit: 100,
  });

  const { data: bodyPartsData } = useGetBodyPartsPaginatedQuery({
    page: 1,
    limit: 100,
  });

  const isPublic = watch("isPublic", false);
  const templateType = watch("templateType", "custom");

  useEffect(() => {
    if (isOpen && mode === "edit" && template) {
      reset({
        templateName: template.templateName,
        templateType: template.templateType,
        modalityId: template.modalityId,
        bodyPartId: template.bodyPartId,
        isPublic: template.isPublic,
        descriptionTemplate: template.descriptionTemplate,
        technicalTemplate: template.technicalTemplate,
        findingsTemplate: template.findingsTemplate,
        conclusionTemplate: template.conclusionTemplate,
        recommendationTemplate: template.recommendationTemplate,
      });
    } else if (isOpen && mode === "create") {
      reset({
        templateName: "",
        templateType: "custom",
        modalityId: "",
        bodyPartId: "",
        isPublic: false,
        descriptionTemplate: "",
        technicalTemplate: "",
        findingsTemplate: "",
        conclusionTemplate: "",
        recommendationTemplate: "",
      });
    }
  }, [isOpen, mode, template, reset]);

  const onSubmit = async (data: CreateReportTemplateDto) => {
    try {
      if (mode === "create") {
        await createTemplate(data).unwrap();
        toast({
          title: "Success",
          description: "Report template created successfully",
        });
      } else if (template) {
        await updateTemplate({
          id: template.reportTemplatesId,
          data,
        }).unwrap();
        toast({
          title: "Success",
          description: "Report template updated successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Template" : "Edit Template"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new report template for diagnostic reports"
              : "Update the report template information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Template Name */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="templateName">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="templateName"
                {...register("templateName", {
                  required: "Template name is required",
                })}
                placeholder="e.g., CT Chest Standard Report"
              />
              {errors.templateName && (
                <p className="text-sm text-red-600">
                  {errors.templateName.message}
                </p>
              )}
            </div>

            {/* Template Type */}
            <div className="space-y-2">
              <Label htmlFor="templateType">
                Template Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={templateType}
                onValueChange={(value) => setValue("templateType", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Public */}
            <div className="space-y-2 flex items-center gap-2 pt-8">
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setValue("isPublic", checked)}
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make this template public
              </Label>
            </div>

            {/* Modality */}
            <div className="space-y-2">
              <Label htmlFor="modalityId">
                Modality <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("modalityId", value)}
                defaultValue={template?.modalityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select modality" />
                </SelectTrigger>
                <SelectContent>
                  {modalitiesData?.data?.map((modality) => (
                    <SelectItem key={modality.id} value={modality.id}>
                      {modality.modalityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.modalityId && (
                <p className="text-sm text-red-600">{errors.modalityId.message}</p>
              )}
            </div>

            {/* Body Part */}
            <div className="space-y-2">
              <Label htmlFor="bodyPartId">
                Body Part <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("bodyPartId", value)}
                defaultValue={template?.bodyPartId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {bodyPartsData?.data?.map((bodyPart) => (
                    <SelectItem key={bodyPart.id} value={bodyPart.id}>
                      {bodyPart.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bodyPartId && (
                <p className="text-sm text-red-600">{errors.bodyPartId.message}</p>
              )}
            </div>
          </div>

          {/* Text Templates */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descriptionTemplate">Description Template</Label>
              <Textarea
                id="descriptionTemplate"
                {...register("descriptionTemplate")}
                placeholder="Enter description template..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalTemplate">Technical Template</Label>
              <Textarea
                id="technicalTemplate"
                {...register("technicalTemplate")}
                placeholder="Enter technical details template..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="findingsTemplate">Findings Template</Label>
              <Textarea
                id="findingsTemplate"
                {...register("findingsTemplate")}
                placeholder="Enter findings template..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclusionTemplate">Conclusion Template</Label>
              <Textarea
                id="conclusionTemplate"
                {...register("conclusionTemplate")}
                placeholder="Enter conclusion template..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendationTemplate">
                Recommendation Template
              </Label>
              <Textarea
                id="recommendationTemplate"
                {...register("recommendationTemplate")}
                placeholder="Enter recommendation template..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Create Template" : "Update Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportTemplateFormModal;