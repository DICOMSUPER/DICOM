import dynamic from "next/dynamic";
import { DicomStudy, DicomSeries } from "@/services/imagingApi";
import { useViewer } from "@/contexts/ViewerContext";
import { useEffect, useState } from "react";

const ViewPortMain = dynamic(
  () => import("@/components/viewer/viewport/ViewPortMain"),
  { ssr: false }
);

interface ViewportGridProps {
  seriesLayout: string;
  selectedSeries: DicomSeries | null;
  selectedStudy: DicomStudy | null;
  selectedTool?: string;
  onToolChange?: (toolName: string) => void;
}

export default function ViewportGrid({
  seriesLayout,
  selectedSeries,
  selectedStudy,
  selectedTool,
  onToolChange,
}: ViewportGridProps) {
  const {
    state,
    getViewportSeries,
    setActiveViewport,
    getViewportId,
    setViewportId,
    setViewportSeries,
  } = useViewer();

  // Local state to track viewport IDs to avoid setState during render
  const [localViewportIds, setLocalViewportIds] = useState<
    Record<number, string>
  >({});

  const getGridClass = () => {
    switch (seriesLayout) {
      case "1x1":
        return "grid grid-cols-1";
      case "1x2":
        return "grid grid-cols-2";
      case "2x1":
        return "grid grid-rows-2";
      case "2x2":
        return "grid grid-cols-2 grid-rows-2";
      case "3x3":
        return "grid grid-cols-3 grid-rows-3";
      default:
        return "grid grid-cols-1";
    }
  };

  // Calculate number of viewports based on layout
  const getViewportCount = () => {
    switch (seriesLayout) {
      case "1x1":
        return 1;
      case "1x2":
        return 2;
      case "2x1":
        return 2;
      case "2x2":
        return 4;
      case "3x3":
        return 9;
      default:
        return 1;
    }
  };

  const viewportCount = getViewportCount();

  // Initialize viewport IDs in useEffect to avoid setState during render
  useEffect(() => {
    const newViewportIds: Record<number, string> = {};

    for (let i = 0; i < viewportCount; i++) {
      const existingViewportId = getViewportId(i);
      // Use Cornerstone.js standard ID format - it creates viewports with IDs "0", "1", "2", etc.
      const expectedViewportId = i.toString();

      if (!existingViewportId || existingViewportId !== expectedViewportId) {
        // Generate or update to correct format
        setViewportId(i, expectedViewportId);
        newViewportIds[i] = expectedViewportId;
        console.log(
          "🆔 ViewportGrid: Generated/updated viewport ID:",
          expectedViewportId,
          "for index:",
          i,
          "layout:",
          seriesLayout
        );
      } else {
        newViewportIds[i] = existingViewportId;
        console.log(
          "🆔 ViewportGrid: Using existing viewport ID:",
          existingViewportId,
          "for index:",
          i,
          "layout:",
          seriesLayout
        );
      }
    }

    // Update local state with all viewport IDs
    setLocalViewportIds(newViewportIds);
    console.log(
      "📊 ViewportGrid: Total viewport count:",
      viewportCount,
      "IDs created:",
      Object.keys(newViewportIds).length
    );
  }, [viewportCount, seriesLayout]); // Removed getViewportId and setViewportId from dependencies

  // Generate viewport data dynamically
  const generateViewports = () => {
    const viewports = [];

    for (let i = 0; i < viewportCount; i++) {
      // Get series for this viewport - prioritize assigned series over selectedSeries fallback
      let viewportSeries = getViewportSeries(i);

      // Remove auto-assignment - let user select manually
      // if (!viewportSeries && i === 0 && selectedSeries) {
      //   viewportSeries = selectedSeries;
      // }

      // Use local viewport ID to avoid setState during render
      const viewportId = localViewportIds[i] || i.toString();

      viewports.push({
        index: i,
        series: viewportSeries,
        viewportId: viewportId,
        isActive: state.activeViewport === i,
        hasSeries: !!viewportSeries,
      });
    }

    return viewports;
  };

  const viewports = generateViewports();

  // Remove auto-update of viewport 0 - let user select manually
  // useEffect(() => {
  //   if (viewportCount > 1 && selectedSeries) {
  //     const viewport0Series = getViewportSeries(0);
  //     // Only update if viewport 0 doesn't have a series assigned or if it's the same as selectedSeries
  //     if (!viewport0Series || viewport0Series.id !== selectedSeries.id) {
  //       setViewportSeries(0, selectedSeries);
  //       console.log('Updated viewport 0 with selectedSeries:', selectedSeries.seriesDescription);
  //     }
  //   }
  // }, [selectedSeries, viewportCount, getViewportSeries, setViewportSeries]);

  return (
    <div className={`flex-1 p-3 gap-3 ${getGridClass()} h-full`}>
      {viewports.map((viewport) => (
        <div
          key={`viewport-${viewport.index}-${seriesLayout}`}
          onClick={() => setActiveViewport(viewport.index)}
          className={`bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-200 relative h-full cursor-pointer ${
            viewport.isActive
              ? "border-blue-400 shadow-2xl shadow-blue-500/50 ring-2 ring-blue-400/30"
              : "border-slate-700 hover:border-slate-600"
          }`}
        >
          {/* Footer Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-[5] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-white">
              {/* Left: VP Badge + Body Part + Series Description */}
              <div className="flex items-center gap-2">
                <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-bold border border-blue-400">
                  VP {viewport.index + 1}
                </div>
                <span className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-2 py-1 rounded text-xs font-bold border border-teal-400/30">
                  {viewport.series?.bodyPartExamined || "N/A"}
                </span>
                <span className="text-teal-100 font-medium">
                  {viewport.series?.seriesDescription || "Drop series here"}
                </span>
              </div>

              {/* Right: Series Info */}
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-300">
                  Se: {viewport.series?.seriesNumber || "-"}
                </span>
                <span className="text-slate-300">
                  Im: {viewport.series?.numberOfInstances || 0}
                </span>
              </div>
            </div>
          </div>

          <ViewPortMain
            key={`viewport-main-${viewport.index}`} // Remove seriesLayout from key to prevent remounting
            selectedSeries={viewport.series}
            selectedStudy={selectedStudy}
            selectedTool={selectedTool}
            onToolChange={onToolChange}
            viewportId={viewport.viewportId}
          />
        </div>
      ))}
    </div>
  );
}
