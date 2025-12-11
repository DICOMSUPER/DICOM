import { jsPDF } from "jspdf";

import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DiagnosisReport } from "@/interfaces/patient/patient-workflow.interface";
import { calculateAge } from "@/lib/formatTimeDate";
import { addPDFHeader } from "./addHeaderPDF";
import { format } from "date-fns";
import { font } from "./font";

export interface DiagnosisReportPDF {
  report: DiagnosisReport;
}

export interface DiagnosisReportPDFProps {
  diagnosisReportPDF: DiagnosisReportPDF;
  dicomStudy?: DicomStudy;
  orderingPhysicianName?: string;
  radiologistName?: string;
}

export const DiagnosisReportPDF = ({
  diagnosisReportPDF,
  dicomStudy,
  orderingPhysicianName,
  radiologistName,
}: DiagnosisReportPDFProps) => {
  const doc = new jsPDF();

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 10;
  const marginRight = 10;
  const maxWidth = pageWidth - marginLeft - marginRight;
  const bottomMargin = 20;

  // header
  let y = addPDFHeader(doc, {
    title: "Diagnosis Report",
    clinicName: "Custom Clinic Name",
    address: "Custom Address",
    phone: "(999) 888-7777",
  });

  const checkAndAddPage = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  doc.addFileToVFS("Roboto-normal.ttf", font);
  doc.addFont("Roboto-normal.ttf", "Roboto", "normal");

  // I. General Information
  checkAndAddPage(15);
  doc.setFont("Roboto");
  doc.setFontSize(14);
  doc.text("I. General Information", marginLeft, y);
  y += 10;

  doc.setFont("Roboto");
  doc.setFontSize(12);

  checkAndAddPage(8);
  doc.text(
    `Patient Name: ${diagnosisReportPDF.report.encounter?.patient?.firstName} ${diagnosisReportPDF.report.encounter?.patient?.lastName}`,
    marginLeft,
    y
  );
  doc.text(
    `Age: ${calculateAge(
      diagnosisReportPDF.report.encounter?.patient?.dateOfBirth as Date
    )}`,
    90,
    y
  );
  doc.text(
    `Gender: ${diagnosisReportPDF.report.encounter?.patient?.gender}`,
    150,
    y
  );
  y += 8;

  checkAndAddPage(8);
  doc.text(
    `Address: ${diagnosisReportPDF.report.encounter?.patient?.address}`,
    marginLeft,
    y
  );
  y += 8;

  checkAndAddPage(8);
  doc.text(
    `Patient ID: ${diagnosisReportPDF.report.encounter?.patient?.patientCode}`,
    marginLeft,
    y
  );
  y += 8;

  // checkAndAddPage(8);
  // doc.text(
  //   `Insurance Number: ${diagnosisReportPDF.report.encounter?.patient?.insuranceNumber}`,
  //   marginLeft,
  //   y
  // );
  // y += 8;

  checkAndAddPage(8);
  doc.text(`Ordering Physician: ${orderingPhysicianName}`, marginLeft, y);
  y += 8;

  checkAndAddPage(8);
  doc.text(
    `Diagnosis: ${dicomStudy?.imagingOrder?.imagingOrderForm.diagnosis}`,
    marginLeft,
    y
  );
  y += 8;

  checkAndAddPage(8);
  doc.text(
    `Procedure: ${dicomStudy?.imagingOrder?.procedure?.name}`,
    marginLeft,
    y
  );
  y += 10;

  checkAndAddPage(15);
  doc.setFont("Roboto");
  doc.setFontSize(14);
  doc.text("II. Diagnosis Details", marginLeft, y);
  y += 10;

  doc.setFont("Roboto");
  doc.setFontSize(12);

  const descriptionText = diagnosisReportPDF.report.description || "";
  const splitDescription = doc.splitTextToSize(descriptionText, maxWidth);

  const lineHeight = 5;

  for (let i = 0; i < splitDescription.length; i++) {
    checkAndAddPage(lineHeight);
    doc.text(splitDescription[i], marginLeft, y);
    y += lineHeight;
  }

  y += 8;

  const signatureSpaceNeeded = 40;
  checkAndAddPage(signatureSpaceNeeded);

  const signatureWidth = 60;

  const rightSignatureX = pageWidth - marginRight - signatureWidth - 20;

  const signatureStartY = y;
  const currentDate = new Date();
  const formatted = format(currentDate, "HH:mm:ss, MMMM do, yyyy");
  // doc.setFontSize(11);
  // doc.setFont("Roboto");

  // doc.text(
  //   `${formatted}`,
  //   leftSignatureX + signatureWidth / 2,
  //   signatureStartY,
  //   { align: "center" }
  // );

  // doc.text(
  //   "Imaging Technician",
  //   leftSignatureX + signatureWidth / 2,
  //   signatureStartY + 10,
  //   {
  //     align: "center",
  //   }
  // );

  // doc.setLineWidth(0.5);
  // doc.line(
  //   leftSignatureX,
  //   signatureStartY + 25,
  //   leftSignatureX + signatureWidth,
  //   signatureStartY + 25
  // );

  // doc.setFontSize(12);
  // doc.setFont("Roboto");
  // const patientName =
  //   `${diagnosisReportPDF.report.encounter?.patient?.firstName || ""} ${
  //     diagnosisReportPDF.report.encounter?.patient?.lastName || ""
  //   }`.trim() || "N/A";
  // doc.text(
  //   patientName,
  //   leftSignatureX + signatureWidth / 2,
  //   signatureStartY + 30,
  //   { align: "center" }
  // );

  // date and time

  doc.setFontSize(11);
  doc.setFont("Roboto");
  doc.text(
    `${formatted}`,
    rightSignatureX + signatureWidth / 2,
    signatureStartY,
    { align: "center" }
  );

  doc.text(
    "Radiologist",
    rightSignatureX + signatureWidth / 2,
    signatureStartY + 10,
    {
      align: "center",
    }
  );

  doc.setLineWidth(0.5);
  doc.line(
    rightSignatureX,
    signatureStartY + 25,
    rightSignatureX + signatureWidth,
    signatureStartY + 25
  );

  doc.setFontSize(12);
  doc.setFont("Roboto");
  const physicianName = radiologistName || "N/A";
  doc.text(
    physicianName,
    rightSignatureX + signatureWidth / 2,
    signatureStartY + 30,
    { align: "center" }
  );

  // Footer metadata (ensure new line)
  const footerY = signatureStartY + 46;
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(
    `Report ID: ${diagnosisReportPDF.report?.id || "N/A"}`,
    marginLeft,
    footerY
  );
  doc.text(
    `Exported: ${new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`,
    marginLeft,
    footerY + 6
  );
  doc.setTextColor(0);

  doc.save(
    `Report_${diagnosisReportPDF.report.encounter?.patient?.patientCode}.pdf`
  );
  // const pdfBlob = doc.output("blob");
  // return URL.createObjectURL(pdfBlob);
};
