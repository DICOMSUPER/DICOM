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
import { RadiologistAnalyticsData } from "@/store/analyticsApi";
import { Inbox } from "lucide-react";

interface RadiologistChartsProps {
  data?: RadiologistAnalyticsData;
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

export function RadiologistCharts({
  data,
  isLoading = false,
  period,
  value,
  appliedPeriod,
  appliedValue,
  onPeriodChange,
  onValueChange,
  onApplyFilter,
}: RadiologistChartsProps) {
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

  const studiesOverTime = data.studiesOverTime || [];
  const reportsOverTime = data.reportsOverTime || [];

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
                  onPeriodChange?.(val === "default" ? undefined : (val as "week" | "month" | "year"))
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
            <CardTitle>Studies Over Time</CardTitle>
            <CardDescription>Studies trend</CardDescription>
          </CardHeader>
          <CardContent>
            {studiesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={studiesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="studies"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No study data</p>
                <p className="text-xs text-slate-400 mt-1">No studies found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Reports Over Time</CardTitle>
            <CardDescription>Reports trend</CardDescription>
          </CardHeader>
          <CardContent>
            {reportsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportsOverTime}>
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
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No report data</p>
                <p className="text-xs text-slate-400 mt-1">No reports found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Studies by Status</CardTitle>
            <CardDescription>
              Distribution of study statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.studiesByStatus && data.studiesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.studiesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const status = entry.status || entry.name || "";
                      const percent = entry.percent;
                      if (!status || percent === undefined || percent === null)
                        return "";
                      const statusStr =
                        typeof status === "string" ? status : String(status);
                      const capitalizedName =
                        statusStr?.charAt(0).toUpperCase() +
                        statusStr.slice(1).toLowerCase().replace(/_/g, " ");
                      return `${capitalizedName}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.studiesByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      // Ensure name is a string before calling string methods
                      const nameStr = typeof name === 'string' ? name : String(name || '');
                      if (!nameStr) return [value, ''];
                      const capitalizedName =
                        nameStr.charAt(0).toUpperCase() +
                        nameStr.slice(1).toLowerCase().replace(/_/g, " ");
                      return [value, capitalizedName];
                    }}
                    labelFormatter={(label: any) => {
                      // Ensure label is a string before calling string methods
                      const labelStr = typeof label === 'string' ? label : String(label || '');
                      if (!labelStr) return '';
                      return (
                        labelStr.charAt(0).toUpperCase() +
                        labelStr.slice(1).toLowerCase().replace(/_/g, " ")
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No study status data</p>
                <p className="text-xs text-slate-400 mt-1">No study status found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Reports by Status</CardTitle>
            <CardDescription>Distribution of report statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {data.reportsByStatus && data.reportsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.reportsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const status = entry.status || entry.name || "";
                      const percent = entry.percent;
                      if (!status || percent === undefined || percent === null)
                        return "";
                      const statusStr =
                        typeof status === "string" ? status : String(status);
                      const capitalizedName =
                        statusStr?.charAt(0).toUpperCase() +
                        statusStr.slice(1).toLowerCase().replace(/_/g, " ");
                      return `${capitalizedName}: ${(percent * 100).toFixed(0)}%`;
                    }}
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
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      // Ensure name is a string before calling string methods
                      const nameStr = typeof name === 'string' ? name : String(name || '');
                      if (!nameStr) return [value, ''];
                      const capitalizedName =
                        nameStr.charAt(0).toUpperCase() +
                        nameStr.slice(1).toLowerCase().replace(/_/g, " ");
                      return [value, capitalizedName];
                    }}
                    labelFormatter={(label: any) => {
                      // Ensure label is a string before calling string methods
                      const labelStr = typeof label === 'string' ? label : String(label || '');
                      if (!labelStr) return '';
                      return (
                        labelStr.charAt(0).toUpperCase() +
                        labelStr.slice(1).toLowerCase().replace(/_/g, " ")
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No report status data</p>
                <p className="text-xs text-slate-400 mt-1">No report status found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Studies by Modality</CardTitle>
            <CardDescription>
              Distribution of studies by imaging modality
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.studiesByModality && data.studiesByModality.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.studiesByModality}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const modality = entry.modality || entry.name || "";
                      const percent = entry.percent;
                      if (!modality || percent === undefined || percent === null)
                        return "";
                      const modalityStr =
                        typeof modality === "string" ? modality : String(modality);
                      const capitalizedName =
                        modalityStr?.charAt(0).toUpperCase() +
                        modalityStr.slice(1).toLowerCase().replace(/_/g, " ");
                      return `${capitalizedName}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.studiesByModality.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      // Ensure name is a string before calling string methods
                      const nameStr = typeof name === 'string' ? name : String(name || '');
                      if (!nameStr) return [value, ''];
                      const capitalizedName =
                        nameStr.charAt(0).toUpperCase() +
                        nameStr.slice(1).toLowerCase().replace(/_/g, " ");
                      return [value, capitalizedName];
                    }}
                    labelFormatter={(label: any) => {
                      // Ensure label is a string before calling string methods
                      const labelStr = typeof label === 'string' ? label : String(label || '');
                      if (!labelStr) return '';
                      return (
                        labelStr.charAt(0).toUpperCase() +
                        labelStr.slice(1).toLowerCase().replace(/_/g, " ")
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No modality data</p>
                <p className="text-xs text-slate-400 mt-1">No modality found for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

