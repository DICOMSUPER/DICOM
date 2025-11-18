'use client';

import type { ReactNode } from 'react';

interface RoomAssignmentsHeaderProps {
  actions?: ReactNode;
}

export function RoomAssignmentsHeader({ actions }: RoomAssignmentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Assignments</h1>
          <p className="text-foreground">
            Manage staff allocations to room schedules
          </p>
        </div>
        {actions}
      </div>
    </div>
  );
}

