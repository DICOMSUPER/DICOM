/**
 * Annotation Deduplication Utility
 * Prevents duplicate annotations when same DICOM instance appears in multiple viewports
 */

import type { Annotation } from "@cornerstonejs/tools/types";

/**
 * Generate unique key for annotation based on its data, not viewport
 * Identical annotations on same instance should have same key
 */
export function getAnnotationUniqueKey(annotation: Annotation): string {
  const metadata = annotation.metadata;
  
  // Key components that make an annotation unique:
  // 1. Referenced image ID (which DICOM instance)
  // 2. Tool name (what type of annotation)
  // 3. Position data (where it's drawn)
  
  const imageId = metadata?.referencedImageId || '';
  const toolName = metadata?.toolName || annotation.metadata?.toolName || '';
  
  // Get position data based on annotation type
  let positionKey = '';
  
  if (annotation.data) {
    const data = annotation.data as any;
    
    // For point-based annotations (Length, Angle, etc.)
    if (data.handles?.points) {
      const points = data.handles.points;
      positionKey = points
        .map((p: any) => `${p.x?.toFixed(2)},${p.y?.toFixed(2)},${p.z?.toFixed(2)}`)
        .join('|');
    }
    // For ROI annotations (Circle, Rectangle, etc.)
    else if (data.cachedStats) {
      const stats = data.cachedStats;
      const firstKey = Object.keys(stats)[0];
      if (firstKey && stats[firstKey]) {
        const { center, radius, mean } = stats[firstKey];
        positionKey = `${center?.[0]?.toFixed(2)},${center?.[1]?.toFixed(2)},${radius?.toFixed(2)},${mean?.toFixed(2)}`;
      }
    }
    // For text annotations
    else if (data.text) {
      positionKey = `text:${data.text}`;
    }
  }
  
  return `${imageId}::${toolName}::${positionKey}`;
}

/**
 * Check if annotation is a duplicate based on unique key
 */
export function isDuplicateAnnotation(
  annotation: Annotation,
  existingAnnotations: Annotation[]
): boolean {
  const newKey = getAnnotationUniqueKey(annotation);
  
  return existingAnnotations.some((existing) => {
    const existingKey = getAnnotationUniqueKey(existing);
    return newKey === existingKey;
  });
}

/**
 * Deduplicate annotations array - keep only unique ones
 * Prefers database annotations over local ones when duplicates exist
 */
export function deduplicateAnnotations(annotations: Annotation[]): Annotation[] {
  const uniqueMap = new Map<string, Annotation>();
  
  annotations.forEach((annotation) => {
    const key = getAnnotationUniqueKey(annotation);
    const existing = uniqueMap.get(key);
    
    // If no existing, add it
    if (!existing) {
      uniqueMap.set(key, annotation);
      return;
    }
    
    // If duplicate found, prefer database annotation over local
    const isExistingFromDb = (existing.metadata as any)?.source === 'db';
    const isNewFromDb = (annotation.metadata as any)?.source === 'db';
    
    if (isNewFromDb && !isExistingFromDb) {
      // Replace local with database version
      uniqueMap.set(key, annotation);
    }
    // Otherwise keep the existing one
  });
  
  return Array.from(uniqueMap.values());
}

/**
 * Merge annotations from multiple viewports, removing duplicates
 * Used when same DICOM instance is shown in multiple viewports
 */
export function mergeAnnotationsAcrossViewports(
  viewportAnnotations: Map<string, Annotation[]>
): Annotation[] {
  // Collect all annotations
  const allAnnotations: Annotation[] = [];
  
  viewportAnnotations.forEach((annotations) => {
    allAnnotations.push(...annotations);
  });
  
  // Deduplicate
  return deduplicateAnnotations(allAnnotations);
}

/**
 * Get annotations grouped by instance ID
 * Helps identify which annotations belong to which DICOM instance
 */
export function groupAnnotationsByInstance(
  annotations: Annotation[]
): Map<string, Annotation[]> {
  const grouped = new Map<string, Annotation[]>();
  
  annotations.forEach((annotation) => {
    const imageId = annotation.metadata?.referencedImageId || 'unknown';
    
    if (!grouped.has(imageId)) {
      grouped.set(imageId, []);
    }
    
    grouped.get(imageId)!.push(annotation);
  });
  
  return grouped;
}

/**
 * Check if two annotations are identical (same position, tool, instance)
 */
export function areAnnotationsIdentical(
  ann1: Annotation,
  ann2: Annotation
): boolean {
  return getAnnotationUniqueKey(ann1) === getAnnotationUniqueKey(ann2);
}

export default {
  getAnnotationUniqueKey,
  isDuplicateAnnotation,
  deduplicateAnnotations,
  mergeAnnotationsAcrossViewports,
  groupAnnotationsByInstance,
  areAnnotationsIdentical,
};

