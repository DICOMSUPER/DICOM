import html2canvas from "html2canvas";

const captureSignature = async (element: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2, 
    logging: false, 
  });
  return canvas.toDataURL("image/png");
};

export default captureSignature;
