'use client';

import { Button } from '@/components/ui/button';
import { Users, Building2, CalendarClock } from 'lucide-react';

interface RoomAssignmentQuickActionsProps {
  onAssign: () => void;
}

export function RoomAssignmentQuickActions({
  onAssign,
}: RoomAssignmentQuickActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onAssign} className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Assign Employee
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Manage Rooms
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4" />
        View Schedules
      </Button>
    </div>
  );
}

