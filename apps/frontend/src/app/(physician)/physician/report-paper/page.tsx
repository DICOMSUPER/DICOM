"use client";

import { decryptPayload } from "@/common/utils/encryption";
import { formatDateTime } from "@/common/lib/formatTimeDate";
import SignatureDisplay from "@/components/common/signature-display";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import AnotherHeaderPDF from "@/components/pdf-generator/another-header";

function ReportPaperContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const signatureRef = useRef<HTMLDivElement>(null);
  const radiologistSignatureRef = useRef<HTMLDivElement>(null);
  const [decodedData, setDecodedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      try {
        const decodedData = decodeURIComponent(data);
        setDecodedData(decryptPayload(decodedData));
      } catch (error) {
        console.log(error);
        setError(
          "Failed to decrypt data. Please make sure you don't tamper with the URL."
        );
      }
    }
  }, [data]);

  const handlePrint = () => {
    const printContent = document.getElementById("diagnosis-report-print");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const clonedContent = printContent.cloneNode(true) as HTMLElement;

    // Handle physician signature
    const physicianSignatureContainer = clonedContent.querySelector(
      ".physician-signature-container"
    ) as HTMLElement;
    if (physicianSignatureContainer && signatureRef.current) {
      physicianSignatureContainer.outerHTML = `<div class="physician-signature-container">${signatureRef.current.innerHTML}</div>`;
    }

    // Handle radiologist signature
    const radiologistSignatureContainer = clonedContent.querySelector(
      ".radiologist-signature-container"
    ) as HTMLElement;
    if (radiologistSignatureContainer && radiologistSignatureRef.current) {
      radiologistSignatureContainer.outerHTML = `<div class="radiologist-signature-container">${radiologistSignatureRef.current.innerHTML}</div>`;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>Diagnosis Report - ${report?.encounter?.patient?.patientCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 20px; 
            background: white;
            color: #000;
            line-height: 1.5;
          }
          img { max-width: 100%; height: auto; }
          .w-24 { width: 6rem; }
          .h-24 { height: 6rem; }
          .object-contain { object-fit: contain; }
          .flex-shrink-0 { flex-shrink: 0; }
          .flex-1 { flex: 1 1 0%; }
          .justify-between { justify-content: space-between; }
          .items-start { align-items: flex-start; }
          .text-right { text-align: right; }
          .leading-relaxed { line-height: 1.625; }
          .font-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .mb-6 { margin-bottom: 1.5rem; }
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
          .col-span-3 { grid-column: span 3 / span 3; }
          .col-span-4 { grid-column: span 4 / span 4; }
          .gap-3 { gap: 0.75rem; }
          .gap-4 { gap: 1rem; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-800 { color: #1f2937; }
          .text-black { color: #000; }
          .whitespace-pre-line { white-space: pre-line; }
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
          .justify-between { justify-content: space-between; }
          .gap-2 { gap: 0.5rem; }
          .tracking-wide { letter-spacing: 0.025em; }
          svg { display: inline-block; max-width: 100%; height: auto; }
          .block { display: block; }
          .physician-signature-container, .radiologist-signature-container { 
            display: flex; flex-direction: column; align-items: center; gap: 0.5rem; 
          }
          .physician-signature-container > *, .radiologist-signature-container > * { 
            display: flex; flex-direction: row; align-items: center; white-space: nowrap; 
          }
          .physician-signature-container svg, .radiologist-signature-container svg { 
            display: inline-block; vertical-align: middle; 
          }
          .physician-signature-container p, .radiologist-signature-container p { 
            display: inline-block; margin: 0; 
          }
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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  if (!decodedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          No Data Available
        </div>
      </div>
    );
  }

  const report = decodedData.diagnosisReportPDF?.report;
  const dicomStudy = decodedData.dicomStudy;
  const orderingPhysicianName = decodedData.orderingPhysicianName || "";
  const radiologistName = decodedData.radiologistName || "";

  const patient = report?.encounter?.patient;
  const imagingOrder = dicomStudy?.imagingOrder;
  const procedure = imagingOrder?.procedure;
  const modality = procedure?.modality;
  const bodyPart = procedure?.bodyPart;
  const modalityMachine = dicomStudy?.modalityMachine;

  // Parse physician names for signatures
  const physicianLastName =
    orderingPhysicianName.split(" ").slice(0, -1).join(" ") || "";
  const physicianFirstName = orderingPhysicianName.split(" ").pop() || "";

  const radiologistLastName =
    radiologistName.split(" ").slice(0, -1).join(" ") || "";
  const radiologistFirstName = radiologistName.split(" ").pop() || "";

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const formatStatus = (status: string) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div
        id="diagnosis-report-print"
        className="max-w-4xl mx-auto bg-white border-2 border-black shadow-lg"
      >
        <AnotherHeaderPDF></AnotherHeaderPDF>
        {/* Header */}
        <div className="border-b-2 border-black p-6 text-center">
          <h1 className="text-2xl font-bold uppercase mb-1">
            Diagnosis Report
          </h1>
          <p className="text-xs text-gray-600">
            Medical Imaging Interpretation & Clinical Findings
          </p>
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
                <div className="grid grid-cols-4 gap-3">
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
                      Age
                    </div>
                    <div className="text-sm">
                      {calculateAge(patient.dateOfBirth)} years
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Date of Birth
                    </div>
                    <div className="text-sm">
                      {formatDateOfBirth(patient.dateOfBirth)}
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
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Address
                    </div>
                    <div className="text-sm">{patient.address || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Information */}
          {dicomStudy && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Study Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Study Date
                    </div>
                    <div className="text-sm">
                      {formatDate(dicomStudy.studyDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Study Time
                    </div>
                    <div className="text-sm">
                      {dicomStudy.studyTime || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Study Status
                    </div>
                    <div className="text-sm font-medium">
                      {formatStatus(dicomStudy.studyStatus)}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Study Instance UID
                    </div>
                    <div className="text-sm font-mono break-all">
                      {dicomStudy.studyInstanceUid || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Procedure Information */}
          {procedure && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Procedure Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Procedure Name
                    </div>
                    <div className="text-sm font-semibold">
                      {procedure.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Modality
                    </div>
                    <div className="text-sm">
                      {modality?.modalityName} ({modality?.modalityCode})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Body Part
                    </div>
                    <div className="text-sm">{bodyPart?.name || "N/A"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Procedure Description
                    </div>
                    <div className="text-sm text-gray-700">
                      {procedure.description || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Clinical Indication
                    </div>
                    <div className="text-sm text-gray-700">
                      {imagingOrder?.clinicalIndication || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Information */}
          {modalityMachine && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Equipment Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Machine Name
                    </div>
                    <div className="text-sm font-semibold">
                      {modalityMachine.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Manufacturer
                    </div>
                    <div className="text-sm">
                      {modalityMachine.manufacturer || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Model
                    </div>
                    <div className="text-sm">
                      {modalityMachine.model || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Serial Number
                    </div>
                    <div className="text-sm font-mono">
                      {modalityMachine.serialNumber || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Diagnosis Report */}
          {report && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Diagnosis Report
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Diagnosis Name
                    </div>
                    <div className="text-sm font-semibold">
                      {report.diagnosisName || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Diagnosis Date
                    </div>
                    <div className="text-sm">
                      {formatDate(report.diagnosisDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Diagnosis Status
                    </div>
                    <div className="text-sm font-medium capitalize">
                      {formatStatus(report.diagnosisStatus)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Diagnosis Type
                    </div>
                    <div className="text-sm capitalize">
                      {report.diagnosisType || "N/A"}
                    </div>
                  </div>
                  {report.approvedAt && (
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        Approved At
                      </div>
                      <div className="text-sm">
                        {formatDateTime(new Date(report.approvedAt))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Report Description
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 border border-gray-200">
                    {report.description || "N/A"}
                  </div>
                </div>
                {report.notes && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Additional Notes
                    </div>
                    <div className="text-sm text-gray-700">{report.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clinical Information */}
          {imagingOrder?.imagingOrderForm && (
            <div className="mb-5 pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
                Clinical Information
              </h2>
              <div className="border border-gray-300 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Diagnosis
                    </div>
                    <div className="text-sm text-gray-700">
                      {imagingOrder.imagingOrderForm.diagnosis || "N/A"}
                    </div>
                  </div>
                  {imagingOrder.imagingOrderForm.notes && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        Clinical Notes
                      </div>
                      <div className="text-sm text-gray-700">
                        {imagingOrder.imagingOrderForm.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Physicians Information */}
          <div className="mb-5 pb-4 border-b border-gray-300">
            <h2 className="text-sm font-bold uppercase text-black border-b-2 border-black pb-2 mb-4">
              Physicians
            </h2>
            <div className="border border-gray-300 p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Ordering Physician
                  </div>
                  <div className="text-sm font-semibold mb-3">
                    {orderingPhysicianName || "N/A"}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Signature
                  </div>
                  <div
                    className="physician-signature-container"
                    ref={signatureRef}
                  >
                    {orderingPhysicianName && (
                      <SignatureDisplay
                        firstName={physicianFirstName}
                        lastName={physicianLastName}
                        duration={0.1}
                        delay={0}
                        role="Dr."
                      />
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Radiologist
                  </div>
                  <div className="text-sm font-semibold mb-3">
                    {radiologistName || "N/A"}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Signature
                  </div>
                  <div
                    className="radiologist-signature-container"
                    ref={radiologistSignatureRef}
                  >
                    {radiologistName && (
                      <SignatureDisplay
                        firstName={radiologistFirstName}
                        lastName={radiologistLastName}
                        duration={0.1}
                        delay={0}
                        role="Dr."
                      />
                    )}
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
              <span className="font-semibold">Report ID: </span>
              <span className="font-mono break-all block">{report?.id}</span>
            </div>
            <div className="block font-semibold leading-snug">
              <span className="font-semibold">Study ID: </span>
              <span className="font-mono break-all block">
                {dicomStudy?.id}
              </span>
            </div>
            <div className="block font-semibold leading-snug">
              <span className="font-semibold">Report Generated: </span>
              <span className="block">
                {new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-700 mt-2">
            <span className="font-bold">DISCLAIMER:</span>
            <ul className="mt-2 ml-4 list-disc">
              <li className="mb-1">
                This report is based on the images provided and clinical
                information available at the time of interpretation
              </li>
              <li className="mb-1">
                Clinical correlation is recommended for all findings
              </li>
              <li className="mb-1">
                This report is confidential and intended for the referring
                physician and patient care team only
              </li>
              <li>
                For any questions regarding this report, please contact the
                radiology department
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
          Print Report
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
            Loading report...
          </div>
        </div>
      }
    >
      <ReportPaperContent />
    </Suspense>
  );
}
