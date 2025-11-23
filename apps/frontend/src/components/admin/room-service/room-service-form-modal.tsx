'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
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

export function RoomServiceFormModal({ roomService, isOpen, onClose, onSuccess }: RoomServiceFormModalProps) {
  const isEdit = !!roomService;
  const [createServiceRoom] = useCreateServiceRoomMutation();
  const [updateServiceRoom] = useUpdateServiceRoomMutation();
  const { data: roomsData } = useGetRoomsQuery({ page: 1, limit: 1000 });
  const { data: servicesData } = useGetServicesQuery();
  const rooms: Room[] = roomsData?.data ?? [];
  const services: Services[] = servicesData?.data ?? [];

  const [formData, setFormData] = useState({
    roomId: '',
    serviceId: '',
    isActive: true,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (roomService) {
      setFormData({
        roomId: roomService.roomId || '',
        serviceId: roomService.serviceId || '',
        isActive: roomService.isActive ?? true,
        notes: roomService.notes || '',
      });
    } else {
      setFormData({
        roomId: '',
        serviceId: '',
        isActive: true,
        notes: '',
      });
    }
  }, [roomService, isOpen]);

  const handleSubmit = async () => {
    if (!formData.roomId) {
      toast.error('Room is required');
      return;
    }
    if (!formData.serviceId) {
      toast.error('Service is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        roomId: formData.roomId,
        serviceId: formData.serviceId,
        isActive: formData.isActive,
        notes: formData.notes || undefined,
      };

      if (isEdit && roomService) {
        await updateServiceRoom({ id: roomService.id, data: { isActive: payload.isActive, notes: payload.notes } }).unwrap();
        toast.success('Room-service assignment updated successfully');
      } else {
        await createServiceRoom(payload).unwrap();
        toast.success('Room-service assignment created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} room-service assignment`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit Room Service Assignment' : 'Create New Room Service Assignment'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Link2 className="h-5 w-5" />
                Assignment Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomId" className="text-foreground">Room *</Label>
                  <Select
                    value={formData.roomId}
                    onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                    disabled={isEdit}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.roomCode} - {room.roomType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceId" className="text-foreground">Service *</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                    disabled={isEdit}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.serviceCode} - {service.serviceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Link2 className="h-5 w-5" />
                Notes
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this assignment..."
                  rows={3}
                  className="text-foreground"
                />
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Link2 className="h-5 w-5" />
                Status
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="isActive" className="text-foreground cursor-pointer">
                  Active
                </Label>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

