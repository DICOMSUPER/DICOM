// Re-export annotation types from Cornerstone to maintain backward compatibility
// All custom annotation types have been replaced with Cornerstone's official types
export type {
  Annotation,
  AnnotationMetadata,
  AnnotationData,
  Handles,
  Contour,
  Annotations,
  GroupSpecificAnnotations,
  AnnotationState,
} from "@cornerstonejs/tools/types";

// Note: If you need Point3, import it from @cornerstonejs/core:
// import type { Types } from '@cornerstonejs/core';
// type Point3 = Types.Point3;
