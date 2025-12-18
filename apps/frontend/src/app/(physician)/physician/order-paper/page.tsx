"use client";
import React, { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import SignatureDisplay from "@/components/common/signature-display";
import { decryptPayload } from "@/common/utils/encryption";
import { useGetRoomByIdQuery } from "@/store/roomsApi";
import { formatDateLocal } from "@/common/utils/schedule/utils";
import { formatDateTime } from "@/common/lib/formatTimeDate";

function OrderPaperContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const signatureRef = useRef<HTMLDivElement>(null);
  const [decodedData, setDecodedData] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  useEffect(() => {
    if (data) {
      try {
        setDecodedData(decryptPayload(data));
        console.log("Decrypted Data:", decryptPayload(data));
        console.log("Order date type:", typeof decodedData.date);
      } catch (error) {
        setError(
          "Failed to decrypt data. Please make sure you don't tamper with the URL."
        );
      }
    }
  }, [data]);

  const { data: roomData, isLoading: roomLoading } = useGetRoomByIdQuery(
    decodedData?.roomId,
    {
      skip: !decodedData?.roomId,
    }
  );

  console.log("RoomData", roomData?.data?.room);
  const room = roomData?.data?.room;

  const handlePrint = () => {
    const printContent = document.getElementById("radiology-order-print");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    // Clone the content
    const clonedContent = printContent.cloneNode(true) as HTMLElement;

    // Get the signature container in the clone
    const signatureContainer = clonedContent.querySelector(
      ".signature-container"
    ) as HTMLElement;

    if (signatureContainer && signatureRef.current) {
      // Replace with the exact HTML from the original signature
      signatureContainer.outerHTML = `<div class="signature-container">${signatureRef.current.innerHTML}</div>`;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>Radiology Order - ${decodedData?.patientCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 20px; 
            background: white;
            color: #000;
            line-height: 1.5;
          }
          .max-w-4xl { max-width: 56rem; margin: 0 auto; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .border-2 { border-width: 2px; border-style: solid; }
          .border { border-width: 1px; border-style: solid; }
          .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
          .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
          .border-t-2 { border-top-width: 2px; border-top-style: solid; }
          .border-black { border-color: #000; }
          .border-gray-300 { border-color: #d1d5db; }
          .bg-white { background-color: #fff; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .p-3 { padding: 0.75rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .pb-4 { padding-bottom: 1rem; }
          .pb-2 { padding-bottom: 0.5rem; }
          .pb-3 { padding-bottom: 0.75rem; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-5 { margin-bottom: 1.25rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .ml-4 { margin-left: 1rem; }
          .text-center { text-align: center; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .uppercase { text-transform: uppercase; }
          .capitalize { text-transform: capitalize; }
          .italic { font-style: italic; }
          .break-all { word-break: break-all; }
          .leading-snug { line-height: 1.375; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-4 { grid-column: span 4 / span 4; }
          .gap-3 { gap: 0.75rem; }
          .gap-4 { gap: 1rem; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-800 { color: #1f2937; }
          .text-black { color: #000; }
          ul { 
            list-style-type: disc;
            padding-left: 1.5rem;
          }
          li { margin-bottom: 0.25rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .flex-row { flex-direction: row; }
          .items-center { align-items: center; }
          .gap-2 { gap: 0.5rem; }
          .tracking-wide { letter-spacing: 0.025em; }
          svg { display: inline-block; max-width: 100%; height: auto; }
          .block { display: block; }
          .signature-container { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
          .signature-container > * { display: flex; flex-direction: row; align-items: center; white-space: nowrap; }
          .signature-container svg { display: inline-block; vertical-align: middle; }
          .signature-container p { display: inline-block; margin: 0; }
          .signature-container text { display: inline; }
          
          /* Copy any signature animation styles */
          svg path {
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          
          @media print {
            body { padding: 10px; }
            .no-print { display: none !important; }
            .shadow-lg { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        ${clonedContent.innerHTML}
      </body>
    </html>
  `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (!decodedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          No Data Available
        </div>
      </div>
    );
  }

  const lastName =
    decodedData.orderingPhysicianName.split(" ").slice(0, -1).join(" ") || "";
  const firstName = decodedData.orderingPhysicianName.split(" ").pop() || "";

  return (
    <div className="min-h-screen bg-white p-8">
      <div
        id="radiology-order-print"
        className="max-w-4xl mx-auto bg-white border-2 border-black shadow-lg"
      >
        {/* Header */}
        <div className="border-b-2 border-black p-6 text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">Radiology Order</h1>
          <p className="text-xs text-gray-600">
            Medical Imaging Request & Patient Information
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Information */}
          <div className="mb-5 pb-4 border-b border-gray-300">
            <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
              Patient Information
            </h2>
            <div className="border border-gray-300 p-3">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Patient Code
                  </div>
                  <div className="text-sm font-mono font-semibold">
                    {decodedData.patientCode}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Full Name
                  </div>
                  <div className="text-sm font-semibold">
                    {decodedData.patientName}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Gender
                  </div>
                  <div className="text-sm capitalize">{decodedData.gender}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Age
                  </div>
                  <div className="text-sm">{decodedData.age} years</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Address
                  </div>
                  <div className="text-sm">{decodedData.address}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Insurance Number
                  </div>
                  <div className="text-sm font-mono">
                    {decodedData.insuranceNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="mb-5 pb-4 border-b border-gray-300">
            <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
              Clinical Information
            </h2>
            <div className="border border-gray-300 p-3">
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Diagnosis
                </div>
                <div className="text-sm text-gray-700">
                  {decodedData.diagnosis}
                </div>
              </div>
              {decodedData.notes && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Clinical Notes
                  </div>
                  <div className="text-sm text-gray-700">
                    {decodedData.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Procedure Orders */}
          <div className="mb-5 pb-4 border-b border-gray-300">
            <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
              Requested Procedures
            </h2>
            {decodedData.procedures.map((procedure: any, index: number) => (
              <div
                key={procedure.id}
                className="border border-gray-300 p-3 mb-3"
              >
                <div className="text-xs font-bold text-gray-600 mb-3 uppercase">
                  Procedure #{index + 1}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Procedure Name
                    </div>
                    <div className="text-sm font-semibold">
                      {procedure.procedureServiceName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Body Part
                    </div>
                    <div className="text-sm">{procedure.bodyPartName}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Clinical Indication
                    </div>
                    <div className="text-sm text-gray-700">
                      {procedure.clinicalIndication}
                    </div>
                  </div>
                  {procedure.specialInstructions && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        Special Instructions
                      </div>
                      <div className="text-sm text-gray-700">
                        {procedure.specialInstructions}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

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
                    {room?.roomCode}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Room Type
                  </div>
                  <div className="text-sm capitalize">{room?.roomType}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Floor
                  </div>
                  <div className="text-sm">Floor {room?.floor}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Capacity
                  </div>
                  <div className="text-sm">{room?.capacity} person(s)</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </div>
                  <div className="text-sm capitalize font-medium">
                    {room?.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Accessibility
                  </div>
                  <div className="text-sm">
                    {room?.isWheelchairAccessible
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
                      room?.hasAirConditioning && "Air Conditioning",
                      room?.hasWiFi && "WiFi",
                      room?.hasTelephone && "Telephone",
                      room?.hasAttachedBathroom && "Private Bathroom",
                      room?.hasTV && "TV",
                    ]
                      .filter(Boolean)
                      .join(" • ") || "Basic facilities"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Ordering Physician */}
          <div className="mb-5 pb-4 border-b border-gray-300">
            <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
              Ordering Physician
            </h2>
            <div className="border border-gray-300 p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Physician Name
                  </div>
                  <div className="text-sm font-semibold">
                    {decodedData.orderingPhysicianName}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-3">
                    Physician Signature
                  </div>
                  <div className="signature-container" ref={signatureRef}>
                    <SignatureDisplay
                      firstName={firstName}
                      lastName={lastName}
                      duration={0.1}
                      delay={0}
                      role="Dr."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black p-4 space-y-3 text-sm text-gray-700">
          <div className="flex flex-col gap-2">
            <div className="block font-semibold leading-snug">
              <span className="font-semibold">Order Date: </span>
              <span className="block">
                {decodedData.date ? formatDateTime(new Date(decodedData.date)) : formatDateTime(new Date())}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-700 mt-2">
            <span className="font-bold">IMPORTANT INSTRUCTIONS:</span>
            <ul className="mt-2 ml-4 list-disc">
              <li className="mb-1">
                Please bring this order form and a valid ID to the radiology
                department
              </li>
              <li className="mb-1">
                Arrive 15 minutes before your scheduled appointment time
              </li>
              <li className="mb-1">
                Follow any preparation instructions provided by your physician
              </li>
              <li>
                For questions or to reschedule, contact the radiology department
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="max-w-4xl mx-auto mt-6 text-center no-print">
        <button
          onClick={handlePrint}
          className="px-8 py-3 bg-black text-white font-semibold uppercase text-sm hover:bg-gray-800 transition-colors shadow-md"
        >
          Print Order
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-600">
            Loading order form...
          </div>
        </div>
      }
    >
      <OrderPaperContent />
    </Suspense>
  );
}
