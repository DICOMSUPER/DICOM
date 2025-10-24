"use client";
import { getAllKeyboardShortcuts, getToolName, TOOL_MAPPINGS } from "./CornerstoneToolManager";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = getAllKeyboardShortcuts();
  
  // Group shortcuts by category
  const navigationTools = Object.keys(TOOL_MAPPINGS)
    .filter(toolType => (TOOL_MAPPINGS as any)[toolType].category === 'navigation')
    .map(toolType => {
      const toolName = getToolName(toolType as any);
      return { toolType, toolName, shortcut: toolName ? shortcuts[toolName] : null };
    })
    .filter(tool => tool.shortcut);

  const measurementTools = Object.keys(TOOL_MAPPINGS)
    .filter(toolType => (TOOL_MAPPINGS as any)[toolType].category === 'measurement')
    .map(toolType => {
      const toolName = getToolName(toolType as any);
      return { toolType, toolName, shortcut: toolName ? shortcuts[toolName] : null };
    })
    .filter(tool => tool.shortcut);

  const advancedTools = Object.keys(TOOL_MAPPINGS)
    .filter(toolType => (TOOL_MAPPINGS as any)[toolType].category === 'advanced')
    .map(toolType => {
      const toolName = getToolName(toolType as any);
      return { toolType, toolName, shortcut: toolName ? shortcuts[toolName] : null };
    })
    .filter(tool => tool.shortcut);

  const annotationTools = Object.keys(TOOL_MAPPINGS)
    .filter(toolType => (TOOL_MAPPINGS as any)[toolType].category === 'annotation')
    .map(toolType => {
      const toolName = getToolName(toolType as any);
      return { toolType, toolName, shortcut: toolName ? shortcuts[toolName] : null };
    })
    .filter(tool => tool.shortcut);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Navigation Tools */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Navigation Tools</h3>
            <div className="grid grid-cols-1 gap-2">
              {navigationTools.map(({ toolType, shortcut }) => (
                <div key={toolType} className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded">
                  <span className="text-white capitalize">{toolType.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <kbd className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm font-mono">
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Measurement Tools */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Measurement Tools</h3>
            <div className="grid grid-cols-1 gap-2">
              {measurementTools.map(({ toolType, shortcut }) => (
                <div key={toolType} className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded">
                  <span className="text-white capitalize">{toolType.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <kbd className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm font-mono">
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Tools */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Advanced Tools</h3>
            <div className="grid grid-cols-1 gap-2">
              {advancedTools.map(({ toolType, shortcut }) => (
                <div key={toolType} className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded">
                  <span className="text-white capitalize">{toolType.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <kbd className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm font-mono">
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Annotation Tools */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Annotation Tools</h3>
            <div className="grid grid-cols-1 gap-2">
              {annotationTools.map(({ toolType, shortcut }) => (
                <div key={toolType} className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded">
                  <span className="text-white capitalize">{toolType.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <kbd className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-sm font-mono">
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Additional Controls</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Scroll Wheel</span>
                <span>Navigate between images</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl + Scroll Wheel</span>
                <span>Rotate image (PlanarRotate)</span>
              </div>
              <div className="flex justify-between">
                <span>Right Click + Drag</span>
                <span>Zoom in/out</span>
              </div>
              <div className="flex justify-between">
                <span>Middle Click + Drag</span>
                <span>Pan image</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
