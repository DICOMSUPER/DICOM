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
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Droplets, 
  Ruler, 
  Weight,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { VitalSignsFormProps, VitalSignsCollection, VitalSignMeasurement } from '@/interfaces/patient/patient-workflow.interface';
import { VitalSignCode, VitalSignUnit } from '@/enums/patient-workflow.enum';

const VitalSignsForm: React.FC<VitalSignsFormProps> = ({
  vitalSigns,
  onChange,
  errors = {},
}) => {
  const [localVitalSigns, setLocalVitalSigns] = useState<VitalSignsCollection>(vitalSigns);

  useEffect(() => {
    setLocalVitalSigns(vitalSigns);
  }, [vitalSigns]);

  const vitalSignConfigs = [
    {
      code: VitalSignCode.HEART_RATE,
      display: 'Heart Rate',
      icon: Heart,
      units: [VitalSignUnit.PER_MINUTE],
      defaultUnit: VitalSignUnit.PER_MINUTE,
      placeholder: '72',
      description: 'Beats per minute'
    },
    {
      code: VitalSignCode.SYSTOLIC_BLOOD_PRESSURE,
      display: 'Systolic BP',
      icon: Activity,
      units: [VitalSignUnit.MILLIMETER_MERCURY],
      defaultUnit: VitalSignUnit.MILLIMETER_MERCURY,
      placeholder: '120',
      description: 'Systolic blood pressure'
    },
    {
      code: VitalSignCode.DIASTOLIC_BLOOD_PRESSURE,
      display: 'Diastolic BP',
      icon: Activity,
      units: [VitalSignUnit.MILLIMETER_MERCURY],
      defaultUnit: VitalSignUnit.MILLIMETER_MERCURY,
      placeholder: '80',
      description: 'Diastolic blood pressure'
    },
    {
      code: VitalSignCode.RESPIRATORY_RATE,
      display: 'Respiratory Rate',
      icon: Activity,
      units: [VitalSignUnit.PER_MINUTE],
      defaultUnit: VitalSignUnit.PER_MINUTE,
      placeholder: '16',
      description: 'Breaths per minute'
    },
    {
      code: VitalSignCode.OXYGEN_SATURATION,
      display: 'Oxygen Saturation',
      icon: Droplets,
      units: [VitalSignUnit.PERCENT],
      defaultUnit: VitalSignUnit.PERCENT,
      placeholder: '98',
      description: 'Blood oxygen level'
    },
    {
      code: VitalSignCode.BODY_TEMPERATURE,
      display: 'Body Temperature',
      icon: Thermometer,
      units: [VitalSignUnit.CELSIUS, VitalSignUnit.FAHRENHEIT],
      defaultUnit: VitalSignUnit.CELSIUS,
      placeholder: '37.0',
      description: 'Core body temperature'
    },
    {
      code: VitalSignCode.BODY_HEIGHT,
      display: 'Height',
      icon: Ruler,
      units: [VitalSignUnit.CENTIMETER, VitalSignUnit.METER],
      defaultUnit: VitalSignUnit.CENTIMETER,
      placeholder: '175',
      description: 'Body height'
    },
    {
      code: VitalSignCode.BODY_WEIGHT,
      display: 'Weight',
      icon: Weight,
      units: [VitalSignUnit.KILOGRAM, VitalSignUnit.GRAM],
      defaultUnit: VitalSignUnit.KILOGRAM,
      placeholder: '70',
      description: 'Body weight'
    },
    {
      code: VitalSignCode.BODY_MASS_INDEX,
      display: 'BMI',
      icon: Weight,
      units: [VitalSignUnit.KILOGRAM_PER_SQUARE_METER],
      defaultUnit: VitalSignUnit.KILOGRAM_PER_SQUARE_METER,
      placeholder: '22.9',
      description: 'Body Mass Index'
    }
  ];

  const handleVitalSignChange = (code: VitalSignCode, field: keyof VitalSignMeasurement, value: any) => {
    const config = vitalSignConfigs.find(c => c.code === code);
    if (!config) return;

    const updatedVitalSigns = {
      ...localVitalSigns,
      [code]: {
        code,
        display: config.display,
        value: field === 'value' ? parseFloat(value) || 0 : localVitalSigns[code]?.value || 0,
        unit: field === 'unit' ? value : localVitalSigns[code]?.unit || config.defaultUnit,
        measuredAt: field === 'measuredAt' ? value : localVitalSigns[code]?.measuredAt || new Date(),
        notes: field === 'notes' ? value : localVitalSigns[code]?.notes || '',
        ...(field === 'value' ? { value: parseFloat(value) || 0 } : {}),
        ...(field === 'unit' ? { unit: value } : {}),
        ...(field === 'measuredAt' ? { measuredAt: value } : {}),
        ...(field === 'notes' ? { notes: value } : {}),
      }
    };

    setLocalVitalSigns(updatedVitalSigns);
    onChange(updatedVitalSigns);
  };

  const addVitalSign = (code: VitalSignCode) => {
    const config = vitalSignConfigs.find(c => c.code === code);
    if (!config) return;

    const newVitalSign: VitalSignMeasurement = {
      code,
      display: config.display,
      value: 0,
      unit: config.defaultUnit,
      measuredAt: new Date(),
      notes: ''
    };

    const updatedVitalSigns = {
      ...localVitalSigns,
      [code]: newVitalSign
    };

    setLocalVitalSigns(updatedVitalSigns);
    onChange(updatedVitalSigns);
  };

  const removeVitalSign = (code: VitalSignCode) => {
    const updatedVitalSigns = { ...localVitalSigns };
    delete updatedVitalSigns[code];
    setLocalVitalSigns(updatedVitalSigns);
    onChange(updatedVitalSigns);
  };

  const getUnitDisplay = (unit: VitalSignUnit) => {
    const unitMap: Record<VitalSignUnit, string> = {
      [VitalSignUnit.PER_MINUTE]: '/min',
      [VitalSignUnit.MILLIMETER_MERCURY]: 'mmHg',
      [VitalSignUnit.PERCENT]: '%',
      [VitalSignUnit.CELSIUS]: '°C',
      [VitalSignUnit.FAHRENHEIT]: '°F',
      [VitalSignUnit.CENTIMETER]: 'cm',
      [VitalSignUnit.METER]: 'm',
      [VitalSignUnit.KILOGRAM]: 'kg',
      [VitalSignUnit.GRAM]: 'g',
      [VitalSignUnit.KILOGRAM_PER_SQUARE_METER]: 'kg/m²',
    };
    return unitMap[unit] || unit;
  };

  const getAvailableVitalSigns = () => {
    return vitalSignConfigs.filter(config => !localVitalSigns[config.code]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vital Signs</span>
          {getAvailableVitalSigns().length > 0 && (
            <Select onValueChange={(value) => addVitalSign(value as VitalSignCode)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Add vital sign" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableVitalSigns().map((config) => (
                  <SelectItem key={config.code} value={config.code}>
                    <div className="flex items-center space-x-2">
                      <config.icon className="h-4 w-4" />
                      <span>{config.display}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.keys(localVitalSigns).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No vital signs recorded</p>
            <p className="text-sm">Add vital signs using the dropdown above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(localVitalSigns).map((vitalSign) => {
              const config = vitalSignConfigs.find(c => c.code === vitalSign.code);
              if (!config) return null;

              const IconComponent = config.icon;

              return (
                <Card key={vitalSign.code} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{vitalSign.display}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVitalSign(vitalSign.code)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`value-${vitalSign.code}`}>Value</Label>
                        <Input
                          id={`value-${vitalSign.code}`}
                          type="number"
                          step="0.1"
                          placeholder={config.placeholder}
                          value={vitalSign.value || ''}
                          onChange={(e) => handleVitalSignChange(vitalSign.code, 'value', e.target.value)}
                          className={errors[`vitalSigns.${vitalSign.code}.value`] ? 'border-red-500' : ''}
                        />
                        {errors[`vitalSigns.${vitalSign.code}.value`] && (
                          <p className="text-sm text-red-600">{errors[`vitalSigns.${vitalSign.code}.value`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`unit-${vitalSign.code}`}>Unit</Label>
                        <Select
                          value={vitalSign.unit}
                          onValueChange={(value) => handleVitalSignChange(vitalSign.code, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {config.units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {getUnitDisplay(unit)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`notes-${vitalSign.code}`}>Notes</Label>
                      <Textarea
                        id={`notes-${vitalSign.code}`}
                        placeholder="Additional notes..."
                        value={vitalSign.notes || ''}
                        onChange={(e) => handleVitalSignChange(vitalSign.code, 'notes', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Measured: {vitalSign.measuredAt ? new Date(vitalSign.measuredAt).toLocaleString() : 'Now'}</span>
                      <Badge variant="outline" className="text-xs">
                        {getUnitDisplay(vitalSign.unit)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Validation Errors */}
        {Object.keys(errors).some(key => key.startsWith('vitalSigns')) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Validation Errors</span>
            </div>
            <div className="mt-2 space-y-1">
              {Object.entries(errors)
                .filter(([key]) => key.startsWith('vitalSigns'))
                .map(([key, error]) => (
                  <p key={key} className="text-sm text-red-700">
                    {error}
                  </p>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VitalSignsForm;
