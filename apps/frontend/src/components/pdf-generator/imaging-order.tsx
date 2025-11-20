import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { ImagingProcedurePDF } from "../patients/detail/create-order-form";
import { addPDFHeader } from "./addHeaderPDF";

export interface ImagingOrderPDFProps {
  imagingProcedurePDF: ImagingProcedurePDF;
}

export const ImagingOrder = ({ imagingProcedurePDF }: ImagingOrderPDFProps) => {
  const doc = new jsPDF();

  let y = addPDFHeader(doc, {
    title: "Radiology Request Form",
    clinicName: "Custom Clinic Name",
    address: "Custom Address",
    phone: "(999) 888-7777",
  });


  doc.setFont("Roboto");
  doc.setFontSize(12);

  doc.text(`Patient Name: ${imagingProcedurePDF.patientName}`, 10, y);
  doc.text(`Age: ${imagingProcedurePDF.age}`, 90, y);
  doc.text(`Gender: ${imagingProcedurePDF.gender}`, 150, y);

  y += 8;

  doc.text(`Address: ${imagingProcedurePDF.address}`, 10, y);

  y += 8;

  doc.text(
    `Department/Room: ${imagingProcedurePDF.departmentName} - ${imagingProcedurePDF.roomName}`,
    10,
    y
  );

  y += 8;

  doc.text(`Patient ID: ${imagingProcedurePDF.patientCode}`, 10, y);
  y += 8;

  doc.text(`Insurance Number: ${imagingProcedurePDF.insuranceNumber}`, 10, y);

  y += 8;

  doc.text(`Diagnosis: ${imagingProcedurePDF.diagnosis}`, 10, y);

  y += 8;

  // Notes
  doc.text(`Notes: ${imagingProcedurePDF.notes}`, 10, y);

  y += 10;
  doc.setFontSize(13);
  doc.text("Procedures:", 10, y);

  const tableData = imagingProcedurePDF.procedures.map((proc, index) => [
    index + 1,
    proc.procedureServiceName ?? "-",
    proc.bodyPartName ?? "-",
    proc.clinicalIndication ?? "-",
  ]);

  autoTable(doc, {
    startY: y + 5,
    head: [["#", "Procedure Name", "Body Part", "Clinical Indication"]],
    body: tableData,
    styles: {
      font: "Roboto",
      fontSize: 10,
      cellPadding: 3,
      valign: "middle",
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    headStyles: {
      font: "Roboto",
      fillColor: [0, 128, 128],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableLineColor: [220, 220, 220],
  });

  y += (tableData.length + 1) * 10 + 20;

  const pageWidth = doc.internal.pageSize.getWidth();
  const signatureWidth = 60;
  const signatureX = pageWidth - 15 - signatureWidth;
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
