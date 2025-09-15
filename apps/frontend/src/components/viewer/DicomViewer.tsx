import React from "react";
import DicomImageLoader from "./DicomImageLoader";
import { RenderingEngine } from "@cornerstonejs/core";

export default function DicomViewer({
  imageId,
  renderingEngine,
  setRenderingEngine,
}: {
  imageId: string;
  renderingEngine: RenderingEngine | null;
  setRenderingEngine: (engine: RenderingEngine) => void;
}) {
  return (
    <div className="flex-1 bg-gray-100 justify-center items-center bg-black">
      <DicomImageLoader
        imageId={imageId}
        isThumbnail={false}
        viewportId=""
        size={650}
        hasFrameNavigation={true}
        hasToolBars={true}
        renderingEngine={renderingEngine}
        setRenderingEngine={setRenderingEngine}
      ></DicomImageLoader>
    </div>
  );
}
