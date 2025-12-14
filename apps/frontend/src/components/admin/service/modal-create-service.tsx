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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateServiceDto } from "@/common/interfaces/user/service.interface";
import { useGetServiceByIdQuery } from "@/store/serviceApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const serviceFormSchema = z.object({
  serviceCode: z.string().optional(),
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ModalServiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceDto) => void;
  serviceId?: string;
  isLoading?: boolean;
}

export function ModalServiceForm({
  open,
  onClose,
  onSubmit,
  serviceId,
  isLoading = false,
}: ModalServiceFormProps) {
  const { data: serviceData } = useGetServiceByIdQuery(serviceId!, {
    skip: !serviceId,
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceCode: "",
      serviceName: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (serviceData?.data && serviceId) {
      form.reset({
        serviceCode: serviceData.data.serviceCode,
        serviceName: serviceData.data.serviceName,
        description: serviceData.data.description || "",
        isActive: serviceData.data.isActive,
      });
    } else if (!serviceId) {
      form.reset({
        serviceCode: "",
        serviceName: "",
        description: "",
        isActive: true,
      });
    }
  }, [serviceData, serviceId, form]);

  const handleSubmit = (data: ServiceFormValues) => {
    onSubmit(data as CreateServiceDto);
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
              {serviceId ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {serviceId
                ? "Update the service information below"
                : "Fill in the details to create a new service"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 min-h-0 h-full px-6 py-6 overflow-y-auto">
              <div className="space-y-6">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    Basic Information
                  </div>
                  <FormField
                    control={form.control}
                    name="serviceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Service Code (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SVC-001"
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
                    name="serviceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Service Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="General Consultation" 
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter service description..."
                            className="resize-none text-foreground"
                            rows={4}
                            {...field}
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
                      <FormItem className="flex flex-row items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="text-base cursor-pointer text-foreground">Active</FormLabel>
                          <FormDescription>
                            Enable or disable this service
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : serviceId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
