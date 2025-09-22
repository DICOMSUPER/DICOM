'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientDetail } from '@/types/patient-detail';
import { User } from 'lucide-react';

interface PatientProfileCardProps {
  patient: PatientDetail;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="h-fit border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Patient Profile</CardTitle>
        </div>
        <p className="text-sm text-gray-600">Patient ID: {patient.patientId}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Basic Info */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-gray-600">{patient.age} years • {patient.gender}</p>
            <div className="flex justify-center mt-2">
              <Badge
                variant={patient.status === 'Active' ? 'default' : 'secondary'}
                className={
                  patient.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {patient.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">Personal Information</span>
          </div>
          <div className="space-y-2 pl-6">
            <div className="flex items-center gap-2 text-sm">
              
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">{patient.personalInfo.dateOfBirth}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
             
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{patient.personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-blue-600">{patient.personalInfo.email}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
         
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">{patient.personalInfo.address}</span>
            </div>
          </div>
        </div>


        {/* Registration Info */}
        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <div>Registered on: {patient.registeredOn}</div>
          <div>Last Updated: {patient.lastUpdated}</div>
        </div>
      </CardContent>
    </Card>
  );
}