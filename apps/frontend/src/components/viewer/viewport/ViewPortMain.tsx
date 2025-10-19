"use client";
import { useEffect, useRef, useState } from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  eventTarget,
  volumeLoader,
  imageLoader,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  addTool,
  init as csToolsInit,
  PanTool,
  StackScrollTool,
  ToolGroupManager,
  WindowLevelTool,
  Enums as ToolEnums,
  ZoomTool,
  ProbeTool,
  RectangleROITool,
  // RectangleScissorsTool,
  segmentation,
} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { MouseBindings, Events } from "@cornerstonejs/tools/enums";
import { imagingApi } from "@/services/imagingApi";

interface ViewPortMainProps {
  selectedSeries?: any;
  selectedStudy?: any;
}

const ViewPortMain = ({ selectedSeries, selectedStudy }: ViewPortMainProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const [activeTool, setActiveTool] = useState("WindowLevel");

  useEffect(() => {
    const setup = async () => {
      if (running.current) return;
      running.current = true;

      try {
        // Init cornerstone
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });

        let imageIds: string[] = [];

        // Load instances from selected series
        if (selectedSeries) {
          try {
            console.log('🔍 Loading instances for series:', selectedSeries.id);
            const instancesResponse = await imagingApi.getInstancesByReferenceId(
              selectedSeries.id, 
              'series', 
              { page: 1, limit: 100 }
            );
            
            console.log('📊 Found instances:', instancesResponse.data.length);
            
            if (instancesResponse.data.length > 0) {
              // Use filePath from instances (should be Cloudinary URLs)
              imageIds = instancesResponse.data
                .filter(instance => instance.filePath) // Filter out instances without filePath
                .map(instance => {
                  // Check if filePath is already a full URL
                  const path = instance.filePath.startsWith('http') 
                    ? instance.filePath 
                    : `${instance.filePath}/${instance.fileName}`;
                  return `wadouri:${path}`;
                });
              
              console.log('✅ Loaded', imageIds.length, 'DICOM images from Cloudinary');
              console.log('📋 Image URLs:', imageIds.slice(0, 3)); // Log first 3 URLs for debugging
            } else {
              console.warn('⚠️ No instances found for series:', selectedSeries.seriesDescription);
            }
          } catch (error) {
            console.error('❌ Failed to load series instances:', error);
          }
        } else {
          console.warn('⚠️ No series selected, cannot load DICOM images');
        }

        // If no images loaded, use fallback demo image
        if (imageIds.length === 0) {
          console.warn('⚠️ No DICOM images available, using fallback demo image');
          imageIds = [
            "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM",
          ];
        }

        addTool(ZoomTool);
        addTool(WindowLevelTool);
        addTool(PanTool);
        addTool(StackScrollTool);
        addTool(ProbeTool);
        addTool(RectangleROITool);
        // addTool(RectangleScissorsTool);

        const renderingEngineId = "myRenderingEngine";
        const renderingEngine = new RenderingEngine(renderingEngineId);

        if (renderingEngine) {
          // renderingEngine.destroy();
          segmentation.removeAllSegmentationRepresentations();
          segmentation.removeAllSegmentations();
        }

        const viewportId = "CT_VIEWPORT";

        const viewportInput: Types.PublicViewportInput = {
          viewportId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current as HTMLDivElement,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        };

        renderingEngine.enableElement(viewportInput);
        const viewport = renderingEngine.getViewport(
          viewportId
        ) as Types.IStackViewport;
        await viewport.setStack(imageIds, 0);

        const toolGroupId = "myToolGroup";
        const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

        toolGroup?.addTool(ZoomTool.toolName);
        toolGroup?.addTool(WindowLevelTool.toolName);
        toolGroup?.addTool(PanTool.toolName);
        toolGroup?.addTool(StackScrollTool.toolName);
        toolGroup?.addTool(ProbeTool.toolName);
        toolGroup?.addTool(RectangleROITool.toolName);

        toolGroup?.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });
        toolGroup?.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Secondary }],
        });
        toolGroup?.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Auxiliary }],
        });
        toolGroup?.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Wheel }],
        });

        toolGroup?.addViewport(viewportId, renderingEngineId);
        const segmentationId = `MY_SEGMENTATION_ID_${Date.now()}`;
        const segmentationImages =
          await imageLoader.createAndCacheDerivedLabelmapImages(imageIds);
        const segmentationImagesIds = segmentationImages.map(
          (image) => image.imageId
        );

        // Check if segmentation already exists before adding
        const existingSegmentation = segmentation.state.getSegmentation(segmentationId);
        if (!existingSegmentation) {
          segmentation.addSegmentations([
            {
              segmentationId,
              representation: {
                type: ToolEnums.SegmentationRepresentations.Labelmap,
                data: {
                  imageIds: segmentationImagesIds,
                },
              },
            },
          ]);
        }

        await segmentation.addLabelmapRepresentationToViewportMap({
          [viewportId]: [{ segmentationId }],
        });

        eventTarget.addEventListener(
          Events.ANNOTATION_COMPLETED,
          (evt: any) => {
            const { annotation } = evt.detail;

            console.log("=== ANNOTATION COMPLETED ===");
            console.log("Tool:", annotation.metadata.toolName);
            console.log("Data:", annotation.data);

            if (
              annotation.metadata.toolName === RectangleROITool.toolName
            ) {
              console.log(
                "Rectangle ROI points:",
                annotation.data.handles.points
              );
            }

            if (annotation.metadata.toolName === ProbeTool.toolName) {
              console.log("Probe position:", annotation.data.handles.points[0]);
              console.log("Pixel value:", annotation.data.cachedStats?.value);
            }
          }
        );

        eventTarget.addEventListener(
          ToolEnums.Events.SEGMENTATION_DATA_MODIFIED,
          async (evt: any) => {
            console.log("Event detail:", evt.detail);
            const { segmentationId, modifiedSlicesToUse } = evt.detail || {};
            console.log("Segmentation ID:", segmentationId);
            console.log("Modified slices:", modifiedSlicesToUse);

            const seg = segmentation.state.getSegmentation(segmentationId);
            if (!seg) {
              console.warn("No segmentation found for ID:", segmentationId);
              return;
            }

            const labelmapData = seg.representationData?.Labelmap;
            if (!labelmapData) {
              console.warn("No Labelmap representation found");
              return;
            }
            console.log("Labelmap representation data:", labelmapData);

            // Lấy imageIds và load image của slice đầu tiên bị modify
            // @ts-ignore - Labelmap structure varies
            const imageIds = labelmapData.imageIds;
            if (!imageIds || imageIds.length === 0) {
              console.warn("No imageIds in labelmap");
              return;
            }

            const sliceIndex = modifiedSlicesToUse?.[0] ?? 0;
            const imageId = imageIds[sliceIndex];
            console.log(`Loading labelmap image for slice ${sliceIndex}: ${imageId}`);

            try {
              const image = await imageLoader.loadAndCacheImage(imageId);
              const pixelData = image.getPixelData();

              console.log("=== LABELMAP PIXEL DATA ===");
              console.log("Width:", image.width);
              console.log("Height:", image.height);
              console.log("Pixel data length:", pixelData.length);
              console.log("Pixel data type:", pixelData.constructor.name);
            } catch (error) {
              console.error("Error loading labelmap image:", error);
            }
          }
        );

        viewport.render();
      } catch (error) {
        console.error("Error setting up DICOM viewer:", error);
      }
    };

    setup();
  }, [selectedSeries, selectedStudy]);

  const handleToolChange = (toolName: string) => {
    setActiveTool(toolName);
    const toolGroup = ToolGroupManager.getToolGroup("myToolGroup");

    toolGroup?.setToolPassive(WindowLevelTool.toolName);
    toolGroup?.setToolPassive(ProbeTool.toolName);
    toolGroup?.setToolPassive(RectangleROITool.toolName);

    toolGroup?.setToolActive(toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 p-4 flex gap-4 items-center border-b border-gray-700">
        <select
          value={activeTool}
          onChange={(e) => handleToolChange(e.target.value)}
          className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
        >
          <option value={WindowLevelTool.toolName}>Window/Level</option>
          <option value={ProbeTool.toolName}>Probe</option>
          <option value={RectangleROITool.toolName}>Rectangle ROI</option>
        </select>
      </div>

      <div className="flex-1 relative">
        <div ref={elementRef} className="w-full h-full bg-black" />
      </div>
    </div>
  );
};


export default ViewPortMain;