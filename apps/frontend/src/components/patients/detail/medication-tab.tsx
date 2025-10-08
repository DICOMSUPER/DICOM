'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Calendar } from 'lucide-react';
import { Medication } from '@/types/patient-detail';

interface MedicationsTabProps {
  medications: Medication[];
}

export function MedicationsTab({ medications }: MedicationsTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Discontinued':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Prescriptions</h2>
          <p className="text-gray-600 text-sm mt-1">Current and past medications for this patient.</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.filter(med => med.status === 'Active').map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                    <Pill className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{medication.name}</div>
                    <div className="text-sm text-gray-600">
                      {medication.dosage} • {medication.frequency}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Prescribed: {new Date(medication.prescribedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={getStatusColor(medication.status)}
                  >
                    {medication.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {medications.filter(med => med.status === 'Discontinued').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discontinued Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.filter(med => med.status === 'Discontinued').map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-75"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                      <Pill className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-700">{medication.name}</div>
                      <div className="text-sm text-gray-500">
                        {medication.dosage} • {medication.frequency}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        Prescribed: {new Date(medication.prescribedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(medication.status)}
                  >
                    {medication.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}