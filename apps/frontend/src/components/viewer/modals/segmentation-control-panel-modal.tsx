"use client";

import type React from "react";

import { X, Plus, Trash2, Undo2, Redo2, Eye, EyeOff } from "lucide-react";

interface Layer {
  id: string;
  name: string;
  active: boolean;
  visible: boolean;
}

export default function SegmentationControlPanel({
  onClose,
  layers,
  currentLayerIndex,
  onAddLayer,
  onDeleteLayer,
  onSelectLayer,
  onRedo,
  onUndo,
  canRedo,
  canUndo,
  onToggleLayerVisibility,
  isSegmentationVisible,
  onToggleSegmentationView,
  selectedLayerCount,
}: {
  onClose: () => void;
  layers: Layer[];
  currentLayerIndex: number;
  onAddLayer: () => void;
  onDeleteLayer: (index: number) => void;
  onSelectLayer: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleLayerVisibility: (index: number) => void;
  isSegmentationVisible: boolean;
  onToggleSegmentationView: () => void;
  selectedLayerCount: number;
}) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">
          Segmentation Control
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-600 rounded transition text-slate-300"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div>
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-xs font-medium transition"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-xs font-medium transition"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>
          <button
            onClick={onAddLayer}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition"
            title="Add New Layer"
          >
            <Plus size={14} />
          </button>
          {/* <button
            onClick={onToggleSegmentationView}
            disabled={selectedLayerCount !== 1}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition ${
              selectedLayerCount === 1
                ? isSegmentationVisible
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-slate-600 hover:bg-slate-500 text-slate-300"
                : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
            }`}
            title={
              selectedLayerCount === 1
                ? "Toggle segmentation visibility"
                : "Select exactly 1 layer to enable"
            }
          >
            {isSegmentationVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button> */}
        </div>

        {/* Current Layer Info */}
        <div className="mb-4 p-2 bg-slate-700 rounded border border-slate-600">
          <p className="text-xs text-slate-400 mb-1">Current Layer</p>
          <p className="text-sm font-semibold text-white">
            {layers[currentLayerIndex]?.name || "No layer selected"}
          </p>
        </div>

        {/* Layers List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300 mb-2">
            Layers ({layers.length})
          </p>
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(index)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition ${
                index === currentLayerIndex
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <button
                  className="p-1 hover:bg-slate-600/50 rounded transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerVisibility(index);
                  }}
                  title={layer.visible ? "Hide layer" : "Show layer"}
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <span className="text-xs font-medium">{layer.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(index);
                }}
                className="p-1 hover:bg-red-600/50 rounded transition text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={layers.length === 1}
                title={
                  layers.length === 1
                    ? "At least one layer must remain"
                    : "Delete layer"
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
