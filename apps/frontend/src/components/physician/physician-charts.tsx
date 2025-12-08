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
  PieChart,
  Pie,
  Cell,
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
import { PhysicianAnalyticsData } from "@/store/analyticsApi";
import { formatPieLabel, formatPieTooltip } from "@/components/common/chart-utils";
import { Inbox } from "lucide-react";

interface PhysicianChartsProps {
  data?: PhysicianAnalyticsData;
  isLoading?: boolean;
  period?: "week" | "month" | "year";
  value?: string;
  appliedPeriod?: "week" | "month" | "year";
  appliedValue?: string;
  onPeriodChange?: (period: "week" | "month" | "year" | undefined) => void;
  onValueChange?: (value: string) => void;
  onApplyFilter?: () => void;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function PhysicianCharts({
  data,
  isLoading = false,
  period,
  value,
  appliedPeriod,
  onPeriodChange,
  onValueChange,
  onApplyFilter,
}: PhysicianChartsProps) {
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const encountersOverTime = data.encountersOverTime || [];
  const reportsOverTime = data.reportsOverTime || [];
  const imagingOrdersOverTime = data.imagingOrdersOverTime || [];

  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (appliedPeriod === "year") {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }
    if (appliedPeriod === "month") {
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
              <CardDescription>Filter charts by period</CardDescription>
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
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Encounters Over Time</CardTitle>
            <CardDescription>Patient visits trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={encountersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="encounters"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Reports & Imaging Orders</CardTitle>
            <CardDescription>
              Diagnosis reports and imaging orders trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[...reportsOverTime, ...imagingOrdersOverTime].reduce(
                  (acc, item) => {
                    const existing = acc.find((a: any) => a.date === item.date);
                    if (existing) {
                      existing.reports = item.reports || existing.reports || 0;
                      existing.imagingOrders =
                        item.imagingOrders || existing.imagingOrders || 0;
                    } else {
                      acc.push({
                        date: item.date,
                        reports: item.reports || 0,
                        imagingOrders: item.imagingOrders || 0,
                      });
                    }
                    return acc;
                  },
                  [] as any[]
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Reports"
                />
                <Line
                  type="monotone"
                  dataKey="imagingOrders"
                  stroke="#FF8042"
                  strokeWidth={2}
                  name="Imaging Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Encounters by Status</CardTitle>
            <CardDescription>
              Distribution of encounter statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.encountersByStatus && data.encountersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.encountersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={formatPieLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.encountersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Inbox className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No encounter data</p>
                <p className="text-xs text-slate-400 mt-1">No encounters found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {data.reportsByStatus && data.reportsByStatus.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Reports by Status</CardTitle>
              <CardDescription>Distribution of report statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.reportsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={formatPieLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.reportsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Imaging Orders by Status</CardTitle>
            <CardDescription>
              Distribution of imaging order statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.imagingOrdersByStatus && data.imagingOrdersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.imagingOrdersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={formatPieLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.imagingOrdersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatPieTooltip} />
                  </PieChart>
                </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Inbox className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No imaging order data</p>
                <p className="text-xs text-slate-400 mt-1">No imaging orders found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
