'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Thermometer, 
  Gauge, 
  Wind,
  Activity,
  Droplets
} from 'lucide-react';
import { VitalSignsCollection } from '@/interfaces/patient/patient-workflow.interface';
import { formatStatus } from '@/utils/format-status';

interface VitalSignsDisplayProps {
  vitalSigns: VitalSignsCollection;
  showHeader?: boolean;
}

export function VitalSignsDisplay({ 
  vitalSigns, 
  showHeader = true 
}: VitalSignsDisplayProps) {
  const getVitalSignStatus = (value: number, normalRange: { min: number; max: number }) => {
    if (value < normalRange.min) return { status: 'low', color: 'bg-blue-100 text-blue-800' };
    if (value > normalRange.max) return { status: 'high', color: 'bg-red-100 text-red-800' };
    return { status: 'normal', color: 'bg-green-100 text-green-800' };
  };

  const formatValue = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  const vitalSignsData = [
    {
      key: 'bloodPressure',
      label: 'Blood Pressure',
      value: vitalSigns.bloodPressure,
      unit: 'mmHg',
      icon: Activity,
      normalRange: { min: 90, max: 140 },
      format: (bp: any) => bp ? `${bp.systolic}/${bp.diastolic}` : 'N/A'
    },
    {
      key: 'heartRate',
      label: 'Heart Rate',
      value: vitalSigns.heartRate,
      unit: 'bpm',
      icon: Heart,
      normalRange: { min: 60, max: 100 },
      format: (hr: number) => formatValue(hr, 'bpm')
    },
    {
      key: 'temperature',
      label: 'Temperature',
      value: vitalSigns.temperature,
      unit: '°F',
      icon: Thermometer,
      normalRange: { min: 97, max: 99.5 },
      format: (temp: number) => formatValue(temp, '°F')
    },
    {
      key: 'respiratoryRate',
      label: 'Respiratory Rate',
      value: vitalSigns.respiratoryRate,
      unit: 'breaths/min',
      icon: Wind,
      normalRange: { min: 12, max: 20 },
      format: (rr: number) => formatValue(rr, 'breaths/min')
    },
    {
      key: 'oxygenSaturation',
      label: 'Oxygen Saturation',
      value: vitalSigns.oxygenSaturation,
      unit: '%',
      icon: Droplets,
      normalRange: { min: 95, max: 100 },
      format: (spo2: number) => formatValue(spo2, '%')
    },
    {
      key: 'weight',
      label: 'Weight',
      value: vitalSigns.weight,
      unit: 'lbs',
      icon: Gauge,
      normalRange: { min: 100, max: 300 },
      format: (weight: number) => formatValue(weight, 'lbs')
    }
  ];

  const hasAnyVitalSigns = vitalSignsData.some(item => item.value !== undefined && item.value !== null);

  if (!hasAnyVitalSigns) {
    return (
      <div className="text-center py-4 text-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No vital signs recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-medium">Vital Signs</h3>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vitalSignsData.map((vital) => {
          if (vital.value === undefined || vital.value === null) return null;
          
          const Icon = vital.icon;
          let status = null;
          
          // Special handling for blood pressure
          if (vital.key === 'bloodPressure' && typeof vital.value === 'object') {
            const bp = vital.value as any;
            if (bp.systolic && bp.diastolic) {
              status = getVitalSignStatus(bp.systolic, vital.normalRange);
            }
          } else if (typeof vital.value === 'number') {
            status = getVitalSignStatus(vital.value, vital.normalRange);
          }

          return (
            <div key={vital.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-sm font-medium">{vital.label}</p>
                  <p className="text-lg font-semibold">
                    {vital.key === 'bloodPressure' && typeof vital.value === 'object'
                      ? vital.format(vital.value)
                      : vital.format(vital.value as number)
                    }
                  </p>
                </div>
              </div>
              {status && (
                <Badge 
                  variant="outline" 
                  className={`${status.color} border-0`}
                >
                  {formatStatus(status.status)}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Notes */}
      {vitalSigns.notes && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Notes: </span>
            {vitalSigns.notes}
          </p>
        </div>
      )}

      {/* Recorded Time */}
      {vitalSigns.recordedAt && (
        <div className="text-xs text-foreground text-center">
          Recorded: {new Date(vitalSigns.recordedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
