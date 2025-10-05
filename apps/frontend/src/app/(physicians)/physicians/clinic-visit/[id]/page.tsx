"use client";
import { usePatientDetail } from '@/hooks/use-patient-detail';
import { PatientProfileCard } from '@/components/patients/detail/patient-profile-card';

import { Skeleton } from '@/components/ui/skeleton';
import ClinicVisit from '@/components/physicians/queue/clinic-visit';
import { mockPatientEncounter } from '@/data/mock-queue';
import { use } from 'react';

interface ClinicVisitDetailPageProps {
   params: Promise<{
    id: string;
  }>;
}

export default function ClinicVisitDetailPage({ params }: ClinicVisitDetailPageProps) {
    const resolvedParams = use(params);
   const {
    patient,
    loading
  } = usePatientDetail(resolvedParams.id);

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl ">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient not found</h2>
          <p className="text-gray-600">The patient you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Patient Profile Sidebar */}
          <div className="lg:col-span-1">
            <PatientProfileCard patient={patient} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ClinicVisit detail={mockPatientEncounter} />
          </div>
        </div>
      </div>
    </div>
  );
}