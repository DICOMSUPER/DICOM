"use client";

import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ReportTemplate } from "@/common/interfaces/patient/report-template.interface";
import {
  useCreateReportTemplateMutation,
  useUpdateReportTemplateMutation,
} from "@/store/reportTemplateApi";
import { FileText } from "lucide-react";
import { TemplateType } from "@/common/enums/report-template.enum";
import { modalStyles } from "@/common/utils/format-status";

interface ReportTemplateFormModalProps {
  template: ReportTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const reportTemplateFormSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  templateType: z.nativeEnum(TemplateType),
  isPublic: z.boolean(),
  descriptionTemplate: z.string().optional(),
  technicalTemplate: z.string().optional(),
  findingsTemplate: z.string().optional(),
  conclusionTemplate: z.string().optional(),
  recommendationTemplate: z.string().optional(),
});

type ReportTemplateFormValues = z.infer<typeof reportTemplateFormSchema>;

export function ReportTemplateFormModal({
  template,
  isOpen,
  onClose,
  onSuccess,
}: ReportTemplateFormModalProps) {
  const isEdit = !!template;
  const [createTemplate] = useCreateReportTemplateMutation();
  const [updateTemplate] = useUpdateReportTemplateMutation();

  const form = useForm<ReportTemplateFormValues>({
    resolver: zodResolver(reportTemplateFormSchema),
    defaultValues: {
      templateName: "",
      templateType: TemplateType.STANDARD,
      isPublic: false,
      descriptionTemplate: "",
      technicalTemplate: "",
      findingsTemplate: "",
      conclusionTemplate: "",
      recommendationTemplate: "",
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        templateName: template.templateName || "",
        templateType: template.templateType || TemplateType.STANDARD,
        isPublic: template.isPublic ?? false,
        descriptionTemplate: template.descriptionTemplate || "",
        technicalTemplate: template.technicalTemplate || "",
        findingsTemplate: template.findingsTemplate || "",
        conclusionTemplate: template.conclusionTemplate || "",
        recommendationTemplate: template.recommendationTemplate || "",
      });
    } else {
      form.reset({
        templateName: "",
        templateType: TemplateType.STANDARD,
        isPublic: false,
        descriptionTemplate: "",
        technicalTemplate: "",
        findingsTemplate: "",
        conclusionTemplate: "",
        recommendationTemplate: "",
      });
    }
  }, [template, isOpen, form]);

  const onSubmit = async (data: ReportTemplateFormValues) => {
    try {
      if (isEdit && template) {
        await updateTemplate({
          id: template.reportTemplatesId,
          body: data,
        }).unwrap();
        toast.success("Template updated successfully");
      } else {
        await createTemplate(data).unwrap();
        toast.success("Template created successfully");
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        `Failed to ${isEdit ? "update" : "create"} template`
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={modalStyles.dialogContent}>
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            {isEdit ? "Edit Report Template" : "Create New Report Template"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                {/* Basic Information */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="templateName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Template Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Chest X-Ray Standard Report"
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="templateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">
                              Template Type *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={TemplateType.STANDARD}>
                                  Standard
                                </SelectItem>
                                <SelectItem value={TemplateType.CUSTOM}>
                                  Custom
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-end">
                            <div className="flex items-center space-x-2 h-10">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-foreground cursor-pointer">
                                Public Template
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </section>

                {/* Template Content */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <FileText className="h-5 w-5" />
                    Template Content
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="descriptionTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Description Template
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter description template..."
                              rows={3}
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="technicalTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Technical Template
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter technical details template..."
                              rows={3}
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="findingsTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Findings Template
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter findings template..."
                              rows={4}
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="conclusionTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Conclusion Template
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter conclusion template..."
                              rows={3}
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recommendationTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Recommendation Template
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter recommendation template..."
                              rows={3}
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className={modalStyles.dialogFooter}>
              <Button type="button" variant="outline" onClick={handleClose} className={modalStyles.secondaryButton}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className={modalStyles.primaryButton}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Update Template"
                    : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
