"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PeriodValuePicker } from "@/components/ui/period-value-picker";
import { AnalyticsData } from "@/store/analyticsApi";

interface ReceptionChartsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
  period?: 'week' | 'month' | 'year';
  value?: string;
  appliedPeriod?: 'week' | 'month' | 'year';
  appliedValue?: string;
  onPeriodChange?: (period: 'week' | 'month' | 'year' | undefined) => void;
  onValueChange?: (value: string) => void;
  onApplyFilter?: () => void;
}

export function ReceptionCharts({ 
  data, 
  isLoading = false,
  period,
  value,
  appliedPeriod,
  appliedValue,
  onPeriodChange,
  onValueChange,
  onApplyFilter,
}: ReceptionChartsProps) {
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[100px] w-full rounded-md" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const encountersOverTime = data.encountersOverTime || [];
  const patientsOverTime = data.patientsOverTime || [];

  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (appliedPeriod === 'year') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    if (appliedPeriod === 'month') {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Time Period Filter</CardTitle>
              <CardDescription>Filter encounters and patients charts by period</CardDescription>
            </div>
            <Button 
              onClick={onApplyFilter}
              disabled={isLoading || (period && !value)}
            >
              Apply Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="period">Period Type</Label>
              <Select
                value={period || 'default'}
                onValueChange={(val) => onPeriodChange?.(val === 'default' ? undefined : val as 'week' | 'month' | 'year')}
              >
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (Last 7 days)</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period && (
              <div className="space-y-2">
                <Label htmlFor="value">Period Value</Label>
                <PeriodValuePicker
                  period={period}
                  value={value}
                  onChange={onValueChange}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Encounters Over Time</CardTitle>
            <CardDescription>
              {appliedPeriod === 'week' ? `Week: ${appliedValue || 'N/A'}` :
               appliedPeriod === 'month' ? `Month: ${appliedValue || 'N/A'}` :
               appliedPeriod === 'year' ? `Year: ${appliedValue || 'N/A'}` :
               'Last 7 days'}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={encountersOverTime}>
              <defs>
                <linearGradient id="colorEncounters" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="encounters" 
                stroke="#0088FE" 
                fillOpacity={1}
                fill="url(#colorEncounters)"
                name="Encounters"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Patients Over Time</CardTitle>
            <CardDescription>
              {appliedPeriod === 'week' ? `Week: ${appliedValue || 'N/A'}` :
               appliedPeriod === 'month' ? `Month: ${appliedValue || 'N/A'}` :
               appliedPeriod === 'year' ? `Year: ${appliedValue || 'N/A'}` :
               'Last 7 days'}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Patients"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

