import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ImagingProcedurePDF } from "@/app/(physicians)/physicians/create-imaging-order/page";
import logo from "../../../public/assets/logo2.webp";

export interface ImagingOrderPDFProps {
  imagingProcedurePDF: ImagingProcedurePDF;
}

export const ImagingOrder = ({ imagingProcedurePDF }: ImagingOrderPDFProps) => {
  const doc = new jsPDF();

  let imageLogo = new Image();
  imageLogo.src = logo.src;
  const logoWidth = 30;
  const logoHeight = 30;
  doc.addImage(imageLogo, "PNG", 10, 10, logoWidth, logoHeight);


  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Healthcare Clinic", 10 + logoWidth + 8, 18);

 
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("123 Health St., Wellness City", 10 + logoWidth + 8, 25);
  doc.text("Phone: (123) 456-7890", 10 + logoWidth + 8, 32);

 
  doc.setDrawColor(0); 
  doc.setLineWidth(0.5);
  doc.line(10, 40, doc.internal.pageSize.getWidth() - 10, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Radiology Request Form", doc.internal.pageSize.getWidth() / 2, 50, {
    align: "center",
  });

  let y = 65;


  doc.setFont("helvetica", "normal");
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

  doc.text(`Patient ID: ${imagingProcedurePDF.patientId}`, 10, y);
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
      fontSize: 10,
      cellPadding: 3,
      valign: "middle",
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    headStyles: {
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

   doc.save("radiology_request_form.pdf");
  // === Return Blob URL ===
  // const pdfBlob = doc.output("blob");
  // return URL.createObjectURL(pdfBlob);
};
