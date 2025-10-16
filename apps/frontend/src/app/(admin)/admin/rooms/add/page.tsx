'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ROOM_FACILITIES, ROOM_STATUSES } from '@/types/room';
import { useCreateRoomMutation } from '@/store/roomsApi';
import { RoomType } from '@/enums/room.enum'
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { Department } from '@/interfaces/user/department.interface';

export default function AddNewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createRoom] = useCreateRoomMutation();

    const { data: departmentsData, isLoading: deptsLoading } = useGetDepartmentsQuery({});

    const departments: Department[] = departmentsData ?? [];

    console.log("check " , departments)

  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    department_id: '',
    floor: '',
    capacity: '',
    price_per_day: '',
    status: 'available',
    description: '',
    additional_notes: '',
  });
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);


  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const validateForm = () => {
    if (!formData.room_number.trim()) {
      toast.error('Room number is required');
      return false;
    }
    if (!formData.room_type_id) {
      toast.error('Room type is required');
      return false;
    }
    if (!formData.department_id) {
      toast.error('Department is required');
      return false;
    }
    if (!formData.floor || parseInt(formData.floor) < 0) {
      toast.error('Valid floor number is required');
      return false;
    }
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      toast.error('Valid capacity is required');
      return false;
    }
    if (!formData.price_per_day || parseFloat(formData.price_per_day) < 0) {
      toast.error('Valid price is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload = {
        roomCode: formData.room_number,
        roomType: formData.room_type_id,
        department: formData.department_id,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        pricePerDay: Number(formData.price_per_day),
        status: formData.status.toUpperCase(),
        description: formData.description,
        hasTV: selectedFacilities.includes("TV"),
        hasAirConditioning: selectedFacilities.includes("Air Conditioning"),
        hasWiFi: selectedFacilities.includes("Wi-Fi"),
        hasTelephone: selectedFacilities.includes("Telephone"),
        hasAttachedBathroom: selectedFacilities.includes("Attached Bathroom"),
        isWheelchairAccessible: selectedFacilities.includes("Wheelchair Accessible"),
        hasOxygenSupply: selectedFacilities.includes("Oxygen Supply"),
        hasNurseCallButton: selectedFacilities.includes("Nurse Call Button"),
        notes: formData.additional_notes,
        isActive: true,
      };

      await createRoom(payload).unwrap();
      toast.success("Room created successfully!");
      router.push("/rooms");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create room");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Add New Room</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1">Room Details</h2>
            <p className="text-sm text-gray-500">
              Add a new room to the hospital inventory. Fill in all the required information below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="room_number">Room Number</Label>
                  <Input
                    id="room_number"
                    placeholder="Enter room number"
                    value={formData.room_number}
                    onChange={(e) => handleInputChange('room_number', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a unique room number</p>
                </div>

                <div>
                  <Label htmlFor="room_type">Room Type</Label>
                  <Select
                    value={formData.room_type_id}
                    onValueChange={(value) => handleInputChange('room_type_id', value)}
                  >
                    <SelectTrigger id="room_type">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RoomType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => handleInputChange('department_id', value)}
                  >
                    <SelectTrigger id="department">
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

                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Select
                    value={formData.floor}
                    onValueChange={(value) => handleInputChange('floor', value)}
                  >
                    <SelectTrigger id="floor">
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(20)].map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          Floor {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4">Additional Details</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="capacity">Capacity (Beds)</Label>
                  <Select
                    value={formData.capacity}
                    onValueChange={(value) => handleInputChange('capacity', value)}
                  >
                    <SelectTrigger id="capacity">
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Bed' : 'Beds'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price Per Day</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    value={formData.price_per_day}
                    onChange={(e) => handleInputChange('price_per_day', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter room description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold mb-4">Facilities</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROOM_FACILITIES.map((facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox
                  id={facility}
                  checked={selectedFacilities.includes(facility)}
                  onCheckedChange={() => handleFacilityToggle(facility)}
                />
                <label
                  htmlFor={facility}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {facility}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              placeholder="Enter any additional notes"
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-black text-white hover:bg-gray-800"
          >
            {submitting ? 'Adding Room...' : 'Add Room'}
          </Button>
        </div>
      </div>
    </div>
  );
}
