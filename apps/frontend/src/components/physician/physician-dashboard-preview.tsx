"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, Image, ArrowRight, Inbox } from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { EncounterStatus } from "@/enums/patient-workflow.enum";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/formatTimeDate";
import { Skeleton } from "@/components/ui/skeleton";

interface PhysicianDashboardPreviewProps {
  encounters: PatientEncounter[];
  onViewEncounters: () => void;
  onViewReports: () => void;
  onViewImagingOrders: () => void;
  isLoading?: boolean;
}

export function PhysicianDashboardPreview({
  encounters,
  onViewEncounters,
  onViewReports,
  onViewImagingOrders,
  isLoading = false,
}: PhysicianDashboardPreviewProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Encounters */}
      <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center text-lg">
            <Stethoscope className="w-5 h-5 mr-2 text-primary" />
            Recent Encounters
          </CardTitle>
          <CardDescription className="text-foreground">
            Latest patient visits
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="space-y-2 flex-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 ml-2" />
                </div>
              ))
            ) : (
              encounters?.slice(0, 5).map((encounter, index) => {
              const encounterDate = encounter?.encounterDate
                ? new Date(encounter.encounterDate)
                : null;
              const formattedDate = encounterDate
                ? formatDate(encounterDate)
                : "Unknown date";
              const formattedTime = encounterDate
                ? formatTime(encounterDate)
                : "Unknown time";

              return (
                <div
                  onClick={() => {
                    router.push(`/physician/clinic-visit/${encounter.id}`);
                  }}
                  key={encounter.id}
                  className="group flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/30 hover:shadow-sm"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 min-w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="text-sm font-semibold text-primary text-center leading-none">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {encounter?.patient?.lastName +
                          " " +
                          encounter?.patient?.firstName}
                      </p>
                      <p className="text-xs text-foreground">
                        {formattedDate} • {formattedTime}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      encounter.status === EncounterStatus.ARRIVED
                        ? "default"
                        : encounter.status === EncounterStatus.WAITING
                        ? "secondary"
                        : encounter.status === EncounterStatus.FINISHED
                        ? "default"
                        : "outline"
                    }
                    className="ml-2 shrink-0"
                  >
                    {encounter.status
                      ? encounter.status.charAt(0).toUpperCase() +
                        encounter.status.slice(1).toLowerCase().replace(/_/g, " ")
                      : "Unknown"}
                  </Badge>
                </div>
              );
            })
            )}
            {!isLoading && (!encounters || encounters.length === 0) && (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No recent encounters</p>
                <p className="text-xs text-slate-400 mt-1">No encounters found</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onViewEncounters}
          >
            View All Encounters
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center text-lg">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-foreground">
            Access frequently used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewReports}
            >
              <FileText className="w-4 h-4" />
              View Diagnosis Reports
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewImagingOrders}
            >
              <Image className="w-4 h-4" />
              View Imaging Orders
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewEncounters}
            >
              <Stethoscope className="w-4 h-4" />
              View All Encounters
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

