"use client";
import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ResizablePanelProps {
  children: ReactNode;
  side: "left" | "right";
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export default function ResizablePanel({
  children,
  side,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  collapsed,
  onToggleCollapse,
  className = "",
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current || !panelRef.current) return;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      let newWidth: number;

      if (side === "left") {
        newWidth = e.clientX;
      } else {
        newWidth = window.innerWidth - e.clientX;
      }

      // Clamp width between min and max
      newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

      // Update width directly via CSS for better performance
      if (panelRef.current) {
        panelRef.current.style.width = `${newWidth}px`;
      }
    });
  }, [side, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    resizingRef.current = false;
    setIsResizing(false);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
    document.body.style.pointerEvents = "auto";

    // Save final width to state
    if (panelRef.current) {
      setWidth(parseInt(panelRef.current.style.width) || defaultWidth);
    }
  }, [defaultWidth]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = () => {
    resizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    document.body.style.pointerEvents = "none";
  };

  return (
    <div className={`flex ${side === "right" ? "flex-row-reverse" : ""}`}>
      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative bg-slate-900 ${className} ${collapsed ? "w-0" : ""
          } ${!isResizing ? "transition-all duration-300" : ""}`}
        style={{
          width: collapsed ? 0 : width,
          willChange: isResizing ? "width" : "auto"
        }}
      >
        {/* Content */}
        <div className="h-full overflow-hidden">{children}</div>

        {/* Resize Handle */}
        {!collapsed && (
          <div
            className={`absolute top-0 ${side === "left" ? "right-0" : "left-0"
              } w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors group`}
            onMouseDown={handleMouseDown}
          >
            {/* Visual indicator on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`h-full w-1 bg-blue-500 ${side === "left" ? "ml-0" : "mr-0"
                }`} />
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button - Positioned correctly for each side */}
      <button
        onClick={onToggleCollapse}
        className={`w-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ${side === "left" ? "border-r border-slate-800" : "border-l border-slate-800"
          }`}
        title={collapsed ? "Open" : "Close"}
      >
        {collapsed
          ? (side === "left" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)
          : (side === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)
        }
      </button>
    </div>
  );
}

