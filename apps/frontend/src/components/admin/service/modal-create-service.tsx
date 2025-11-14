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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateServiceDto } from "@/interfaces/user/service.interface";
import { useGetServiceByIdQuery } from "@/store/serviceApi";
import { useGetDepartmentsQuery } from "@/store/departmentApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const serviceFormSchema = z.object({
  serviceCode: z.string().min(1, "Service code is required"),
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  isActive: z.boolean().default(true),
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

  const { data: departmentsData } = useGetDepartmentsQuery();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceCode: "",
      serviceName: "",
      description: "",
      departmentId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (serviceData?.data && serviceId) {
      form.reset({
        serviceCode: serviceData.data.serviceCode,
        serviceName: serviceData.data.serviceName,
        description: serviceData.data.description || "",
        departmentId: serviceData.data.departmentId,
        isActive: serviceData.data.isActive,
      });
    } else if (!serviceId) {
      form.reset({
        serviceCode: "",
        serviceName: "",
        description: "",
        departmentId: "",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {serviceId ? "Edit Service" : "Add New Service"}
          </DialogTitle>
          <DialogDescription>
            {serviceId
              ? "Update the service information below"
              : "Fill in the details to create a new service"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serviceCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SVC-001"
                      {...field}
                      disabled={!!serviceId}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="General Consultation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departmentsData?.data?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Enter service description..."
                      className="resize-none"
                      {...field}
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
                    <FormDescription>
                      Enable or disable this service
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
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