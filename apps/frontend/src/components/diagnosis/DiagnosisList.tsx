'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Stethoscope, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus
} from 'lucide-react';
import { DiagnosisReport } from '@/interfaces/patient/patient-workflow.interface';
import { DiagnosisType, DiagnosisStatus, Severity } from '@/enums/patient-workflow.enum';

interface DiagnosisListProps {
  diagnoses: DiagnosisReport[];
  loading?: boolean;
  onEdit?: (diagnosis: DiagnosisReport) => void;
  onDelete?: (id: string) => void;
  onView?: (diagnosis: DiagnosisReport) => void;
  onCreate?: () => void;
}

export function DiagnosisList({
  diagnoses,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
}: DiagnosisListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDiagnoses = diagnoses.filter(diagnosis =>
    diagnosis.diagnosisName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.diagnosedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getSeverityColor = (severity: Severity | undefined) => {
    switch (severity) {
      case Severity.CRITICAL:
        return 'bg-red-100 text-red-800';
      case Severity.SEVERE:
        return 'bg-orange-100 text-orange-800';
      case Severity.MODERATE:
        return 'bg-yellow-100 text-yellow-800';
      case Severity.MILD:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: DiagnosisStatus) => {
    switch (status) {
      case DiagnosisStatus.ACTIVE:
        return 'bg-blue-100 text-blue-800';
      case DiagnosisStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case DiagnosisStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Diagnoses ({filteredDiagnoses.length})
          </CardTitle>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Diagnosis
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
            <Input
              placeholder="Search diagnoses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDiagnoses.length === 0 ? (
          <div className="text-center py-6">
            <Stethoscope className="h-12 w-12 text-foreground mx-auto mb-4" />
            <p className="text-foreground">No diagnoses found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Diagnosis Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Physician</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{diagnosis.diagnosisName}</div>
                      {diagnosis.description && (
                        <div className="text-sm text-foreground truncate max-w-xs">
                          {diagnosis.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {diagnosis.diagnosisType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(diagnosis.diagnosisStatus)}>
                      {diagnosis.diagnosisStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {diagnosis.severity && (
                      <Badge className={getSeverityColor(diagnosis.severity)}>
                        {diagnosis.severity}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(diagnosis.diagnosisDate)}</TableCell>
                  <TableCell>{diagnosis.diagnosedBy || 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(diagnosis)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(diagnosis)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(diagnosis.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
