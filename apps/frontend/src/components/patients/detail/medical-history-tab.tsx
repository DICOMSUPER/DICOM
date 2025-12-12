'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  MapPin, 
  FileText,
  Stethoscope,
  Syringe,
  Activity
} from 'lucide-react';
import { 
  MedicalProcedure, 
  Diagnosis, 
  Visit, 
  Immunization 
} from '@/types/patient-detail';
import { formatStatus } from '@/utils/format-status';

interface MedicalHistoryTabProps {
  procedures: MedicalProcedure[];
  diagnoses: Diagnosis[];
  visits: Visit[];
  immunizations: Immunization[];
}

export function MedicalHistoryTab({ 
  procedures, 
  diagnoses, 
  visits, 
  immunizations 
}: MedicalHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Resolved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Chronic':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
      case 'No Show':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
          <p className="text-gray-600 text-sm mt-1">Complete medical history and records for this patient.</p>
        </div>
      </div>

      <Tabs defaultValue="procedures" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
            <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </div>
        </div>

        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-500" />
                Procedures & Surgeries
              </CardTitle>
              <p className="text-sm text-gray-600">Medical procedures performed on the patient</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Procedure</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedures.map((procedure) => (
                      <tr key={procedure.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-900">{procedure.date}</td>
                        <td className="py-4 px-4 font-medium text-gray-900">{procedure.procedure}</td>
                        <td className="py-4 px-4 text-gray-600">{procedure.doctor}</td>
                        <td className="py-4 px-4 text-gray-600">{procedure.location}</td>
                        <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{procedure.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnoses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Diagnoses
              </CardTitle>
              <p className="text-sm text-gray-600">Medical diagnoses and conditions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{diagnosis.condition}</h4>
                          <Badge variant="outline" className={getStatusColor(diagnosis.status)}>
                            {formatStatus(diagnosis.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {diagnosis.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {diagnosis.doctor}
                          </div>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {diagnosis.icd10Code}
                          </span>
                        </div>
                        {diagnosis.notes && (
                          <p className="text-sm text-gray-600 mt-2">{diagnosis.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Visits
              </CardTitle>
              <p className="text-sm text-gray-600">Patient visit history and records</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div key={visit.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{visit.type}</h4>
                        <Badge variant="outline" className={getStatusColor(visit.status)}>
                          {formatStatus(visit.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {visit.date} at {visit.time}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Doctor:</span>
                        <span className="ml-2 text-gray-600">{visit.doctor}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Chief Complaint:</span>
                        <span className="ml-2 text-gray-600">{visit.chiefComplaint}</span>
                      </div>
                      {visit.diagnosis && (
                        <div>
                          <span className="font-medium text-gray-700">Diagnosis:</span>
                          <span className="ml-2 text-gray-600">{visit.diagnosis}</span>
                        </div>
                      )}
                      {visit.treatment && (
                        <div>
                          <span className="font-medium text-gray-700">Treatment:</span>
                          <span className="ml-2 text-gray-600">{visit.treatment}</span>
                        </div>
                      )}
                      {visit.followUp && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Follow-up:</span>
                          <span className="ml-2 text-gray-600">{visit.followUp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-purple-500" />
                Immunizations
              </CardTitle>
              <p className="text-sm text-gray-600">Vaccination history and immunization records</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {immunizations.map((immunization) => (
                  <div key={immunization.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{immunization.vaccine}</h4>
                        <p className="text-sm text-gray-600">Dose {immunization.doseNumber}</p>
                      </div>
                      <div className="text-sm text-gray-500">{immunization.date}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Manufacturer:</span>
                        <span className="ml-2 text-gray-600">{immunization.manufacturer}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Lot Number:</span>
                        <span className="ml-2 text-gray-600 font-mono">{immunization.lotNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Administered By:</span>
                        <span className="ml-2 text-gray-600">{immunization.administeredBy}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="ml-2 text-gray-600">{immunization.location}</span>
                      </div>
                      {immunization.nextDueDate && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Next Due:</span>
                          <span className="ml-2 text-gray-600">{immunization.nextDueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}