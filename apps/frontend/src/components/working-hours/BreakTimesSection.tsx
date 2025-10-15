"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useGetBreakTimesQuery, useCreateBreakTimeMutation, useUpdateBreakTimeMutation, useDeleteBreakTimeMutation } from "@/lib/api/schedule-api";
import { BreakTime, BreakTimeFormData } from "@/lib/api/schedule-api";
import { toast } from "sonner";

interface BreakTimeData {
  id: string;
  breakName: string;
  start: string;
  end: string;
  description?: string;
}

interface BreakTimesSectionProps {
  workingHoursId?: string;
}

export function BreakTimesSection({ workingHoursId }: BreakTimesSectionProps) {
  const [breakTimes, setBreakTimes] = useState<BreakTimeData[]>([]);
  const [newBreakName, setNewBreakName] = useState("");
  const [newBreakStart, setNewBreakStart] = useState("");
  const [newBreakEnd, setNewBreakEnd] = useState("");
  const [newBreakDescription, setNewBreakDescription] = useState("");

  const { data: breakTimesData, isLoading, error } = useGetBreakTimesQuery(workingHoursId || "");
  const [createBreakTime] = useCreateBreakTimeMutation();
  const [updateBreakTime] = useUpdateBreakTimeMutation();
  const [deleteBreakTime] = useDeleteBreakTimeMutation();

  // Load break times data when component mounts
  useEffect(() => {
    if (breakTimesData) {
      const formattedBreakTimes = breakTimesData.map((breakTime: BreakTime) => ({
        id: breakTime.id,
        breakName: breakTime.breakName,
        start: breakTime.startTime,
        end: breakTime.endTime,
        description: breakTime.description
      }));
      setBreakTimes(formattedBreakTimes);
    }
  }, [breakTimesData]);

  const addBreakTime = async () => {
    if (!newBreakName || !newBreakStart || !newBreakEnd || !workingHoursId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const formData: BreakTimeFormData = {
        breakName: newBreakName,
        startTime: newBreakStart,
        endTime: newBreakEnd,
        workingHoursId: workingHoursId,
        description: newBreakDescription || undefined
      };

      await createBreakTime(formData).unwrap();
      
      // Reset form
      setNewBreakName("");
      setNewBreakStart("");
      setNewBreakEnd("");
      setNewBreakDescription("");
      
      toast.success("Break time added successfully!");
    } catch (error) {
      toast.error("Failed to add break time");
      console.error("Error adding break time:", error);
    }
  };

  const updateBreakTimeData = async (id: string, field: keyof BreakTimeData, value: string) => {
    try {
      const breakTime = breakTimes.find(bt => bt.id === id);
      if (!breakTime) return;

      const updatedBreakTime = { ...breakTime, [field]: value };
      
      const formData: Partial<BreakTimeFormData> = {
        breakName: updatedBreakTime.breakName,
        startTime: updatedBreakTime.start,
        endTime: updatedBreakTime.end,
        description: updatedBreakTime.description
      };

      await updateBreakTime({ id, data: formData }).unwrap();
      
      setBreakTimes(breakTimes.map(bt => 
        bt.id === id ? updatedBreakTime : bt
      ));
      
      toast.success("Break time updated successfully!");
    } catch (error) {
      toast.error("Failed to update break time");
      console.error("Error updating break time:", error);
    }
  };

  const removeBreakTime = async (id: string) => {
    try {
      await deleteBreakTime(id).unwrap();
      setBreakTimes(breakTimes.filter(bt => bt.id !== id));
      toast.success("Break time removed successfully!");
    } catch (error) {
      toast.error("Failed to remove break time");
      console.error("Error removing break time:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Break Times</CardTitle>
          <p className="text-sm text-foreground">Loading break times...</p>
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
          <CardTitle className="text-xl font-bold">Break Times</CardTitle>
          <p className="text-sm text-red-600">Failed to load break times</p>
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
        <CardTitle className="text-xl font-bold">Break Times</CardTitle>
        <p className="text-sm text-foreground">
          Configure daily break times for your clinic.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Break List */}
        <div className="space-y-3">
          {breakTimes.map((breakTime) => (
            <div key={breakTime.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex-1">
                <Input
                  value={breakTime.breakName}
                  onChange={(e) => updateBreakTimeData(breakTime.id, 'breakName', e.target.value)}
                  placeholder="Break name"
                  className="mb-2"
                />
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={breakTime.start}
                    onChange={(e) => updateBreakTimeData(breakTime.id, 'start', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-foreground">to</span>
                  <Input
                    type="time"
                    value={breakTime.end}
                    onChange={(e) => updateBreakTimeData(breakTime.id, 'end', e.target.value)}
                    className="w-32"
                  />
                </div>
                <Input
                  value={breakTime.description || ""}
                  onChange={(e) => updateBreakTimeData(breakTime.id, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  className="mt-2"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBreakTime(breakTime.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Break Time */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Add New Break Time</h4>
          <div className="space-y-3">
            <Input
              value={newBreakName}
              onChange={(e) => setNewBreakName(e.target.value)}
              placeholder="Break name"
            />
            <div className="flex items-center space-x-2">
              <Input
                type="time"
                value={newBreakStart}
                onChange={(e) => setNewBreakStart(e.target.value)}
                placeholder="Start time"
                className="w-32"
              />
              <span className="text-sm text-foreground">to</span>
              <Input
                type="time"
                value={newBreakEnd}
                onChange={(e) => setNewBreakEnd(e.target.value)}
                placeholder="End time"
                className="w-32"
              />
            </div>
            <Input
              value={newBreakDescription}
              onChange={(e) => setNewBreakDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <Button onClick={addBreakTime} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Break Time
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}