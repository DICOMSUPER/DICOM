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
  Eye,
  EyeOff,
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
import { compressSnapshots } from "@/contexts/viewer-context/segmentation-helper";
import {
  useCreateImageSegmentationLayerMutation,
  useDeleteImageSegmentationLayerMutation,
} from "@/store/imageSegmentationLayerApi";
import { toast } from "sonner";
import { useMemo, useCallback, memo } from "react";

interface ViewerLeftSidebarProps {
  seriesLayout: string;
  onSeriesLayoutChange: (layout: string) => void;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onViewAllAnnotations?: () => void;
  onViewDraftAnnotations?: () => void;
  activeAnnotationView?: "all" | "draft" | null;
}

const SERIES_LAYOUTS = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
] as const;

const NAVIGATION_TOOLS = [
  { id: "WindowLevel", icon: ScanLine, label: "Window/Level", shortcut: "W" },
  { id: "Pan", icon: Move, label: "Pan", shortcut: "P" },
  { id: "Zoom", icon: Search, label: "Zoom", shortcut: "Z" },
  { id: "Probe", icon: Target, label: "Probe", shortcut: "I" },
  { id: "Magnify", icon: Maximize2, label: "Magnify", shortcut: "M" },
  { id: "PlanarRotate", icon: RotateCw, label: "Planar Rotate", shortcut: "O" },
  { id: "TrackballRotate", icon: RotateCw, label: "Trackball Rotate", shortcut: "R" },
  { id: "reset", icon: RefreshCw, label: "Reset View", action: "reset" },
  { id: "invert", icon: MousePointer, label: "Invert Colors", action: "invert" },
] as const;

const MEASUREMENT_TOOLS = [
  { id: "Length", icon: Ruler, label: "Length", shortcut: "L" },
  { id: "Height", icon: Ruler, label: "Height", shortcut: "H" },
  { id: "CircleROI", icon: Circle, label: "Circle ROI", shortcut: "C" },
  { id: "RectangleROI", icon: Square, label: "Rectangle ROI", shortcut: "R" },
  { id: "Bidirectional", icon: ArrowRight, label: "Bidirectional", shortcut: "B" },
  { id: "Angle", icon: RotateCcwIcon, label: "Angle", shortcut: "A" },
  { id: "ArrowAnnotate", icon: ArrowRight, label: "Arrow", shortcut: "Shift+A" },
  { id: "CobbAngle", icon: RotateCcwIcon, label: "Cobb Angle", shortcut: "Shift+C" },
  { id: "SplineROI", icon: Circle, label: "Spline ROI", shortcut: "S" },
] as const;

const ANNOTATION_MANAGEMENT_TOOLS = [
  { id: "toggle-annotations", icon: Eye, label: "Toggle Annotations", action: "toggleAnnotations" },
  { id: "view-all-annotations", icon: FileText, label: "View All Annotations", action: "viewAllAnnotations" },
  { id: "view-draft-annotations", icon: FileClock, label: "View Draft Annotations", action: "viewDraftAnnotations" },
  { id: "clear", icon: Trash2, label: "Clear All Annotations", action: "clear" },
  { id: "clear-viewport", icon: Trash2, label: "Clear Active Viewport", action: "clearViewport" },
  { id: "undo-annotation", icon: Undo, label: "Undo Annotation", action: "undoAnnotation" },
] as const;


const ANNOTATION_TOOLS = [
  { id: "KeyImage", icon: MousePointer, label: "Key Image", shortcut: "Q" },
  { id: "Label", icon: MousePointer, label: "Label", shortcut: "N" },
  { id: "DragProbe", icon: Target, label: "Drag Probe", shortcut: "F" },
  { id: "PaintFill", icon: MousePointer, label: "Paint Fill", shortcut: "Y" },
] as const;

const SEGMENTATION_TOOLS = [
  { id: "Brush", icon: Paintbrush, label: "Brush", shortcut: "S" },
  { id: "CircleScissors", icon: CircleDot, label: "Circle Scissors", shortcut: "G" },
  { id: "RectangleScissors", icon: Square, label: "Rectangle Scissors", shortcut: "X" },
  { id: "Eraser", icon: Eraser, label: "Eraser", shortcut: "Shift+Z" },
] as const;

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
    resetView,
    clearAnnotations,
    clearViewportAnnotations,
    undoAnnotation,
    invertViewport,
    toggleAnnotations,
    state,
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
    refetchSegmentationLayers,
  } = useViewer();

  const [createImageSegmentationLayers] =
    useCreateImageSegmentationLayerMutation();
  const [deleteImageSegmentationLayer] =
    useDeleteImageSegmentationLayerMutation();

  const handleToolSelect = useCallback((toolId: string) => {
    onToolSelect(toolId);
  }, [onToolSelect]);

  const saveSegmentationLayerToDatabase = useCallback(async (layerId: string) => {
    try {
      const layers = getSegmentationLayers();
      const layer = layers.find((l) => l.id === layerId);

      if (!layer) {
        return;
      }

      const compressedSnapshots = compressSnapshots(layer.snapshots);

      await createImageSegmentationLayers({
        layerName: layer.name,
        instanceId: layer.instanceId as string,
        notes: layer.notes,
        frame: 1,
        snapshots: compressedSnapshots,
      }).unwrap();

      toast.success("Segmentation layer saved to database");
      await refetchSegmentationLayers([layerId]);
    } catch (error) {
      toast.error("Error saving segmentation layer to database");
    }
  }, [getSegmentationLayers, createImageSegmentationLayers, refetchSegmentationLayers]);

  const deleteSegmentationLayerFromDatabase = useCallback(async (layerId: string) => {
    try {
      await deleteImageSegmentationLayer(layerId);
      deleteSegmentationLayer(layerId);
      await refetchSegmentationLayers();

      const layers = getSegmentationLayers();
      if (layers.length === 0) {
        handleToolSelect("WindowLevel");
      }

      toast.success("Segmentation layer deleted from database");
    } catch (error) {
      toast.error("Error deleting segmentation layer from database");
    }
  }, [deleteImageSegmentationLayer, deleteSegmentationLayer, refetchSegmentationLayers, getSegmentationLayers, handleToolSelect]);

  const toolDisplayNameMap = useMemo(() => new Map<string, string>([
    ["Rotate", "PlanarRotate"],
    ["WindowLevel", "WindowLevel"],
    ["Pan", "Pan"],
    ["Zoom", "Zoom"],
    ["Probe", "Probe"],
    ["Length", "Length"],
    ["Height", "Height"],
    ["CircleROI", "CircleROI"],
    ["EllipticalROI", "EllipticalROI"],
    ["RectangleROI", "RectangleROI"],
    ["Bidirectional", "Bidirectional"],
    ["Angle", "Angle"],
    ["ArrowAnnotate", "ArrowAnnotate"],
    ["CobbAngle", "CobbAngle"],
    ["SplineROI", "SplineROI"],
    ["Magnify", "Magnify"],
    ["TrackballRotate", "TrackballRotate"],
    ["KeyImage", "KeyImage"],
    ["Label", "Label"],
    ["DragProbe", "DragProbe"],
    ["PaintFill", "PaintFill"],
    ["Eraser", "Eraser"],
    ["Brush", "Brush"],
    ["CircleScissors", "CircleScissors"],
    ["RectangleScissors", "RectangleScissors"],
    ["SphereScissors", "SphereScissors"],
  ]), []);

  const getToolDisplayName = useCallback((toolId: string) => {
    return toolDisplayNameMap.get(toolId) || toolId;
  }, [toolDisplayNameMap]);

  const actionHandlers = useMemo(() => ({
    reset: resetView,
    clear: clearAnnotations,
    clearViewport: clearViewportAnnotations,
    clearSegmentation: () => {},
    viewAllAnnotations: () => onViewAllAnnotations?.(),
    viewDraftAnnotations: () => onViewDraftAnnotations?.(),
    undoAnnotation: undoAnnotation,
    invert: invertViewport,
    toggleAnnotations: toggleAnnotations,
  }), [resetView, clearAnnotations, clearViewportAnnotations, onViewAllAnnotations, onViewDraftAnnotations, undoAnnotation, invertViewport, toggleAnnotations]);

  const handleTransformAction = useCallback((action: string) => {
    const handler = actionHandlers[action as keyof typeof actionHandlers];
    if (handler) {
      handler();
    }
  }, [actionHandlers]);

  const getActionButtonClasses = useCallback((toolId: string) => {
    if (toolId === "clear") {
      return "bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-300";
    }
    if (toolId === "clear-viewport") {
      return "bg-slate-800 text-slate-400 hover:bg-orange-900/30 hover:text-orange-300";
    }
    if (toolId === "toggle-annotations") {
      return state.showAnnotations
        ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300";
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
  }, [activeAnnotationView, state.showAnnotations]);

  const segmentationState = useMemo(() => {
    const selectedLayerCount = getSelectedLayerCount();
    const historyState = getSegmentationHistoryState();
    const layers = getSegmentationLayers();
    const currentLayerIndex = getCurrentSegmentationLayerIndex();
    const currentLayer = layers.find(
      (layer) => layer.id === layers[currentLayerIndex]?.id
    );
    const disabled = layers.length === 0 ||
      selectedLayerCount === 0 ||
      currentLayer?.origin === "database";

    return {
      selectedLayerCount,
      canUndo: historyState.canUndo,
      canRedo: historyState.canRedo,
      layers,
      currentLayer,
      disabled,
    };
  }, [getSelectedLayerCount, getSegmentationHistoryState, getSegmentationLayers, getCurrentSegmentationLayerIndex]);

  const ToolButton = memo(({ 
    tool, 
    isActive, 
    onClick, 
    disabled, 
    className 
  }: { 
    tool: { id: string; icon: any; label: string; shortcut?: string; action?: string }; 
    isActive: boolean; 
    onClick: () => void; 
    disabled?: boolean;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={`h-10 px-3 transition-all duration-200 rounded-lg flex flex-wrap items-center justify-center text-center ${
            disabled
              ? "bg-slate-900 text-slate-600 opacity-50 cursor-not-allowed pointer-events-none"
              : isActive
              ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300"
          } ${className || ""}`}
          title={disabled ? "Add and select a segmentation layer to enable tools" : undefined}
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
        {tool.shortcut ? (
          <div className="text-center">
            <div>{tool.label}</div>
            <div className="text-xs text-slate-400">{tool.shortcut}</div>
          </div>
        ) : (
          tool.label
        )}
      </TooltipContent>
    </Tooltip>
  ));

  ToolButton.displayName = "ToolButton";

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
              {SERIES_LAYOUTS.map((layout) => (
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
            <div className="grid grid-cols-2 gap-2 mb-3">
              {ANNOTATION_MANAGEMENT_TOOLS.map((tool) => {
                // Dynamically set icon for toggle-annotations based on state
                const toolWithDynamicIcon = tool.id === "toggle-annotations"
                  ? { ...tool, icon: state.showAnnotations ? Eye : EyeOff }
                  : tool;
                
                return (
                  <ToolButton
                    key={tool.id}
                    tool={toolWithDynamicIcon}
                    isActive={false}
                    onClick={() => handleTransformAction(tool.action)}
                    className={getActionButtonClasses(tool.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Navigation & View Control Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navigation & View Control</h3>
            <p className="text-slate-400 text-xs mb-3">
              Navigate, transform, and adjust image display
            </p>
            <div className="grid grid-cols-2 gap-2">
              {NAVIGATION_TOOLS.map((tool) => {
                // Handle tools with action (reset, invert)
                if ('action' in tool) {
                  return (
                    <ToolButton
                      key={tool.id}
                      tool={tool}
                      isActive={false}
                      onClick={() => handleTransformAction(tool.action)}
                      className={getActionButtonClasses(tool.id)}
                    />
                  );
                }
                // Handle regular tools with shortcuts
                return (
                  <ToolButton
                    key={tool.id}
                    tool={tool}
                    isActive={selectedTool === getToolDisplayName(tool.id)}
                    onClick={() => handleToolSelect(tool.id)}
                  />
                );
              })}
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
              {MEASUREMENT_TOOLS.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={selectedTool === getToolDisplayName(tool.id)}
                  onClick={() => handleToolSelect(tool.id)}
                />
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
              {ANNOTATION_TOOLS.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={selectedTool === getToolDisplayName(tool.id)}
                  onClick={() => handleToolSelect(tool.id)}
                />
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
                  layers={segmentationState.layers}
                  currentLayerIndex={getCurrentSegmentationLayerIndex()}
                  onAddLayer={addSegmentationLayer}
                  onDeleteLayer={deleteSegmentationLayer}
                  onSelectLayer={(index) => {
                    if (index >= 0 && index < segmentationState.layers.length) {
                      selectSegmentationLayer(segmentationState.layers[index].id);
                    }
                  }}
                  onToggleLayerVisibility={(index) => {
                    if (index >= 0 && index < segmentationState.layers.length) {
                      toggleSegmentationLayerVisibility(segmentationState.layers[index].id);
                    }
                  }}
                  onUndo={undoSegmentation}
                  onRedo={redoSegmentation}
                  canUndo={segmentationState.canUndo}
                  canRedo={segmentationState.canRedo}
                  isSegmentationVisible={isSegmentationVisible()}
                  onToggleSegmentationView={toggleSegmentationView}
                  selectedLayerCount={segmentationState.selectedLayerCount}
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
                {SEGMENTATION_TOOLS.map((tool) => (
                  <ToolButton
                    key={tool.id}
                    tool={tool}
                    isActive={selectedTool === getToolDisplayName(tool.id)}
                    onClick={() => handleToolSelect(tool.id)}
                    disabled={segmentationState.disabled}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
