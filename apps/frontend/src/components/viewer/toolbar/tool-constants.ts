// Tool mapping constants extracted for better tree-shaking and code organization
import {
  LengthTool,
  CircleROITool,
  EllipticalROITool,
  BidirectionalTool,
  AngleTool,
  ProbeTool,
  RectangleROITool,
  PlanarFreehandROITool,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  ArrowAnnotateTool,
  CobbAngleTool,
  PlanarRotateTool,
  MagnifyTool,
  HeightTool,
  SplineROITool,
  TrackballRotateTool,
  MIPJumpToClickTool,
  SegmentBidirectionalTool,
  KeyImageTool,
  DragProbeTool,
  PaintFillTool,
  BrushTool,
  CircleScissorsTool,
  RectangleScissorsTool,
  SphereScissorsTool,
  ScaleOverlayTool,
} from "@cornerstonejs/tools";
import { MouseBindings } from "@cornerstonejs/tools/enums";
import { CustomLabelTool } from "./CustomLabelTool";

export type NavigationTool =
  | "WindowLevel"
  | "Pan"
  | "Zoom"
  | "StackScroll"
  | "Probe"
  | "TrackballRotate"
  | "MIPJumpToClick";

export type MeasurementTool =
  | "Length"
  | "Height"
  | "CircleROI"
  | "EllipticalROI"
  | "RectangleROI"
  | "PlanarFreehandROI"
  | "Bidirectional"
  | "Angle"
  | "ArrowAnnotate"
  | "CobbAngle"
  | "SplineROI"
  | "SegmentBidirectional";

export type AdvancedTool = "PlanarRotate" | "Magnify";

export type AnnotationTool =
  | "KeyImage"
  | "Label"
  | "DragProbe"
  | "PaintFill"
  | "ScaleOverlay";

export type SegmentationTool =
  | "Brush"
  | "CircleScissors"
  | "RectangleScissors"
  | "SphereScissors"
  | "Eraser"; // Eraser works on segmentation labelmaps

export type CustomTool =
  | "Rotate"
  | "Flip"
  | "Invert"
  | "ClearAnnotations"
  | "ClearViewportAnnotations"
  | "ClearSegmentation"
  | "UndoAnnotation"
  | "Reset";

export type ToolType =
  | NavigationTool
  | MeasurementTool
  | AdvancedTool
  | AnnotationTool
  | SegmentationTool
  | CustomTool;

export interface ToolMapping {
  toolName: string;
  toolClass: any;
  category:
    | "navigation"
    | "measurement"
    | "advanced"
    | "annotation"
    | "segmentation"
    | "custom";
  configuration?: Record<string, unknown>;
}

export interface ToolBindings {
  primary?: MouseBindings;
  secondary?: MouseBindings;
  auxiliary?: MouseBindings;
  wheel?: MouseBindings;
  wheelWithCtrl?: MouseBindings;
  keyboard?: string;
}

// Tool mappings for reusability
export const TOOL_MAPPINGS: Record<ToolType, ToolMapping> = {
  // Navigation tools
  WindowLevel: {
    toolName: WindowLevelTool.toolName,
    toolClass: WindowLevelTool,
    category: "navigation",
  },
  Pan: {
    toolName: PanTool.toolName,
    toolClass: PanTool,
    category: "navigation",
  },
  Zoom: {
    toolName: ZoomTool.toolName,
    toolClass: ZoomTool,
    category: "navigation",
  },
  StackScroll: {
    toolName: StackScrollTool.toolName,
    toolClass: StackScrollTool,
    category: "navigation",
  },
  Probe: {
    toolName: ProbeTool.toolName,
    toolClass: ProbeTool,
    category: "navigation",
  },
  TrackballRotate: {
    toolName: TrackballRotateTool.toolName,
    toolClass: TrackballRotateTool,
    category: "navigation",
  },
  MIPJumpToClick: {
    toolName: MIPJumpToClickTool.toolName,
    toolClass: MIPJumpToClickTool,
    category: "navigation",
  },

  // Measurement tools
  Length: {
    toolName: LengthTool.toolName,
    toolClass: LengthTool,
    category: "measurement",
  },
  Height: {
    toolName: HeightTool.toolName,
    toolClass: HeightTool,
    category: "measurement",
  },
  CircleROI: {
    toolName: CircleROITool.toolName,
    toolClass: CircleROITool,
    category: "measurement",
  },
  EllipticalROI: {
    toolName: EllipticalROITool.toolName,
    toolClass: EllipticalROITool,
    category: "measurement",
  },
  RectangleROI: {
    toolName: RectangleROITool.toolName,
    toolClass: RectangleROITool,
    category: "measurement",
  },
  PlanarFreehandROI: {
    toolName: PlanarFreehandROITool.toolName,
    toolClass: PlanarFreehandROITool,
    category: "measurement",
  },
  Bidirectional: {
    toolName: BidirectionalTool.toolName,
    toolClass: BidirectionalTool,
    category: "measurement",
  },
  Angle: {
    toolName: AngleTool.toolName,
    toolClass: AngleTool,
    category: "measurement",
  },
  ArrowAnnotate: {
    toolName: ArrowAnnotateTool.toolName,
    toolClass: ArrowAnnotateTool,
    category: "measurement",
  },
  CobbAngle: {
    toolName: CobbAngleTool.toolName,
    toolClass: CobbAngleTool,
    category: "measurement",
  },
  SplineROI: {
    toolName: SplineROITool.toolName,
    toolClass: SplineROITool,
    category: "measurement",
  },
  SegmentBidirectional: {
    toolName: SegmentBidirectionalTool.toolName,
    toolClass: SegmentBidirectionalTool,
    category: "measurement",
  },

  // Advanced tools
  PlanarRotate: {
    toolName: PlanarRotateTool.toolName,
    toolClass: PlanarRotateTool,
    category: "advanced",
  },
  Magnify: {
    toolName: MagnifyTool.toolName,
    toolClass: MagnifyTool,
    category: "advanced",
  },

  // Annotation tools
  KeyImage: {
    toolName: KeyImageTool.toolName,
    toolClass: KeyImageTool,
    category: "annotation",
  },
  Label: {
    toolName: CustomLabelTool.toolName,
    toolClass: CustomLabelTool,
    category: "annotation",
  },
  DragProbe: {
    toolName: DragProbeTool.toolName,
    toolClass: DragProbeTool,
    category: "annotation",
  },
  PaintFill: {
    toolName: PaintFillTool.toolName,
    toolClass: PaintFillTool,
    category: "annotation",
  },
  Eraser: {
    toolName: BrushTool.toolName, // Use BrushTool with segment index 0 for segmentation erasing
    toolClass: BrushTool,
    category: "segmentation",
  },
  ScaleOverlay: {
    toolName: ScaleOverlayTool.toolName,
    toolClass: ScaleOverlayTool,
    category: "annotation",
  },

  // Segmentation tools
  Brush: {
    toolName: BrushTool.toolName,
    toolClass: BrushTool,
    category: "segmentation",
  },
  CircleScissors: {
    toolName: CircleScissorsTool.toolName,
    toolClass: CircleScissorsTool,
    category: "segmentation",
  },
  RectangleScissors: {
    toolName: RectangleScissorsTool.toolName,
    toolClass: RectangleScissorsTool,
    category: "segmentation",
  },
  SphereScissors: {
    toolName: SphereScissorsTool.toolName,
    toolClass: SphereScissorsTool,
    category: "segmentation",
  },

  // Custom tools (no Cornerstone.js tool class)
  Rotate: { toolName: "Rotate", toolClass: null, category: "custom" },
  Flip: { toolName: "Flip", toolClass: null, category: "custom" },
  Invert: { toolName: "Invert", toolClass: null, category: "custom" },
  ClearAnnotations: {
    toolName: "ClearAnnotations",
    toolClass: null,
    category: "custom",
  },
  ClearViewportAnnotations: {
    toolName: "ClearViewportAnnotations",
    toolClass: null,
    category: "custom",
  },
  ClearSegmentation: {
    toolName: "ClearSegmentation",
    toolClass: null,
    category: "custom",
  },
  UndoAnnotation: {
    toolName: "UndoAnnotation",
    toolClass: null,
    category: "custom",
  },
  Reset: { toolName: "Reset", toolClass: null, category: "custom" },
};

// Tool bindings configuration - keyboard shortcuts disabled for all tools except scroll wheel
export const TOOL_BINDINGS: Record<string, ToolBindings> = {
  [WindowLevelTool.toolName]: { primary: MouseBindings.Primary },
  [PanTool.toolName]: { auxiliary: MouseBindings.Auxiliary },
  [ZoomTool.toolName]: { secondary: MouseBindings.Secondary },
  [StackScrollTool.toolName]: { wheel: MouseBindings.Wheel },
  [PlanarRotateTool.toolName]: { wheelWithCtrl: MouseBindings.Wheel },
};

// Helper functions
export const getToolMapping = (toolType: ToolType): ToolMapping | null => {
  return TOOL_MAPPINGS[toolType] || null;
};

export const getToolName = (toolType: ToolType): string | null => {
  const mapping = getToolMapping(toolType);
  return mapping?.toolName || null;
};

export const getToolClass = (toolType: ToolType): any | null => {
  const mapping = getToolMapping(toolType);
  return mapping?.toolClass || null;
};

export const isCustomTool = (toolType: ToolType): boolean => {
  return getToolMapping(toolType)?.category === "custom";
};

// Keyboard shortcut helpers
export const getToolByKeyboardShortcut = (key: string): string | null => {
  for (const [toolName, bindings] of Object.entries(TOOL_BINDINGS)) {
    if (bindings.keyboard === key.toLowerCase()) {
      return toolName;
    }
  }
  return null;
};

export const getKeyboardShortcut = (toolName: string): string | null => {
  const bindings = TOOL_BINDINGS[toolName];
  return bindings?.keyboard || null;
};

export const getAllKeyboardShortcuts = (): Record<string, string> => {
  const shortcuts: Record<string, string> = {};
  Object.entries(TOOL_BINDINGS).forEach(([toolName, bindings]) => {
    if (bindings.keyboard) {
      shortcuts[toolName] = bindings.keyboard;
    }
  });
  return shortcuts;
};

// Get all non-custom tool mappings (memoized)
export const getNonCustomMappings = () => {
  return Object.values(TOOL_MAPPINGS).filter(
    (mapping) => mapping.category !== "custom" && mapping.toolClass
  );
};

// Get all tool names (memoized)
export const getAllToolNames = () => {
  return getNonCustomMappings().map((mapping) => mapping.toolName);
};

