"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { PredictionMetadata } from "@/interfaces/system/ai-result.interface";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc?: string;
  imageAlt?: string;
  width?: number; 
  height?: number; 
  showDimensions?: boolean;
  mode?: "original" | "analyzed";
  predictions?: PredictionMetadata[];
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageSrc,
  imageAlt = "Preview image",
  width,
  height,
  showDimensions = true,
  mode = "original",
  predictions = [],
}: ImagePreviewModalProps) {
  
  if (!imageSrc) return null;

  // Logic hiển thị Badge
  const renderStatusBadge = () => {
    if (mode !== 'analyzed') return null;

    if (predictions.length === 0) {
      return (
        <div className="absolute top-4 left-4 bg-teal-600/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm z-40 flex items-center gap-2 pointer-events-none">
          <CheckCircle2 className="h-3.5 w-3.5" />
          No Detections Found
        </div>
      );
    }

    return (
      <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm z-40 flex items-center gap-2 pointer-events-none">
        <AlertCircle className="h-3.5 w-3.5" />
        Analysis Overlay ({predictions.length})
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl! max-h-7xl! p-0 border-0  shadow-none overflow-auto">
        <VisuallyHidden.Root>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden.Root>
        
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="relative inline-block">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={width || 800}
              height={height || 600}
              style={{
                width: width ? `${width}px` : "auto",
                height: height ? `${height}px` : "auto",
                maxWidth: "90vw",
                maxHeight: "85vh",
              }}
              className="object-contain rounded-lg shadow-2xl bg-white block"
            />


            {mode === 'analyzed' && width && height && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none rounded-lg z-10"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet" 
              >
                {predictions.map((prediction, index) => {
                  if (!prediction.points || prediction.points.length === 0) return null;

                  const pointsString = prediction.points
                    .map((p) => `${p.x},${p.y}`)
                    .join(" ");

                  return (
                    <g key={prediction.detection_id || index}>
                      <polygon
                        points={pointsString}
                        fill="rgba(255, 0, 0, 0.2)" 
                        stroke="#FF0000"           
                        strokeWidth="4"           
                        strokeLinejoin="round"
                      />
                      {prediction.points[0] && (
                         <text 
                           x={prediction.points[0].x} 
                           y={prediction.points[0].y - 10} 
                           fill="white" 
                           fontSize="24" 
                           fontWeight="bold"
                           style={{ textShadow: "0px 1px 3px black" }}
                         >
                           {prediction.class}
                         </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
            
            {/* Close Button */}
            {/* <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg rounded-full z-50"
            >
              <X className="h-4 w-4" />
            </Button> */}

            {/* Dimensions Badge */}
            {showDimensions && width && height && (
              <div className="absolute bottom-4 left-4 bg-black/75 text-white px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-sm z-40 pointer-events-none">
                {width} × {height} px
              </div>
            )}

            {/* Status Badge */}
            {renderStatusBadge()}
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}