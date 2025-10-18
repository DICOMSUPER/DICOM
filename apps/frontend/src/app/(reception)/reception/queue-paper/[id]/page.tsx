"use client";

import React from "react";
import { useGetQueueAssignmentByIdQuery } from "@/store/queueAssignmentApi";
import { useGetUserByIdQuery } from "@/store/userApi";
import { useGetRoomByIdQuery } from "@/store/roomsApi";

export default function QueueAssignmentPaper({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { doctor?: string };
}) {
  const { id } = params;
  const { doctor } = searchParams || {};

  const queueId = typeof id === "string" ? id : String(id);
  const doctorId = typeof doctor === "string" ? doctor : String(doctor || "");

  const { data: queueData, isLoading: isLoadingQueue } =
    useGetQueueAssignmentByIdQuery(queueId);
  const { data: doctorData, isLoading: isLoadingDoctor } = useGetUserByIdQuery(
    doctorId,
    {
      skip: !doctorId,
    }
  );
  const { data: roomData, isLoading: isLoadingRoom } = useGetRoomByIdQuery(
    queueData?.roomId as string,
    {
      skip: !queueData?.roomId,
    }
  );

  const formatDate = (dateString) => {
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

  const formatDateOfBirth = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoadingQueue || isLoadingDoctor || isLoadingRoom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!queueData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-bold">Queue Assignment Not Found</div>
      </div>
    );
  }

  const patient = queueData.encounter?.patient;

  const handlePrint = () => {
    const printContent = document.getElementById("queue-assignment-print");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Queue Assignment - ${queueData.queueNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .border-2 { border: 2px solid #000; }
            .border { border: 1px solid #000; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .border-black { border-color: #000; }
            .p-6 { padding: 1.5rem; }
            .p-4 { padding: 1rem; }
            .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pt-3 { padding-top: 0.75rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-4 { margin-top: 1rem; }
            .text-center { text-align: center; }
            .text-2xl { font-size: 1.5rem; }
            .text-7xl { font-size: 4.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .capitalize { text-transform: capitalize; }
            .break-all { word-break: break-all; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .col-span-2 { grid-column: span 2; }
            .gap-4 { gap: 1rem; }
            .font-mono { font-family: 'Courier New', monospace; }
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
        className="max-w-4xl mx-auto border-2 border-black"
      >
        {/* Header */}
        <div className="border-b-2 border-black p-6 text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">
            Hospital Queue Assignment
          </h1>
          <p className="text-xs">Patient Encounter & Queue Information</p>
        </div>

        {/* Queue Number Badge */}
        <div className="border-b-2 border-black py-8 text-center">
          <div className="text-sm font-bold mb-2">QUEUE NUMBER</div>
          <div className="text-7xl font-bold">
            {String(queueData.queueNumber).padStart(3, "0")}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Information */}
          {patient && (
            <div className="mb-6 pb-4 border-b border-black">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">
                Patient Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold mb-1">Patient Code</div>
                  <div className="text-sm break-all">
                    {patient.patientCode || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Date of Birth</div>
                  <div className="text-sm">
                    {formatDateOfBirth(patient.dateOfBirth)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Full Name</div>
                  <div className="text-sm">
                    {patient.lastName} {patient.firstName}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Gender</div>
                  <div className="text-sm capitalize">
                    {patient.gender || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Phone Number</div>
                  <div className="text-sm">{patient.phoneNumber || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Blood Type</div>
                  <div className="text-sm">{patient.bloodType || "N/A"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-bold mb-1">Address</div>
                  <div className="text-sm">{patient.address || "N/A"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Queue Assignment Details */}
          <div className="mb-6 pb-4 border-b border-black">
            <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">
              Queue Assignment Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold mb-1">Queue Number</div>
                <div className="text-sm">{queueData.queueNumber}</div>
              </div>
              <div>
                <div className="text-xs font-bold mb-1">Priority</div>
                <div className="text-sm">{queueData.priority}</div>
              </div>
              <div>
                <div className="text-xs font-bold mb-1">Assignment Date</div>
                <div className="text-sm">
                  {formatDate(queueData.assignmentDate)}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold mb-1">Expires Date</div>
                <div className="text-sm">
                  {formatDate(queueData.assignmentExpiresDate)}
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-4 text-center mt-4">
              <div className="text-3xl font-bold">
                ~{queueData.estimatedWaitTime} minutes
              </div>
              <div className="text-xs font-bold mt-1">ESTIMATED WAIT TIME</div>
            </div>
          </div>

          {/* Encounter Information */}
          {queueData.encounter && (
            <div className="mb-6 pb-4 border-b border-black">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">
                Encounter Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold mb-1">Encounter Type</div>
                  <div className="text-sm capitalize">
                    {queueData.encounter.encounterType || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Encounter Date</div>
                  <div className="text-sm">
                    {formatDate(queueData.encounter.encounterDate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Physician */}
          {doctorData && (
            <div className="mb-6 pb-4 border-b border-black">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">
                Assigned Physician
              </h2>
              <div>
                <div className="text-xs font-bold mb-1">Physician Name</div>
                <div className="text-sm">
                  Dr. {doctorData.lastName} {doctorData.firstName}
                </div>
              </div>
            </div>
          )}

          {/* Room Information */}
          {roomData && (
            <div className="mb-6 pb-4 border-b border-black">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">
                Room Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold mb-1">Room Code</div>
                  <div className="text-sm font-mono">
                    {roomData?.room.roomCode}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Room Type</div>
                  <div className="text-sm capitalize">
                    {roomData?.room.roomType}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">Floor</div>
                  <div className="text-sm">Floor {roomData?.room.floor}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black p-4 text-xs">
          <div className="mb-2">
            <div className="font-bold">Queue Assignment ID:</div>
            <div className="font-mono text-xs break-all">{queueData.id}</div>
          </div>
          <div className="mb-3">
            <div className="font-bold">Encounter ID:</div>
            <div className="font-mono text-xs break-all">
              {queueData.encounterId}
            </div>
          </div>
          <div className="pt-3 border-t border-black">
            <span className="font-bold">NOTE:</span> Please keep this document
            for your records. Present it when called for your appointment.
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="max-w-4xl mx-auto mt-6 text-center">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
        >
          Print Document
        </button>
      </div>
    </div>
  );
}
