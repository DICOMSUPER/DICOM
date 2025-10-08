'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Pill, FileText, Clock, Eye } from 'lucide-react';
import { PatientSummary } from '@/types/patient-detail';

interface PatientSummaryProps {
  summary: PatientSummary;
}

export function PatientSummaryTab({ summary }: PatientSummaryProps) {
  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Summary</h2>
        <p className="text-gray-600 text-sm">Overview of patient's health status and recent activities.</p>
      </div>



      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Vital Signs Trend</CardTitle>
            <Button variant="link" className="text-blue-600">
              View History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summary.vitalSigns.map((vital) => (
              <div key={vital.type} className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{vital.type}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{vital.value}</span>
                    <span className="text-sm text-gray-600">{vital.unit}</span>
                  </div>
                  <div className="text-xs text-gray-500">Last Checked: {vital.date}</div>
                </div>
                
                {/* Simple trend indicator */}
                <div className="space-y-2">
                  <div className={`h-2 rounded-full ${
                    vital.status === 'Normal' ? 'bg-green-200' :
                    vital.status === 'High' ? 'bg-orange-200' :
                    vital.status === 'Low' ? 'bg-blue-200' : 'bg-red-200'
                  }`}>
                    <div className={`h-full rounded-full ${
                      vital.status === 'Normal' ? 'bg-green-500' :
                      vital.status === 'High' ? 'bg-orange-500' :
                      vital.status === 'Low' ? 'bg-blue-500' : 'bg-red-500'
                    }`} style={{ width: '70%' }}></div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      vital.status === 'Normal' ? 'bg-green-50 text-green-700 border-green-200' :
                      vital.status === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      vital.status === 'Low' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }
                  >
                    {vital.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}