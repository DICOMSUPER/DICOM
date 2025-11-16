import { PatientEncounter } from "@/interfaces/patient/patient-workflow.interface";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Stethoscope,
  ClipboardList,
  MapPin,
  X,
  Clipboard,
} from "lucide-react";
import {
  formatDate,
  getEncounterTypeColor,
  getEncounterTypeLabel,
  getPriorityColor,
  getStatusColor,
} from "@/utils/patient/[id]/color";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";
import { useGetUserByIdQuery } from "@/store/userApi";

export default function EncounterModal({
  encounter,
  onClose,
}: {
  encounter: PatientEncounter | null;
  onClose: () => void;
}) {
  const { data: serviceRoomData, isLoading: isServiceRoomLoading } =
    useGetServiceRoomByIdQuery(encounter?.serviceRoomId as string, {
      skip: !encounter?.serviceRoomId,
    });

  const { data: physicianData, isLoading: isUserDataLoading } =
    useGetUserByIdQuery(encounter?.assignedPhysicianId as string, {
      skip: !encounter?.assignedPhysicianId,
    });

  const { data: receptionData, isLoading: isReceptionLoading } =
    useGetUserByIdQuery(encounter?.createdBy as string, {
      skip: !encounter?.createdBy,
    });

  if (isServiceRoomLoading || isUserDataLoading || isReceptionLoading)
    return <div>Loading...</div>;

  if (!encounter) return null;
  const physician = physicianData?.data;
  const reception = receptionData?.data;

  const serviceRoom = serviceRoomData?.data?.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Encounter Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {encounter.orderNumber && `Order #${encounter.orderNumber}`}
              {encounter.orderNumber && encounter.encounterDate && " - "}
              {encounter.encounterDate && formatDate(encounter.encounterDate)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            {encounter.priority && (
              <Badge className={getPriorityColor(encounter.priority)}>
                {encounter.priority}
              </Badge>
            )}
            <Badge className={getStatusColor(encounter.status)}>
              {encounter.status}
            </Badge>
            <Badge className={getEncounterTypeColor(encounter.encounterType)}>
              {getEncounterTypeLabel(encounter.encounterType)}
            </Badge>
          </div>

          {/* Basic Information */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                Encounter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Encounter ID
                  </p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {encounter.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Order Number
                  </p>
                  <p className="text-sm text-gray-900">
                    {encounter.orderNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Encounter Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {encounter.encounterDate
                      ? formatDate(encounter.encounterDate)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Created By
                  </p>
                  <p className="text-sm text-gray-900">
                    {reception
                      ? reception?.firstName + " " + reception?.lastName
                      : encounter.createdBy || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-600" />
                Clinical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {encounter.chiefComplaint ? (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Chief Complaint
                  </p>
                  <p className="text-sm text-gray-900">
                    {encounter.chiefComplaint}
                  </p>
                </div>
              ) : null}

              {encounter.symptoms ? (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" />
                    Symptoms
                  </p>
                  <p className="text-sm text-gray-900">{encounter.symptoms}</p>
                </div>
              ) : null}

              {encounter.vitalSigns ? (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Vital Signs
                  </p>
                  <div className="text-sm text-gray-900 space-y-1">
                    {Object.entries(encounter.vitalSigns).map(
                      ([key, value]) => (
                        <p key={key} className="capitalize">
                          <span className="font-medium">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>{" "}
                          {value !== null && value !== undefined
                            ? String(value)
                            : "N/A"}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {!encounter.chiefComplaint &&
                !encounter.symptoms &&
                !encounter.vitalSigns && (
                  <p className="text-sm text-gray-400 italic">
                    No clinical details recorded yet
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Assigned Physician
                  </p>
                  <p className="text-sm text-gray-900">
                    {physician
                      ? "Dr. " +
                        physician?.firstName +
                        " " +
                        physician?.lastName
                      : encounter.assignedPhysicianId || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    Service
                  </p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {serviceRoom?.service?.serviceName || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    Room
                  </p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {serviceRoom?.room?.roomCode || "Not assigned"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                {encounter.notes ? (
                  <p className="text-sm text-gray-900 p-3 bg-white rounded border border-gray-200">
                    {encounter.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No notes available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Updated:{" "}
                {encounter.updatedAt ? formatDate(encounter.updatedAt) : "N/A"}
              </span>
            </div>
            {encounter.createdBy && (
              <div className="flex items-center gap-1.5">
                <span>Created by: {encounter.createdBy}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-800 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
