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
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewer } from "@/common/contexts/ViewerContext";
import AIDiagnosisButton from "@/components/viewer/toolbar/AIDiagnosisButton";
import { AIAnalysisModal } from "@/components/viewer/ai/AIAnalysisModal";
import { useSubmitFeedbackMutation } from "@/store/aiAnalysisApi";
import { useViewerEvents } from "../../../common/contexts/ViewerEventContext";
import SegmentationControlPanelModal from "../modals/segmentation-control-panel-modal";
import {
  compressSnapshots,
  type SegmentationSnapshot,
} from "@/common/contexts/viewer-context/segmentation-helper";
import {
  useCreateImageSegmentationLayerMutation,
  useDeleteImageSegmentationLayerMutation,
} from "@/store/imageSegmentationLayerApi";
import { toast } from "sonner";
import { useMemo, useCallback, memo, useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface ViewerLeftSidebarProps {
  seriesLayout: string;
  onSeriesLayoutChange: (layout: string) => void;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onViewAllAnnotations?: () => void;
  onViewDraftAnnotations?: () => void;
  activeAnnotationView?: "all" | "draft" | null;
  viewportReady?: boolean; // Add viewport ready flag to disable tools until image is loaded
  isStudyLocked?: boolean; // Disable annotation/segmentation tools if study is finalized
  onReloadSeries?: () => void; // reload current series into viewport
}

const SERIES_LAYOUTS = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
] as const;

type ToolConfig = {
  id: string;
  icon: any;
  label: string;
  shortcut?: string;
  action?: string;
};

const NAVIGATION_TOOLS: readonly ToolConfig[] = [
  { id: "WindowLevel", icon: ScanLine, label: "Window/Level", shortcut: "W" },
  { id: "Pan", icon: Move, label: "Pan", shortcut: "P" },
  { id: "Zoom", icon: Search, label: "Zoom", shortcut: "Z" },
  { id: "Magnify", icon: Maximize2, label: "Magnify", shortcut: "M" },
  { id: "PlanarRotate", icon: RotateCw, label: "Planar Rotate", shortcut: "O" },
  { id: "TrackballRotate", icon: RotateCw, label: "Trackball Rotate", shortcut: "R" },
  { id: "reset", icon: RefreshCw, label: "Reset View", action: "reset" },
  { id: "invert", icon: MousePointer, label: "Invert Colors", action: "invert" },
] as const;

const MEASUREMENT_TOOLS: readonly ToolConfig[] = [
  { id: "Length", icon: Ruler, label: "Length", shortcut: "L" },
  { id: "Height", icon: Ruler, label: "Height", shortcut: "H" },
  { id: "CircleROI", icon: Circle, label: "Circle ROI", shortcut: "C" },
  { id: "RectangleROI", icon: Square, label: "Rectangle ROI", shortcut: "R" },
  { id: "Bidirectional", icon: ArrowRight, label: "Bidirectional", shortcut: "B" },
  { id: "Angle", icon: RotateCcwIcon, label: "Angle", shortcut: "A" },
  { id: "ArrowAnnotate", icon: ArrowRight, label: "Arrow", shortcut: "Shift+A" },
  { id: "CobbAngle", icon: RotateCcwIcon, label: "Cobb Angle", shortcut: "Shift+C" },
  { id: "SplineROI", icon: Circle, label: "Spline ROI", shortcut: "S" },
  { id: "Probe", icon: Target, label: "Probe", shortcut: "I" },
] as const;

const ANNOTATION_MANAGEMENT_TOOLS: readonly ToolConfig[] = [
  { id: "toggle-annotations", icon: Eye, label: "Toggle Annotations", action: "toggleAnnotations" },
  { id: "view-all-annotations", icon: FileText, label: "View All Annotations", action: "viewAllAnnotations" },
  { id: "view-draft-annotations", icon: FileClock, label: "View Draft Annotations", action: "viewDraftAnnotations" },
  { id: "clear", icon: Trash2, label: "Clear All Annotations", action: "clear" },
  { id: "clear-viewport", icon: Trash2, label: "Clear Active Viewport", action: "clearViewport" },
  { id: "undo-annotation", icon: Undo, label: "Undo Annotation", action: "undoAnnotation" },
] as const;


const ANNOTATION_TOOLS: readonly ToolConfig[] = [];

const SEGMENTATION_TOOLS: readonly ToolConfig[] = [
  { id: "Brush", icon: Paintbrush, label: "Brush", shortcut: "S" },
  { id: "CircleScissors", icon: CircleDot, label: "Circle Scissors", shortcut: "G" },
  { id: "RectangleScissors", icon: Square, label: "Rectangle Scissors", shortcut: "X" },
  // { id: "Eraser", icon: Eraser, label: "Eraser", shortcut: "Shift+Z" }, // temporarily hidden
] as const;

const deriveFrameForLayer = (snapshots: SegmentationSnapshot[]): number => {
  const latestSnapshot = snapshots?.[snapshots.length - 1];
  const firstImage = latestSnapshot?.imageData?.[0];
  const frameNumber = firstImage?.frameNumber;
  return typeof frameNumber === "number" && Number.isFinite(frameNumber)
    ? frameNumber
    : 1;
};

export default function ViewerLeftSidebar({
  seriesLayout,
  onSeriesLayoutChange,
  selectedTool,
  onToolSelect,
  onViewAllAnnotations,
  onViewDraftAnnotations,
  activeAnnotationView,
  viewportReady = false,
  isStudyLocked = false,
  onReloadSeries,
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
  setSegmentationBrushSize,
  } = useViewer();

  const [createImageSegmentationLayers] =
    useCreateImageSegmentationLayerMutation();
  const [deleteImageSegmentationLayer] =
    useDeleteImageSegmentationLayerMutation();
  const [submitFeedback] = useSubmitFeedbackMutation();
  
  const { subscribe } = useViewerEvents();
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [aiAnalyzeMessage, setAiAnalyzeMessage] = useState<string>("");
  
  // Listen for AI diagnosis success
  useEffect(() => {
    const unsubscribe = subscribe("ai:diagnosis:success", (data: any) => {
      console.log('📡 Received AI diagnosis data:', data);
      if (data?.analysisId) {
        setCurrentAnalysisId(data.analysisId);
        setAiPredictions(data.predictions || []);
        setAiAnalyzeMessage(data.aiAnalyzeMessage || "");
        // Don't auto-open modal, let user click "View Analysis" button
      }
    });
    return unsubscribe;
  }, [subscribe]);


  const saveSegmentationLayerToDatabase = useCallback(async (layerId: string) => {
    try {
      const layers = getSegmentationLayers();
      const layer = layers.find((l) => l.id === layerId);

      if (!layer) {
        return;
      }

      const frame = deriveFrameForLayer(layer.snapshots as SegmentationSnapshot[]);
      const compressedSnapshots = compressSnapshots(layer.snapshots);

      await createImageSegmentationLayers({
        layerName: layer.name,
        instanceId: layer.instanceId as string,
        notes: layer.notes,
        frame,
        snapshots: compressedSnapshots,
      }).unwrap();

      toast.success("Segmentation layer saved to database");
      await refetchSegmentationLayers([layerId]);
    } catch (error) {
      console.error("Error saving segmentation layer:", error);
      toast.error("Error saving segmentation layer to database");
    }
  }, [getSegmentationLayers, createImageSegmentationLayers, refetchSegmentationLayers]);

  const deleteSegmentationLayerFromDatabase = useCallback(async (layerId: string) => {
    try {
      await deleteImageSegmentationLayer(layerId);
      deleteSegmentationLayer(layerId);
      await refetchSegmentationLayers();

      toast.success("Segmentation layer deleted from database");
    } catch (error) {
      console.error("Error deleting segmentation layer:", error);
      toast.error("Error deleting segmentation layer from database");
    }
  }, [deleteImageSegmentationLayer, deleteSegmentationLayer, refetchSegmentationLayers]);
  
  const handleSubmitFeedback = useCallback(async (isHelpful: boolean, comment?: string) => {
    if (!currentAnalysisId) return;
    
    await submitFeedback({
      id: currentAnalysisId,
      feedback: {
        isHelpful,
        feedbackComment: comment,
      },
    }).unwrap();
    
    // Close modal after successful feedback submission
    setShowAnalysisModal(false);
  }, [currentAnalysisId, submitFeedback]);

  // Tool display name mapping - constant, no need for useMemo
  const TOOL_DISPLAY_NAME_MAP = new Map<string, string>([
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
    ["PlanarFreehandROITool", "PlanarFreehandROITool"],
  ]);

  const getToolDisplayName = (toolId: string) => {
    return TOOL_DISPLAY_NAME_MAP.get(toolId) || toolId;
  };

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

  // Action button class mapping - more efficient than multiple if statements
  const getActionButtonClasses = useCallback((toolId: string) => {
    const classMap: Record<string, string> = {
      "clear": "bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-300",
      "clear-viewport": "bg-slate-800 text-slate-400 hover:bg-orange-900/30 hover:text-orange-300",
      "toggle-annotations": state.showAnnotations
        ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300",
      "view-all-annotations": activeAnnotationView === "all"
        ? "bg-linear-to-br from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30"
        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300",
      "view-draft-annotations": activeAnnotationView === "draft"
        ? "bg-linear-to-br from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30"
        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300",
    };
    return classMap[toolId] || "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-teal-300";
  }, [activeAnnotationView, state.showAnnotations]);

  const segmentationState = useMemo(() => {
    const selectedLayerCount = getSelectedLayerCount();
    const historyState = getSegmentationHistoryState();
    const layers = getSegmentationLayers() as any[];
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

  const [brushSize, setBrushSize] = useState(3);
  const isSegmentationTool = useMemo(
    () => SEGMENTATION_TOOLS.some((t) => t.id === selectedTool),
    [selectedTool]
  );

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
                
                // Disable annotation management if viewport not ready OR order is finalized
                const isDisabled =
                  tool.id === "view-all-annotations"
                    ? false
                    : !viewportReady || isStudyLocked;
                
                return (
                  <ToolButton
                    key={tool.id}
                    tool={toolWithDynamicIcon}
                    isActive={false}
                    onClick={() => {
                      if (tool.action) {
                        handleTransformAction(tool.action);
                      }
                    }}
                    disabled={isDisabled}
                    className={getActionButtonClasses(tool.id)}
                  />
                );
              })}
            </div>
            {isStudyLocked && (
              <div className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded px-2 py-1.5 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>Study is finalized. Annotations are read-only.</span>
              </div>
            )}
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
                      onClick={() => {
                        if (tool.action) {
                          handleTransformAction(tool.action);
                        }
                      }}
                      disabled={!viewportReady}
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
                    onClick={() => onToolSelect(tool.id)}
                    disabled={!viewportReady}
                  />
                );
              })}
              <ToolButton
                key="reload-series"
                tool={{ id: "reload-series", icon: RefreshCw, label: "Reload Series", shortcut: "" } as any}
                isActive={false}
                onClick={() => onReloadSeries?.()}
                disabled={!viewportReady}
              />
            </div>
          </div>

          {/* AI Diagnosis Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">AI Diagnosis</h3>
            <p className="text-slate-400 text-xs mb-3">
              Analyze current viewport with AI model
            </p>
            <AIDiagnosisButton 
              onClearAI={() => {
                setCurrentAnalysisId(null);
                setAiPredictions([]);
                setAiAnalyzeMessage("");
              }}
            />
            
            {/* View Analysis Results Button */}
            <Button
              onClick={() => setShowAnalysisModal(true)}
              disabled={!currentAnalysisId}
              className={`w-full mt-3 ${
                currentAnalysisId
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              View Analysis
            </Button>
          </div>

          {/* Annotation Tools Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Annotation Tools</h3>
            <p className="text-slate-400 text-xs mb-3">
              Add notes, measure, and analyze regions of interest (ROI)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MEASUREMENT_TOOLS.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  isActive={selectedTool === getToolDisplayName(tool.id)}
                  onClick={() => onToolSelect(tool.id)}
                  disabled={!viewportReady}
                />
              ))}
            </div>
          </div>

          {/* (Legacy) Annotation Tools Section */}
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
                  onClick={() => onToolSelect(tool.id)}
                  disabled={!viewportReady || isStudyLocked}
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
              <Button 
                onClick={() => toggleSegmentationControlPanel()}
                disabled={!viewportReady || isStudyLocked}
              >
                Segmentation Control Panel
              </Button>
              {isSegmentationTool && (
                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Brush/Eraser Size</span>
                    <span className="font-semibold text-white">{brushSize} mm</span>
                  </div>
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[brushSize]}
                    onValueChange={(vals) => {
                      const next = vals?.[0] ?? brushSize;
                      setBrushSize(next);
                      setSegmentationBrushSize(next, true);
                    }}
                    className="py-2"
                  />
                </div>
              )}
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
                    onClick={() => onToolSelect(tool.id)}
                    disabled={!viewportReady || segmentationState.disabled || isStudyLocked}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Analysis Results Modal */}
    
        <AIAnalysisModal
          open={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          predictions={aiPredictions}
          aiAnalyzeMessage={aiAnalyzeMessage}
          analysisId={currentAnalysisId as string}
          onSubmitFeedback={handleSubmitFeedback}
        />

    </TooltipProvider>
  );
}
