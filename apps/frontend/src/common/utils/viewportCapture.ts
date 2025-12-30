/**
 * Viewport capture and export utilities for Cornerstone.js
 * Allows capturing viewport content (image, annotations, segmentation) as images
 */

import { getRenderingEngine } from "@cornerstonejs/core";

export interface ViewportCaptureOptions {
  /** Quality for JPEG format (0-1, default: 0.95) */
  quality?: number;
  /** Output format (default: 'image/png') */
  format?: "image/png" | "image/jpeg" | "image/webp";
  /** Include annotations in capture (default: true) */
  includeAnnotations?: boolean;
  /** Include segmentation in capture (default: true) */
  includeSegmentation?: boolean;
}

export interface ViewportCaptureResult {
  /** Base64 data URL of the captured image */
  dataUrl: string;
  /** Blob of the captured image */
  blob: Blob;
  /** Width of the captured image */
  width: number;
  /** Height of the captured image */
  height: number;
}

/**
 * Get the canvas element from a viewport
 */
export function getViewportCanvas(
  renderingEngineId: string,
  viewportId: string
): HTMLCanvasElement | null {
  try {
    const renderingEngine = getRenderingEngine(renderingEngineId);
    if (!renderingEngine) {
      console.warn(`Rendering engine ${renderingEngineId} not found`);
      return null;
    }

    const viewport = renderingEngine.getViewport(viewportId);
    if (!viewport) {
      console.warn(`Viewport ${viewportId} not found`);
      return null;
    }

    const element = viewport.element as HTMLDivElement;
    const canvas = element?.querySelector("canvas");

    return canvas as HTMLCanvasElement | null;
  } catch (error) {
    console.error("Error getting viewport canvas:", error);
    return null;
  }
}

/**
 * Capture the current viewport content as an image
 * This captures everything rendered on the canvas including the DICOM image,
 * annotations, and segmentation overlays
 */
export async function captureViewport(
  renderingEngineId: string,
  viewportId: string,
  options: ViewportCaptureOptions = {}
): Promise<ViewportCaptureResult | null> {
  const { quality = 0.95, format = "image/png" } = options;

  try {
    const canvas = getViewportCanvas(renderingEngineId, viewportId);

    if (!canvas) {
      console.warn("Could not find viewport canvas");
      return null;
    }

    // Get the data URL
    const dataUrl = canvas.toDataURL(format, quality);

    // Convert to Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        format,
        quality
      );
    });

    return {
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error("Error capturing viewport:", error);
    return null;
  }
}

/**
 * Download the captured viewport as an image file
 */
export async function downloadViewportImage(
  renderingEngineId: string,
  viewportId: string,
  filename: string = "dicom-capture",
  options: ViewportCaptureOptions = {}
): Promise<boolean> {
  try {
    const result = await captureViewport(renderingEngineId, viewportId, options);

    if (!result) {
      return false;
    }

    // Determine file extension based on format
    const format = options.format || "image/png";
    const extension = format.replace("image/", "");
    const fullFilename = `${filename}.${extension}`;

    // Create download link
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Error downloading viewport image:", error);
    return false;
  }
}

/**
 * Print the viewport image using the browser's print dialog
 */
export async function printViewport(
  renderingEngineId: string,
  viewportId: string,
  options: ViewportCaptureOptions = {}
): Promise<boolean> {
  try {
    const result = await captureViewport(renderingEngineId, viewportId, options);

    if (!result) {
      return false;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      console.warn("Could not open print window - popup may be blocked");
      return false;
    }

    // Write the image to the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DICOM Print</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              img { max-width: 100%; height: auto; }
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #000;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${result.dataUrl}" alt="DICOM Image" />
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for image to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };

    return true;
  } catch (error) {
    console.error("Error printing viewport:", error);
    return false;
  }
}

/**
 * Copy the viewport image to clipboard
 */
export async function copyViewportToClipboard(
  renderingEngineId: string,
  viewportId: string,
  options: ViewportCaptureOptions = {}
): Promise<boolean> {
  try {
    const result = await captureViewport(renderingEngineId, viewportId, {
      ...options,
      format: "image/png", // Clipboard requires PNG format
    });

    if (!result) {
      return false;
    }

    // Use the Clipboard API to copy the image
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": result.blob,
      }),
    ]);

    return true;
  } catch (error) {
    console.error("Error copying viewport to clipboard:", error);
    return false;
  }
}
