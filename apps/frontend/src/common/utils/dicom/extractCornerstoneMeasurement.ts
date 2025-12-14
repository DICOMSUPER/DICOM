/**
 * Extract measurement values from Cornerstone annotations
 * Cornerstone already calculates measurements in calibrated units (mm/cm) when pixel spacing is available
 */

import type { Annotation } from "@cornerstonejs/tools/types";

/**
 * Extract measurement from Cornerstone annotation's cached stats
 * Cornerstone tools automatically calculate measurements in mm when pixel spacing is available
 */
export function extractMeasurementFromAnnotation(
  annotation: Annotation
): { value: number; unit: string } | null {
  try {
    // Cornerstone stores calculated measurements in data.cachedStats
    const data = annotation.data as any;
    
    if (!data) {
      return null;
    }

    // Different tools store measurements differently
    // LengthTool stores in data.cachedStats.length
    if (data.cachedStats?.length !== undefined) {
      return {
        value: Math.round(data.cachedStats.length * 10) / 10,
        unit: data.cachedStats.unit || "mm",
      };
    }

    // BidirectionalTool stores width and height
    if (data.cachedStats?.width !== undefined || data.cachedStats?.height !== undefined) {
      const width = data.cachedStats.width || 0;
      const height = data.cachedStats.height || 0;
      return {
        value: Math.round(Math.max(width, height) * 10) / 10,
        unit: data.cachedStats.unit || "mm",
      };
    }

    // Circle/Ellipse ROI stores area and/or radius
    if (data.cachedStats?.area !== undefined) {
      return {
        value: Math.round(data.cachedStats.area * 100) / 100,
        unit: data.cachedStats.areaUnit || "mm²",
      };
    }

    if (data.cachedStats?.radius !== undefined) {
      return {
        value: Math.round(data.cachedStats.radius * 2 * 10) / 10, // Diameter
        unit: data.cachedStats.unit || "mm",
      };
    }

    // AngleTool stores angle in degrees
    if (data.cachedStats?.angle !== undefined) {
      return {
        value: Math.round(data.cachedStats.angle * 10) / 10,
        unit: "°",
      };
    }

    // Fallback: try to read from handles or other properties
    if (data.handles?.textBox?.text) {
      // Parse text if it contains measurement
      const text = data.handles.textBox.text as string;
      const match = text.match(/([\d.]+)\s*(mm|cm|px|°)/i);
      if (match) {
        return {
          value: parseFloat(match[1]),
          unit: match[2],
        };
      }
    }

    return null;
  } catch (error) {
    console.warn("Failed to extract measurement from annotation:", error);
    return null;
  }
}

/**
 * Format measurement for display
 * Converts mm to cm for values >= 10mm
 */
export function formatMeasurement(
  value: number,
  unit: string
): { value: number; unit: string } {
  // Don't convert angles or areas
  if (unit === "°" || unit.includes("²")) {
    return { value: Math.round(value * 10) / 10, unit };
  }

  // Convert mm to cm for larger values
  if (unit === "mm" && value >= 10) {
    return {
      value: Math.round((value / 10) * 10) / 10,
      unit: "cm",
    };
  }

  return { value: Math.round(value * 10) / 10, unit };
}

