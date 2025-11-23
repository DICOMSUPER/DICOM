'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Room } from '@/interfaces/user/room.interface';
import { useCreateServiceRoomMutation } from '@/store/serviceRoomApi';
import { useGetServicesQuery } from '@/store/serviceApi';
import { useGetServicesByRoomQuery } from '@/store/serviceRoomApi';
import { Services } from '@/interfaces/user/service.interface';
import { ServiceRoom } from '@/interfaces/user/service-room.interface';
import { Stethoscope, X } from 'lucide-react';

interface RoomServiceAssignmentModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RoomServiceAssignmentModal({ room, isOpen, onClose, onSuccess }: RoomServiceAssignmentModalProps) {
  const [createServiceRoom] = useCreateServiceRoomMutation();
  const { data: servicesData } = useGetServicesQuery();
  const { data: existingAssignmentsData, refetch: refetchAssignments } = useGetServicesByRoomQuery(
    room?.id || '',
    { skip: !room?.id || !isOpen }
  );
  
  const services: Services[] = servicesData?.data ?? [];
  const existingAssignments: ServiceRoom[] = existingAssignmentsData?.data ?? [];

  const assignedServiceIds = useMemo(() => {
    return new Set(existingAssignments.map((assignment) => assignment.serviceId));
  }, [existingAssignments]);

  const availableServices = useMemo(() => {
    return services.filter((service) => !assignedServiceIds.has(service.id));
  }, [services, assignedServiceIds]);

  const [formData, setFormData] = useState({
    serviceId: '',
    isActive: true,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && room) {
      refetchAssignments();
      setFormData({
        serviceId: '',
        isActive: true,
        notes: '',
      });
    }
  }, [isOpen, room, refetchAssignments]);

  const handleSubmit = async () => {
    if (!room?.id) {
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
        roomId: room.id,
        serviceId: formData.serviceId,
        isActive: formData.isActive,
        notes: formData.notes || undefined,
      };

      await createServiceRoom(payload).unwrap();
      toast.success('Service assigned to room successfully');
      setFormData({
        serviceId: '',
        isActive: true,
        notes: '',
      });
      await       refetchAssignments();
      onSuccess?.();
      // Keep modal open to allow multiple assignments
    } catch (error) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || 'Failed to assign service to room');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            Assign Service to Room: {room.roomCode}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5" />
                Room Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Room Code</p>
                  <p className="text-base font-semibold text-foreground">{room.roomCode}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Room Type</p>
                  <p className="text-base font-semibold text-foreground">{room.roomType || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5" />
                Select Service
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceId" className="text-foreground">Service *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger className="text-foreground">
                    <SelectValue placeholder="Select service to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.length === 0 ? (
                      <div className="p-2 text-sm text-foreground">No available services</div>
                    ) : (
                      availableServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.serviceCode} - {service.serviceName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {availableServices.length === 0 && (
                  <p className="text-sm text-foreground">All services are already assigned to this room.</p>
                )}
              </div>
            </section>

            {existingAssignments.length > 0 && (
              <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Stethoscope className="h-5 w-5" />
                  Currently Assigned Services ({existingAssignments.length})
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {existingAssignments
                    .filter((assignment) => assignment.isActive && assignment.service)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-border/20 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {assignment.service?.serviceName || "Unknown Service"}
                            </p>
                            {assignment.service?.serviceCode && (
                              <p className="text-xs text-foreground mt-0.5">
                                Code: {assignment.service.serviceCode}
                              </p>
                            )}
                          </div>
                          <Badge className={`${assignment.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'} text-xs font-medium shrink-0 border`}>
                            {assignment.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5" />
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
                <Stethoscope className="h-5 w-5" />
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
          <Button onClick={handleSubmit} disabled={isSubmitting || availableServices.length === 0}>
            {isSubmitting ? 'Assigning...' : 'Assign Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

