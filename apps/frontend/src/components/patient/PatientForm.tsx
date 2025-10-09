'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Droplets, 
  CreditCard,
  Save,
  X
} from 'lucide-react';
import { PatientFormProps, CreatePatientDto, UpdatePatientDto, Patient } from '@/interfaces/patient/patient-workflow.interface';
import { Gender, BloodType } from '@/enums/patient-workflow.enum';
import { formatInsuranceNumber, validateInsuranceNumber } from '@/lib/validation/patient-form';

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
}) => {
  const [formData, setFormData] = useState<CreatePatientDto | UpdatePatientDto>({
    patientCode: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: Gender.MALE,
    phoneNumber: '',
    address: '',
    bloodType: undefined,
    insuranceNumber: '',
    isActive: true,
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        gender: patient.gender,
        phoneNumber: patient.phoneNumber || '',
        address: patient.address || '',
        bloodType: patient.bloodType,
        insuranceNumber: patient.insuranceNumber || '',
        isActive: patient.isActive,
      });
    }
  }, [patient]);

  const handleInputChange = (field: keyof (CreatePatientDto | UpdatePatientDto), value: any) => {
    // Special handling for insurance number
    if (field === 'insuranceNumber') {
      const formattedValue = formatInsuranceNumber(value);
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditMode = !!patient;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{isEditMode ? 'Edit Patient' : 'Register New Patient'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientCode">Patient Code *</Label>
                <Input
                  id="patientCode"
                  placeholder="Enter patient code"
                  value={formData.patientCode || ''}
                  onChange={(e) => handleInputChange('patientCode', e.target.value)}
                  disabled={isEditMode}
                  className={errors.patientCode ? 'border-red-500' : ''}
                />
                {errors.patientCode && (
                  <p className="text-sm text-red-600">{errors.patientCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className={`pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value as Gender)}
                >
                  <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    {Object.values(Gender).map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={formData.bloodType || 'not-specified'}
                  onValueChange={(value) => handleInputChange('bloodType', value === 'not-specified' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    <SelectItem value="not-specified">Not specified</SelectItem>
                    {Object.values(BloodType).map((bloodType) => (
                      <SelectItem key={bloodType} value={bloodType}>
                        {bloodType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    placeholder="Enter address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
            
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Insurance Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="insuranceNumber"
                    placeholder="Enter 10-digit insurance number"
                    value={formData.insuranceNumber || ''}
                    onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                    className={`pl-10 ${errors.insuranceNumber ? 'border-red-500' : ''}`}
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
                {errors.insuranceNumber && (
                  <p className="text-sm text-red-600">{errors.insuranceNumber}</p>
                )}
                {formData.insuranceNumber && !validateInsuranceNumber(formData.insuranceNumber) && (
                  <p className="text-sm text-amber-600">
                    Insurance number must be exactly 10 digits
                  </p>
                )}
              </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Patient
              </Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{isEditMode ? 'Update Patient' : 'Create Patient'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
