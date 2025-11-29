'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  Save,
  X
} from 'lucide-react';
import { VitalSignsCollection, VitalSignCode, VitalSignUnit } from '@/interfaces/patient/patient-workflow.interface';
import { Roles } from '@/enums/user.enum';
import type { RootState } from '@/store';

interface VitalSignsFormProps {
  vitalSigns?: VitalSignsCollection;
  onSubmit: (vitalSigns: VitalSignsCollection) => void;
  onCancel: () => void;
  loading?: boolean;
  errors?: Record<string, string>;
}

const VITAL_SIGNS_CONFIG = [
  {
    code: '8867-4' as VitalSignCode,
      display: 'Heart Rate',
    unit: '/min' as VitalSignUnit,
      icon: Heart,
    normalRange: { min: 60, max: 100 },
    color: 'text-red-600'
  },
  {
    code: '8310-5' as VitalSignCode,
    display: 'Body Temperature',
    unit: '°C' as VitalSignUnit,
    icon: Thermometer,
    normalRange: { min: 36.1, max: 37.2 },
    color: 'text-orange-600'
  },
  {
    code: '9279-1' as VitalSignCode,
    display: 'Respiratory Rate',
    unit: '/min' as VitalSignUnit,
    icon: Wind,
    normalRange: { min: 12, max: 20 },
    color: 'text-blue-600'
  },
  {
    code: '85354-9' as VitalSignCode,
    display: 'Blood Pressure Systolic',
    unit: 'mmHg' as VitalSignUnit,
      icon: Activity,
    normalRange: { min: 90, max: 140 },
    color: 'text-purple-600'
  },
  {
    code: '8462-4' as VitalSignCode,
    display: 'Blood Pressure Diastolic',
    unit: 'mmHg' as VitalSignUnit,
    icon: Activity,
    normalRange: { min: 60, max: 90 },
    color: 'text-purple-600'
  },
  {
    code: '29463-7' as VitalSignCode,
    display: 'Body Weight',
    unit: 'kg' as VitalSignUnit,
    icon: Activity,
    normalRange: { min: 50, max: 150 },
    color: 'text-green-600'
  },
  {
    code: '8302-2' as VitalSignCode,
    display: 'Body Height',
    unit: 'cm' as VitalSignUnit,
    icon: Activity,
    normalRange: { min: 150, max: 200 },
    color: 'text-green-600'
  }
];

export function VitalSignsForm({
  vitalSigns = {},
  onSubmit,
  onCancel,
  loading = false,
  errors = {}
}: VitalSignsFormProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isReceptionStaff = user?.role === Roles.RECEPTION_STAFF;
  
  const [formData, setFormData] = useState<VitalSignsCollection>(vitalSigns);
  const [measuredAt, setMeasuredAt] = useState(() => {
    // Get measuredAt from existing vital signs or use current time
    const existingMeasuredAt = Object.values(vitalSigns)[0]?.measuredAt;
    if (existingMeasuredAt) {
      return new Date(existingMeasuredAt).toISOString().slice(0, 16);
    }
    return new Date().toISOString().slice(0, 16);
  });

  useEffect(() => {
    if (vitalSigns) {
      setFormData(vitalSigns);
    }
  }, [vitalSigns]);

  const handleInputChange = (code: VitalSignCode, value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) && value !== '') return;

    const config = VITAL_SIGNS_CONFIG.find(c => c.code === code);
    if (!config) return;

    setFormData(prev => ({
      ...prev,
      [code]: {
        code,
        display: config.display,
        value: numericValue,
        unit: config.unit,
        measuredAt: new Date(measuredAt)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReceptionStaff) {
      return; // Prevent submission for reception staff
    }
    onSubmit(formData);
  };

  const getValueStatus = (code: VitalSignCode, value: number) => {
    const config = VITAL_SIGNS_CONFIG.find(c => c.code === code);
    if (!config || !value) return 'normal';

    if (value < config.normalRange.min || value > config.normalRange.max) {
      return 'abnormal';
    }
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    return status === 'abnormal' ? 'text-red-600' : 'text-green-600';
  };

  // If reception staff, show read-only message
  if (isReceptionStaff) {
    return (
      <Card className='border-0 shadow-none p-0'>
        <CardContent className='border-0 p-6'>
          <div className="text-center py-8 text-foreground">
            <p className="text-sm">Vital signs editing is not available for reception staff.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-0 shadow-none p-0'>
      <CardContent className='border-0 p-6'>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VITAL_SIGNS_CONFIG.map((config) => {
              const Icon = config.icon;
              const currentValue = formData[config.code]?.value;
              const status = typeof currentValue === 'number' ? getValueStatus(config.code, currentValue) : 'normal';

              return (
                <div key={config.code} className="space-y-2">
                  <Label htmlFor={config.code} className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    {config.display}
                  </Label>
                  <div className="flex items-center gap-2">
                        <Input
                      id={config.code}
                          type="number"
                          step="0.1"
                      value={currentValue ?? ''}
                      onChange={(e) => handleInputChange(config.code, e.target.value)}
                      placeholder={`Enter ${config.display.toLowerCase()}`}
                      className={errors[config.code] ? 'border-red-500' : ''}
                    />
                    <span className="text-sm text-foreground">{config.unit}</span>
                    {currentValue && (
                      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                        {status === 'abnormal' ? '⚠️' : '✓'}
                      </span>
                        )}
                      </div>
                  {errors[config.code] && (
                    <p className="text-sm text-red-500">{errors[config.code]}</p>
                  )}
                  {currentValue && (
                    <p className="text-xs text-foreground">
                      Normal range: {config.normalRange.min}-{config.normalRange.max} {config.unit}
                    </p>
                  )}
                    </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="measuredAt">Measured At</Label>
            <DateTimePicker
              value={measuredAt}
              onChange={(value) => {
                setMeasuredAt(value);
                // Update all vital signs with the new measuredAt time
                const updatedFormData: VitalSignsCollection = {};
                const measuredAtDate = new Date(value);
                Object.keys(formData).forEach((code) => {
                  const vitalSign = formData[code as VitalSignCode];
                  if (vitalSign && !isNaN(measuredAtDate.getTime())) {
                    updatedFormData[code as VitalSignCode] = {
                      ...vitalSign,
                      measuredAt: measuredAtDate,
                    };
                  }
                });
                setFormData(updatedFormData);
              }}
              placeholder="Select date and time"
              error={!!errors.measuredAt}
            />
            {errors.measuredAt && (
              <p className="text-sm text-red-500">{errors.measuredAt}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Vital Signs
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}