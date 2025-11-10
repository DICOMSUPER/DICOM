"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ViewerProvider, useViewer } from "@/contexts/ViewerContext";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { useLazyGetDicomSeriesByReferenceQuery } from "@/store/dicomSeriesApi";
import { extractApiData } from "@/utils/api";

export const dynamic = "force-dynamic";


// Layout components
import ViewerHeader from "@/components/viewer/layout/ViewerHeader";
import ViewerLeftSidebar from "@/components/viewer/layout/ViewerLeftSidebar";
import ViewerRightSidebar from "@/components/viewer/layout/ViewerRightSidebar";
import ViewportGrid from "@/components/viewer/viewport/ViewportGrid";
import ResizablePanel from "@/components/viewer/layout/ResizablePanel";

// Loading component
function ViewerLoading() {
  return (
    <div className="h-[100vh] bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-slate-400 text-lg mb-2">Loading Viewer...</div>
      </div>
    </div>
  );
}

// Inner component that uses ViewerContext and useSearchParams
function ViewerPageContent() {
  const searchParams = useSearchParams();
  const studyId = searchParams.get("study");
  const seriesId = searchParams.get("series");
  const { state, setActiveViewport, setViewportSeries } = useViewer();

  // UI State
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("WindowLevel");
  const [seriesLayout, setSeriesLayout] = useState<string>("1x1");
  const [autoOpen, setAutoOpen] = useState(false);

  // Data State
  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(null);
  const [series, setSeries] = useState<DicomSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchSeriesByReference] = useLazyGetDicomSeriesByReferenceQuery();

  // Ensure viewport 0 is active on page load
  useEffect(() => {
    setActiveViewport(0);
    console.log("Page loaded - set viewport 0 as active");
  }, [setActiveViewport]);

  // Handle layout change
  const handleLayoutChange = (layout: string) => {
    setSeriesLayout(layout);
    if (layout === "1x1") {
      setActiveViewport(0);
      console.log("Switched to 1x1 layout - set viewport 0 as active");
    }
  };

  // Handle series loaded from sidebar
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

  const handleSeriesSelect = (series: any) => {
    console.log("Selected series:", series, "for viewport:", state.activeViewport);
    setSelectedSeries(series);
    setViewportSeries(state.activeViewport, series);
  };

  const handleDeleteStudy = () => {
    console.log("Delete study clicked");
  };

  const handleRefresh = async () => {
    if (studyId) {
      setLoading(true);
      try {
        const seriesResponse = await fetchSeriesByReference({
          id: studyId,
          type: "study",
          params: { page: 1, limit: 50 },
        }).unwrap();
        const refreshedSeries = extractApiData<DicomSeries>(seriesResponse);
        setSeries(refreshedSeries);
        handleSeriesLoaded(refreshedSeries);

        // Dispatch refreshViewport event to force viewport rebuild
        window.dispatchEvent(
          new CustomEvent("refreshViewport", {
            detail: { studyId },
          })
        );
      } catch (error) {
        console.error("Error refreshing series:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-[100vh] bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex flex-col h-[5vh]">
        <ViewerHeader
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          autoOpen={autoOpen}
          onAutoOpenChange={setAutoOpen}
          onDeleteStudy={handleDeleteStudy}
          layout={seriesLayout}
          onLayoutChange={handleLayoutChange}
          isCollapsed={headerCollapsed}
          onToggleCollapse={() => setHeaderCollapsed(!headerCollapsed)}
          loading={loading}
          onRefresh={handleRefresh}
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

      {/* Main Content */}
      <div className="flex-1 flex h-[95vh]">
        {/* Left Sidebar */}
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
          />
        </ResizablePanel>

        {/* Center */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {loading && (
            <div className="flex-1 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-slate-400 text-lg mb-2">Đang tải series...</div>
                <div className="text-slate-500 text-sm">Loading series data</div>
              </div>
            </div>
          )}

          {!loading && series.length === 0 && (
            <div className="flex-1 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="text-slate-400 text-lg mb-2">Không có dữ liệu để hiển thị</div>
                <div className="text-slate-500 text-sm">
                  {studyId ? "No series found for this study" : "Please provide a study ID to load series"}
                </div>
              </div>
            </div>
          )}

          {!loading && series.length > 0 && (
            <ViewportGrid
              seriesLayout={seriesLayout}
              selectedSeries={selectedSeries}
              selectedStudy={null}
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
            />
          )}
        </div>

        {/* Right Sidebar */}
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
            onSeriesLoaded={handleSeriesLoaded}
          />
        </ResizablePanel>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <ViewerProvider>
      {/* Bọc toàn bộ trong Suspense để đảm bảo useSearchParams hoạt động */}
      <Suspense fallback={<ViewerLoading />}>
        <ViewerPageContent />
      </Suspense>
    </ViewerProvider>
  );
}
