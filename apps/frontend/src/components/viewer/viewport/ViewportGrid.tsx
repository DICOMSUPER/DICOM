import dynamic from "next/dynamic";
import { DicomStudy, DicomSeries } from "@/services/imagingApi";

const ViewPortMain = dynamic(
  () => import("@/components/viewer/viewport/ViewPortMain"),
  { ssr: false }
);

interface ViewportGridProps {
  seriesLayout: string;
  series: DicomSeries[];
  selectedSeries: DicomSeries | null;
  selectedStudy: DicomStudy | null;
  windowWidth: number;
  windowLevel: number;
  currentSlice: number;
  maxSlices: number;
  zoom: number;
}

export default function ViewportGrid({
  seriesLayout,
  series,
  selectedSeries,
  selectedStudy,
  windowWidth,
  windowLevel,
  currentSlice,
  maxSlices,
  zoom,
}: ViewportGridProps) {
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

  return (
    <div className={`flex-1 p-2 gap-2 ${getGridClass()} h-full`}>
      {/* Viewport 1 - Main Series */}
      <div key={`viewport-1-${seriesLayout}`} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative h-full">
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {selectedSeries?.bodyPartExamined || 'N/A'}
          </span>
          <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs">
            {selectedSeries?.seriesDescription || 'No Series'}
          </span>
        </div>
        <div className="absolute top-2 right-2 z-10 text-white text-xs space-y-1">
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
            WW: {windowWidth} | WL: {windowLevel}
          </div>
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
            Slice: {currentSlice}/{maxSlices}
          </div>
        </div>
        <div className="absolute bottom-2 left-2 z-10 text-white text-xs">
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
            Zoom: {zoom.toFixed(2)}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 z-10 text-white text-xs">
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
            5 cm
          </div>
        </div>
        <div className="absolute top-1/2 left-2 z-10 text-white text-xs space-y-1">
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">H</div>
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">A</div>
          <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">F</div>
        </div>
        <ViewPortMain 
          key={`viewport-main-1-${seriesLayout}`}
          selectedSeries={selectedSeries}
          selectedStudy={selectedStudy}
        />
      </div>

      {/* Viewport 2 - Secondary Series */}
      {seriesLayout !== "1x1" && (
        <div key={`viewport-2-${seriesLayout}`} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative h-full">
          <div className="absolute top-2 left-2 z-10 flex gap-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
              {series[1]?.bodyPartExamined || 'N/A'}
            </span>
            <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs">
              {series[1]?.seriesDescription || 'Series 2'}
            </span>
          </div>
          <div className="absolute top-2 right-2 z-10 text-white text-xs space-y-1">
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
              WW: {windowWidth} | WL: {windowLevel}
            </div>
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
              Im: {currentSlice}/{series[1]?.numberOfInstances || 0}
            </div>
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
              Se: {series[1]?.seriesNumber || 2}
            </div>
          </div>
          <div className="absolute bottom-2 left-2 z-10 text-white text-xs">
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
              Zoom: {zoom.toFixed(2)}
            </div>
          </div>
          <div className="absolute bottom-2 right-2 z-10 text-white text-xs">
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">
              5 cm
            </div>
          </div>
          <div className="absolute top-1/2 left-2 z-10 text-white text-xs space-y-1">
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">A</div>
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">P</div>
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">R</div>
            <div className="bg-slate-800 bg-opacity-75 px-2 py-1 rounded">L</div>
          </div>
          <ViewPortMain 
            key={`viewport-main-2-${seriesLayout}`}
            selectedSeries={series[1]}
            selectedStudy={selectedStudy}
          />
        </div>
      )}

      {/* Additional viewports for 2x2 layouts */}
      {seriesLayout === "2x2" && (
        <>
          <div key={`viewport-3-${seriesLayout}`} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative h-full">
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                {series[2]?.bodyPartExamined || 'N/A'}
              </span>
              <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs">
                {series[2]?.seriesDescription || 'Series 3'}
              </span>
            </div>
            <ViewPortMain 
              key={`viewport-main-3-${seriesLayout}`}
              selectedSeries={series[2]}
              selectedStudy={selectedStudy}
            />
          </div>
          <div key={`viewport-4-${seriesLayout}`} className="bg-black rounded-lg overflow-hidden border border-slate-800 relative h-full">
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                {series[3]?.bodyPartExamined || 'N/A'}
              </span>
              <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs">
                {series[3]?.seriesDescription || 'Series 4'}
              </span>
            </div>
            <ViewPortMain
              key={`viewport-main-4-${seriesLayout}`}
              selectedSeries={series[3]}
              selectedStudy={selectedStudy}
            />
          </div>
        </>
      )}
    </div>
  );
}

