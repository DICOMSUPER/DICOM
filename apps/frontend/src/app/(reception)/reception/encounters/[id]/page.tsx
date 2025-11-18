"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPatientEncounterByIdQuery,
  useUpdatePatientEncounterMutation,
  useDeletePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import {
  Stethoscope,
  Calendar,
  User,
  Clock,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Activity,
  AlertCircle,
  MapPin,
  DoorOpen,
  Loader2,
} from "lucide-react";
import { EncounterForm } from "@/components/patient/EncounterForm";
import {
  getStatusBadgeClass,
  getEncounterTypeBadgeClass,
  getPriorityColor,
  formatDate,
} from "@/utils/patient/[id]/color";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import { EncounterPriorityLevel } from "@/enums/patient-workflow.enum";

// Format status for display
const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatStatus = (status: string) => {
  return status
    .split(/[-_]/)
    .map((word) => capitalizeFirst(word))
    .join(" ");
};

// Format encounter type for display
const formatEncounterType = (type: string): string => {
  return type
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatDateTime = (dateValue?: string | Date | null) => {
  if (!dateValue) return "—";
  const date =
    typeof dateValue === "string" || dateValue instanceof Date
      ? new Date(dateValue)
      : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Format gender for display
const formatGender = (gender: string | null | undefined): string => {
  if (!gender) return "N/A";
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
};

// Skeleton component for encounter details
function EncounterDetailSkeleton() {
  return (
    <div className="space-y-8 pr-4 pb-2">
      {/* Hero Section Skeleton */}
      <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-9 w-64" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          {/* Overview Skeleton */}
          <section className="rounded-2xl p-6 shadow border-border border space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          </section>

          {/* Clinical Details Skeleton */}
          <section className="rounded-2xl p-6 shadow border-border border space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Patient Info Skeleton */}
          <section className="rounded-2xl p-6 shadow border-border border space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </section>

          {/* Timestamps Skeleton */}
          <section className="rounded-2xl p-6 shadow border-border border space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function EncounterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const {
    data: encounterData,
    isLoading,
    error,
    refetch: refetchEncounter,
  } = useGetPatientEncounterByIdQuery(encounterId);
  const [updateEncounter, { isLoading: isUpdating }] =
    useUpdatePatientEncounterMutation();
  const [deleteEncounter, { isLoading: isDeleting }] =
    useDeletePatientEncounterMutation();

  const encounter = encounterData?.data;

  // Fetch related data
  const { data: serviceRoomData, isLoading: isServiceRoomLoading } =
    useGetServiceRoomByIdQuery(encounter?.serviceRoomId as string, {
      skip: !encounter?.serviceRoomId,
    });

  const { data: physicianData, isLoading: isPhysicianLoading } =
    useGetUserByIdQuery(encounter?.assignedPhysicianId as string, {
      skip: !encounter?.assignedPhysicianId,
    });

  const { data: createdByData, isLoading: isCreatedByLoading } =
    useGetUserByIdQuery(encounter?.createdBy as string, {
      skip: !encounter?.createdBy,
    });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (data: any) => {
    try {
      await updateEncounter({
        id: encounterId,
        data: data,
      }).unwrap();
      setIsEditing(false);
      await refetchEncounter();
    } catch (error) {
      console.error("Error updating encounter:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this encounter?")) {
      try {
        await deleteEncounter(encounterId).unwrap();
        router.push("/reception/encounters");
      } catch (error) {
        console.error("Error deleting encounter:", error);
      }
    }
  };

  const handleBack = () => {
    router.push("/reception/encounters");
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchEncounter(),
      // Refetch related data if encounter exists
      encounter?.serviceRoomId && serviceRoomData,
      encounter?.assignedPhysicianId && physicianData,
      encounter?.createdBy && createdByData,
    ]);
  };

  const physician = physicianData?.data;
  // @ts-ignore - API response structure may vary
  const serviceRoom = serviceRoomData?.data?.data || serviceRoomData?.data;
  const createdBy = createdByData?.data;
  const isLoadingRelated = isServiceRoomLoading || isPhysicianLoading || isCreatedByLoading;

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Fixed Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <RefreshButton onRefresh={handleRefresh} loading={isLoading} />
          </div>
        </div>

        {/* Skeleton Content */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <EncounterDetailSkeleton />
        </ScrollArea>
      </div>
    );
  }

  // Error state
  if (error || !encounter) {
    return (
      <div className="space-y-6">
        {/* Fixed Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Encounter Details</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <RefreshButton onRefresh={handleRefresh} loading={false} />
          </div>
        </div>

        {/* Error Content */}
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Encounter Not Found
          </h2>
          <p className="text-sm text-foreground text-center max-w-md mb-6">
            The requested encounter could not be found. It may have been deleted or the ID is invalid.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Encounters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Encounter Details</h1>
          <p className="text-sm text-foreground mt-1">
            {encounter.patient
              ? `${encounter.patient.firstName} ${encounter.patient.lastName}`
              : "Unknown Patient"}{" "}
            • {new Date(encounter.encounterDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <RefreshButton 
            onRefresh={handleRefresh} 
            loading={isLoading || isLoadingRelated} 
          />
          {!isEditing && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {isEditing ? (
          <div className="pr-4">
            <EncounterForm
              encounter={encounter}
              onSubmit={handleSave}
              onCancel={handleCancel}
              loading={isUpdating}
            />
          </div>
        ) : (
          <div className="space-y-8 pr-4 pb-2">
            {/* Hero Section */}
            <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <FileText className="h-3.5 w-3.5" />
                    {encounter.orderNumber ? `Order #${encounter.orderNumber}` : encounter.id.slice(0, 8)}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {formatEncounterType(encounter.encounterType)}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {encounter.encounterDate
                          ? formatDate(encounter.encounterDate)
                          : "No date set"}
                      </p>
                      {physician && (
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Dr. {physician.firstName} {physician.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {encounter.priority && (
                      <Badge
                        className={`${getPriorityColor(encounter.priority as EncounterPriorityLevel)} px-4 py-1 text-xs font-semibold border shadow-sm`}
                      >
                        {encounter.priority === EncounterPriorityLevel.STAT && (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {encounter.priority}
                      </Badge>
                    )}
                    <Badge
                      className={`${getStatusBadgeClass(encounter.status)} px-4 py-1 text-xs font-semibold border shadow-sm`}
                    >
                      {formatStatus(encounter.status)}
                    </Badge>
                    <Badge
                      className={`${getEncounterTypeBadgeClass(encounter.encounterType)} px-4 py-1 text-xs font-semibold border shadow-sm`}
                    >
                      {formatEncounterType(encounter.encounterType)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Encounter Date</p>
                    <p className="text-lg font-semibold text-foreground">
                      {encounter.encounterDate
                        ? new Date(encounter.encounterDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                    <p className="text-xs text-foreground">Visit date</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Physician</p>
                    <p className="text-lg font-semibold text-foreground">
                      {physician
                        ? `Dr. ${physician.firstName} ${physician.lastName}`
                        : "Not assigned"}
                    </p>
                    <p className="text-xs text-foreground">Assigned doctor</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Service Room</p>
                    <p className="text-lg font-semibold text-foreground">
                      {serviceRoom?.room?.roomCode || "Not assigned"}
                    </p>
                    <p className="text-xs text-foreground">
                      {serviceRoom?.service?.serviceName || "No service"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-7 space-y-6">
                {/* Encounter Overview */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Stethoscope className="h-5 w-5" />
                    Encounter Overview
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">Encounter ID</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground font-mono break-all line-clamp-2">
                        {encounter.id}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText className="h-4 w-4 shrink-0" />
                        Order Number
                      </div>
                      <p className="text-base font-semibold text-foreground truncate">
                        {encounter.orderNumber || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <User className="h-4 w-4 shrink-0" />
                        Created By
                      </div>
                      <p className="text-base font-semibold text-foreground truncate">
                        {createdBy
                          ? `${createdBy.firstName} ${createdBy.lastName}`
                          : encounter.createdBy || "N/A"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Clinical Details */}
                {(encounter.chiefComplaint || encounter.symptoms || encounter.notes) ? (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Stethoscope className="h-5 w-5" />
                      Clinical Details
                    </div>
                    <div className="space-y-4">
                      {encounter.chiefComplaint && (
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 shadow-sm space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 uppercase tracking-wide">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Chief Complaint
                          </div>
                          <p className="text-sm text-amber-800 leading-relaxed break-words">
                            {encounter.chiefComplaint}
                          </p>
                        </div>
                      )}
                      {encounter.symptoms && (
                        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 shadow-sm space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 uppercase tracking-wide">
                            <Activity className="h-4 w-4 shrink-0" />
                            Symptoms
                          </div>
                          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap break-words">
                            {encounter.symptoms}
                          </p>
                        </div>
                      )}
                      {encounter.notes && (
                        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 shadow-sm space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wide">
                            <FileText className="h-4 w-4 shrink-0" />
                            Notes
                          </div>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {encounter.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ) : (
                  <section className="rounded-2xl p-6 shadow border-border border">
                    <div className="flex flex-col items-center justify-center py-12">
                      <Stethoscope className="h-16 w-16 text-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Clinical Details
                      </h3>
                      <p className="text-sm text-foreground text-center max-w-md">
                        No clinical details have been recorded for this encounter yet.
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar - Right Side */}
              <div className="lg:col-span-5 space-y-4">
                {/* Patient Information */}
                {encounter.patient ? (
                  <section className="rounded-2xl p-4 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <User className="h-4 w-4" />
                      Patient Information
                    </div>
                    <div className="grid gap-2.5">
                      <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                        <p className="text-xs text-foreground mb-1">Name</p>
                        <p className="text-sm font-semibold text-foreground break-words">
                          {encounter.patient.firstName} {encounter.patient.lastName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                          <p className="text-xs text-foreground mb-1">Patient ID</p>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {encounter.patient.patientCode}
                          </p>
                        </div>
                        {encounter.patient.gender && (
                          <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                            <p className="text-xs text-foreground mb-1">Gender</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatGender(encounter.patient.gender)}
                            </p>
                          </div>
                        )}
                      </div>
                      {encounter.patient.dateOfBirth && (
                        <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                          <p className="text-xs text-foreground mb-1">Date of Birth</p>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(encounter.patient.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ) : (
                  <section className="rounded-2xl p-4 shadow border-border border">
                    <div className="flex flex-col items-center justify-center py-8">
                      <User className="h-12 w-12 text-foreground/40 mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        No Patient Information
                      </h3>
                      <p className="text-xs text-foreground text-center">
                        Patient information is not available.
                      </p>
                    </div>
                  </section>
                )}

                {/* Location Information */}
                {serviceRoom ? (
                  <section className="rounded-2xl p-4 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <DoorOpen className="h-4 w-4" />
                      Location
                    </div>
                    <div className="grid gap-2.5">
                      <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                        <p className="text-xs text-foreground mb-1">Room</p>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {serviceRoom.room?.roomCode || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                        <p className="text-xs text-foreground mb-1">Service</p>
                        <p className="text-sm font-semibold text-foreground break-words">
                          {serviceRoom.service?.serviceName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="rounded-2xl p-4 shadow border-border border">
                    <div className="flex flex-col items-center justify-center py-8">
                      <MapPin className="h-12 w-12 text-foreground/40 mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        No Location Assigned
                      </h3>
                      <p className="text-xs text-foreground text-center">
                        No service room assigned yet.
                      </p>
                    </div>
                  </section>
                )}

                {/* Timestamps */}
                <section className="rounded-2xl p-4 shadow border-border border space-y-3">
                  <div className="flex items-center gap-2 text-base font-semibold">
                    <Clock className="h-4 w-4" />
                    Timestamps
                  </div>
                  <div className="grid gap-2.5">
                    <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                      <p className="text-xs text-foreground mb-1">Created At</p>
                      <p className="text-xs font-semibold text-foreground break-words">
                        {formatDateTime(encounter.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 text-foreground p-3 shadow-sm ring-1 ring-border/10">
                      <p className="text-xs text-foreground mb-1">Updated At</p>
                      <p className="text-xs font-semibold text-foreground break-words">
                        {formatDateTime(encounter.updatedAt)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
