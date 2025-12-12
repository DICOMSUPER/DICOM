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
      <DialogContent className="w-[50vw] max-w-[700px] sm:max-w-[50vw] h-auto max-h-[85vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle className="text-xl font-semibold">
              {modalityId ? "Edit Imaging Modality" : "Create Imaging Modality"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {modalityId
                ? "Update the imaging modality information"
                : "Add a new imaging modality to the system"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-6 pr-4 py-6">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    Basic Information
                  </div>
                  <FormField
                    control={form.control}
                    name="modalityCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Modality Code *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., CT, MRI, XRAY"
                            className="text-foreground"
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
                        <FormLabel className="text-foreground">Modality Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Computed Tomography"
                            className="text-foreground"
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
                        <FormLabel className="text-foreground">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description"
                            className="text-foreground"
                            {...field}
                            disabled={isLoading}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    Status
                  </div>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="text-foreground cursor-pointer">
                          Active
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : modalityId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

