"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ViewerProvider } from "@/contexts/ViewerContext";
import { imagingApi, DicomStudy, DicomSeries } from "@/services/imagingApi";

// Layout components
import ViewerHeader from "@/components/viewer/layout/ViewerHeader";
import ViewerLeftSidebar from "@/components/viewer/layout/ViewerLeftSidebar";
import ViewerRightSidebar from "@/components/viewer/layout/ViewerRightSidebar";
import ViewportControls from "@/components/viewer/layout/ViewportControls";
import ViewportGrid from "@/components/viewer/viewport/ViewportGrid";
import ResizablePanel from "@/components/viewer/layout/ResizablePanel";

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const studyId = searchParams.get('study');
  const seriesId = searchParams.get('series');
  
  // UI State
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("windowLevel");
  const [seriesLayout, setSeriesLayout] = useState<string>("1x2");
  const [imageLayout, setImageLayout] = useState<string>("1x2");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlice, setCurrentSlice] = useState(1);
  const [maxSlices, setMaxSlices] = useState(150);
  const [autoOpen, setAutoOpen] = useState(false);
  const [imageLocalizer, setImageLocalizer] = useState(true);
  const [scrollMode, setScrollMode] = useState<string>("position");
  
  // Data State
  const [selectedSeries, setSelectedSeries] = useState<DicomSeries | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [studies, setStudies] = useState<DicomStudy[]>([]);
  const [series, setSeries] = useState<DicomSeries[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Viewport State
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowLevel, setWindowLevel] = useState(40);
  const [zoom, setZoom] = useState(1.0);

  // Load studies and series data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (studyId) {
          // Load specific study and its series
          const [study, seriesResponse] = await Promise.all([
            imagingApi.getStudyById(studyId),
            imagingApi.getSeriesByReferenceId(studyId, 'study', { page: 1, limit: 50 })
          ]);
          setSelectedStudy(study);
          setSeries(seriesResponse.data);
          
          // If seriesId is provided, select that series
          if (seriesId) {
            const targetSeries = seriesResponse.data.find(s => s.id === seriesId);
            if (targetSeries) {
              setSelectedSeries(targetSeries);
            }
          } else if (seriesResponse.data.length > 0) {
            // Auto-select first series if no seriesId provided
            setSelectedSeries(seriesResponse.data[0]);
          }
        } else {
          // Load all studies and series
          const [studiesResponse, seriesResponse] = await Promise.all([
            imagingApi.getStudies({ page: 1, limit: 10 }),
            imagingApi.getSeries({ page: 1, limit: 20 })
          ]);
          setStudies(studiesResponse.data);
          setSeries(seriesResponse.data);
          
          // Auto-select first series
          if (seriesResponse.data.length > 0) {
            setSelectedSeries(seriesResponse.data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studyId, seriesId]);

  const handleSeriesSelect = (series: any) => {
    console.log('Selected series:', series);
    setSelectedSeries(series);
  };

  const handleDeleteStudy = () => {
    console.log('Delete study clicked');
    // TODO: Implement delete study
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (studyId) {
        // Reload specific study and its series
        const [study, seriesResponse] = await Promise.all([
          imagingApi.getStudyById(studyId),
          imagingApi.getSeriesByReferenceId(studyId, 'study', { page: 1, limit: 50 })
        ]);
        setSelectedStudy(study);
        setSeries(seriesResponse.data);
      } else {
        // Reload all studies and series
        const [studiesResponse, seriesResponse] = await Promise.all([
          imagingApi.getStudies({ page: 1, limit: 10 }),
          imagingApi.getSeries({ page: 1, limit: 20 })
        ]);
        setStudies(studiesResponse.data);
        setSeries(seriesResponse.data);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ViewerProvider>
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
            onLayoutChange={setSeriesLayout}
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
              onSeriesLayoutChange={setSeriesLayout}
              imageLayout={imageLayout}
              onImageLayoutChange={setImageLayout}
              selectedTool={selectedTool}
              onToolSelect={setSelectedTool}
              isPlaying={isPlaying}
              onPlayToggle={() => setIsPlaying(!isPlaying)}
              imageLocalizer={imageLocalizer}
              onImageLocalizerChange={setImageLocalizer}
              scrollMode={scrollMode}
              onScrollModeChange={setScrollMode}
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
                    {studyId ? 'Đang tải study...' : 'Đang tải dữ liệu...'}
                  </div>
                  <div className="text-slate-500 text-sm">
                    {studyId ? 'Loading study and series data' : 'Loading studies and series'}
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
                    {studyId ? 'No series found for this study' : 'No studies or series available'}
                  </div>
                </div>
              </div>
            )}

            {/* Viewport Grid */}
            {!loading && series.length > 0 && (
              <>
                <ViewportGrid
                  seriesLayout={seriesLayout}
                  series={series}
                  selectedSeries={selectedSeries}
                  selectedStudy={selectedStudy}
                  windowWidth={windowWidth}
                  windowLevel={windowLevel}
                  currentSlice={currentSlice}
                  maxSlices={maxSlices}
                  zoom={zoom}
                />

                {/* Bottom Controls */}
                <ViewportControls
                  isPlaying={isPlaying}
                  onPlayToggle={() => setIsPlaying(!isPlaying)}
                  currentSlice={currentSlice}
                  maxSlices={maxSlices}
                  onSliceChange={setCurrentSlice}
                  selectedStudy={selectedStudy}
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
              studies={studyId ? (selectedStudy ? [selectedStudy] : []) : studies}
              series={series}
              showSeriesOnly={!!studyId}
              selectedStudy={selectedStudy}
            />
          </ResizablePanel>
        </div>
      </div>
    </ViewerProvider>
  );
}
