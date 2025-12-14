'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Grid, 
  List, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Activity,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PatientListProps, Patient, PatientViewMode, PatientSortBy } from '@/common/interfaces/patient/patient-workflow.interface';
import { format } from 'date-fns';
import PatientCard from './PatientCard';

const PatientList: React.FC<PatientListProps> = ({
  patients,
  loading,
  error,
  onEdit,
  onView,
  onDelete,
  onSelect,
  selectedPatients,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getSortIcon = (field: PatientSortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (field: PatientSortBy) => {
    onSort(field);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading patients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32 text-red-600">
            <div className="text-center">
              <p className="font-medium">Error loading patients</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users className="h-12 w-12 mb-2" />
            <p className="font-medium">No patients found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === PatientViewMode.GRID || viewMode === PatientViewMode.CARD) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onSelect={onSelect}
            selected={selectedPatients.includes(patient.id)}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Patients ({patients.length})</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>{patients.reduce((sum, p) => sum + (p.encountersCount || 0), 0)} encounters</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{patients.reduce((sum, p) => sum + (p.diagnosesCount || 0), 0)} diagnoses</span>
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPatients.length === patients.length && patients.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      patients.forEach(patient => onSelect(patient.id, true));
                    } else {
                      patients.forEach(patient => onSelect(patient.id, false));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort(PatientSortBy.NAME)}
                  className="h-auto p-0 font-semibold"
                >
                  <span className="flex items-center space-x-1">
                    <span>Name</span>
                    {getSortIcon(PatientSortBy.NAME)}
                  </span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort(PatientSortBy.PATIENT_CODE)}
                  className="h-auto p-0 font-semibold"
                >
                  <span className="flex items-center space-x-1">
                    <span>Code</span>
                    {getSortIcon(PatientSortBy.PATIENT_CODE)}
                  </span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort(PatientSortBy.DATE_OF_BIRTH)}
                  className="h-auto p-0 font-semibold"
                >
                  <span className="flex items-center space-x-1">
                    <span>Age</span>
                    {getSortIcon(PatientSortBy.DATE_OF_BIRTH)}
                  </span>
                </Button>
              </TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Encounters</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort(PatientSortBy.CREATED_AT)}
                  className="h-auto p-0 font-semibold"
                >
                  <span className="flex items-center space-x-1">
                    <span>Created</span>
                    {getSortIcon(PatientSortBy.CREATED_AT)}
                  </span>
                </Button>
              </TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow 
                key={patient.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedPatients.includes(patient.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelect(patient.id, !selectedPatients.includes(patient.id))}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={(e) => onSelect(patient.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {patient.patientCode}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {calculateAge(patient.dateOfBirth)} years
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {patient.gender}
                  </Badge>
                </TableCell>
                <TableCell>
                  {patient.bloodType ? (
                    <Badge variant="outline">
                      {patient.bloodType}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={patient.isActive ? "default" : "secondary"}
                    className={patient.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{patient.encountersCount || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(patient)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(patient)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(patient.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PatientList;
