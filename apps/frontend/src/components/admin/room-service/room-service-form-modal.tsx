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
import { ServiceRoom } from '@/interfaces/user/service-room.interface';
import { useCreateServiceRoomMutation, useUpdateServiceRoomMutation } from '@/store/serviceRoomApi';
import { useGetRoomsQuery } from '@/store/roomsApi';
import { useGetServicesQuery } from '@/store/serviceApi';
import { Room } from '@/interfaces/user/room.interface';
import { Services } from '@/interfaces/user/service.interface';
import { Link2 } from 'lucide-react';

interface RoomServiceFormModalProps {
  roomService: ServiceRoom | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const roomServiceFormSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  serviceId: z.string().min(1, 'Service is required'),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type RoomServiceFormValues = z.infer<typeof roomServiceFormSchema>;

export function RoomServiceFormModal({ roomService, isOpen, onClose, onSuccess }: RoomServiceFormModalProps) {
  const isEdit = !!roomService;
  const [createServiceRoom] = useCreateServiceRoomMutation();
  const [updateServiceRoom] = useUpdateServiceRoomMutation();
  const { data: roomsData } = useGetRoomsQuery({ page: 1, limit: 1000 });
  const { data: servicesData } = useGetServicesQuery();
  const rooms: Room[] = roomsData?.data ?? [];
  const services: Services[] = servicesData?.data ?? [];

  const form = useForm<RoomServiceFormValues>({
    resolver: zodResolver(roomServiceFormSchema),
    defaultValues: {
      roomId: '',
      serviceId: '',
      isActive: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (roomService) {
      form.reset({
        roomId: roomService.roomId || '',
        serviceId: roomService.serviceId || '',
        isActive: roomService.isActive ?? true,
        notes: roomService.notes || '',
      });
    } else {
      form.reset({
        roomId: '',
        serviceId: '',
        isActive: true,
        notes: '',
      });
    }
  }, [roomService, isOpen, form]);

  const onSubmit = async (data: RoomServiceFormValues) => {
    try {
      const payload = {
        roomId: data.roomId,
        serviceId: data.serviceId,
        isActive: data.isActive,
        notes: data.notes || undefined,
      };

      if (isEdit && roomService) {
        await updateServiceRoom({ id: roomService.id, data: { isActive: payload.isActive, notes: payload.notes } }).unwrap();
        toast.success('Room service assignment updated successfully');
      } else {
        await createServiceRoom(payload).unwrap();
        toast.success('Room service assignment created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} room service assignment`);
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
            {isEdit ? 'Edit Room Service Assignment' : 'Create New Room Service Assignment'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Link2 className="h-5 w-5" />
                    Assignment Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roomId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Room *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isEdit}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select room" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  {room.roomCode} - {room.roomType}
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
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Service *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isEdit}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.serviceCode} - {service.serviceName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <Link2 className="h-5 w-5" />
                    Notes
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this assignment..."
                            rows={3}
                            className="text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update Assignment' : 'Create Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

