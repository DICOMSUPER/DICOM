'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, Download } from 'lucide-react';
import { LabResult } from '@/types/patient-detail';

interface LabResultsTabProps {
  labResults: LabResult[];
}

export function LabResultsTab({ labResults }: LabResultsTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lab Results</h2>
          <p className="text-gray-600 text-sm mt-1">Laboratory test results and reports.</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Order Lab Test
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{result.testName}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(result.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {result.results && (
                      <div className="text-sm text-gray-600">{result.results}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={getStatusColor(result.status)}
                  >
                    {result.status}
                  </Badge>
                  {result.status === 'Completed' && (
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {labResults.filter(r => r.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {labResults.filter(r => r.status === 'Pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{labResults.length}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}