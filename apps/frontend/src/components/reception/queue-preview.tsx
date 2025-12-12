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
import { Clock, ArrowRight, Inbox } from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { EncounterPriorityLevel } from "@/enums/patient-workflow.enum";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/formatTimeDate";
import { Skeleton } from "@/components/ui/skeleton";
import { formatStatus } from "@/utils/format-status";

export interface QueuePreviewProps {
  encounters: PatientEncounter[];
  onViewAll: () => void;
  onViewEncounters: () => void;
  isLoading?: boolean;
}

export function QueuePreview({
  encounters,
  onViewAll,
  onViewEncounters,
  isLoading = false,
}: QueuePreviewProps) {
  const router = useRouter();

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center text-lg">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Recent Encounters
        </CardTitle>
        <CardDescription className="text-foreground">
          Recently forwarded patients
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
                  router.push(`/reception/encounters/${encounter.id}`);
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
                      Arrived: {formattedDate} • {formattedTime}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`shrink-0 ml-2 font-medium ${
                    encounter.priority === EncounterPriorityLevel.STAT
                      ? "bg-red-100 text-red-800 border-red-200"
                      : encounter.priority === EncounterPriorityLevel.URGENT
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {formatStatus(encounter.priority)}
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
        <div className="pt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 group hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={onViewAll}
          >
            View All Patients
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="default"
            className="flex-1 group"
            onClick={onViewEncounters}
          >
            View Encounters
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
