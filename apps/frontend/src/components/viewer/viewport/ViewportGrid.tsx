import dynamic from "next/dynamic";
import { useState } from "react";
import { DicomStudy, DicomSeries } from "@/services/imagingApi";
import { useViewer } from "@/contexts/ViewerContext";
import { Download } from "lucide-react";

const ViewPortMain = dynamic(
  () => import("@/components/viewer/viewport/ViewPortMain"),
  { ssr: false }
);

interface ViewportGridProps {
  seriesLayout: string;
  series: DicomSeries[];
  selectedSeries: DicomSeries | null;
  selectedStudy: DicomStudy | null;
  selectedTool?: string;
  onToolChange?: (toolName: string) => void;
}

export default function ViewportGrid({
  seriesLayout,
  series,
  selectedSeries,
  selectedStudy,
  selectedTool,
  onToolChange,
}: ViewportGridProps) {
  const { state, setViewportSeries, setDropTargetViewport, getViewportSeries } = useViewer();
  const [hoveredViewport, setHoveredViewport] = useState<number | null>(null);

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

  // Drop handlers for viewports
  const handleDragOver = (e: React.DragEvent, viewportIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetViewport(viewportIndex);
    setHoveredViewport(viewportIndex);
  };

  const handleDragLeave = (e: React.DragEvent, viewportIndex: number) => {
    e.preventDefault();
    setHoveredViewport(null);
  };

  const handleDrop = (e: React.DragEvent, viewportIndex: number) => {
    e.preventDefault();
    setDropTargetViewport(null);
    setHoveredViewport(null);

    try {
      const seriesData = e.dataTransfer.getData('application/json');
      if (seriesData) {
        const droppedSeries: DicomSeries = JSON.parse(seriesData);
        setViewportSeries(viewportIndex, droppedSeries);
        console.log(`Series ${droppedSeries.seriesNumber} dropped to viewport ${viewportIndex}`);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  // Get series for each viewport (either from drag & drop or default)
  const viewport1Series = getViewportSeries(0) || selectedSeries;
  const viewport2Series = getViewportSeries(1) || series[1];
  const viewport3Series = getViewportSeries(2) || series[2];
  const viewport4Series = getViewportSeries(3) || series[3];

  return (
    <div className={`flex-1 p-3 gap-3 ${getGridClass()} h-full`}>
      {/* Viewport 1 - Main Series with Drop Zone */}
      <div 
        key={`viewport-1-${seriesLayout}`}
        onDragOver={(e) => handleDragOver(e, 0)}
        onDragLeave={(e) => handleDragLeave(e, 0)}
        onDrop={(e) => handleDrop(e, 0)}
        className={`bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-200 relative h-full ${
          hoveredViewport === 0 
            ? 'border-teal-400 shadow-2xl shadow-teal-500/50 scale-[1.02]' 
            : state.dropTargetViewport === 0
            ? 'border-teal-500/50'
            : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        {/* Drop Zone Overlay */}
        {hoveredViewport === 0 && (
          <div className="absolute inset-0 z-10 bg-teal-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-teal-400 rounded-xl animate-pulse">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <Download className="h-8 w-8" />
              <div>
                <div className="font-bold text-lg">Thả series tại đây</div>
                <div className="text-sm text-teal-100">Viewport 1</div>
              </div>
            </div>
          </div>
        )}
        
        
        {/* Footer Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-[5] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-3 py-2">
          <div className="flex items-center justify-between text-xs text-white">
            {/* Left: VP Badge + Body Part + Series Description */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-bold border border-blue-400">
                VP 1
              </div>
              <span className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-2 py-1 rounded text-xs font-bold border border-teal-400/30">
                {viewport1Series?.bodyPartExamined || 'N/A'}
              </span>
              <span className="text-teal-100 font-medium">
                {viewport1Series?.seriesDescription || 'Drop series here'}
              </span>
            </div>
            
            {/* Right: Series Info */}
            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-300">Se: {viewport1Series?.seriesNumber || '-'}</span>
              <span className="text-slate-300">Im: {viewport1Series?.numberOfInstances || 0}</span>
            </div>
          </div>
        </div>
        
        <ViewPortMain 
          key={`viewport-main-1-${seriesLayout}`}
          selectedSeries={viewport1Series}
          selectedStudy={selectedStudy}
          selectedTool={selectedTool}
          onToolChange={onToolChange}
        />
      </div>

      {/* Viewport 2 - Secondary Series with Drop Zone */}
      {seriesLayout !== "1x1" && (
        <div 
          key={`viewport-2-${seriesLayout}`}
          onDragOver={(e) => handleDragOver(e, 1)}
          onDragLeave={(e) => handleDragLeave(e, 1)}
          onDrop={(e) => handleDrop(e, 1)}
          className={`bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-200 relative h-full ${
            hoveredViewport === 1 
              ? 'border-teal-400 shadow-2xl shadow-teal-500/50 scale-[1.02]' 
              : state.dropTargetViewport === 1
              ? 'border-teal-500/50'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          {/* Drop Zone Overlay */}
          {hoveredViewport === 1 && (
            <div className="absolute inset-0 z-10 bg-teal-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-teal-400 rounded-xl animate-pulse">
              <div className="bg-teal-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
                <Download className="h-8 w-8" />
                <div>
                  <div className="font-bold text-lg">Thả series tại đây</div>
                  <div className="text-sm text-teal-100">Viewport 2</div>
                </div>
              </div>
            </div>
          )}
          
          
          {/* Footer Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-[5] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-white">
              {/* Left: VP Badge + Body Part + Series Description */}
              <div className="flex items-center gap-2">
                <div className="bg-green-600/90 text-white px-2 py-1 rounded text-xs font-bold border border-green-400">
                  VP 2
                </div>
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-2 py-1 rounded text-xs font-bold border border-green-400/30">
                  {viewport2Series?.bodyPartExamined || 'N/A'}
                </span>
                <span className="text-green-100 font-medium">
                  {viewport2Series?.seriesDescription || 'Drop series here'}
                </span>
              </div>
              
              {/* Right: Series Info */}
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-300">Se: {viewport2Series?.seriesNumber || '-'}</span>
                <span className="text-slate-300">Im: {viewport2Series?.numberOfInstances || 0}</span>
              </div>
            </div>
          </div>
          
          <ViewPortMain 
            key={`viewport-main-2-${seriesLayout}`}
            selectedSeries={viewport2Series}
            selectedStudy={selectedStudy}
            selectedTool={selectedTool}
            onToolChange={onToolChange}
          />
        </div>
      )}

      {/* Additional viewports for 2x2 layouts with Drop Zones */}
      {seriesLayout === "2x2" && (
        <>
          {/* Viewport 3 */}
          <div 
            key={`viewport-3-${seriesLayout}`}
            onDragOver={(e) => handleDragOver(e, 2)}
            onDragLeave={(e) => handleDragLeave(e, 2)}
            onDrop={(e) => handleDrop(e, 2)}
            className={`bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-200 relative h-full ${
              hoveredViewport === 2 
                ? 'border-teal-400 shadow-2xl shadow-teal-500/50 scale-[1.02]' 
                : state.dropTargetViewport === 2
                ? 'border-teal-500/50'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Drop Zone Overlay */}
            {hoveredViewport === 2 && (
              <div className="absolute inset-0 z-10 bg-teal-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-teal-400 rounded-xl animate-pulse">
                <div className="bg-teal-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
                  <Download className="h-8 w-8" />
                  <div>
                    <div className="font-bold text-lg">Thả series tại đây</div>
                    <div className="text-sm text-teal-100">Viewport 3</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Footer Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-[5] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-white">
                {/* Left: VP Badge + Body Part + Series Description */}
                <div className="flex items-center gap-2">
                  <div className="bg-purple-600/90 text-white px-2 py-1 rounded text-xs font-bold border border-purple-400">
                    VP 3
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-2 py-1 rounded text-xs font-bold border border-purple-400/30">
                    {viewport3Series?.bodyPartExamined || 'N/A'}
                  </span>
                  <span className="text-purple-100 font-medium">
                  {viewport3Series?.seriesDescription || 'Drop series here'}
                </span>
              </div>
              
              {/* Right: Series Info */}
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-300">Se: {viewport3Series?.seriesNumber || '-'}</span>
                <span className="text-slate-300">Im: {viewport3Series?.numberOfInstances || 0}</span>
              </div>
            </div>
          </div>
          
          <ViewPortMain 
            key={`viewport-main-3-${seriesLayout}`}
              selectedSeries={viewport3Series}
              selectedStudy={selectedStudy}
              selectedTool={selectedTool}
              onToolChange={onToolChange}
            />
          </div>
          
          {/* Viewport 4 */}
          <div 
            key={`viewport-4-${seriesLayout}`}
            onDragOver={(e) => handleDragOver(e, 3)}
            onDragLeave={(e) => handleDragLeave(e, 3)}
            onDrop={(e) => handleDrop(e, 3)}
            className={`bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-200 relative h-full ${
              hoveredViewport === 3 
                ? 'border-teal-400 shadow-2xl shadow-teal-500/50 scale-[1.02]' 
                : state.dropTargetViewport === 3
                ? 'border-teal-500/50'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Drop Zone Overlay */}
            {hoveredViewport === 3 && (
              <div className="absolute inset-0 z-10 bg-teal-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-teal-400 rounded-xl animate-pulse">
                <div className="bg-teal-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
                  <Download className="h-8 w-8" />
                  <div>
                    <div className="font-bold text-lg">Thả series tại đây</div>
                    <div className="text-sm text-teal-100">Viewport 4</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Footer Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-[5] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-white">
                {/* Left: VP Badge + Body Part + Series Description */}
                <div className="flex items-center gap-2">
                  <div className="bg-orange-600/90 text-white px-2 py-1 rounded text-xs font-bold border border-orange-400">
                    VP 4
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold border border-orange-400/30">
                    {viewport4Series?.bodyPartExamined || 'N/A'}
                  </span>
                  <span className="text-orange-100 font-medium">
                  {viewport4Series?.seriesDescription || 'Drop series here'}
                </span>
              </div>
              
              {/* Right: Series Info */}
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-300">Se: {viewport4Series?.seriesNumber || '-'}</span>
                <span className="text-slate-300">Im: {viewport4Series?.numberOfInstances || 0}</span>
              </div>
            </div>
          </div>
          
          <ViewPortMain
            key={`viewport-main-4-${seriesLayout}`}
              selectedSeries={viewport4Series}
              selectedStudy={selectedStudy}
              selectedTool={selectedTool}
              onToolChange={onToolChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

