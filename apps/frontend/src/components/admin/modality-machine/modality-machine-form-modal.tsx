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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateModalityMachineDto,
  UpdateModalityMachineDto,
} from "@/interfaces/image-dicom/modality-machine.interface";
import {
  useGetModalityMachineByIdQuery,
  useGetAllModalityMachineQuery,
} from "@/store/modalityMachineApi";
import { useGetAllImagingModalityQuery } from "@/store/imagingModalityApi";
import { useGetRoomsQuery } from "@/store/roomsApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MachineStatus } from "@/enums/machine-status.enum";
import { extractApiData } from "@/utils/api";

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
}

export function ModalityMachineFormModal({
  open,
  onClose,
  onSubmit,
  machineId,
  isLoading = false,
}: ModalityMachineFormModalProps) {
  const { data: machineData } = useGetModalityMachineByIdQuery(machineId!, {
    skip: !machineId,
  });
  const { data: modalitiesData } = useGetAllImagingModalityQuery();
  const { data: roomsData } = useGetRoomsQuery({ page: 1, limit: 10000 });

  const modalities = extractApiData(modalitiesData);
  const rooms = roomsData?.data || [];

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
    
    if (machineData?.data && machineId) {
      form.reset({
        name: machineData.data.name,
        modalityId: machineData.data.modalityId,
        manufacturer: machineData.data.manufacturer || "",
        model: machineData.data.model || "",
        serialNumber: machineData.data.serialNumber || "",
        roomId: machineData.data.roomId || "",
        status: (machineData.data.status as MachineStatus) || MachineStatus.ACTIVE,
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
  }, [open, machineId, machineData?.data?.id, form]);

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] max-w-[900px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <div>
            <DialogTitle>
              {machineId ? "Edit Modality Machine" : "Create Modality Machine"}
            </DialogTitle>
            <DialogDescription>
              {machineId
                ? "Update the modality machine information"
                : "Add a new modality machine to the system"}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CT Scanner 01"
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
                    <FormLabel>Imaging Modality</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Siemens, GE Healthcare"
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
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SOMATOM Definition AS"
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
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter serial number"
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
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Room</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? "" : value)
                      }
                      value={field.value || "none"}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
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
            {isLoading ? "Saving..." : machineId ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

