"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RadiologistDashboard() {
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Radiologist Dashboard
        </h1>
        <p className="text-foreground">
          Welcome back! Manage your imaging studies and reports.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Work Tree
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              View and manage imaging studies by modality and machine
            </CardDescription>
            <Link href="/radiologist/work-tree">
              <Button variant="outline" className="w-full">
                Open Work Tree
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Schedule
            </CardTitle>
            <Clock className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              View your clinical schedule and appointments
            </CardDescription>
            <Link href="/radiologist/schedule">
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Access imaging reports and interpretations
            </CardDescription>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick access to your most used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              • Use <strong>Work Tree</strong> to browse imaging studies by modality and machine
            </p>
            <p className="text-sm text-foreground">
              • View your <strong>Schedule</strong> to see upcoming appointments
            </p>
            <p className="text-sm text-foreground">
              • Navigate using the sidebar to access different sections
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
