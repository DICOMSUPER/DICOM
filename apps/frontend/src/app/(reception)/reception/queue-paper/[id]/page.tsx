"use client";

import React, { use } from "react";
import { useGetPatientEncounterByIdQuery } from "@/store/patientEncounterApi";
import { useGetServiceRoomByIdQuery } from "@/store/serviceRoomApi";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ doctor?: string }>;
}) {
  const { id } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};

  const encounterId = typeof id === "string" ? id : String(id);

  const { data: encounterData, isLoading: isLoadingEncounter } =
    useGetPatientEncounterByIdQuery(encounterId);

  const { data: serviceRoomData, isLoading: isLoadingServiceRooms } =
    useGetServiceRoomByIdQuery(encounterData?.data?.serviceRoomId as string, {
      skip: !encounterData?.data || isLoadingEncounter,
    });

  const encounter = encounterData?.data;
  const patient = encounterData?.data?.patient;
  const serviceRoom = serviceRoomData?.data?.data;

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateOfBirth = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string | Date) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (isLoadingEncounter || isLoadingServiceRooms) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!encounterData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          Encounter Not Found
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    const printContent = document.getElementById("queue-assignment-print");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Queue Assignment - ${encounter?.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background: white; }
            .border-2 { border: 2px solid #000; }
            .border { border: 1px solid #ddd; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .border-b { border-bottom: 1px solid #ddd; }
            .border-t { border-top: 1px solid #ddd; }
            .border-t-2 { border-top: 2px solid #000; }
            .border-black { border-color: #000; }
            .border-gray-300 { border-color: #d1d5db; }
            .p-6 { padding: 1.5rem; }
            .p-4 { padding: 1rem; }
            .p-3 { padding: 0.75rem; }
            .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .pb-3 { padding-bottom: 0.75rem; }
            .pt-3 { padding-top: 0.75rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-5 { margin-bottom: 1.25rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-3 { margin-top: 0.75rem; }
            .ml-4 { margin-left: 1rem; }
            .text-center { text-align: center; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-8xl { font-size: 6rem; line-height: 1; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .uppercase { text-transform: uppercase; }
            .capitalize { text-transform: capitalize; }
            .break-all { word-break: break-all; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .col-span-2 { grid-column: span 2; }
            .col-span-3 { grid-column: span 3; }
            .gap-4 { gap: 1rem; }
            .gap-3 { gap: 0.75rem; }
            .font-mono { font-family: 'Courier New', monospace; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-black { color: #000; }
            ul { list-style-type: disc; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div
        id="queue-assignment-print"
        className="max-w-4xl mx-auto bg-white border-2 border-black shadow-lg"
      >
        {/* Header */}
        <div className="border-b-2 border-black p-6 text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">
            Patient Encounter
          </h1>
          <p className="text-xs text-gray-600">
            Hospital Encounter Information & Service Details
          </p>
        </div>

        {/* Queue Number Badge */}
        <div className="border-b-2 border-black py-8 text-center">
          <div className="text-sm font-bold mb-3 text-gray-600 uppercase tracking-wide">
            Your Queue Number
          </div>
          <div className="text-8xl font-bold text-black">
            {encounter && String(encounter?.orderNumber).padStart(3, "0")}
          </div>
          <div className="text-lg font-semibold mt-2 text-gray-700">
            Priority: {encounter?.priority}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Information */}
          {patient && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Patient Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Patient Code
                    </div>
                    <div className="text-sm font-mono font-semibold">
                      {patient.patientCode || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Full Name
                    </div>
                    <div className="text-sm font-semibold">
                      {patient.lastName} {patient.firstName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Gender
                    </div>
                    <div className="text-sm capitalize">
                      {patient.gender || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Date of Birth
                    </div>
                    <div className="text-sm">
                      {formatDateOfBirth(patient?.dateOfBirth as Date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Blood Type
                    </div>
                    <div className="text-sm font-semibold">
                      {patient.bloodType || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Address
                    </div>
                    <div className="text-sm">{patient.address || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Encounter Details */}
          {encounter && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Encounter Details
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Encounter Type
                    </div>
                    <div className="text-sm capitalize font-medium">
                      {encounter.encounterType || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Encounter Date & Time
                    </div>
                    <div className="text-sm">
                      {formatDate(encounter?.encounterDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Note
                    </div>
                    <div className="text-sm capitalize font-medium">
                      {encounter.notes || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Current Status
                    </div>
                    <div className="text-sm capitalize font-medium">
                      {encounter.status || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Information */}
          {serviceRoom?.service && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Service Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Service Code
                    </div>
                    <div className="text-sm font-mono font-semibold">
                      {serviceRoom?.service?.serviceCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Service Name
                    </div>
                    <div className="text-sm">
                      {serviceRoom?.service?.serviceName}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Description
                    </div>
                    <div className="text-sm text-gray-700">
                      {serviceRoom?.service?.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Information */}
          {serviceRoom?.room && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Room Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Room Code
                    </div>
                    <div className="text-sm font-mono font-semibold">
                      {serviceRoom?.room?.roomCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Room Type
                    </div>
                    <div className="text-sm capitalize">
                      {serviceRoom?.room?.roomType}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Floor
                    </div>
                    <div className="text-sm">
                      Floor {serviceRoom?.room?.floor}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Capacity
                    </div>
                    <div className="text-sm">
                      {serviceRoom?.room?.capacity} person(s)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Status
                    </div>
                    <div className="text-sm capitalize font-medium">
                      {serviceRoom?.room?.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Accessibility
                    </div>
                    <div className="text-sm">
                      {serviceRoom?.room?.isWheelchairAccessible
                        ? "Wheelchair Accessible"
                        : "Standard"}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Room Facilities
                    </div>
                    <div className="text-sm text-gray-700">
                      {[
                        serviceRoom?.room?.hasAirConditioning &&
                          "Air Conditioning",
                        serviceRoom?.room?.hasWiFi && "WiFi",
                        serviceRoom?.room?.hasTelephone && "Telephone",
                        serviceRoom?.room?.hasAttachedBathroom &&
                          "Private Bathroom",
                        serviceRoom?.room?.hasTV && "TV",
                      ]
                        .filter(Boolean)
                        .join(" • ") || "Basic facilities"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black p-4">
          <div className="mb-3 pb-3 border-b border-gray-300">
            <div className="text-xs font-semibold text-gray-600 mb-1">
              Encounter Reference ID
            </div>
            <div className="font-mono text-xs break-all text-gray-700">
              {encounter?.id}
            </div>
          </div>
          <div className="text-xs text-gray-700">
            <span className="font-bold">IMPORTANT INSTRUCTIONS:</span>
            <ul className="mt-2 ml-4 list-disc">
              <li className="mb-1">
                Please keep this document with you at all times during your
                visit
              </li>
              <li className="mb-1">
                Present this document when your queue number is called
              </li>
              <li className="mb-1">
                Listen for announcements and watch the display screens for your
                number
              </li>
              <li>
                For inquiries, please approach the information desk with this
                document
              </li>
            </ul>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300 text-center text-xs text-gray-500">
            Printed on:{" "}
            {new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="max-w-4xl mx-auto mt-6 text-center">
        <button
          onClick={handlePrint}
          className="px-8 py-3 bg-black text-white font-semibold uppercase text-sm hover:bg-gray-800 transition-colors shadow-md"
        >
          Print Document
        </button>
      </div>
    </div>
  );
}
