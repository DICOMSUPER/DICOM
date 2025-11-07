// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Clock } from "lucide-react";
import { useGetSpecialHoursQuery, useCreateSpecialHoursMutation, useUpdateSpecialHoursMutation, useDeleteSpecialHoursMutation } from "@/store/scheduleApi";
import { SpecialHours, SpecialHoursFormData } from "@/store/scheduleApi";
import { toast } from "sonner";

interface SpecialHoursData {
  id: string;
  date: string;
  start: string;
  end: string;
  isHoliday: boolean;
  description: string;
}

interface SpecialHoursSectionProps {
  // No props needed as we'll fetch data directly
}

export function SpecialHoursSection({}: SpecialHoursSectionProps) {
  const [specialHours, setSpecialHours] = useState<SpecialHoursData[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newIsHoliday, setNewIsHoliday] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const { data: specialHoursData, isLoading, error } = useGetSpecialHoursQuery({ page: 1, limit: 100 });
  const [createSpecialHours] = useCreateSpecialHoursMutation();
  const [updateSpecialHours] = useUpdateSpecialHoursMutation();
  const [deleteSpecialHours] = useDeleteSpecialHoursMutation();

  // Load special hours data when component mounts
  useEffect(() => {
    if (specialHoursData?.data) {
      const formattedSpecialHours = specialHoursData.data.map((specialHour: SpecialHours) => ({
        id: specialHour.id,
        date: specialHour.date,
        start: specialHour.startTime || "",
        end: specialHour.endTime || "",
        isHoliday: specialHour.isHoliday,
        description: specialHour.description || ""
      }));
      setSpecialHours(formattedSpecialHours);
    }
  }, [specialHoursData]);

  const addSpecialHours = async () => {
    if (!newDate) {
      toast.error("Please select a date");
      return;
    }

    if (!newIsHoliday && (!newStart || !newEnd)) {
      toast.error("Please provide start and end times for special hours");
      return;
    }

    try {
      const formData: SpecialHoursFormData = {
        date: newDate,
        startTime: newIsHoliday ? undefined : newStart,
        endTime: newIsHoliday ? undefined : newEnd,
        isHoliday: newIsHoliday,
        description: newDescription || undefined
      };

      await createSpecialHours(formData).unwrap();
      
      // Reset form
      setNewDate("");
      setNewStart("");
      setNewEnd("");
      setNewIsHoliday(false);
      setNewDescription("");
      
      toast.success("Special hours added successfully!");
    } catch (error) {
      toast.error("Failed to add special hours");
      console.error("Error adding special hours:", error);
    }
  };

  const updateSpecialHoursData = async (id: string, field: keyof SpecialHoursData, value: string | boolean) => {
    try {
      const specialHour = specialHours.find(sh => sh.id === id);
      if (!specialHour) return;

      const updatedSpecialHour = { ...specialHour, [field]: value };
      
      const formData: Partial<SpecialHoursFormData> = {
        date: updatedSpecialHour.date,
        startTime: updatedSpecialHour.isHoliday ? undefined : updatedSpecialHour.start,
        endTime: updatedSpecialHour.isHoliday ? undefined : updatedSpecialHour.end,
        isHoliday: updatedSpecialHour.isHoliday,
        description: updatedSpecialHour.description
      };

      await updateSpecialHours({ id, data: formData }).unwrap();
      
      setSpecialHours(specialHours.map(sh => 
        sh.id === id ? updatedSpecialHour : sh
      ));
      
      toast.success("Special hours updated successfully!");
    } catch (error) {
      toast.error("Failed to update special hours");
      console.error("Error updating special hours:", error);
    }
  };

  const removeSpecialHours = async (id: string) => {
    try {
      await deleteSpecialHours(id).unwrap();
      setSpecialHours(specialHours.filter(sh => sh.id !== id));
      toast.success("Special hours removed successfully!");
    } catch (error) {
      toast.error("Failed to remove special hours");
      console.error("Error removing special hours:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Special Hours & Holidays</CardTitle>
          <p className="text-sm text-foreground">Loading special hours...</p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Special Hours & Holidays</CardTitle>
          <p className="text-sm text-red-600">Failed to load special hours</p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Special Hours & Holidays</CardTitle>
        <p className="text-sm text-foreground">
          Set special operating hours or mark holidays.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="special-hours" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="special-hours">Special Hours</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
          </TabsList>
          
          <TabsContent value="special-hours" className="space-y-4 mt-4">
            {/* Special Hours List */}
            <div className="space-y-3">
              {specialHours.length > 0 && (
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-foreground border-b border-border pb-2">
                  <div>Date</div>
                  <div>Start Time</div>
                  <div>End Time</div>
                  <div></div>
                </div>
              )}
              
              {specialHours.map((hour) => (
                <div key={hour.id} className="grid grid-cols-4 gap-4 items-center">
                  <Input
                    type="date"
                    value={hour.date}
                    onChange={(e) => updateSpecialHoursData(hour.id, 'date', e.target.value)}
                    className="w-full"
                  />
                  <div className="relative">
                    <Input
                      type="time"
                      value={hour.start}
                      onChange={(e) => updateSpecialHoursData(hour.id, 'start', e.target.value)}
                      className="w-full pr-8"
                    />
                    <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                  </div>
                  <div className="relative">
                    <Input
                      type="time"
                      value={hour.end}
                      onChange={(e) => updateSpecialHoursData(hour.id, 'end', e.target.value)}
                      className="w-full pr-8"
                    />
                    <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecialHours(hour.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Special Hours Button */}
            <Button variant="outline" onClick={addSpecialHours} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Special Hours
            </Button>
          </TabsContent>
          
          <TabsContent value="holidays" className="mt-4">
            <div className="text-center py-8 text-foreground">
              <p>Holiday management coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add New Special Hours Form */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium mb-3">Add New Special Hours</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="Select date"
                className="flex-1"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-holiday"
                  checked={newIsHoliday}
                  onCheckedChange={(checked) => setNewIsHoliday(checked as boolean)}
                />
                <label htmlFor="is-holiday" className="text-sm">
                  Holiday
                </label>
              </div>
            </div>
            
            {!newIsHoliday && (
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  placeholder="Start time"
                  className="w-32"
                />
                <span className="text-sm text-foreground">to</span>
                <Input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  placeholder="End time"
                  className="w-32"
                />
              </div>
            )}
            
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            
            <Button onClick={addSpecialHours} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Special Hours
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}