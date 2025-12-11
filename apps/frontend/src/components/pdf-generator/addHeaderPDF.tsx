import { jsPDF } from "jspdf";
import logo from "../../../public/assets/logo_nobg.png";
import { font } from "./font";

export interface PDFHeaderConfig {
  clinicName?: string;
  address?: string;
  phone?: string;
  title: string;
}

export const addPDFHeader = (doc: jsPDF, config: PDFHeaderConfig): number => {
  // Default values
  const clinicName = config.clinicName || "Healthcare Clinic";
  const address = config.address || "123 Health St., Wellness City";
  const phone = config.phone || "(123) 456-7890";

  // Add logo
  let imageLogo = new Image();
  imageLogo.src = logo.src;
  const logoWidth = 30;
  const logoHeight = 30;
  doc.addImage(imageLogo, "PNG", 10, 10, logoWidth, logoHeight);

  doc.addFileToVFS("Roboto-normal.ttf", font);
  doc.addFont("Roboto-normal.ttf", "Roboto", "normal");

  doc.setFont("Roboto");
  doc.setFontSize(16);
  doc.text(clinicName, 10 + logoWidth + 8, 18);

  // Address and phone
  doc.setFont("Roboto");
  doc.setFontSize(11);
  doc.text(address, 10 + logoWidth + 8, 25);
  doc.text(`Phone: ${phone}`, 10 + logoWidth + 8, 32);

  // Divider line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, 40, doc.internal.pageSize.getWidth() - 10, 40);

  // Title
  doc.setFont("Roboto");
  doc.setFontSize(20);
  doc.text(config.title, doc.internal.pageSize.getWidth() / 2, 50, {
    align: "center",
  });

  // Return Y position after header (where content should start)
  return 65;
};
