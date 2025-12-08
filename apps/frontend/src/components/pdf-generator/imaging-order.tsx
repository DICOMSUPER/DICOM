import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { ImagingProcedurePDF } from "../patients/detail/create-order-form";
import { addPDFHeader } from "./addHeaderPDF";

export interface ImagingOrderPDFProps {
  imagingProcedurePDF: ImagingProcedurePDF;
}

export const ImagingOrder = ({ imagingProcedurePDF }: ImagingOrderPDFProps) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  let y = addPDFHeader(doc, {
    title: "Radiology Request Form",
    clinicName: "Custom Clinic Name",
    address: "Custom Address",
    phone: "(999) 888-7777",
  });

  const line = (label: string, value: string | number | undefined, offsetY: number) => {
    const val = value ?? "N/A";
    doc.setFontSize(9.5);
    doc.setTextColor(60);
    doc.text(`${label}`, margin + 6, offsetY);
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(String(val), margin + 6, offsetY + 5);
    return offsetY + 12;
  };

  // Card: Patient & Order info (queue ticket style)
  const cardHeight = 60;
  doc.setDrawColor(220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 3, 3, "FD");

  doc.setFont("Roboto");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Patient & Order", margin + 6, y + 8);
  doc.setTextColor(20);

  let infoY = y + 16;
  infoY = line("Patient Name", imagingProcedurePDF.patientName, infoY);
  infoY = line("Age / Gender", `${imagingProcedurePDF.age} / ${imagingProcedurePDF.gender}`, infoY);
  infoY = line("Patient ID", imagingProcedurePDF.patientCode, infoY);
  infoY = line("Insurance", imagingProcedurePDF.insuranceNumber, infoY);

  // Second column inside card
  let infoY2 = y + 16;
  const col2X = margin + contentWidth / 2;
  const line2 = (label: string, value: string | number | undefined, offsetY: number) => {
    const val = value ?? "N/A";
    doc.setFontSize(9.5);
    doc.setTextColor(60);
    doc.text(label, col2X, offsetY);
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(String(val), col2X, offsetY + 5);
    return offsetY + 12;
  };
  infoY2 = line2("Department / Room", `${imagingProcedurePDF.departmentName} - ${imagingProcedurePDF.roomName}`, infoY2);
  infoY2 = line2("Address", imagingProcedurePDF.address, infoY2);
  infoY2 = line2("Diagnosis", imagingProcedurePDF.diagnosis, infoY2);
  infoY2 = line2("Notes", imagingProcedurePDF.notes, infoY2);

  y += cardHeight + 12;

  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Procedures", margin, y);

  const tableData = imagingProcedurePDF.procedures.map((proc, index) => [
    index + 1,
    proc.procedureServiceName ?? "-",
    proc.bodyPartName ?? "-",
    proc.clinicalIndication ?? "-",
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [["#", "Procedure Name", "Body Part", "Clinical Indication"]],
    body: tableData,
    styles: {
      font: "Roboto",
      fontSize: 10,
      cellPadding: 3,
      valign: "middle",
      lineColor: [222, 226, 230],
      lineWidth: 0.2,
    },
    headStyles: {
      font: "Roboto",
      fillColor: [24, 144, 255],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableLineColor: [222, 226, 230],
    tableWidth: contentWidth,
    margin: { left: margin, right: margin },
  });

  y += (tableData.length + 1) * 10 + 24;

  const signatureWidth = 60;
  const signatureX = pageWidth - margin - signatureWidth;
  const signatureY = y + 12;

  doc.setFontSize(12);
  doc.text("Ordering Physician", signatureX + signatureWidth / 2, y, {
    align: "center",
  });

  doc.setLineWidth(0.5);
  doc.line(
    signatureX,
    signatureY + 10,
    signatureX + signatureWidth,
    signatureY + 10
  );

  doc.setFontSize(12);
  const physicianName = imagingProcedurePDF.orderingPhysicianName || "";
  const centerX = signatureX + signatureWidth / 2;
  doc.text(physicianName, centerX, signatureY + 22, { align: "center" });

   doc.save(`Imaging_Order_${imagingProcedurePDF.patientCode}.pdf`);
  // === Return Blob URL ===
  // const pdfBlob = doc.output("blob");
  // return URL.createObjectURL(pdfBlob);
};
