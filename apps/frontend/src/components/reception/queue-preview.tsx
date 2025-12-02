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
import { Clock, ArrowRight } from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { EncounterPriorityLevel } from "@/enums/patient-workflow.enum";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/formatTimeDate";

interface QueuePreviewProps {
  encounters: PatientEncounter[];
  onViewAll: () => void;
  onViewEncounters: () => void;
}

export function QueuePreview({
  encounters,
  onViewAll,
  onViewEncounters,
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
      <CardContent>
        <div className="space-y-2">
          {encounters?.map((encounter, index) => {
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
                  {encounter.priority}
                </Badge>
              </div>
            );
          })}
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
        </div>
      </CardContent>
    </Card>
  );
}
