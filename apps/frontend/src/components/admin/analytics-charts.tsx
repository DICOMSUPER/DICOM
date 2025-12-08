"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PeriodValuePicker } from "@/components/ui/period-value-picker";
import { AnalyticsData } from "@/store/analyticsApi";

interface AnalyticsChartsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
  period?: "week" | "month" | "year";
  value?: string;
  appliedPeriod?: "week" | "month" | "year";
  appliedValue?: string;
  onPeriodChange?: (period: "week" | "month" | "year" | undefined) => void;
  onValueChange?: (value: string) => void;
  onApplyFilter?: () => void;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

const formatStatusName = (status: string): string => {
  return status
    .split("_")
    .map((word) => word?.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export function AnalyticsCharts({
  data,
  isLoading,
  period,
  value,
  appliedPeriod,
  appliedValue,
  onPeriodChange,
  onValueChange,
  onApplyFilter,
}: AnalyticsChartsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
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
    );
  }

  const encountersOverTime = data.encountersOverTime || [];
  const patientsOverTime = data.patientsOverTime || [];
  const encountersByType = data.encountersByType || [];
  const departmentsDistribution = data.departmentsDistribution || [];
  const roomsByStatus = data.roomsByStatus || [];
  const encountersByStatus = data.encountersByStatus || [];

  const formatPieData = (data: Array<{ status: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      name: formatStatusName(item.status),
    }));
  };

  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === "year") {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }
    if (period === "month") {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Time Period Filter</CardTitle>
              <CardDescription>
                Filter encounters and patients charts by period
              </CardDescription>
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
                value={period || "default"}
                onValueChange={(val) =>
                  onPeriodChange?.(
                    val === "default"
                      ? undefined
                      : (val as "week" | "month" | "year")
                  )
                }
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
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Encounters Over Time</CardTitle>
            <CardDescription>
              {appliedPeriod === "week"
                ? `Week: ${appliedValue || "N/A"}`
                : appliedPeriod === "month"
                ? `Month: ${appliedValue || "N/A"}`
                : appliedPeriod === "year"
                ? `Year: ${appliedValue || "N/A"}`
                : "Last 7 days"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={encountersOverTime}>
                <defs>
                  <linearGradient
                    id="colorEncounters"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
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

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Patients Over Time</CardTitle>
            <CardDescription>
              {appliedPeriod === "week"
                ? `Week: ${appliedValue || "N/A"}`
                : appliedPeriod === "month"
                ? `Month: ${appliedValue || "N/A"}`
                : appliedPeriod === "year"
                ? `Year: ${appliedValue || "N/A"}`
                : "Last 7 days"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
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

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Encounters by Type</CardTitle>
            <CardDescription>Distribution of encounter types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={encountersByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  name="Count"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {departmentsDistribution.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Rooms by Department</CardTitle>
              <CardDescription>
                Room distribution across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#8884d8"
                    name="Rooms"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {roomsByStatus.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Rooms by Status</CardTitle>
              <CardDescription>Room status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatPieData(roomsByStatus)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={formatPieLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {roomsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatPieTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {encountersByStatus.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Encounters by Status</CardTitle>
              <CardDescription>Encounter status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatPieData(encountersByStatus)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={formatPieLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {encountersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatPieTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
