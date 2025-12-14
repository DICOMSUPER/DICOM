'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  Phone,
  MapPin,
  Activity,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Patient, PatientCardProps, PatientViewMode, Gender, BloodType } from '@/common/interfaces/patient/patient-workflow.interface';
import { format } from 'date-fns';

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onView,
  onDelete,
  onSelect,
  selected = false,
  viewMode = PatientViewMode.CARD,
}) => {
  const getGenderColor = (gender: Gender) => {
    switch (gender) {
      case Gender.MALE:
        return 'bg-blue-100 text-blue-800';
      case Gender.FEMALE:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBloodTypeColor = (bloodType: BloodType) => {
    switch (bloodType) {
      case BloodType.O_Positive:
      case BloodType.O_Negative:
        return 'bg-red-100 text-red-800';
      case BloodType.A_Positive:
      case BloodType.A_Negative:
        return 'bg-green-100 text-green-800';
      case BloodType.B_Positive:
      case BloodType.B_Negative:
        return 'bg-yellow-100 text-yellow-800';
      case BloodType.AB_Positive:
      case BloodType.AB_Negative:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

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

  const handleSelect = () => {
    onSelect(patient.id, !selected);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(patient);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(patient);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(patient.id);
  };

  if (viewMode === PatientViewMode.LIST) {
    return (
      <div 
        className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
          selected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
        }`}
        onClick={handleSelect}
      >
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <Badge className={getGenderColor(patient.gender)}>
                {patient.gender}
              </Badge>
              <Badge className={getStatusColor(patient.isActive)}>
                {patient.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>Code: {patient.patientCode}</span>
              <span>Age: {calculateAge(patient.dateOfBirth)}</span>
              {patient.bloodType && (
                <Badge className={getBloodTypeColor(patient.bloodType)}>
                  {patient.bloodType}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {patient.encountersCount || 0} encounters
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
      }`}
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={handleSelect}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <CardTitle className="text-lg font-semibold">
                {patient.firstName} {patient.lastName}
              </CardTitle>
              <p className="text-sm text-gray-500">Code: {patient.patientCode}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className={getGenderColor(patient.gender)}>
                {patient.gender}
              </Badge>
              <Badge className={getStatusColor(patient.isActive)}>
                {patient.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <span className="text-sm text-gray-500">
              Age: {calculateAge(patient.dateOfBirth)}
            </span>
          </div>

          {/* Contact Info */}
          {patient.phoneNumber && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{patient.phoneNumber}</span>
            </div>
          )}

          {patient.address && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}

          {/* Medical Info */}
          <div className="flex items-center space-x-2">
            {patient.bloodType && (
              <Badge className={getBloodTypeColor(patient.bloodType)}>
                {patient.bloodType}
              </Badge>
            )}
            {patient.insuranceNumber && (
              <span className="text-xs text-gray-500">
                Insurance: {patient.insuranceNumber}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>{patient.encountersCount || 0} encounters</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{patient.diagnosesCount || 0} diagnoses</span>
              </div>
            </div>
            {patient.lastEncounterDate && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Last visit: {format(new Date(patient.lastEncounterDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-400">
            Created: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
