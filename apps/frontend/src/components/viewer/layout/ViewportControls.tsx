import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { DicomStudy } from "@/services/imagingApi";

interface ViewportControlsProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  currentSlice: number;
  maxSlices: number;
  onSliceChange: (slice: number) => void;
  selectedStudy: DicomStudy | null;
}

export default function ViewportControls({
  isPlaying,
  onPlayToggle,
  currentSlice,
  maxSlices,
  onSliceChange,
  selectedStudy,
}: ViewportControlsProps) {
  return (
    <div className="bg-slate-900 border-t border-slate-800 px-4 py-3">
      {/* Playback Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors">
          <SkipBack size={16} />
        </button>
        <button 
          onClick={onPlayToggle}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors">
          <SkipForward size={16} />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <span className="text-slate-400 text-sm min-w-[80px]">
            Slice: {currentSlice}/{maxSlices}
          </span>
          <input
            type="range"
            min="1"
            max={maxSlices}
            value={currentSlice}
            onChange={(e) => onSliceChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer custom-slider"
          />
        </div>

        {/* Metadata Info */}
        <div className="flex gap-4 text-xs text-slate-400">
          <span>Patient ID: {selectedStudy?.patientId || 'N/A'}</span>
          <span>Study Date: {selectedStudy?.studyDate || 'N/A'}</span>
          <span>Modality: {selectedStudy?.modality?.modalityCode || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

