// "use client";
// import React from "react";
// import { PanelServiceProvider } from "@/contexts/PanelServiceProvider";
// import { ViewportGridProvider } from "@/contexts/ViewportGridProvider";
// import ViewerLayout from "@/components/viewer/viewport-1/ViewerLayout";

// import {
//   StudiesPanelTab,
//   SeriesPanelTab,
//   MeasurementsPanelTab,
//   SettingsPanelTab,
// } from "@/components/viewer/panels/ExamplePanels";
// import { ImageViewerProvider } from "@/contexts/ImageViewerProvider";
// import ViewportGridService from "@/components/viewer/viewport-1/service/ViewportGridService";

// // Simple Viewport Grid Component
// function SimpleViewportGrid({ viewports }: { viewports: any[] }) {
//   return (
//     <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
//       <div className="bg-gray-800 flex items-center justify-center text-white">
//         <p>Viewport 1 - Axial</p>
//       </div>
//       <div className="bg-gray-800 flex items-center justify-center text-white">
//         <p>Viewport 2 - Sagittal</p>
//       </div>
//       <div className="bg-gray-800 flex items-center justify-center text-white">
//         <p>Viewport 3 - Coronal</p>
//       </div>
//       <div className="bg-gray-800 flex items-center justify-center text-white">
//         <p>Viewport 4 - 3D</p>
//       </div>
//     </div>
//   );
// }

// export default function ViewerExamplePage() {
//   const viewportGridService = new ViewportGridService();

//   // Define default panels
//   const defaultLeftPanels = [
//     {
//       id: "studies",
//       component: StudiesPanelTab,
//       title: "Studies",
//       iconName: "folder",
//       label: "Studies",
//     },
//     {
//       id: "series",
//       component: SeriesPanelTab,
//       title: "Series",
//       iconName: "list",
//       label: "Series",
//     },
//   ];

//   const defaultRightPanels = [
//     {
//       id: "measurements",
//       component: MeasurementsPanelTab,
//       title: "Measurements",
//       iconName: "ruler",
//       label: "Measurements",
//     },
//     {
//       id: "settings",
//       component: SettingsPanelTab,
//       title: "Settings",
//       iconName: "settings",
//       label: "Settings",
//     },
//   ];

//   return (
//     <ImageViewerProvider
//       StudyInstanceUIDs={["1.2.826.0.1.3680043.2.1125.1.1234567890.1"]}
//     >
//       <PanelServiceProvider
//         defaultLeftPanels={defaultLeftPanels}
//         defaultRightPanels={defaultRightPanels}
//       >
//         <ViewportGridProvider service={viewportGridService}>
//           <ViewerLayout
//             ViewportGridComp={SimpleViewportGrid}
//             viewports={[]}
//             leftPanelClosed={false}
//             rightPanelClosed={false}
//           />
//         </ViewportGridProvider>
//       </PanelServiceProvider>
//     </ImageViewerProvider>
//   );
// }
