import {
  Layout,
  Grid,
  Maximize2,
} from "lucide-react";

interface ViewerLeftSidebarProps {
  seriesLayout: string;
  onSeriesLayoutChange: (layout: string) => void;
}

const seriesLayouts = [
  { id: "1x1", icon: Maximize2, label: "1x1" },
  { id: "1x2", icon: Grid, label: "1x2" },
  { id: "2x1", icon: Grid, label: "2x1" },
  { id: "2x2", icon: Layout, label: "2x2" },
  { id: "3x3", icon: Layout, label: "3x3" },
];

export default function ViewerLeftSidebar({
  seriesLayout,
  onSeriesLayoutChange,
}: ViewerLeftSidebarProps) {
  return (
    <div className="h-full border-r border-slate-800 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Viewport Layout Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Viewport Layout</h3>
          <p className="text-slate-400 text-xs mb-3">
            Chọn số lượng viewport hiển thị
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {seriesLayouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => onSeriesLayoutChange(layout.id)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 ${
                  seriesLayout === layout.id
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
                title={layout.label}
              >
                <layout.icon size={16} />
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <h4 className="text-teal-300 text-xs font-semibold mb-2">Hướng dẫn:</h4>
          <ul className="text-slate-400 text-xs space-y-1">
            <li>• Kéo thả series vào viewport</li>
            <li>• Sử dụng tools từ header toolbar</li>
            <li>• Scroll để navigate frames</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
