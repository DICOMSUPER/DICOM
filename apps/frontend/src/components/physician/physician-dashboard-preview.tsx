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
import { Stethoscope, FileText, Image, ArrowRight } from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { EncounterStatus } from "@/enums/patient-workflow.enum";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/formatTimeDate";

interface PhysicianDashboardPreviewProps {
  encounters: PatientEncounter[];
  onViewEncounters: () => void;
  onViewReports: () => void;
  onViewImagingOrders: () => void;
}

export function PhysicianDashboardPreview({
  encounters,
  onViewEncounters,
  onViewReports,
  onViewImagingOrders,
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
        <CardContent>
          <div className="space-y-2">
            {encounters?.slice(0, 5).map((encounter, index) => {
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
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="text-sm font-semibold text-primary">
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
            })}
            {(!encounters || encounters.length === 0) && (
              <p className="text-sm text-foreground text-center py-4">
                No recent encounters
              </p>
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
              <FileText className="w-4 h-4 mr-2" />
              View Diagnosis Reports
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewImagingOrders}
            >
              <Image className="w-4 h-4 mr-2" />
              View Imaging Orders
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewEncounters}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              View All Encounters
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

