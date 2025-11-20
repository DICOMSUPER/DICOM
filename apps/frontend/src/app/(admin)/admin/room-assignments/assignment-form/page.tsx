'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AssignEmployeeForm } from '@/components/admin/room-assignments/assign-employee-form';

function AssignmentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScheduleId = searchParams.get('scheduleId') || undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Assignment Form</h1>
          <p className="text-sm text-foreground">
            Assign an employee to a room schedule
          </p>
        </div>
      </div>

      <AssignEmployeeForm initialScheduleId={initialScheduleId} />
    </div>
  );
}

export default function AssignmentFormPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assignment Form</h1>
            <p className="text-sm text-foreground">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <AssignmentFormContent />
    </Suspense>
  );
}
