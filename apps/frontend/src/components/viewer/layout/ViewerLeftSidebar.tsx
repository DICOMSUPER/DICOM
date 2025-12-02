import {
  Layout,
  Grid,
  Maximize2,
  Search,
  Move,
  ScanLine,
  Ruler,
  Circle,
  Square,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Trash2,
  MousePointer,
  Target,
  ArrowRight,
  RotateCcw as RotateCcwIcon,
  Undo,
  Paintbrush,
  CircleDot,
  Eraser,
  FileText,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewer } from "@/contexts/ViewerContext";
import AIDiagnosisButton from "@/components/viewer/toolbar/AIDiagnosisButton";
import SegmentationControlPanelModal from "../modals/segmentation-control-panel-modal";
import {
  compressSnapshots,
  getCurrentSegmentationSnapshot,
} from "@/contexts/viewer-context/segmentation-helper";
import {
  useCreateImageSegmentationLayerMutation,
  useDeleteImageSegmentationLayerMutation,
} from "@/store/imageSegmentationLayerApi";
import { create } from "domain";
import { toast } from "sonner";

interface ViewerLeftSidebarProps {
  seriesLayout: string;
  onSeriesLayoutChange: (layout: string) => void;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onViewAllAnnotations?: () => void;
  onViewDraftAnnotations?: () => void;
  activeAnnotationView?: "all" | "draft" | null;
}

const seriesLayouts = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
  { id: "3x3", icon: Layout, label: "3x3" },
];

// Basic navigation tools
const navigationTools = [
  { id: "WindowLevel", icon: ScanLine, label: "Window/Level", shortcut: "W" },
  { id: "Pan", icon: Move, label: "Pan", shortcut: "P" },
  { id: "Zoom", icon: Search, label: "Zoom", shortcut: "Z" },
  { id: "Probe", icon: Target, label: "Probe", shortcut: "I" },
];

// Measurement tools
const measurementTools = [
  { id: "Length", icon: Ruler, label: "Length", shortcut: "L" },
  { id: "Height", icon: Ruler, label: "Height", shortcut: "H" },
  { id: "CircleROI", icon: Circle, label: "Circle ROI", shortcut: "C" },
  { id: "RectangleROI", icon: Square, label: "Rectangle ROI", shortcut: "R" },
  {
    id: "Bidirectional",
    icon: ArrowRight,
    label: "Bidirectional",
    shortcut: "B",
  },
  { id: "Angle", icon: RotateCcwIcon, label: "Angle", shortcut: "A" },
  {
    id: "ArrowAnnotate",
    icon: ArrowRight,
    label: "Arrow",
    shortcut: "Shift+A",
  },
  {
    id: "CobbAngle",
    icon: RotateCcwIcon,
    label: "Cobb Angle",
    shortcut: "Shift+C",
  },
  { id: "SplineROI", icon: Circle, label: "Spline ROI", shortcut: "S" },
];

// Transform tools
const transformTools = [
  { id: "rotate-cw", icon: RotateCw, label: "Rotate Right", action: "rotate" },
  { id: "rotate-ccw", icon: RotateCcw, label: "Rotate Left", action: "rotate" },
  {
    id: "flip-h",
    icon: FlipHorizontal,
    label: "Flip Horizontal",
    action: "flip",
  },
  { id: "flip-v", icon: FlipVertical, label: "Flip Vertical", action: "flip" },
];

// Annotation Management tools (moved to top)
const annotationManagementTools = [
  {
    id: "view-all-annotations",
    icon: FileText,
    label: "View All Annotations",
    action: "viewAllAnnotations",
  },
  {
    id: "view-draft-annotations",
    icon: FileClock,
    label: "View Draft Annotations",
    action: "viewDraftAnnotations",
  },
  {
    id: "clear",
    icon: Trash2,
    label: "Clear All Annotations",
    action: "clear",
  },
  {
    id: "clear-viewport",
    icon: Trash2,
    label: "Clear Active Viewport",
    action: "clearViewport",
  },
  {
    id: "undo-annotation",
    icon: Undo,
    label: "Undo Annotation",
    action: "undoAnnotation",
  },
];

// Action tools
const actionTools = [
  { id: "reset", icon: RefreshCw, label: "Reset View", action: "reset" },
  // {
  //   id: "clear-segmentation",
  //   icon: Trash2,
  //   label: "Clear Segmentation",
  //   action: "clearSegmentation",
  // },
  {
    id: "invert",
    icon: MousePointer,
    label: "Invert Colors",
    action: "invert",
  },
];

// Advanced tools
const advancedTools = [
  { id: "Magnify", icon: Maximize2, label: "Magnify", shortcut: "M" },
  { id: "PlanarRotate", icon: RotateCw, label: "Planar Rotate", shortcut: "O" },
  {
    id: "TrackballRotate",
    icon: RotateCw,
    label: "Trackball Rotate",
    shortcut: "R",
  },
  {
    id: "OrientationMarker",
    icon: MousePointer,
    label: "Orientation Marker",
    shortcut: "U",
  },
  { id: "ETDRSGrid", icon: Grid, label: "ETDRS Grid", shortcut: "E" },
  {
    id: "ReferenceLines",
    icon: Grid,
    label: "Reference Lines",
    shortcut: "Shift+R",
  },
  { id: "OverlayGrid", icon: Grid, label: "Overlay Grid", shortcut: "H" },
];

// Annotation tools
const annotationTools = [
  { id: "KeyImage", icon: MousePointer, label: "Key Image", shortcut: "Q" },
  { id: "Label", icon: MousePointer, label: "Label", shortcut: "N" },
  { id: "DragProbe", icon: Target, label: "Drag Probe", shortcut: "F" },
  { id: "PaintFill", icon: MousePointer, label: "Paint Fill", shortcut: "Y" },
];

// Segmentation tools
const segmentationTools = [
  { id: "Brush", icon: Paintbrush, label: "Brush", shortcut: "S" },
  {
    id: "CircleScissors",
    icon: CircleDot,
    label: "Circle Scissors",
    shortcut: "G",
  },
  {
    id: "RectangleScissors",
    icon: Square,
    label: "Rectangle Scissors",
    shortcut: "X",
  },
  // { id: "SphereScissors", icon: Globe, label: "Sphere Scissors", shortcut: "Shift+S" },
  { id: "Eraser", icon: Eraser, label: "Eraser", shortcut: "Shift+Z" },
];

export default function ViewerLeftSidebar({
  seriesLayout,
  onSeriesLayoutChange,
  selectedTool,
  onToolSelect,
  onViewAllAnnotations,
  onViewDraftAnnotations,
  activeAnnotationView,
}: ViewerLeftSidebarProps) {
  const {
    rotateViewport,
    flipViewport,
    resetView,
    clearAnnotations,
    clearViewportAnnotations,
    undoAnnotation,
    invertViewport,
    addSegmentationLayer,
    deleteSegmentationLayer,
    selectSegmentationLayer,
    updateSegmentationLayerMetadata,
    toggleSegmentationLayerVisibility,
    getSegmentationLayers,
    getCurrentSegmentationLayerIndex,
    getSelectedLayerCount,
    isSegmentationVisible,
    toggleSegmentationView,
    undoSegmentation,
    redoSegmentation,
    toggleSegmentationControlPanel,
    isSegmentationControlPanelOpen,
    getSegmentationHistoryState,
    getCurrentSegmentationSnapshot,
    getAllLayerSnapshots,
    getAllCurrentLayerSnapshots,
    refetchSegmentationLayers,
  } = useViewer();

  const [createImageSegmentationLayers] =
    useCreateImageSegmentationLayerMutation();
  const [deleteImageSegmentationLayer] =
    useDeleteImageSegmentationLayerMutation();

  const saveSegmentationLayerToDatabase = async (layerId: string) => {
    try {
      const layer = getSegmentationLayers().find((l) => l.id === layerId);

      if (!layer) {
        console.error("Layer not found:", layerId);
        return;
      }

      console.log("Save segmentation layer to database", layerId, layer);

      // Compress snapshots before saving to reduce payload size
      // To decompress on fetch:
      // 1. Decode Base64 to Uint8Array: Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      // 2. Decompress with pako: pako.inflate(compressedUint8Array)
      const compressedSnapshots = compressSnapshots(layer.snapshots);

      await createImageSegmentationLayers({
        layerName: layer.name,
        instanceId: layer.instanceId as string,
        notes: layer.notes,
        frame: layer?.frame || 1,
        snapshots: compressedSnapshots,
      }).unwrap();

      toast.success("Segmentation layer saved to database");

      // Refetch all layers to get the new database layer, excluding the local one we just saved
      // This effectively "converts" the local layer to a database layer in the UI
      await refetchSegmentationLayers([layerId]);
    } catch (error) {
      console.error("Error saving segmentation layer:", error);
      toast.error("Error saving segmentation layer to database");
    }
  };

  const deleteSegmentationLayerFromDatabase = async (layerId: string) => {
    try {
      console.log("Delete segmentation layer from database", layerId);

      await deleteImageSegmentationLayer(layerId);

      deleteSegmentationLayer(layerId);

      await refetchSegmentationLayers();

      console.log(getSegmentationLayers(), getSegmentationLayers().length);
      if (getSegmentationLayers().length === 0) {
        handleToolSelect("WindowLevel");
      }

      toast.success("Segmentation layer deleted from database");
    } catch (error) {
      console.error("Error deleting segmentation layer:", error);
      toast.error("Error deleting segmentation layer from database", error);
    }
  }; // Map tool names for display
  const getToolDisplayName = (toolId: string) => {
    const toolMapping: Record<string, string> = {
      WindowLevel: "WindowLevel",
      Pan: "Pan",
      Zoom: "Zoom",
      Probe: "Probe",
      Length: "Length",
      Height: "Height",
      CircleROI: "CircleROI",
      EllipticalROI: "EllipticalROI",
      RectangleROI: "RectangleROI",
      Bidirectional: "Bidirectional",
      Angle: "Angle",
      ArrowAnnotate: "ArrowAnnotate",
      CobbAngle: "CobbAngle",
      SplineROI: "SplineROI",
      Rotate: "PlanarRotate",
      Magnify: "Magnify",
      TrackballRotate: "TrackballRotate",
      OrientationMarker: "OrientationMarker",
      ETDRSGrid: "ETDRSGrid",
      ReferenceLines: "ReferenceLines",
      OverlayGrid: "OverlayGrid",
      KeyImage: "KeyImage",
      Label: "Label",
      DragProbe: "DragProbe",
      PaintFill: "PaintFill",
      Eraser: "Eraser",
      ClearSegmentation: "ClearSegmentation",
      UndoAnnotation: "UndoAnnotation",
      // Segmentation tools
      Brush: "Brush",
      CircleScissors: "CircleScissors",
      RectangleScissors: "RectangleScissors",
      SphereScissors: "SphereScissors",
    };
    return toolMapping[toolId] || toolId;
  };

  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
  };

  const handleTransformAction = (action: string, toolId: string) => {
    switch (action) {
      case "rotate":
        rotateViewport(toolId === "rotate-cw" ? 90 : -90);
        break;
      case "flip":
        flipViewport(toolId === "flip-h" ? "horizontal" : "vertical");
        break;
      case "reset":
        resetView();
        break;
      case "clear":
        clearAnnotations();
        break;
      case "clearViewport":
        clearViewportAnnotations();
        break;
      case "clearSegmentation":
        // Clear segmentation action
        console.log("Clear segmentation action triggered");
        // This will be handled by the tool manager
        break;
      case "viewAllAnnotations":
        onViewAllAnnotations?.();
        break;
      case "viewDraftAnnotations":
        onViewDraftAnnotations?.();
        break;
      case "undoAnnotation":
        undoAnnotation();
        break;
      case "invert":
        invertViewport();
        break;
    }
  };

  const getActionButtonClasses = (toolId: string) => {
    if (toolId === "clear") {
      return "bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-300";
    }

    if (toolId === "clear-viewport") {
      return "bg-slate-800 text-slate-400 hover:bg-orange-900/30 hover:text-orange-300";
    }

    if (toolId === "view-all-annotations") {
      return activeAnnotationView === "all"
        ? "bg-linear-to-br from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30"
        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300";
    }

    if (toolId === "view-draft-annotations") {
      return activeAnnotationView === "draft"
        ? "bg-linear-to-br from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30"
        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300";
    }

    return "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300";
  };
  const selectedLayerCountValue = getSelectedLayerCount();
  const {
    canUndo: canUndoSegmentationHistory,
    canRedo: canRedoSegmentationHistory,
  } = getSegmentationHistoryState();

  // Disable segmentation tools if no layers exist OR no layer is selected
  const layers = getSegmentationLayers();

  const currentLayer = layers.find(
    (layer) => layer.id === layers[getCurrentSegmentationLayerIndex()]?.id
  );
  const segmentationToolsDisabled =
    layers.length === 0 ||
    selectedLayerCountValue === 0 ||
    currentLayer?.origin === "database";

  return (
    <TooltipProvider>
      <div className="h-full border-r border-slate-800 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Viewport Layout Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Viewport Layout</h3>
            <p className="text-slate-400 text-xs mb-3">
              Select the number of viewports to display
            </p>

            <div className="grid grid-cols-2 gap-2">
              {seriesLayouts.map((layout) => (
                <Tooltip key={layout.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSeriesLayoutChange(layout.id)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 ${
                        seriesLayout === layout.id
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <layout.icon size={16} />
                      {layout.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    {layout.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Annotation Management Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Annotation Management
            </h3>
            <p className="text-slate-400 text-xs mb-3">
              View, clear, and undo annotations
            </p>
            <div className="grid grid-cols-2 gap-2">
              {annotationManagementTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleTransformAction(tool.action, tool.id)
                      }
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${getActionButtonClasses(
                        tool.id
                      )}`}
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    {tool.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Navigation Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navigation Tools</h3>
            <p className="text-slate-400 text-xs mb-3">
              Adjust display and navigate images
            </p>
            <div className="grid grid-cols-2 gap-2">
              {navigationTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">
                        {tool.shortcut}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* AI Diagnosis Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">AI Diagnosis</h3>
            <p className="text-slate-400 text-xs mb-3">
              Analyze current viewport with AI model
            </p>
            <AIDiagnosisButton />
          </div>

          {/* Measurement Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Measurement Tools</h3>
            <p className="text-slate-400 text-xs mb-3">
              Measure and analyze regions of interest (ROI)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {measurementTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">
                        {tool.shortcut}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Transform Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Transform Tools</h3>
            <p className="text-slate-400 text-xs mb-3">
              Rotate, flip and transform images
            </p>
            <div className="grid grid-cols-2 gap-2">
              {transformTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleTransformAction(tool.action, tool.id)
                      }
                      className="h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    {tool.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Annotation Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Annotation Tools</h3>
            <p className="text-slate-400 text-xs mb-3">
              Add notes and markers to images
            </p>
            <div className="grid grid-cols-2 gap-2">
              {annotationTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">
                        {tool.shortcut}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Segmentation Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Segmentation Tools
            </h3>
            <p className="text-slate-400 text-xs mb-3">
              Segment and draw masks on images
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={() => toggleSegmentationControlPanel()}>
                Segmentation Control Panel
              </Button>
              {isSegmentationControlPanelOpen() && (
                <SegmentationControlPanelModal
                  onClose={() => toggleSegmentationControlPanel()}
                  layers={getSegmentationLayers()}
                  currentLayerIndex={getCurrentSegmentationLayerIndex()}
                  onAddLayer={addSegmentationLayer}
                  onDeleteLayer={deleteSegmentationLayer}
                  onSelectLayer={(index) => {
                    const layers = getSegmentationLayers();
                    if (index >= 0 && index < layers.length) {
                      selectSegmentationLayer(layers[index].id);
                    }
                  }}
                  onToggleLayerVisibility={(index) => {
                    const layers = getSegmentationLayers();
                    if (index >= 0 && index < layers.length) {
                      toggleSegmentationLayerVisibility(layers[index].id);
                    }
                  }}
                  onUndo={undoSegmentation}
                  onRedo={redoSegmentation}
                  canUndo={canUndoSegmentationHistory}
                  canRedo={canRedoSegmentationHistory}
                  isSegmentationVisible={isSegmentationVisible()}
                  onToggleSegmentationView={toggleSegmentationView}
                  selectedLayerCount={selectedLayerCountValue}
                  onSaveLayerToDatabase={(layerId: string) =>
                    saveSegmentationLayerToDatabase(layerId)
                  }
                  onDeleteLayerFromDatabase={(layerId: string) =>
                    deleteSegmentationLayerFromDatabase(layerId)
                  }
                  onUpdateLayerMetadata={(
                    layerId: string,
                    updates: { name?: string; notes?: string }
                  ) => updateSegmentationLayerMetadata(layerId, updates)}
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                {segmentationTools.map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToolSelect(tool.id)}
                        disabled={segmentationToolsDisabled}
                        className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${
                          segmentationToolsDisabled
                            ? "bg-slate-900 text-slate-600 opacity-50 cursor-not-allowed pointer-events-none"
                            : selectedTool === getToolDisplayName(tool.id)
                            ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                        }`}
                        title={
                          segmentationToolsDisabled
                            ? "Add and select a segmentation layer to enable tools"
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1 w-full justify-center">
                          <tool.icon className="h-5 w-5 shrink-0" />
                          <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                            {tool.label}
                          </span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-slate-800 border-teal-700 text-white"
                    >
                      <div className="text-center">
                        <div>{tool.label}</div>
                        <div className="text-xs text-slate-400">
                          {tool.shortcut}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Action Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Actions</h3>
            <p className="text-slate-400 text-xs mb-3">
              Quick actions: clear, undo and reset
            </p>
            <div className="grid grid-cols-2 gap-2">
              {actionTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleTransformAction(tool.action, tool.id)
                      }
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${getActionButtonClasses(
                        tool.id
                      )}`}
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    {tool.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Advanced Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Advanced Tools</h3>
            <p className="text-slate-400 text-xs mb-3">
              Professional and advanced tools
            </p>
            <div className="grid grid-cols-2 gap-2">
              {advancedTools.map((tool) => (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${
                        selectedTool === getToolDisplayName(tool.id)
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full justify-center">
                        <tool.icon className="h-5 w-5 shrink-0" />
                        <span className="text-xs text-center whitespace-normal wrap-break-word leading-tight">
                          {tool.label}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-slate-800 border-teal-700 text-white"
                  >
                    <div className="text-center">
                      <div>{tool.label}</div>
                      <div className="text-xs text-slate-400">
                        {tool.shortcut}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
