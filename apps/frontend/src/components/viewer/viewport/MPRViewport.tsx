"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  volumeLoader,
  getRenderingEngine,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as csToolsInit } from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { viewportSyncService } from "@/services/ViewportSyncService";
import type { DicomInstance } from "@/common/interfaces/image-dicom/dicom-instances.interface";
import { smartSort, extractSortingMetadata } from "@/common/utils/dicom/sortInstances";
import { useLazyGetInstancesByReferenceQuery } from "@/store/dicomInstanceApi";
import { resolveDicomImageUrl } from "@/common/utils/dicom/resolveDicomImageUrl";

interface MPRViewportProps {
  selectedSeries?: any;
  renderingEngineId?: string;
}

interface ViewportSetup {
  id: string;
  orientation: 'AXIAL' | 'SAGITTAL' | 'CORONAL';
  label: string;
  color: string;
}

const VIEWPORT_CONFIGS: ViewportSetup[] = [
  { id: 'axial', orientation: 'AXIAL', label: 'Axial', color: 'red' },
  { id: 'sagittal', orientation: 'SAGITTAL', label: 'Sagittal', color: 'green' },
  { id: 'coronal', orientation: 'CORONAL', label: 'Coronal', color: 'blue' },
];

export default function MPRViewport({
  selectedSeries,
  renderingEngineId = 'mprRenderingEngine',
}: MPRViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [viewports, setViewports] = useState<Record<string, Types.IVolumeViewport | null>>({});
  const running = useRef(false);
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        console.log('⏳ MPR Setup already running, skipping...');
        return;
      }
      running.current = true;

      try {
        setIsLoading(true);
        setLoadingProgress(0);
        
        console.log('🚀 Initializing MPR viewports for series:', selectedSeries?.id);

        // Init Cornerstone
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 4 });
        setLoadingProgress(10);

        let imageIds: string[] = [];

        // Load instances
        if (selectedSeries) {
          try {
            const instancesResponse = await fetchInstancesByReference({
              id: selectedSeries.id,
              type: "series",
              params: { page: 1, limit: 100 },
            }).unwrap();

            setLoadingProgress(30);

            const instanceData: DicomInstance[] =
              instancesResponse.data?.data ?? [];

            if (instanceData.length > 0) {
              const instancesWithMetadata: DicomInstance[] = instanceData
                .filter((instance) => !!resolveDicomImageUrl(instance.filePath, instance.fileName))
                .map((instance) =>
                  extractSortingMetadata(instance) as DicomInstance
                );

              const sortedInstances = smartSort(instancesWithMetadata);

              imageIds = sortedInstances
                .map((instance) =>
                  resolveDicomImageUrl(instance.filePath, instance.fileName)
                )
                .filter((path): path is string => Boolean(path))
                .map((path) => `wadouri:${path}`);

              console.log(
                "✅ Sorted and loaded",
                imageIds.length,
                "images for MPR"
              );
            }
          } catch (error) {
            console.error('❌ Failed to load series instances:', error);
          }
        }

        if (imageIds.length === 0) {
          console.warn('⚠️ No images available for MPR');
          setIsLoading(false);
          return;
        }

        setLoadingProgress(50);

        // Create rendering engine
        const renderingEngine = new RenderingEngine(renderingEngineId);

        // Create volume
        const volumeId = `mprVolume-${selectedSeries?.id || 'default'}`;
        const volume = await volumeLoader.createAndCacheVolume(volumeId, {
          imageIds,
        });

        setLoadingProgress(70);

        // Enable viewports
        const newViewports: Record<string, Types.IVolumeViewport> = {};

        for (const config of VIEWPORT_CONFIGS) {
          const viewportId = `mpr-${config.id}`;
          const element = viewportRefs.current[config.id];

          if (!element) {
            console.warn(`Element not found for ${config.id}`);
            continue;
          }

          const viewportInput: Types.PublicViewportInput = {
            viewportId,
            type: Enums.ViewportType.ORTHOGRAPHIC,
            element,
            defaultOptions: {
              orientation: Enums.OrientationAxis[config.orientation],
              background: [0, 0, 0] as Types.Point3,
            },
          };

          renderingEngine.enableElement(viewportInput);

          const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;
          
          // Set volume
          await viewport.setVolumes([
            {
              volumeId,
              callback: ({ volumeActor }) => {
                // Volume loaded callback
                console.log(`✅ ${config.label} viewport ready`);
              },
            },
          ]);

          newViewports[config.id] = viewport;
        }

        setViewports(newViewports);
        setLoadingProgress(90);

        // Load volume data
        await volume.load();

        // Render all viewports
        Object.values(newViewports).forEach(vp => vp?.render());

        // Setup synchronization
        viewportSyncService.createSyncGroup(
          'mpr-sync',
          VIEWPORT_CONFIGS.map(c => `mpr-${c.id}`),
          ['scroll']
        );

        setLoadingProgress(100);
        setIsLoading(false);
        console.log('✅ MPR viewports initialized successfully');

      } catch (error) {
        console.error('❌ Error setting up MPR viewports:', error);
        setIsLoading(false);
        setLoadingProgress(0);
      } finally {
        running.current = false;
      }
    };

    running.current = false;
    setup();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up MPR viewports...');
      try {
        const renderingEngine = getRenderingEngine(renderingEngineId);
        if (renderingEngine) {
          renderingEngine.destroy();
        }
        viewportSyncService.destroySyncGroup('mpr-sync');
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    };
  }, [selectedSeries, renderingEngineId, fetchInstancesByReference]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-900 grid grid-cols-3 gap-1">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 col-span-3">
          <div className="w-80 max-w-md">
            <div className="mb-4 text-center">
              <div className="text-white text-lg font-medium mb-2">
                Loading MPR Volume...
              </div>
              <div className="text-gray-400 text-sm">
                {loadingProgress}% Complete
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MPR Viewports */}
      {VIEWPORT_CONFIGS.map(config => (
        <div key={config.id} className="relative bg-black">
          <div
            ref={(el) => {
              viewportRefs.current[config.id] = el;
            }}
            className="w-full h-full"
          />
          
          {/* Viewport Label */}
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium z-10"
            style={{
              backgroundColor: `${config.color}30`,
              borderLeft: `3px solid ${config.color}`,
              color: 'white',
            }}
          >
            {config.label}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {!selectedSeries && !isLoading && (
        <div className="col-span-3 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-lg mb-2">No Series Selected</div>
            <div className="text-sm">Select a series to view MPR</div>
          </div>
        </div>
      )}
    </div>
  );
}

