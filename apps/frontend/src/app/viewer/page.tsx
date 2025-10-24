"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ViewerProvider, useViewer } from "@/contexts/ViewerContext";
import { imagingApi, DicomSeries } from "@/services/imagingApi";

// Layout components
import ViewerHeader from "@/components/viewer/layout/ViewerHeader";
import ViewerLeftSidebar from "@/components/viewer/layout/ViewerLeftSidebar";
import ViewerRightSidebar from "@/components/viewer/layout/ViewerRightSidebar";
import ViewportGrid from "@/components/viewer/viewport/ViewportGrid";
import ResizablePanel from "@/components/viewer/layout/ResizablePanel";

// Inner component that uses ViewerContext
function ViewerPageContent() {
  const searchParams = useSearchParams();
  const studyId = searchParams.get('study');
  const seriesId = searchParams.get('series');
  const { state, setActiveViewport, setViewportSeries } = useViewer();
  
  // UI State
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("WindowLevel");
  const [seriesLayout, setSeriesLayout] = useState<string>("1x1");
  
  // Handle layout change and set active viewport
  const handleLayoutChange = (layout: string) => {
    setSeriesLayout(layout);
    
    // When switching to 1x1 layout, set viewport 0 as active
    if (layout === "1x1") {
      setActiveViewport(0);
      console.log('Switched to 1x1 layout - set viewport 0 as active');
    }
  };
  const [autoOpen, setAutoOpen] = useState(false);
  
  // Data State
  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(null);
  const [series, setSeries] = useState<DicomSeries[]>([]);
  const [loading, setLoading] = useState(false);

  // Ensure viewport 0 is active on page load
  useEffect(() => {
    setActiveViewport(0);
    console.log('Page loaded - set viewport 0 as active');
  }, []);

  // Handle series loaded from sidebar
  const handleSeriesLoaded = useCallback((loadedSeries: DicomSeries[]) => {
    setSeries(loadedSeries);
    
    // Ensure viewport 0 is active when loading series
    setActiveViewport(0);
    
    if (seriesId) {
      const targetSeries = loadedSeries.find(s => s.id === seriesId);
      if (targetSeries) {
        setSelectedSeries(targetSeries);
        // Also set it to the active viewport (viewport 0)
        setViewportSeries(0, targetSeries);
      }
    } else if (loadedSeries.length > 0) {
      // DON'T auto-select any series - let user select manually
      // setSelectedSeries(loadedSeries[0]);
    }
  }, [seriesId, setActiveViewport, setViewportSeries]);

  const handleSeriesSelect = (series: any) => {
    console.log('Selected series:', series, 'for viewport:', state.activeViewport);
    setSelectedSeries(series);
    
    // Set the series to the currently active viewport
    setViewportSeries(state.activeViewport, series);
    
      // Remove auto-assignment to viewport 0 - let user select manually
      // const viewport0Series = state.viewportSeries.get(0);
      // if (!viewport0Series && state.activeViewport !== 0) {
      //   setViewportSeries(0, series);
      //   console.log('Set series to viewport 0 for multi-viewport compatibility');
      // }
  };

  const handleDeleteStudy = () => {
    console.log('Delete study clicked');
    // TODO: Implement delete study
  };

  const handleRefresh = async () => {
    if (studyId) {
      setLoading(true);
      try {
        // Reload series for the specific study
        const seriesResponse = await imagingApi.getSeriesByReferenceId(studyId, 'study', { page: 1, limit: 50 });
        setSeries(seriesResponse.data?.data || []);
        
        // Dispatch refreshViewport event to force viewport rebuild
        window.dispatchEvent(new CustomEvent('refreshViewport', {
          detail: { studyId }
        }));
      } catch (error) {
        console.error('Error refreshing series:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-[100vh] bg-slate-950 flex flex-col">
          {/* Advanced Header with Toggle */}
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
          
          {/* Collapsed Header Toggle Bar */}
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
          {/* Left Sidebar - Resizable */}
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

          {/* Center - Viewport Area */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex-1 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-slate-400 text-lg mb-2">
                    Đang tải series...
                  </div>
                  <div className="text-slate-500 text-sm">
                    Loading series data
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {!loading && series.length === 0 && (
              <div className="flex-1 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="text-slate-400 text-lg mb-2">Không có dữ liệu để hiển thị</div>
                  <div className="text-slate-500 text-sm">
                    {studyId ? 'No series found for this study' : 'Please provide a study ID to load series'}
                  </div>
                </div>
              </div>
            )}

            {/* Viewport Grid */}
            {!loading && series.length > 0 && (
              <>
                <ViewportGrid
                  seriesLayout={seriesLayout}
                  selectedSeries={selectedSeries}
                  selectedStudy={null}
                  selectedTool={selectedTool}
                  onToolChange={setSelectedTool}
                />
              </>
            )}
          </div>

          {/* Right Panel - Studies Browser (Resizable) */}
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
    <DndProvider backend={HTML5Backend}>
      <ViewerProvider>
        <ViewerPageContent />
      </ViewerProvider>
    </DndProvider>
  );
}
