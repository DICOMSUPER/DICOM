import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PatientsHeaderProps {
  onAddPatient: () => void;
}

export function PatientsHeader({ onAddPatient }: PatientsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Patients
        </h1>
        <p className="text-gray-600">
          Manage your patients and their medical records.
        </p>
      </div>
      <Button 
        onClick={onAddPatient}
        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Patient
      </Button>
    </div>
  );
}