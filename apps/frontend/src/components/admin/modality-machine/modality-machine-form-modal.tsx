"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreateModalityMachineDto,
  UpdateModalityMachineDto,
  ModalityMachine,
} from "@/common/interfaces/image-dicom/modality-machine.interface";
import {
  useGetModalityMachineByIdQuery,
} from "@/store/modalityMachineApi";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MachineStatus } from "@/common/enums/machine-status.enum";
import { extractApiData } from "@/common/utils/api";
import { ImagingModality } from "@/common/interfaces/image-dicom/imaging_modality.interface";
import { Room } from "@/common/interfaces/user/room.interface";
import { Cpu } from "lucide-react";

const modalityMachineFormSchema = z.object({
  name: z.string().min(1, "Machine name is required"),
  modalityId: z.string().min(1, "Imaging modality is required"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  roomId: z.string().optional(),
  status: z.nativeEnum(MachineStatus, {
    message: "Status is required",
  }),
});

type ModalityMachineFormValues = z.infer<typeof modalityMachineFormSchema>;

interface ModalityMachineFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateModalityMachineDto | UpdateModalityMachineDto
  ) => void;
  machineId?: string;
  isLoading?: boolean;
  rooms?: Room[];
}

export function ModalityMachineFormModal({
  open,
  onClose,
  onSubmit,
  machineId,
  isLoading = false,
  rooms = [],
}: ModalityMachineFormModalProps) {
  const { data: machineData } = useGetModalityMachineByIdQuery(machineId ?? '', {
    skip: !machineId,
  });
  const { data: modalitiesData } = useGetAllImagingModalityQuery(undefined, {
    skip: !open,
    refetchOnMountOrArgChange: true,
  });

  const modalities = extractApiData<ImagingModality>(modalitiesData);

  const form = useForm<ModalityMachineFormValues>({
    resolver: zodResolver(modalityMachineFormSchema),
    defaultValues: {
      name: "",
      modalityId: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      roomId: "",
      status: MachineStatus.ACTIVE,
    },
  });

  useEffect(() => {
    if (!open) return;
    
    const machine = machineData?.data?.data ?? machineData?.data as ModalityMachine | undefined;
    if (machine && machineId) {
      form.reset({
        name: machine.name,
        modalityId: machine.modalityId,
        manufacturer: machine.manufacturer || "",
        model: machine.model || "",
        serialNumber: machine.serialNumber || "",
        roomId: machine.roomId || "",
        status: (machine.status as MachineStatus) || MachineStatus.ACTIVE,
      });
    } else if (!machineId) {
      form.reset({
        name: "",
        modalityId: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        roomId: "",
        status: MachineStatus.ACTIVE,
      });
    }
  }, [open, machineId, machineData, form]);

  const handleSubmit = (data: ModalityMachineFormValues) => {
    onSubmit({
      name: data.name,
      modalityId: data.modalityId,
      manufacturer: data.manufacturer || undefined,
      model: data.model || undefined,
      serialNumber: data.serialNumber || undefined,
      roomId: data.roomId || undefined,
      status: data.status,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isEdit = !!machineId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Modality Machine" : "Create New Modality Machine"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Cpu className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Machine Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., CT Scanner 01"
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
                      name="modalityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Imaging Modality *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select imaging modality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modalities
                                .filter((m) => m.isActive)
                                .map((modality) => (
                                  <SelectItem key={modality.id} value={modality.id}>
                                    {modality.modalityName} ({modality.modalityCode})
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
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Manufacturer</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Siemens, GE Healthcare"
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
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Model</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., SOMATOM Definition AS"
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
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Serial Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter serial number"
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Status *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={MachineStatus.ACTIVE}>
                                Active
                              </SelectItem>
                              <SelectItem value={MachineStatus.INACTIVE}>
                                Inactive
                              </SelectItem>
                              <SelectItem value={MachineStatus.MAINTENANCE}>
                                Maintenance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Cpu className="h-5 w-5" />
                    Assignment
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roomId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Assigned Room</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value === "none" ? "" : value)
                            }
                            value={field.value || "none"}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select room (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  {room.roomCode} - {room.roomType} (Floor {room.floor})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading || form.formState.isSubmitting
                  ? "Saving..."
                  : isEdit
                  ? "Update Machine"
                  : "Create Machine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

