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
  FileText, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus
} from 'lucide-react';
import { Prescription } from '@/interfaces/patient/prescription.interface';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  loading?: boolean;
  onEdit?: (prescription: Prescription) => void;
  onDelete?: (id: string) => void;
  onView?: (prescription: Prescription) => void;
  onCreate?: () => void;
}

export function PrescriptionList({
  prescriptions,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
}: PrescriptionListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.physician_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
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
            <FileText className="h-5 w-5" />
            Prescriptions ({filteredPrescriptions.length})
          </CardTitle>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-foreground mx-auto mb-4" />
            <p className="text-foreground">No prescriptions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prescription Number</TableHead>
                <TableHead>Encounter ID</TableHead>
                <TableHead>Physician ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.prescription_id}>
                  <TableCell className="font-medium">
                    {prescription.prescription_number || 'N/A'}
                  </TableCell>
                  <TableCell>{prescription.visit_id || 'N/A'}</TableCell>
                  <TableCell>{prescription.physician_id || 'N/A'}</TableCell>
                  <TableCell>{formatDate(prescription.prescription_date)}</TableCell>
                  <TableCell>
                    <Badge variant={prescription.is_deleted ? 'destructive' : 'default'}>
                      {prescription.is_deleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(prescription)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && !prescription.is_deleted && (
                          <DropdownMenuItem onClick={() => onEdit(prescription)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && !prescription.is_deleted && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(prescription.prescription_id)}
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
