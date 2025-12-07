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
import { ImagingTechnicianAnalyticsData } from "@/store/analyticsApi";

interface ImagingTechnicianChartsProps {
  data?: ImagingTechnicianAnalyticsData;
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

export function ImagingTechnicianCharts({
  data,
  isLoading = false,
  period,
  value,
  appliedPeriod,
  appliedValue,
  onPeriodChange,
  onValueChange,
  onApplyFilter,
}: ImagingTechnicianChartsProps) {
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

  const imagingOrdersOverTime = data.imagingOrdersOverTime || [];
  const studiesOverTime = data.studiesOverTime || [];

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
            <CardTitle>Imaging Orders Over Time</CardTitle>
            <CardDescription>Orders trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={imagingOrdersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="imagingOrders"
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
            <CardTitle>Studies Over Time</CardTitle>
            <CardDescription>Studies trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studiesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatXAxisLabel} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="studies"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Studies"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {data.imagingOrdersByStatus && data.imagingOrdersByStatus.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>
                Distribution of imaging order statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.imagingOrdersByStatus}
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
                    {data.imagingOrdersByStatus.map((entry, index) => (
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
            </CardContent>
          </Card>

          {data.ordersByModality && data.ordersByModality.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Orders by Modality</CardTitle>
                <CardDescription>
                  Distribution of orders by imaging modality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.ordersByModality}
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
                      {data.ordersByModality.map((entry, index) => (
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
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

