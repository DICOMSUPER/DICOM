"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateImagingModalityDto,
  UpdateImagingModalityDto,
} from "@/store/imagingModalityApi";
import { useGetImagingModalityByIdQuery } from "@/store/imagingModalityApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";

const imagingModalityFormSchema = z.object({
  modalityCode: z.string().min(1, "Modality code is required"),
  modalityName: z.string().min(1, "Modality name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type ImagingModalityFormValues = z.infer<typeof imagingModalityFormSchema>;

interface ImagingModalityFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateImagingModalityDto | UpdateImagingModalityDto) => void;
  modalityId?: string;
  isLoading?: boolean;
}

export function ImagingModalityFormModal({
  open,
  onClose,
  onSubmit,
  modalityId,
  isLoading = false,
}: ImagingModalityFormModalProps) {
  const { data: modalityData } = useGetImagingModalityByIdQuery(modalityId!, {
    skip: !modalityId,
  });

  const form = useForm<ImagingModalityFormValues>({
    resolver: zodResolver(imagingModalityFormSchema),
    defaultValues: {
      modalityCode: "",
      modalityName: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    
    if (modalityData?.data && modalityId) {
      form.reset({
        modalityCode: modalityData.data.modalityCode,
        modalityName: modalityData.data.modalityName,
        description: modalityData.data.description || "",
        isActive: modalityData.data.isActive,
      });
    } else if (!modalityId) {
      form.reset({
        modalityCode: "",
        modalityName: "",
        description: "",
        isActive: true,
      });
    }
  }, [open, modalityId, modalityData?.data?.id, form]);

  const handleSubmit = (data: ImagingModalityFormValues) => {
    onSubmit({
      modalityCode: data.modalityCode,
      modalityName: data.modalityName,
      description: data.description || undefined,
      isActive: data.isActive,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] max-w-[800px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle>
              {modalityId ? "Edit Imaging Modality" : "Create Imaging Modality"}
            </DialogTitle>
            <DialogDescription>
              {modalityId
                ? "Update the imaging modality information"
                : "Add a new imaging modality to the system"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 min-h-0 space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="modalityCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modality Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CT, MRI, XRAY"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modalityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modality Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Computed Tomography"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        {...field}
                        disabled={isLoading}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this imaging modality
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 border-t border-gray-100 shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : modalityId ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

