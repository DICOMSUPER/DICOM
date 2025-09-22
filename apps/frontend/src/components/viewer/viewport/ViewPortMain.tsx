"use client";
import { useEffect, useRef, useState } from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  volumeLoader,
  setVolumesForViewports,
  getRenderingEngine,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  addTool,
  init as csToolsInit,
  PanTool,
  StackScrollTool,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { MouseBindings } from "@cornerstonejs/tools/enums";

const ViewPortMain = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return;
      }
      running.current = true;

      try {
        // Initialize Cornerstone
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1 });

        // DICOM image IDs
        const imageIds = [
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=0",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=1",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=2",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=3",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=4",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=5",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=6",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=7",
          "wadouri:https://res.cloudinary.com/dz2dv8lk4/raw/upload/v1757871975/0002_sb8yxe.DCM?frame=8",
        ];
        console.log("Image IDs:", imageIds);

        // Create rendering engine
        const renderingEngineId = "myRenderingEngine";
        const renderingEngine = new RenderingEngine(renderingEngineId);
        const viewportId = "CT_VIEWPORT";

        // Viewport configuration
        const viewportInput: Types.PublicViewportInput = {
          viewportId,
          type: Enums.ViewportType.STACK,
          element: elementRef.current as HTMLDivElement,
        };

        // Enable the viewport
        renderingEngine.enableElement(viewportInput);

        // Get the viewport
        const viewport = renderingEngine.getViewport(
          viewportId
        ) as Types.IStackViewport;
        viewport.setStack(imageIds, 0);

        // Create and cache volume
        // const volumeId = "myVolume";
        // const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        //   imageIds,
        // });

        // // Load the volume
        // await volume.load();

        // // Set volumes for viewport (correct way)
        // await setVolumesForViewports(
        //   renderingEngine,
        //   [{ volumeId, callback: () => console.log("Volume loaded successfully") }],
        //   [viewportId]
        // );

        // Render
        viewport.render();
        const toolGroupId = "myToolGroup";
        const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
        addTool(ZoomTool);
        addTool(WindowLevelTool);
        addTool(PanTool);
        addTool(StackScrollTool);
        toolGroup?.addTool(ZoomTool.toolName);
        toolGroup?.addTool(WindowLevelTool.toolName);
        toolGroup?.addTool(PanTool.toolName);
        toolGroup?.addTool(StackScrollTool.toolName);
        toolGroup?.addViewport(viewportId);
        /**
         * Primary = 1: Nút chuột chính (thường là chuột trái)
          Secondary = 2: Nút chuột phụ (thường là chuột phải)
          Primary_And_Secondary = 3: Kết hợp chuột trái và phải
          Auxiliary = 4: Nút chuột phụ trợ (thường là nút giữa/con lăn)
          Primary_And_Auxiliary = 5: Kết hợp chuột trái và giữa
          Secondary_And_Auxiliary = 6: Kết hợp chuột phải và giữa
          Primary_And_Secondary_And_Auxiliary = 7: Kết hợp cả ba nút chuột
          Fourth_Button = 8: Nút chuột thứ 4 (nếu có)
          Fifth_Button = 16: Nút chuột thứ 5 (nếu có)
          Wheel = 524288: Con lăn chuột
          Wheel_Primary = 524289: Con lăn chuột + nút chuột trái
         */
        toolGroup?.setToolActive(WindowLevelTool.toolName, {
          bindings: [
            {
              mouseButton: 1,
            },
          ],
        });

        toolGroup?.setToolActive(ZoomTool.toolName, {
          bindings: [
            {
              mouseButton: 2,
            },
          ],
        });
        toolGroup?.setToolActive(StackScrollTool.toolName, {
          bindings: [
            {
              mouseButton: MouseBindings.Wheel,
            },
          ],
        });

        // if (elementRef.current) {
        //   elementRef.current.addEventListener("wheel", (event) => {
        //     // Ngăn chặn cuộn trang khi đang tương tác với viewer
        //     event.preventDefault();
        //   });
        // }
        console.log("DICOM viewer setup complete");
      } catch (error) {
        console.error("Error setting up DICOM viewer:", error);
      }
    };
    if(elementRef.current){
      elementRef.current.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      }); 
    }

    setup();
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener("contextmenu", (e) => {
          e.preventDefault();
        });
      }
    };
  }, [elementRef, running]);

  return (
    <div
      ref={elementRef}
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#000",
        border: "1px solid #333",
      }}
    />
  );
};

export default ViewPortMain;
