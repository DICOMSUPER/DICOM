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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Room } from '@/interfaces/user/room.interface';
import { RoomStatus } from '@/enums/room.enum';
import { useCreateRoomMutation, useUpdateRoomMutation } from '@/store/roomsApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { Department } from '@/interfaces/user/department.interface';
import { Building2 } from 'lucide-react';

interface RoomFormModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RoomFormModal({ room, isOpen, onClose, onSuccess }: RoomFormModalProps) {
  const isEdit = !!room;
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments: Department[] = departmentsData?.data ?? [];

  const [formData, setFormData] = useState({
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        roomCode: room.roomCode || '',
        roomType: room.roomType || '',
        department: room.department?.id || '',
        floor: room.floor?.toString() || '',
        capacity: room.capacity?.toString() || '',
        pricePerDay: room.pricePerDay || '',
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
      setFormData({
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
  }, [room, isOpen]);

  const handleSubmit = async () => {
    if (!formData.roomCode.trim()) {
      toast.error('Room code is required');
      return;
    }
    if (!formData.roomType) {
      toast.error('Room type is required');
      return;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }
    if (!formData.floor || parseInt(formData.floor) < 0) {
      toast.error('Valid floor number is required');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      toast.error('Valid capacity is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        roomCode: formData.roomCode,
        roomType: formData.roomType,
        department: formData.department,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        pricePerDay: formData.pricePerDay || '0',
        status: formData.status,
        description: formData.description,
        notes: formData.notes,
        hasTV: formData.hasTV,
        hasAirConditioning: formData.hasAirConditioning,
        hasWiFi: formData.hasWiFi,
        hasTelephone: formData.hasTelephone,
        hasAttachedBathroom: formData.hasAttachedBathroom,
        isWheelchairAccessible: formData.isWheelchairAccessible,
        hasOxygenSupply: formData.hasOxygenSupply,
        hasNurseCallButton: formData.hasNurseCallButton,
        isActive: formData.isActive,
      };

      if (isEdit && room) {
        await updateRoom({ id: room.id, data: payload }).unwrap();
        toast.success('Room updated successfully');
      } else {
        await createRoom(payload).unwrap();
        toast.success('Room created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} room`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit Room' : 'Create New Room'}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {/* Basic Information */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Basic Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomCode" className="text-foreground">Room Code *</Label>
                  <Input
                    id="roomCode"
                    value={formData.roomCode}
                    onChange={(e) => setFormData({ ...formData, roomCode: e.target.value })}
                    placeholder="e.g., R101"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomType" className="text-foreground">Room Type *</Label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="DOUBLE">Double</SelectItem>
                      <SelectItem value="SUITE">Suite</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="OPERATING">Operating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-foreground">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-foreground">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as RoomStatus })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RoomStatus.AVAILABLE}>Available</SelectItem>
                      <SelectItem value={RoomStatus.OCCUPIED}>Occupied</SelectItem>
                      <SelectItem value={RoomStatus.MAINTENANCE}>Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor" className="text-foreground">Floor *</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g., 1"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-foreground">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 2"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay" className="text-foreground">Price per Day</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    placeholder="e.g., 500000"
                    className="text-foreground"
                  />
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Description
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Room description..."
                  rows={3}
                  className="text-foreground"
                />
              </div>
            </section>

            {/* Facilities */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Facilities
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'hasTV', label: 'TV' },
                  { key: 'hasAirConditioning', label: 'Air Conditioning' },
                  { key: 'hasWiFi', label: 'WiFi' },
                  { key: 'hasTelephone', label: 'Telephone' },
                  { key: 'hasAttachedBathroom', label: 'Attached Bathroom' },
                  { key: 'isWheelchairAccessible', label: 'Wheelchair Accessible' },
                  { key: 'hasOxygenSupply', label: 'Oxygen Supply' },
                  { key: 'hasNurseCallButton', label: 'Nurse Call Button' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={formData[key as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, [key]: checked })
                      }
                    />
                    <Label htmlFor={key} className="text-foreground cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Notes
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="text-foreground"
                />
              </div>
            </section>

            {/* Active Status */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
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

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Room' : 'Create Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
