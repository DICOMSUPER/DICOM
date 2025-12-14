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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox as UICheckbox } from '@/components/ui/checkbox';
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
import { Room } from '@/common/interfaces/user/room.interface';
import { RoomStatus, RoomType } from '@/common/enums/room.enum';
import { useCreateRoomMutation, useUpdateRoomMutation } from '@/store/roomsApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { Department } from '@/common/interfaces/user/department.interface';
import { Building2, MapPin, FileText, Settings, Tv, Wind, Wifi, Phone, DoorOpen, Accessibility, Heart, Bell } from 'lucide-react';
import { formatStatus, modalStyles } from '@/common/utils/format-status';

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
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export function RoomFormModal({ room, isOpen, onClose, onSuccess }: RoomFormModalProps) {
  const isEdit = !!room;
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsQuery({ page: 1, limit: 10000 });
  const departments: Department[] = departmentsData?.data ?? [];

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
    if (!isOpen) return;

    if (room) {
      form.reset({
        roomCode: room.roomCode || '',
        roomType: room.roomType || '',
        department: room.department?.id || room.departmentId || '',
        floor: room.floor?.toString() || '',
        capacity: room.capacity?.toString() || '',
        pricePerDay:
          room.pricePerDay !== undefined && room.pricePerDay !== null
            ? typeof room.pricePerDay === 'number'
              ? room.pricePerDay.toString()
              : String(room.pricePerDay)
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
        console.log('Create room result:', result);
        
        roomId = (result.data.room as Room)?.id || (result as any)?.data?.id || '';
        if (!roomId) {
          toast.error('Failed to get room ID after creation');
          return;
        }
        toast.success('Room created successfully');
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

  const facilityFields = [
    { name: 'hasTV' as const, label: 'TV', icon: Tv },
    { name: 'hasAirConditioning' as const, label: 'Air Conditioning', icon: Wind },
    { name: 'hasWiFi' as const, label: 'WiFi', icon: Wifi },
    { name: 'hasTelephone' as const, label: 'Telephone', icon: Phone },
    { name: 'hasAttachedBathroom' as const, label: 'Attached Bathroom', icon: DoorOpen },
    { name: 'isWheelchairAccessible' as const, label: 'Wheelchair Accessible', icon: Accessibility },
    { name: 'hasOxygenSupply' as const, label: 'Oxygen Supply', icon: Heart },
    { name: 'hasNurseCallButton' as const, label: 'Nurse Call Button', icon: Bell },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={modalStyles.dialogContent}>
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            {isEdit ? 'Edit Room' : 'Create New Room'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Building2 className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roomCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Room Code *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., R101"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                          <FormLabel className={modalStyles.formLabel}>Room Type *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
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
                          <FormLabel className={modalStyles.formLabel}>Department *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={departmentsLoading || departments.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
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
                          <FormLabel className={modalStyles.formLabel}>Status *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as RoomStatus)}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={RoomStatus.AVAILABLE}>{formatStatus(RoomStatus.AVAILABLE)}</SelectItem>
                              <SelectItem value={RoomStatus.OCCUPIED}>{formatStatus(RoomStatus.OCCUPIED)}</SelectItem>
                              <SelectItem value={RoomStatus.MAINTENANCE}>{formatStatus(RoomStatus.MAINTENANCE)}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Location & Capacity */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <MapPin className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Location & Capacity</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Floor *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 1"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                          <FormLabel className={modalStyles.formLabel}>Capacity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 2"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                          <FormLabel className={modalStyles.formLabel}>Price per Day (₫)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 500000"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                      <FormItem className="flex items-center space-x-3 pt-4 border-t border-slate-100 mt-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-teal-600"
                          />
                        </FormControl>
                        <FormLabel className={`${modalStyles.formLabel} cursor-pointer mt-0!`}>
                          Active Status
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>

                {/* Description & Notes */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <FileText className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Description & Notes</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Room description..."
                              rows={3}
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                          <FormLabel className={modalStyles.formLabel}>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes..."
                              rows={3}
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Facilities */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Settings className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Facilities & Amenities</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {facilityFields.map(({ name, label, icon: Icon }) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 rounded-lg border border-slate-200 p-3 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                            <FormControl>
                              <UICheckbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-slate-500" />
                              <FormLabel className={`${modalStyles.formLabel} cursor-pointer mt-0! text-xs`}>
                                {label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className={modalStyles.dialogFooter}>
              <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting} className={modalStyles.secondaryButton}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className={modalStyles.primaryButton}>
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update Room' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
