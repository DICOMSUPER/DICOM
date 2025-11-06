// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetWorkingHoursQuery, useCreateWorkingHoursMutation, useUpdateWorkingHoursMutation } from "@/store/scheduleApi";
import { WorkingHours, WorkingHoursFormData } from "@/store/scheduleApi";
import { toast } from "sonner";

interface ClinicHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface ClinicHoursData {
  monday: ClinicHours;
  tuesday: ClinicHours;
  wednesday: ClinicHours;
  thursday: ClinicHours;
  friday: ClinicHours;
  saturday: ClinicHours;
  sunday: ClinicHours;
}

interface ClinicHoursSectionProps {
  is24HourFormat: boolean;
  setIs24HourFormat: (value: boolean) => void;
}

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export function ClinicHoursSection({ is24HourFormat, setIs24HourFormat }: ClinicHoursSectionProps) {
  const [clinicHours, setClinicHours] = useState<ClinicHoursData>({
    monday: { enabled: true, start: "9:00 AM", end: "5:00 PM" },
    tuesday: { enabled: true, start: "9:00 AM", end: "5:00 PM" },
    wednesday: { enabled: true, start: "9:00 AM", end: "5:00 PM" },
    thursday: { enabled: true, start: "9:00 AM", end: "5:00 PM" },
    friday: { enabled: true, start: "9:00 AM", end: "5:00 PM" },
    saturday: { enabled: true, start: "9:00 AM", end: "3:00 PM" },
    sunday: { enabled: false, start: "9:00 AM", end: "3:00 PM" }
  });

  const { data: workingHoursData, isLoading, error } = useGetWorkingHoursQuery({ page: 1, limit: 100 });
  const [createWorkingHours] = useCreateWorkingHoursMutation();
  const [updateWorkingHours] = useUpdateWorkingHoursMutation();

  // Load working hours data when component mounts
  useEffect(() => {
    if (workingHoursData?.data) {
      const hoursData: ClinicHoursData = {
        monday: { enabled: false, start: "9:00 AM", end: "5:00 PM" },
        tuesday: { enabled: false, start: "9:00 AM", end: "5:00 PM" },
        wednesday: { enabled: false, start: "9:00 AM", end: "5:00 PM" },
        thursday: { enabled: false, start: "9:00 AM", end: "5:00 PM" },
        friday: { enabled: false, start: "9:00 AM", end: "5:00 PM" },
        saturday: { enabled: false, start: "9:00 AM", end: "3:00 PM" },
        sunday: { enabled: false, start: "9:00 AM", end: "3:00 PM" }
      };

      workingHoursData.data.forEach((hours: WorkingHours) => {
        const dayKey = hours.dayOfWeek as keyof ClinicHoursData;
        if (dayKey in hoursData) {
          hoursData[dayKey] = {
            enabled: hours.isEnabled,
            start: hours.startTime,
            end: hours.endTime
          };
        }
      });

      setClinicHours(hoursData);
    }
  }, [workingHoursData]);

  const updateDayHours = (day: keyof ClinicHoursData, field: keyof ClinicHours, value: boolean | string) => {
    setClinicHours({
      ...clinicHours,
      [day]: {
        ...clinicHours[day],
        [field]: value
      }
    });
  };

  const saveWorkingHours = async () => {
    try {
      const promises = Object.entries(clinicHours).map(async ([dayKey, dayData]) => {
        const dayOfWeek = dayKey as keyof ClinicHoursData;
        const existingHours = workingHoursData?.data?.find(
          (hours: WorkingHours) => hours.dayOfWeek === dayOfWeek
        );

        const formData: WorkingHoursFormData = {
          dayOfWeek: dayOfWeek,
          startTime: dayData.start,
          endTime: dayData.end,
          isEnabled: dayData.enabled,
          description: `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} working hours`
        };

        if (existingHours) {
          return updateWorkingHours({ id: existingHours.id, data: formData });
        } else {
          return createWorkingHours(formData);
        }
      });

      await Promise.all(promises);
      toast.success("Working hours saved successfully!");
    } catch (error) {
      toast.error("Failed to save working hours");
      console.error("Error saving working hours:", error);
    }
  };

  const resetToDefault = () => {
    setClinicHours({
      monday: { enabled: true, start: "8:00 AM", end: "6:00 PM" },
      tuesday: { enabled: true, start: "8:00 AM", end: "6:00 PM" },
      wednesday: { enabled: true, start: "8:00 AM", end: "6:00 PM" },
      thursday: { enabled: true, start: "8:00 AM", end: "6:00 PM" },
      friday: { enabled: true, start: "8:00 AM", end: "6:00 PM" },
      saturday: { enabled: true, start: "9:00 AM", end: "3:00 PM" },
      sunday: { enabled: false, start: "9:00 AM", end: "3:00 PM" }
    });
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Clinic Hours</CardTitle>
          <p className="text-sm text-foreground">Loading working hours...</p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {days.map((day) => (
              <div key={day.key} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Clinic Hours</CardTitle>
          <p className="text-sm text-red-600">Failed to load working hours</p>
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
        <CardTitle className="text-xl font-bold">Clinic Hours</CardTitle>
        <p className="text-sm text-foreground">
          Set your clinic's regular operating hours for each day of the week.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Schedule List */}
        <div className="space-y-3">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${key}-enabled`}
                  checked={clinicHours[key as keyof ClinicHoursData].enabled}
                  onCheckedChange={(checked) => updateDayHours(key as keyof ClinicHoursData, 'enabled', checked as boolean)}
                />
                <Label htmlFor={`${key}-enabled`} className="text-sm font-medium w-20">
                  {label}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={clinicHours[key as keyof ClinicHoursData].start}
                  onChange={(e) => updateDayHours(key as keyof ClinicHoursData, 'start', e.target.value)}
                  disabled={!clinicHours[key as keyof ClinicHoursData].enabled}
                  className="w-32"
                />
                <span className="text-sm text-foreground">to</span>
                <Input
                  type="time"
                  value={clinicHours[key as keyof ClinicHoursData].end}
                  onChange={(e) => updateDayHours(key as keyof ClinicHoursData, 'end', e.target.value)}
                  disabled={!clinicHours[key as keyof ClinicHoursData].enabled}
                  className="w-32"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Time Format Toggle */}
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Switch
            id="24-hour-format"
            checked={is24HourFormat}
            onCheckedChange={setIs24HourFormat}
          />
          <Label htmlFor="24-hour-format" className="text-sm">
            24-hour format
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={saveWorkingHours} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={resetToDefault} variant="outline">
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}