"use client";

import type React from "react";
import { useState, useEffect } from "react";

import {
  X,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Edit2,
  Check,
  Delete,
  Trash,
  Layers,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Layer {
  id: string;
  name: string;
  notes?: string;
  instanceId?: string;
  createdAt: number;
  active: boolean;
  visible: boolean;
  origin: "local" | "database";
  snapshots: object[];
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
  onSaveLayerToDatabase,
  onDeleteLayerFromDatabase,
  onUpdateLayerMetadata,
}: {
  onClose: () => void;
  layers: Layer[];
  currentLayerIndex: number;
  onAddLayer: () => void;
  onDeleteLayer: (layerId: string) => void;
  onSelectLayer: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleLayerVisibility: (index: number) => void;
  isSegmentationVisible: boolean;
  onToggleSegmentationView: () => void;
  selectedLayerCount: number;
  onSaveLayerToDatabase: (layerId: string) => void;
  onDeleteLayerFromDatabase: (layerId: string) => void;
  onUpdateLayerMetadata: (
    layerId: string,
    updates: { name?: string; notes?: string }
  ) => void;
}) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  console.log(layers);
  // Prevent keyboard shortcuts from triggering when modal is open
  useEffect(() => {
    if (editingLayerId === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop propagation for all keydown events when editing
      e.stopPropagation();
    };

    // Add listener to document to capture events before they reach other handlers
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [editingLayerId]);

  const startEditing = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditName(layer.name);
    setEditNotes(layer.notes || "");
  };

  const saveEditing = (layerId: string) => {
    onUpdateLayerMetadata(layerId, {
      name: editName.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditingLayerId(null);
  };

  const cancelEditing = () => {
    setEditingLayerId(null);
    setEditName("");
    setEditNotes("");
  };
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
          <button
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded ${
              layers.length === 0 ||
              layers[currentLayerIndex]?.origin === "database"
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-green-600 hover:bg-green-700"
            } text-white text-xs font-medium transition`}
            title={
              layers.length === 0
                ? "No layer to save"
                : layers[currentLayerIndex]?.origin === "database"
                ? "Already saved to database"
                : "Save to database"
            }
            disabled={
              layers.length === 0 ||
              layers[currentLayerIndex]?.origin === "database"
            }
            onClick={() => {
              if (layers[currentLayerIndex]) {
                onSaveLayerToDatabase(layers[currentLayerIndex].id);
              }
            }}
          >
            <Save size={14} />
          </button>
          <button
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded ${
              layers.length === 0 ||
              layers[currentLayerIndex]?.origin !== "database"
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-red-600 hover:bg-red-700"
            } text-white text-xs font-medium transition`}
            title={
              layers.length === 0
                ? "No layer to delete"
                : layers[currentLayerIndex]?.origin !== "database"
                ? "Only database layers can be deleted from database"
                : "Delete from database"
            }
            disabled={
              layers.length === 0 ||
              layers[currentLayerIndex]?.origin !== "database"
            }
            onClick={() => {
              if (layers[currentLayerIndex]) {
                onDeleteLayerFromDatabase(layers[currentLayerIndex].id);
              }
            }}
          >
            <Trash size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (layers[currentLayerIndex]) {
                onDeleteLayer(layers[currentLayerIndex].id);
              }
            }}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded ${
              layers.length === 0 ||
              layers.length === 1 ||
              layers[currentLayerIndex]?.origin !== "local"
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-yellow-600 hover:bg-yellow-700 cursor-pointer"
            } text-white text-xs font-medium transition`}
            title={
              layers.length === 0
                ? "No layer to delete"
                : layers.length === 1
                ? "At least one layer must remain"
                : layers[currentLayerIndex]?.origin !== "local"
                ? "Only local layers can be deleted locally"
                : "Delete current draft layer"
            }
            disabled={
              layers.length === 0 ||
              layers.length === 1 ||
              layers[currentLayerIndex]?.origin !== "local"
            }
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Current Layer Info */}
        <div className="mb-4 p-3 bg-slate-700 rounded border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">Current Layer</p>
            {layers[currentLayerIndex] && (
              <button
                onClick={() => startEditing(layers[currentLayerIndex])}
                className="p-1 hover:bg-slate-600 rounded transition text-slate-300"
                title="Edit layer"
              >
                <Edit2 size={12} />
              </button>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-1">
              {layers[currentLayerIndex]?.name || "No layer selected"}
            </p>
            {layers[currentLayerIndex]?.notes && (
              <p className="text-xs text-slate-400 italic">
                {layers[currentLayerIndex].notes}
              </p>
            )}
          </div>
        </div>

        {/* Edit Layer Modal */}
        <Dialog
          open={editingLayerId !== null}
          onOpenChange={(open) => !open && cancelEditing()}
        >
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Layer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Layer Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Layer name"
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-cyan-500"
                  maxLength={50}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Notes (optional)
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this layer..."
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={cancelEditing}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => editingLayerId && saveEditing(editingLayerId)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Check size={16} className="mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Layers List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300 mb-2 flex justify-left gap-4">
            <Layers size={16} /> Layers ({layers.length})
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
                {/* Active status indicator - green dot for active layer */}
                {index === currentLayerIndex && (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                )}
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
                {/* Lock icon for database layers */}
                {layer.origin === "database" && (
                  <span title="Database layer (read-only)">
                    <Lock size={12} className="text-slate-400 shrink-0" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
