"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Stethoscope,
  Calendar,
  User,
  Clock,
  FileText,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  DoorOpen,
} from "lucide-react";
import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import { useGetAllServiceRoomsQuery } from "@/store/serviceRoomApi";
import { EncounterPriorityLevel } from "@/enums/patient-workflow.enum";
import {
  getEncounterTypeBadgeVariant,
  getPriorityColor,
  getStatusBadgeVariant,
} from "@/utils/patient/[id]/color";

interface EncounterListProps {
  encounters: PatientEncounter[];
  loading?: boolean;
  onEdit?: (encounter: PatientEncounter) => void;
  onDelete?: (encounterId: string) => void;
  onView?: (encounter: PatientEncounter) => void;
  onCreate?: () => void;
  page: number;
  totalPages: number;
}

export function EncounterList({
  encounters,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
  page,
  totalPages,
}: EncounterListProps) {
  //1 db query only
  const { data: ServiceRoomData, isLoading: isLoadingServiceRooms } =
    useGetAllServiceRoomsQuery({});

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-foreground">Loading encounters...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (encounters.length === 0) {
    return (
      <EmptyState
        icon={<Stethoscope className="h-12 w-12 text-foreground" />}
        title="No Encounters Found"
        description="No patient encounters match your current filters. Try adjusting your search criteria."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border hover:shadow-md transition-shadow px-5">
        <h3 className="text-lg font-medium text-foreground">
          Recent Encounters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        <div className=" h-[30vh] overflow-y-auto">
          {encounters.map((encounter) => (
            <Card
              key={encounter.id}
              className="border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 overflow-hidden bg-card/50"
            >
              <CardContent className="p-0">
                <div className="px-5 py-2 space-y-3">
                  {/* Top row: Patient info and badges */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Date and time info */}
                    <div className="flex items-center gap-4 text-xs text-gray-700 ">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {encounter?.encounterDate
                            ? new Date(encounter.encounterDate)
                                .toISOString()
                                .split("T")[0]
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {encounter?.encounterDate
                            ? new Date(encounter.encounterDate)
                                .toISOString()
                                .split("T")[1]
                                .split(".")[0]
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    {/* Status and type badges */}
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {encounter.priority && (
                        <Badge
                          className={`${getPriorityColor(
                            encounter.priority
                          )} text-xs`}
                        >
                          {encounter.priority ===
                            EncounterPriorityLevel.STAT && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {encounter.priority}
                        </Badge>
                      )}
                      <Badge
                        variant={getStatusBadgeVariant(encounter.status)}
                        className="text-xs"
                      >
                        {encounter.status}
                      </Badge>
                      <Badge
                        variant={getEncounterTypeBadgeVariant(
                          encounter.encounterType
                        )}
                        className="text-xs"
                      >
                        {encounter.encounterType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4 border-t border-border/40">
                  {/* Room and Service - highlighted section */}
                  {encounter.serviceRoomId && (
                    <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-md border border-accent/10 hover:bg-accent/10 transition-colors">
                      <DoorOpen className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5 flex-1 flex justify-between min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {(() => {
                            const serviceRoom = ServiceRoomData?.data.find(
                              (sr) => sr.id === encounter.serviceRoomId
                            );
                            return (
                              serviceRoom?.room?.roomCode || "No room assigned"
                            );
                          })()}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {(() => {
                            const serviceRoom = ServiceRoomData?.data.find(
                              (sr) => sr.id === encounter.serviceRoomId
                            );
                            return (
                              serviceRoom?.service?.serviceCode ||
                              "No service assigned"
                            );
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Chief Complaint */}
                  {/* <div>
                           <h4 className="text-sm font-medium text-foreground mb-1">Chief Complaint</h4>
                           <p className="text-sm text-foreground">{encounter.chiefComplaint}</p>
                         </div> */}

                  {/* Symptoms */}
                  {/* <div>
                           <h4 className="text-sm font-medium text-foreground mb-1">Symptoms</h4>
                           <p className="text-sm text-foreground">{encounter.symptoms}</p>
                         </div> */}

                  {/* Physician - only show if present */}
                  {/* {encounter.physician && (
                           <div>
                             <h4 className="text-sm font-medium text-foreground mb-1">Assigned Physician</h4>
                             <p className="text-sm text-foreground">{encounter.physician}</p>
                           </div>
                         )} */}

                  {/* Notes */}
                  {/* {encounter.notes && (
                           <div>
                             <h4 className="text-sm font-medium text-foreground mb-1">Notes</h4>
                             <p className="text-sm text-foreground">{encounter.notes}</p>
                           </div>
                         )} */}
                </div>

                <div className="px-5 py-3 border-t border-border/40 flex gap-2 bg-muted/20">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2 text-xs"
                    onClick={() => {
                      onView ? onView(encounter) : {};
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Button>

                  {/* <Button
                           variant="outline"
                           size="sm"
                           onClick={() => onEdit(encounter)}
                           className="flex items-center gap-1"
                         >
                           <Edit className="h-4 w-4" />
                           Edit
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => onDelete(encounter.id)}
                           className="flex items-center gap-1 text-destructive hover:text-destructive"
                         >
                           <Trash2 className="h-4 w-4" />
                           Delete
                         </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
