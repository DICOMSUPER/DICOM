"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/ui/refresh-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPatientEncounterByIdQuery,
  useUpdatePatientEncounterMutation,
} from "@/store/patientEncounterApi";
import {
  Stethoscope,
  Calendar,
  User,
  Clock,
  FileText,
  Edit,
  ArrowLeft,
  Activity,
  AlertCircle,
  MapPin,
  DoorOpen,
  Loader2,
} from "lucide-react";
import { EncounterForm } from "@/components/patient/EncounterForm";
import { formatDate } from "@/common/utils/patient/[id]/color";
import {
  getEncounterStatusBadge,
  getEncounterTypeBadge,
  getEncounterPriorityBadge,
} from "@/common/utils/status-badge";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import { modalStyles } from "@/common/utils/format-status";

// Format status for display
const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
    .map((word) => word?.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
  return gender?.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
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
    isFetching,
    error,
    refetch: refetchEncounter,
  } = useGetPatientEncounterByIdQuery(encounterId);
  const [updateEncounter, { isLoading: isUpdating }] =
    useUpdatePatientEncounterMutation();

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
  const isLoadingRelated =
    isServiceRoomLoading || isPhysicianLoading || isCreatedByLoading;

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
            <RefreshButton
              onRefresh={handleRefresh}
              loading={isLoading || isFetching}
            />
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
            <h1 className="text-3xl font-bold text-foreground">
              Encounter Details
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <RefreshButton onRefresh={handleRefresh} loading={isFetching} />
          </div>
        </div>

        {/* Error Content */}
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Encounter Not Found
          </h2>
          <p className="text-sm text-foreground text-center max-w-md mb-6">
            The requested encounter could not be found. It may have been deleted
            or the ID is invalid.
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
          <h1 className="text-3xl font-bold text-foreground">
            Encounter Details
          </h1>
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
            loading={isLoading || isFetching || isLoadingRelated}
          />
          {!isEditing && (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
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
            <section className={modalStyles.heroSection}>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className={modalStyles.heroLabel}>
                    <FileText className="h-3.5 w-3.5" />
                    {encounter.orderNumber
                      ? `Order #${encounter.orderNumber}`
                      : encounter.id.slice(0, 8)}
                  </div>
                  <div>
                    <p className={modalStyles.heroTitle}>
                      {formatEncounterType(encounter.encounterType)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {getEncounterStatusBadge(encounter.status)}
                    {getEncounterTypeBadge(encounter.encounterType)}
                    {encounter.priority &&
                      getEncounterPriorityBadge(encounter.priority)}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className={modalStyles.infoCard}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Calendar className={modalStyles.sectionIcon} />
                  </div>
                  <div>
                    <div className={modalStyles.infoCardLabel}>
                      Encounter Date
                    </div>
                    <p className={modalStyles.infoCardLarge}>
                      {encounter.encounterDate
                        ? new Date(encounter.encounterDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                    <p className="text-xs text-slate-500">Visit date</p>
                  </div>
                </div>
                <div className={modalStyles.infoCard}>
                  <div className={modalStyles.sectionIconContainer}>
                    <User className={modalStyles.sectionIcon} />
                  </div>
                  <div>
                    <div className={modalStyles.infoCardLabel}>
                      Physician
                    </div>
                    <p className={modalStyles.infoCardLarge}>
                      {physician
                        ? `Dr. ${physician.firstName} ${physician.lastName}`
                        : "Not assigned"}
                    </p>
                    <p className="text-xs text-slate-500">Assigned doctor</p>
                  </div>
                </div>
                <div className={modalStyles.infoCard}>
                  <div className={modalStyles.sectionIconContainer}>
                    <MapPin className={modalStyles.sectionIcon} />
                  </div>
                  <div>
                    <div className={modalStyles.infoCardLabel}>
                      Service Room
                    </div>
                    <p className={modalStyles.infoCardLarge}>
                      {serviceRoom?.room?.roomCode || "Not assigned"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {serviceRoom?.service?.serviceName || "No service"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Patient Information - Full Width (Most Important Section) */}
            {encounter.patient && (
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <User className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Patient Information</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Name - Full width on mobile, spans 1 col on larger */}
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.sectionIconContainer}>
                      <User className={modalStyles.sectionIcon} />
                    </div>
                    <div>
                      <div className={modalStyles.infoCardLabel}>Name</div>
                      <p className={modalStyles.infoCardValue}>
                        {encounter.patient.firstName} {encounter.patient.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Patient ID */}
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.sectionIconContainer}>
                      <User className={modalStyles.sectionIcon} />
                    </div>
                    <div>
                      <div className={modalStyles.infoCardLabel}>Patient ID</div>
                      <p className={modalStyles.infoCardValue}>{encounter.patient.patientCode}</p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  {encounter.patient.dateOfBirth && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.sectionIconContainer}>
                        <Calendar className={modalStyles.sectionIcon} />
                      </div>
                      <div>
                        <div className={modalStyles.infoCardLabel}>Date of Birth</div>
                        <p className={modalStyles.infoCardValue}>
                          {new Date(encounter.patient.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {encounter.patient.gender && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.sectionIconContainer}>
                        <User className={modalStyles.sectionIcon} />
                      </div>
                      <div>
                        <div className={modalStyles.infoCardLabel}>Gender</div>
                        <p className={modalStyles.infoCardValue}>{formatGender(encounter.patient.gender)}</p>
                      </div>
                    </div>
                  )}

                  {/* Phone Number */}
                  {encounter.patient.phoneNumber && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.sectionIconContainer}>
                        <Phone className={modalStyles.sectionIcon} />
                      </div>
                      <div>
                        <div className={modalStyles.infoCardLabel}>Phone</div>
                        <p className={modalStyles.infoCardValue}>{encounter.patient.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Blood Type */}
                  {encounter.patient.bloodType && (
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.sectionIconContainer}>
                        <Activity className={modalStyles.sectionIcon} />
                      </div>
                      <div>
                        <div className={modalStyles.infoCardLabel}>Blood Type</div>
                        <p className={modalStyles.infoCardValue}>{encounter.patient.bloodType}</p>
                      </div>
                    </div>
                  )}

                  {/* Insurance Number - Can span 2 cols if needed */}
                  {encounter.patient.insuranceNumber && (
                    <div className={`${modalStyles.infoCard} ${!encounter.patient.address ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                      <div className={modalStyles.sectionIconContainer}>
                        <FileText className={modalStyles.sectionIcon} />
                      </div>
                      <div>
                        <div className={modalStyles.infoCardLabel}>Insurance Number</div>
                        <p className={modalStyles.infoCardValue}>{encounter.patient.insuranceNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Address - Always full width */}
                  {encounter.patient.address && (
                    <div className={`${modalStyles.infoCard} sm:col-span-2 lg:col-span-3`}>
                      <div className={modalStyles.sectionIconContainer}>
                        <MapPin className={modalStyles.sectionIcon} />
                      </div>
                      <div>
                        <div className={modalStyles.infoCardLabel}>Address</div>
                        <p className={modalStyles.infoCardValue}>{encounter.patient.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-7 space-y-6">
                {/* Encounter Overview */}
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Stethoscope className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Encounter Overview</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className={modalStyles.gridCard}>
                      <div className={modalStyles.gridCardLabel}>
                        <FileText className={modalStyles.gridCardIcon} />
                        Encounter ID
                      </div>
                      <p className="text-xs font-semibold text-slate-900 font-mono break-all line-clamp-2">
                        {encounter.id}
                      </p>
                    </div>
                    <div className={modalStyles.gridCard}>
                      <div className={modalStyles.gridCardLabel}>
                        <FileText className={modalStyles.gridCardIcon} />
                        Order Number
                      </div>
                      <p className={modalStyles.gridCardValue}>
                        {encounter.orderNumber || "N/A"}
                      </p>
                    </div>
                    <div className={`${modalStyles.gridCard} sm:col-span-2 lg:col-span-1`}>
                      <div className={modalStyles.gridCardLabel}>
                        <User className={modalStyles.gridCardIcon} />
                        Created By
                      </div>
                      <p className={modalStyles.gridCardValue}>
                        {createdBy
                          ? `${createdBy.firstName} ${createdBy.lastName}`
                          : encounter.createdBy || "N/A"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Clinical Details */}
                {encounter.chiefComplaint ||
                  encounter.symptoms ||
                  encounter.notes ? (
                  <section className={modalStyles.section}>
                    <div className={modalStyles.sectionHeader}>
                      <div className={modalStyles.sectionIconContainer}>
                        <Stethoscope className={modalStyles.sectionIcon} />
                      </div>
                      <h3 className={modalStyles.sectionTitle}>Clinical Details</h3>
                    </div>
                    <div className="space-y-4">
                      {encounter.chiefComplaint && (
                        <div className={`${modalStyles.infoCard} !bg-amber-50 !border-amber-200`}>
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Chief Complaint
                          </div>
                          <p className="text-sm text-amber-800 leading-relaxed break-words">
                            {encounter.chiefComplaint}
                          </p>
                        </div>
                      )}
                      {encounter.symptoms && (
                        <div className={`${modalStyles.infoCard} !bg-blue-50 !border-blue-200`}>
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                            <Activity className="h-4 w-4 shrink-0" />
                            Symptoms
                          </div>
                          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap break-words">
                            {encounter.symptoms}
                          </p>
                        </div>
                      )}
                      {encounter.notes && (
                        <div className={modalStyles.infoCard}>
                          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">
                            <FileText className="h-4 w-4 shrink-0" />
                            Notes
                          </div>
                          <p className={modalStyles.infoCardValue}>
                            {encounter.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ) : (
                  <section className={modalStyles.section}>
                    <div className="flex flex-col items-center justify-center py-12">
                      <Stethoscope className="h-16 w-16 text-slate-300 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        No Clinical Details
                      </h3>
                      <p className="text-sm text-slate-500 text-center max-w-md">
                        No clinical details have been recorded for this
                        encounter yet.
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar - Right Side */}
              <div className="lg:col-span-5 space-y-4">
                {/* Location Information */}
                {serviceRoom ? (
                  <section className={modalStyles.section}>
                    <div className={modalStyles.sectionHeader}>
                      <div className={modalStyles.sectionIconContainer}>
                        <DoorOpen className={modalStyles.sectionIcon} />
                      </div>
                      <h3 className={modalStyles.sectionTitle}>Location</h3>
                    </div>
                    <div className="grid gap-3">
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>Room</div>
                        <p className={modalStyles.infoCardValue}>
                          {serviceRoom.room?.roomCode || "N/A"}
                        </p>
                      </div>
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>Service</div>
                        <p className={modalStyles.infoCardValue}>
                          {serviceRoom.service?.serviceName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className={modalStyles.section}>
                    <div className="flex flex-col items-center justify-center py-8">
                      <MapPin className="h-12 w-12 text-slate-300 mb-3" />
                      <h3 className="text-base font-semibold text-slate-700 mb-1">
                        No Location Assigned
                      </h3>
                      <p className="text-xs text-slate-500 text-center">
                        No service room assigned yet.
                      </p>
                    </div>
                  </section>
                )}

                {/* Timestamps */}
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Clock className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Timestamps</h3>
                  </div>
                  <div className="grid gap-3">
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Created At</div>
                      <p className={modalStyles.infoCardValue}>
                        {formatDateTime(encounter.createdAt)}
                      </p>
                    </div>
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Updated At</div>
                      <p className={modalStyles.infoCardValue}>
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
