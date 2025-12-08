"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ViewerProvider, useViewer } from "@/contexts/ViewerContext";
import { ViewerEventProvider } from "@/contexts/ViewerEventContext";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import ViewerHeader from "@/components/viewer/layout/ViewerHeader";
import ViewerLeftSidebar from "@/components/viewer/layout/ViewerLeftSidebar";
import ViewerRightSidebar from "@/components/viewer/layout/ViewerRightSidebar";
import ViewportGrid from "@/components/viewer/viewport/ViewportGrid";
import ResizablePanel from "@/components/viewer/layout/ResizablePanel";
import { DraftAnnotationsModal } from "@/components/viewer/modals/DraftAnnotationsModal";
import { SeriesAnnotationsModal } from "@/components/viewer/modals/SeriesAnnotationsModal";
import { useGetOneDicomStudyQuery } from "@/store/dicomStudyApi";
import { DicomStudyStatus } from "@/enums/image-dicom.enum";
import { toast } from "sonner";

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

  const {
    state,
    setActiveViewport,
    setViewportSeries,
  } = useViewer();

  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [seriesLayout, setSeriesLayout] = useState<string>("1x1");
  const [viewportReady, setViewportReady] = useState(false);

  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(null);
  const [series] = useState<DicomSeries[]>([]);
  const [activeAnnotationsModal, setActiveAnnotationsModal] = useState<"all" | "draft" | null>(null);

  useEffect(() => {
    setActiveViewport(0);
  }, [setActiveViewport]);

  // Listen for viewport ready state from ViewerContext
  useEffect(() => {
    const activeViewportState = state.viewportRuntimeStates.get(state.activeViewport);
    const isReady = activeViewportState?.viewportReady || false;
    
    setViewportReady(isReady);
  }, [state.viewportRuntimeStates, state.activeViewport]);

  // Reset initial tool flag when series changes
  useEffect(() => {
    if (selectedSeries) {
      setViewportReady(false);
    }
  }, [selectedSeries]);

  const handleLayoutChange = (layout: string) => {
    setSeriesLayout(layout);
    if (layout === "1x1") {
      setActiveViewport(0);
    }
  };

  const updateURLParams = useCallback(
    (params: Record<string, string>) => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const current = url.searchParams;

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });

      url.search = current.toString();
      router.replace(url.toString(), { scroll: false });
    },
    [router]
  );

  const handleSeriesSelect = useCallback((series: DicomSeries) => {
    setSelectedSeries(series);
    setViewportSeries(state.activeViewport, series);
    // Auto-select Pan after loading a series
    setSelectedTool("Pan");
    console.log("Series selected:", series);
    updateURLParams({
      patient: patientId || "",
      study: studyId || series.studyId || "",
    });
  }, [patientId, studyId, updateURLParams, setViewportSeries, state.activeViewport]);

  // Study status lock: disable annotation/segmentation when study finalized
  const { data: studyDetail } = useGetOneDicomStudyQuery(studyId || "", {
    skip: !studyId,
  });
  const studyStatus = (studyDetail?.data as any)?.status as DicomStudyStatus | undefined;
  const isStudyLocked = useMemo(() => {
    if (!studyStatus) return false;
    return (
      studyStatus === DicomStudyStatus.APPROVED ||
      studyStatus === DicomStudyStatus.RESULT_PRINTED ||
      studyStatus === DicomStudyStatus.REJECTED
    );
  }, [studyStatus]);

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
            isStudyLocked={isStudyLocked}
            onReloadSeries={() => {
              if (selectedSeries) {
                setViewportSeries(state.activeViewport, selectedSeries);
                toast.success("Reloaded series into viewport");
              } else {
                toast.info("No series selected");
              }
            }}
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
