"use client";

import { useEffect, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Department } from "@/common/interfaces/user/department.interface";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/store/departmentApi";
import { useGetRoomsQuery, useUpdateRoomMutation } from "@/store/roomsApi";
import { Building } from "lucide-react";

interface DepartmentFormModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const departmentFormSchema = z.object({
  code: z.string().min(1, "Department code is required"),
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
  roomIds: z.array(z.string()).optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export function DepartmentFormModal({
  department,
  isOpen,
  onClose,
  onSuccess,
}: DepartmentFormModalProps) {
  const isEdit = !!department;
  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const { data: roomsData } = useGetRoomsQuery({
    page: 1,
    limit: 1000,
    includeInactive: true,
  });
  const rooms = useMemo(() => roomsData?.data ?? [], [roomsData?.data]);
  const currentDepartmentId = department?.id;

  const availableRooms = useMemo(() => {
    return rooms.filter(
      (room) => !room.departmentId || room.departmentId === currentDepartmentId
    );
  }, [rooms, currentDepartmentId]);

  const initiallySelectedRoomIds = useMemo(() => {
    if (!currentDepartmentId) return [];
    return rooms
      .filter((room) => room.departmentId === currentDepartmentId)
      .map((r) => r.id);
  }, [rooms, currentDepartmentId]);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      isActive: true,
      roomIds: [],
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        code: department.departmentCode || "",
        name: department.departmentName || "",
        description: department.description || "",
        isActive: department.isActive ?? true,
        roomIds: initiallySelectedRoomIds,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        description: "",
        isActive: true,
        roomIds: [],
      });
    }
  }, [department, isOpen, form, initiallySelectedRoomIds]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const desiredRoomIds = data.roomIds || [];
      const existingRoomIds = rooms
        .filter((room) => room.departmentId === department?.id)
        .map((r) => r.id);

      if (isEdit && department) {
        const payload = {
          code: data.code,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        };
        await updateDepartment({ id: department.id, data: payload }).unwrap();

        const toAssign = desiredRoomIds.filter(
          (id) => !existingRoomIds.includes(id)
        );
        const toUnassign = existingRoomIds.filter(
          (id) => !desiredRoomIds.includes(id)
        );

        await Promise.all([
          ...toAssign.map((id) =>
            updateRoom({ id, data: { department: department.id } }).unwrap()
          ),
          ...toUnassign.map((id) =>
            updateRoom({ id, data: { department: null as any } }).unwrap()
          ),
        ]);
        toast.success("Department updated successfully");
      } else {
        const payload = {
          code: data.code,
          name: data.name,
          description: data.description,
        };
        const created = await createDepartment(payload).unwrap();
        const newDepartmentId =
          (created as any)?.id || (created as any)?.data?.id;
        if (newDepartmentId && desiredRoomIds.length > 0) {
          await Promise.all(
            desiredRoomIds.map((id) =>
              updateRoom({ id, data: { department: newDepartmentId } }).unwrap()
            )
          );
        }
        toast.success("Department created successfully");
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} department`
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Department" : "Create New Department"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Department Code *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., DEP001"
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Department Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Cardiology"
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
                          <FormLabel className="text-foreground">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Department description..."
                              rows={4}
                              className="text-foreground"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-foreground cursor-pointer">
                          Active
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building className="h-5 w-5" />
                    Rooms
                  </div>
                  <FormField
                    control={form.control}
                    name="roomIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Assign Rooms
                        </FormLabel>
                        <div className="space-y-2 rounded-lg border border-border p-3">
                          <p className="text-xs text-foreground">
                            Select rooms to associate with this department.
                            Rooms already linked to other departments are
                            hidden.
                          </p>
                          {availableRooms.length === 0 ? (
                            <p className="text-sm text-foreground">
                              No available rooms
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto pr-1">
                              {availableRooms.map((room) => {
                                const checked = field.value?.includes(room.id);
                                return (
                                  <label
                                    key={room.id}
                                    className="flex items-start gap-3 rounded-md border border-border px-3 py-2 hover:bg-muted/50 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(val) => {
                                        const next = new Set(field.value || []);
                                        if (val) {
                                          next.add(room.id);
                                        } else {
                                          next.delete(room.id);
                                        }
                                        field.onChange(Array.from(next));
                                      }}
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-foreground">
                                        {room.roomCode}{" "}
                                        {room.roomType
                                          ? `- ${room.roomType}`
                                          : ""}
                                      </span>
                                      {room.description && (
                                        <span className="text-xs text-foreground line-clamp-2">
                                          {room.description}
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <FormMessage />
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
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEdit
                  ? "Update Department"
                  : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
