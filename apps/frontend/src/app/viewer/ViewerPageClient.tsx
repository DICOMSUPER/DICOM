"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, ImageOff } from "lucide-react";
import { ViewerProvider, useViewer } from "@/contexts/ViewerContext";
import { ViewerEventProvider } from "@/contexts/ViewerEventContext";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useLazyGetDicomSeriesByReferenceQuery } from "@/store/dicomSeriesApi";
import { extractApiData } from "@/utils/api";
import ViewerHeader from "@/components/viewer/layout/ViewerHeader";
import ViewerLeftSidebar from "@/components/viewer/layout/ViewerLeftSidebar";
import ViewerRightSidebar from "@/components/viewer/layout/ViewerRightSidebar";
import ViewportGrid from "@/components/viewer/viewport/ViewportGrid";
import ResizablePanel from "@/components/viewer/layout/ResizablePanel";
import { DraftAnnotationsModal } from "@/components/viewer/modals/DraftAnnotationsModal";
import { SeriesAnnotationsModal } from "@/components/viewer/modals/SeriesAnnotationsModal";

function ViewerLoading() {
  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-slate-400 text-lg mb-2">Loading Viewer...</div>
      </div>
    </div>
  );
}

function ViewerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studyId = searchParams.get("study");
  const patientId = searchParams.get("patient");
  const seriesId = searchParams.get("series");

  const {
    state,
    setActiveViewport,
    setViewportSeries,
    toggleSegmentationControlPanel,
    isSegmentationControlPanelOpen,
  } = useViewer();

  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [seriesLayout, setSeriesLayout] = useState<string>("1x1");
  const [viewportReady, setViewportReady] = useState(false);
  const [hasSetInitialTool, setHasSetInitialTool] = useState(false);

  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(null);
  const [series, setSeries] = useState<DicomSeries[]>([]);
  const [fetchSeriesByReference] = useLazyGetDicomSeriesByReferenceQuery();
  const [activeAnnotationsModal, setActiveAnnotationsModal] = useState<"all" | "draft" | null>(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    setActiveViewport(0);
  }, [setActiveViewport]);

  // Listen for viewport ready state from ViewerContext
  useEffect(() => {
    const activeViewportState = state.viewportRuntimeStates.get(state.activeViewport);
    const isReady = activeViewportState?.viewportReady || false;
    
    setViewportReady(isReady);

    // Auto-select WindowLevel tool when viewport becomes ready with an image
    if (isReady && !hasSetInitialTool) {
      setSelectedTool("WindowLevel");
      setHasSetInitialTool(true);
      console.log("✅ Viewport ready - WindowLevel tool automatically selected");
    }
  }, [state.viewportRuntimeStates, state.activeViewport, hasSetInitialTool]);

  // Reset initial tool flag when series changes
  useEffect(() => {
    if (selectedSeries) {
      setHasSetInitialTool(false);
      setViewportReady(false);
    }
  }, [selectedSeries]);

  const handleLayoutChange = (layout: string) => {
    setSeriesLayout(layout);
    if (layout === "1x1") {
      setActiveViewport(0);
    }
  };

  const handleSeriesLoaded = useCallback(
    (loadedSeries: DicomSeries[]) => {
      setSeries(loadedSeries);
      setActiveViewport(0);

      if (seriesId) {
        const targetSeries = loadedSeries.find((s) => s.id === seriesId);
        if (targetSeries) {
          setSelectedSeries(targetSeries);
          setViewportSeries(0, targetSeries);
        }
      }
    },
    [seriesId, setActiveViewport, setViewportSeries]
  );

  const updateURLParams = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/viewer${query}`, { scroll: false });
  }, [searchParams, router]);

  const handleSeriesSelect = useCallback((series: DicomSeries) => {
    setSelectedSeries(series);
    setViewportSeries(state.activeViewport, series);
    
    updateURLParams({
      patient: patientId || '',
      study: studyId || '',
      series: series.id,
    });
  }, [patientId, studyId, updateURLParams, setViewportSeries, state.activeViewport]);

  const handleOrderStatusChange = useCallback((status: string | null) => {
    setCurrentOrderStatus(status);
  }, []);

  // Check if order is in a final state (completed or cancelled)
  const isOrderFinalized = useMemo(() => {
    return currentOrderStatus === 'completed' || currentOrderStatus === 'cancelled';
  }, [currentOrderStatus]);

  const handleViewAllAnnotations = useCallback(() => {
    setActiveAnnotationsModal("all");
  }, []);

  const handleViewDraftAnnotations = useCallback(() => {
    setActiveAnnotationsModal("draft");
  }, []);

  const handleAnnotationModalOpenChange = useCallback(
    (type: "all" | "draft", open: boolean) => {
      setActiveAnnotationsModal(open ? type : null);
    },
    []
  );


  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex flex-col shrink-0">
        <ViewerHeader
          isCollapsed={headerCollapsed}
          onToggleCollapse={() => setHeaderCollapsed(!headerCollapsed)}
        />
        {headerCollapsed && (
          <div className="bg-slate-900 border-b border-slate-800 flex items-center justify-center transition-all duration-300">
            <button
              onClick={() => setHeaderCollapsed(false)}
              className="w-full h-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Show Header"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Viewer */}
      <div className="flex-1 flex min-h-0">
        <ResizablePanel
          side="left"
          defaultWidth={320}
          minWidth={250}
          maxWidth={500}
          collapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        >
          <ViewerLeftSidebar
            seriesLayout={seriesLayout}
            onSeriesLayoutChange={handleLayoutChange}
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            onViewAllAnnotations={handleViewAllAnnotations}
            onViewDraftAnnotations={handleViewDraftAnnotations}
            activeAnnotationView={activeAnnotationsModal}
            viewportReady={viewportReady}
            isOrderFinalized={isOrderFinalized}
          />
        </ResizablePanel>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <ViewportGrid
            seriesLayout={seriesLayout}
            selectedSeries={selectedSeries}
            selectedStudy={null}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
          />
        </div>

        <ResizablePanel
          side="right"
          defaultWidth={320}
          minWidth={250}
          maxWidth={500}
          collapsed={rightPanelCollapsed}
          onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
        >
          <ViewerRightSidebar
            onSeriesSelect={handleSeriesSelect}
            series={series}
            studyId={studyId || undefined}
            patientId={patientId || undefined}
            selectedSeriesFromParent={selectedSeries}
            urlSeriesId={seriesId || undefined}
            onOrderStatusChange={handleOrderStatusChange}
          />
        </ResizablePanel>
      </div>

      {/* Annotation Modals */}
      <SeriesAnnotationsModal
        open={activeAnnotationsModal === "all"}
        onOpenChange={(open) => handleAnnotationModalOpenChange("all", open)}
        cachedSeriesList={series}
      />
      <DraftAnnotationsModal
        open={activeAnnotationsModal === "draft"}
        onOpenChange={(open) => handleAnnotationModalOpenChange("draft", open)}
        cachedSeriesList={series}
      />
    </div>
  );
}

export default function ViewerPageClient() {
  return (
    <ViewerEventProvider>
      <ViewerProvider>
        <Suspense fallback={<ViewerLoading />}>
          <ViewerPageContent />
        </Suspense>
      </ViewerProvider>
    </ViewerEventProvider>
  );
}
