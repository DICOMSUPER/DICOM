'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Room } from '@/interfaces/user/room.interface';
import { RoomStatus, RoomType } from '@/enums/room.enum';
import { ModalityMachine } from '@/interfaces/image-dicom/modality-machine.interface';
import { useCreateRoomMutation, useUpdateRoomMutation } from '@/store/roomsApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { Department } from '@/interfaces/user/department.interface';
import { useGetAllModalityMachineQuery, useGetModalitiesInRoomQuery } from '@/store/modalityMachineApi';
import { useUpdateModalityMachineMutation } from '@/store/modalityMachineApi';
import { extractApiData } from '@/utils/api';
import { Building2 } from 'lucide-react';

interface RoomFormModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const roomFormSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
  roomType: z.string().min(1, 'Room type is required'),
  department: z.string().min(1, 'Department is required'),
  floor: z.string().min(1, 'Floor is required').refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, { message: 'Floor must be a valid number >= 0' }),
  capacity: z.string().min(1, 'Capacity is required').refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1;
  }, { message: 'Capacity must be at least 1' }),
  pricePerDay: z.string().optional(),
  status: z.nativeEnum(RoomStatus),
  description: z.string().optional(),
  notes: z.string().optional(),
  hasTV: z.boolean(),
  hasAirConditioning: z.boolean(),
  hasWiFi: z.boolean(),
  hasTelephone: z.boolean(),
  hasAttachedBathroom: z.boolean(),
  isWheelchairAccessible: z.boolean(),
  hasOxygenSupply: z.boolean(),
  hasNurseCallButton: z.boolean(),
  isActive: z.boolean(),
  modalityMachineId: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export function RoomFormModal({ room, isOpen, onClose, onSuccess }: RoomFormModalProps) {
  const isEdit = !!room;
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [updateModalityMachine] = useUpdateModalityMachineMutation();
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsQuery({ page: 1, limit: 10000 });
  const { data: machinesData } = useGetAllModalityMachineQuery({});
  const { data: roomMachinesData } = useGetModalitiesInRoomQuery(room?.id || '', {
    skip: !room?.id,
  });
  const departments: Department[] = departmentsData?.data ?? [];
  const machines = extractApiData<ModalityMachine>(machinesData);
  const roomMachines = extractApiData<ModalityMachine>(roomMachinesData);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomCode: '',
      roomType: '',
      department: '',
      floor: '',
      capacity: '',
      pricePerDay: '',
      status: RoomStatus.AVAILABLE,
      description: '',
      notes: '',
      hasTV: false,
      hasAirConditioning: false,
      hasWiFi: false,
      hasTelephone: false,
      hasAttachedBathroom: false,
      isWheelchairAccessible: false,
      hasOxygenSupply: false,
      hasNurseCallButton: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        roomCode: room.roomCode || '',
        roomType: room.roomType || '',
        department: room.department?.id || room.departmentId || '',
        floor: room.floor?.toString() || '',
        capacity: room.capacity?.toString() || '',
        pricePerDay: room.pricePerDay !== undefined && room.pricePerDay !== null 
          ? (typeof room.pricePerDay === 'number' ? room.pricePerDay.toString() : String(room.pricePerDay))
          : '',
        status: room.status || RoomStatus.AVAILABLE,
        description: room.description || '',
        notes: room.notes || '',
        hasTV: room.hasTV || false,
        hasAirConditioning: room.hasAirConditioning || false,
        hasWiFi: room.hasWiFi || false,
        hasTelephone: room.hasTelephone || false,
        hasAttachedBathroom: room.hasAttachedBathroom || false,
        isWheelchairAccessible: room.isWheelchairAccessible || false,
        hasOxygenSupply: room.hasOxygenSupply || false,
        hasNurseCallButton: room.hasNurseCallButton || false,
        isActive: room.isActive ?? true,
        modalityMachineId: roomMachines.length > 0 ? roomMachines[0].id : '',
      });
    } else {
      form.reset({
        roomCode: '',
        roomType: '',
        department: '',
        floor: '',
        capacity: '',
        pricePerDay: '',
        status: RoomStatus.AVAILABLE,
        description: '',
        notes: '',
        hasTV: false,
        hasAirConditioning: false,
        hasWiFi: false,
        hasTelephone: false,
        hasAttachedBathroom: false,
        isWheelchairAccessible: false,
        hasOxygenSupply: false,
        hasNurseCallButton: false,
        isActive: true,
        modalityMachineId: '',
      });
    }
  }, [room, isOpen, form]);

  const onSubmit = async (data: RoomFormValues) => {
    try {
      const payload: any = {
        roomCode: data.roomCode,
        roomType: data.roomType,
        floor: Number(data.floor),
        capacity: Number(data.capacity),
        pricePerDay: data.pricePerDay ? Number(data.pricePerDay) : undefined,
        status: data.status,
        description: data.description || undefined,
        notes: data.notes || undefined,
        hasTV: data.hasTV,
        hasAirConditioning: data.hasAirConditioning,
        hasWiFi: data.hasWiFi,
        hasTelephone: data.hasTelephone,
        hasAttachedBathroom: data.hasAttachedBathroom,
        isWheelchairAccessible: data.isWheelchairAccessible,
        hasOxygenSupply: data.hasOxygenSupply,
        hasNurseCallButton: data.hasNurseCallButton,
        isActive: data.isActive,
      };

      if (data.department && data.department.trim() !== '') {
        payload.department = data.department;
      }

      let roomId: string;
      if (isEdit && room) {
        await updateRoom({ id: room.id, data: payload }).unwrap();
        roomId = room.id;
        toast.success('Room updated successfully');
      } else {
        const result = await createRoom(payload).unwrap();
        roomId = (result as Room)?.id || (result as any)?.data?.id || '';
        if (!roomId) {
          toast.error('Failed to get room ID after creation');
          return;
        }
        toast.success('Room created successfully');
      }

      if (data.modalityMachineId && data.modalityMachineId.trim() !== '') {
        try {
          await updateModalityMachine({
            id: data.modalityMachineId,
            data: { roomId },
          }).unwrap();
        } catch (machineError: any) {
          toast.warning(
            machineError?.data?.message || 'Room saved but failed to assign modality machine'
          );
        }
      }

      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} room`);
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
            {isEdit ? 'Edit Room' : 'Create New Room'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roomCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Room Code *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., R101"
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
                      name="roomType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Room Type *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={RoomType.CT}>CT</SelectItem>
                              <SelectItem value={RoomType.WC}>WC</SelectItem>
                              <SelectItem value={RoomType.XRAY}>X-RAY</SelectItem>
                              <SelectItem value={RoomType.MRI}>MRI</SelectItem>
                              <SelectItem value={RoomType.ULTRASOUND}>Ultrasound</SelectItem>
                              <SelectItem value={RoomType.RESPIRATORY}>Respiratory</SelectItem>
                              <SelectItem value={RoomType.GENERAL}>General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Department *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={departmentsLoading || departments.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "Select department"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.length === 0 && !departmentsLoading ? (
                                <SelectItem value="" disabled>No departments available</SelectItem>
                              ) : (
                                departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.departmentName}
                                  </SelectItem>
                                ))
                              )}
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
                          <FormLabel className="text-foreground">Status *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as RoomStatus)}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={RoomStatus.AVAILABLE}>Available</SelectItem>
                              <SelectItem value={RoomStatus.OCCUPIED}>Occupied</SelectItem>
                              <SelectItem value={RoomStatus.MAINTENANCE}>Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Floor *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 1"
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
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Capacity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 2"
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
                      name="pricePerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Price per Day</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 500000"
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
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-foreground">Status</FormLabel>
                          <div className="flex items-center space-x-2 pt-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <Label className="text-foreground cursor-pointer">
                              Active
                            </Label>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="modalityMachineId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Modality Machine</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value === "none" ? "" : value)
                            }
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select modality machine (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {machines
                                .filter((m) => m.status === 'ACTIVE')
                                .map((machine) => (
                                  <SelectItem key={machine.id} value={machine.id}>
                                    {machine.name} ({machine.modality?.modalityCode || 'N/A'})
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

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="h-5 w-5" />
                    Description & Notes
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Room description..."
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes..."
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

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building2 className="h-5 w-5" />
                    Facilities
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="hasTV"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            TV
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasAirConditioning"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            Air Conditioning
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasWiFi"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            WiFi
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasTelephone"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            Telephone
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasAttachedBathroom"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            Attached Bathroom
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isWheelchairAccessible"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            Wheelchair Accessible
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasOxygenSupply"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            Oxygen Supply
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasNurseCallButton"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-foreground cursor-pointer">
                            Nurse Call Button
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update Room' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
