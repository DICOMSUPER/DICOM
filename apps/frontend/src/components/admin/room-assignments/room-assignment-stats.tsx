"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, CheckCircle2, Layers3 } from "lucide-react";

interface RoomAssignmentStatsProps {
  totalAssignments: number;
  activeAssignments: number;
  uniqueRooms: number;
  uniqueEmployees: number;
  isLoading?: boolean;
}

const statIcons = {
  total: Users,
  active: CheckCircle2,
  rooms: Building,
  employees: Layers3,
};

export function RoomAssignmentStats({
  totalAssignments,
  activeAssignments,
  uniqueRooms,
  uniqueEmployees,
  isLoading,
}: RoomAssignmentStatsProps) {
  const stats = [
    {
      label: "Total Assignments",
      value: totalAssignments,
      description: "Overall scheduled assignments",
      icon: statIcons.total,
    },
    {
      label: "Rooms Covered",
      value: uniqueRooms,
      description: "Unique rooms with assignments",
      icon: statIcons.rooms,
    },
    {
      label: "Employees Assigned",
      value: uniqueEmployees,
      description: "Unique employees scheduled",
      icon: statIcons.employees,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "—" : stat.value}
            </div>
            <p className="text-xs text-foreground flex items-center gap-2">
              {stat.description}
              {stat.badge && (
                <Badge variant="outline" className="text-xs font-normal">
                  {stat.badge}
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

