"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Filter, FolderOpen, Database, Loader2, Grid3X3, List, FileText, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DicomInstance } from '@/interfaces/image-dicom/dicom-instances.interface';
import { DicomSeries } from '@/interfaces/image-dicom/dicom-series.interface';
import { useViewer } from '@/contexts/ViewerContext';
import { useLazyGetDicomSeriesByReferenceQuery } from '@/store/dicomSeriesApi';
import { useLazyGetInstancesByReferenceQuery } from '@/store/dicomInstanceApi';
import SeriesCard from '../sidebar/SeriesCard';
import SeriesFilter from '../sidebar/SeriesFilter';
import AnnotationAccordion from '../sidebar/AnnotationAccordion';
import SegmentationAccordion from '../sidebar/SegmentationAccordion';
import { extractApiData } from '@/utils/api';
import { resolveDicomImageUrl } from '@/utils/dicom/resolveDicomImageUrl';
import { 
  useCreateImageSegmentationLayersMutation, 
  useDeleteImageSegmentationLayerMutation,
  useLazyGetImageSegmentationLayersByInstanceIdQuery 
} from '@/store/imageSegmentationLayerApi';
import { toast } from 'sonner';

interface ViewerRightSidebarProps {
  onSeriesSelect?: (series: DicomSeries) => void;
  series?: DicomSeries[];
  studyId?: string;
  onSeriesLoaded?: (series: DicomSeries[]) => void;
}

const ViewerRightSidebar = ({
  onSeriesSelect,
  series = [],
  studyId,
  onSeriesLoaded,
}: ViewerRightSidebarProps) => {
  const { 
    state, 
    getViewportSeries,
    getSegmentationLayers,
    deleteSegmentationLayer,
    updateSegmentationLayerMetadata,
    refetchSegmentationLayers,
  } = useViewer();
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterModality, setFilterModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [seriesInstances, setSeriesInstances] = useState<Record<string, DicomInstance[]>>({});
  const [loadingInstances, setLoadingInstances] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'annotations'>('grid');
  const [annotationsTab, setAnnotationsTab] = useState<'annotations' | 'segmentations'>('annotations');
  const [loadedStudyId, setLoadedStudyId] = useState<string | null>(null);
  const [thumbnailPaths, setThumbnailPaths] = useState<Record<string, string>>({});
  const [seriesList, setSeriesList] = useState<DicomSeries[]>(series);
  const [fetchSeriesByReference] = useLazyGetDicomSeriesByReferenceQuery();
  const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();
  const [createImageSegmentationLayers] = useCreateImageSegmentationLayersMutation();
  const [deleteImageSegmentationLayer] = useDeleteImageSegmentationLayerMutation();

  useEffect(() => {
    const activeViewportSeries = getViewportSeries(state.activeViewport);
    if (activeViewportSeries) {
      if (activeViewportSeries.id !== selectedSeries) {
        setSelectedSeries(activeViewportSeries.id);
      }
      return;
    }

    if (selectedSeries) {
      setSelectedSeries(null);
    }
  }, [state.activeViewport, getViewportSeries, selectedSeries]);

  useEffect(() => {
    let cancelled = false;

    if (!Array.isArray(series) || series.length === 0) {
      setSeriesList([]);
      if (!loading) {
        setThumbnailPaths({});
      }
      return;
    }

    setSeriesList(series);

    const preload = async () => {
      setLoading(true);
      try {
        await preloadThumbnails(series);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void preload();

    return () => {
      cancelled = true;
    };
  }, [series]);

  const handleSeriesClick = (seriesItem: DicomSeries) => {
    setSelectedSeries(seriesItem.id);
    onSeriesSelect?.(seriesItem);
  };
  const getSeriesModality = (series: DicomSeries) => {
    return 'CT';
  };

  useEffect(() => {
    const loadSeries = async () => {
      if (!studyId) {
        return;
      }

      if (series && series.length > 0 && studyId === loadedStudyId) {
        return;
      }

      if (studyId !== loadedStudyId) {
        setSeriesList([]);
        setSeriesInstances({});
        setThumbnailPaths({});
      }

      setLoading(true);

      try {
        const seriesResponse = await fetchSeriesByReference({
          id: studyId,
          type: 'study',
          params: { page: 1, limit: 50 },
        }).unwrap();

        const fetchedSeries = extractApiData<DicomSeries>(seriesResponse);

        setSeriesList(fetchedSeries);
        onSeriesLoaded?.(fetchedSeries);
        preloadThumbnails(fetchedSeries);
        setLoadedStudyId(studyId);
      } catch (error) {
        console.error('❌ Failed to load series:', error);
        setSeriesList([]);
        onSeriesLoaded?.([]);
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [studyId, series, onSeriesLoaded, loadedStudyId, fetchSeriesByReference]);

  const preloadThumbnails = async (seriesArray: DicomSeries[]) => {
    const updatedThumbnails: Record<string, string> = {};

    for (const seriesItem of seriesArray) {
      if (!seriesItem || !seriesItem.id) continue;

      const cachedInstances = seriesInstances[seriesItem.id];
      const cachedInstanceWithPath = cachedInstances?.find(
        (inst: DicomInstance) =>
          resolveDicomImageUrl(inst.filePath, inst.fileName)
      );

      if (cachedInstanceWithPath) {
        const resolved = resolveDicomImageUrl(
          cachedInstanceWithPath.filePath,
          cachedInstanceWithPath.fileName
        );
        if (resolved) {
          updatedThumbnails[seriesItem.id] = resolved;
        }
        continue;
      }

      try {
        const response = await fetchInstancesByReference({
          id: seriesItem.id,
          type: 'series',
          params: { page: 1, limit: 1 },
        }).unwrap();

        const instances = extractApiData<DicomInstance>(response);
        const firstWithFile = instances.find(
          (inst: DicomInstance) =>
            resolveDicomImageUrl(inst.filePath, inst.fileName)
        );

        if (firstWithFile) {
          const resolved = resolveDicomImageUrl(
            firstWithFile.filePath,
            firstWithFile.fileName
          );
          if (resolved) {
            updatedThumbnails[seriesItem.id] = resolved;
          }
          setSeriesInstances((prev) => ({
            ...prev,
            [seriesItem.id]: instances,
          }));
        }
      } catch (error) {
        console.warn('Failed to preload thumbnail for series', seriesItem.id, error);
      }
    }

    if (Object.keys(updatedThumbnails).length) {
      setThumbnailPaths((prev) => ({ ...prev, ...updatedThumbnails }));
    }
  };


  // Segmentation layer handlers
  const handleSaveLayer = useCallback(async (layerId: string) => {
    try {
      const layers = getSegmentationLayers();
      const layer = layers.find((l) => l.id === layerId);

      if (!layer) {
        toast.error("Layer not found");
        return;
      }

      // Compress snapshots before saving
      const compressedSnapshots = layer.snapshots?.map((snapshot) => ({
        ...snapshot,
        data: snapshot.data // Already compressed in context
      }));

      await createImageSegmentationLayers({
        layerName: layer.name,
        instanceId: layer.instanceId as string,
        notes: layer.notes,
        frame: 1,
        snapshots: compressedSnapshots,
      }).unwrap();

      toast.success("Segmentation layer saved to database");
      await refetchSegmentationLayers();
    } catch (error) {
      toast.error("Error saving segmentation layer to database");
    }
  }, [getSegmentationLayers, createImageSegmentationLayers, refetchSegmentationLayers]);

  const handleDeleteLayer = useCallback(async (layerId: string) => {
    try {
      const layers = getSegmentationLayers();
      const layer = layers.find((l) => l.id === layerId);
      
      if (layer?.origin === "database") {
        await deleteImageSegmentationLayer(layerId);
        await refetchSegmentationLayers();
      }
      
      deleteSegmentationLayer(layerId);
      toast.success("Segmentation layer deleted");
    } catch (error) {
      toast.error("Error deleting segmentation layer");
    }
  }, [getSegmentationLayers, deleteImageSegmentationLayer, deleteSegmentationLayer, refetchSegmentationLayers]);

  const toggleSeriesExpansion = async (seriesId: string) => {
    const isExpanding = !expandedSeries.has(seriesId);
    
    setExpandedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });

    if (isExpanding && !seriesInstances[seriesId]) {
      setLoadingInstances(prev => new Set(prev).add(seriesId));
      try {
        const response = await fetchInstancesByReference({
          id: seriesId,
          type: 'series',
          params: { page: 1, limit: 1000 },
        }).unwrap();
        const instances = response.data?.data || [];
        setSeriesInstances(prev => ({
          ...prev,
          [seriesId]: instances
        }));
      } catch (error) {
        console.error('Failed to load instances:', error);
      } finally {
        setLoadingInstances(prev => {
          const newSet = new Set(prev);
          newSet.delete(seriesId);
          return newSet;
        });
      }
    }
  };


  const filteredSeries = useMemo(() => {
    return (seriesList || []).filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        (s.seriesDescription || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesModality =
        filterModality === 'All' || getSeriesModality(s) === filterModality;
      return matchesSearch && matchesModality;
    });
  }, [seriesList, searchQuery, filterModality]);

  const renderSeriesCard = useCallback((s: DicomSeries) => {
    const resolvedFallback = resolveDicomImageUrl(
      seriesInstances[s.id]?.[0]?.filePath,
      seriesInstances[s.id]?.[0]?.fileName
    );
    const thumbnailPath = thumbnailPaths[s.id] ?? resolvedFallback ?? undefined;
    const isLoadingThumbnail =
      (loading || loadingInstances.has(s.id)) &&
      !thumbnailPath &&
      (s.numberOfInstances ?? 0) > 0;

    return (
      <SeriesCard
        key={s.id}
        series={s}
        isSelected={selectedSeries === s.id}
        viewMode={viewMode}
        onSeriesClick={handleSeriesClick}
        thumbnailPath={thumbnailPath}
        loadingThumbnail={isLoadingThumbnail}
      />
    );
  }, [seriesInstances, thumbnailPaths, loading, loadingInstances, viewMode, selectedSeries, handleSeriesClick]);


  return (
    <TooltipProvider>
      <div className="bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 border-l-2 border-teal-900/30 flex flex-col h-full shadow-2xl">
        {/* Medical-themed Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b-2 border-teal-800/40 bg-linear-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-600/20 rounded-lg border border-teal-500/30">
              {viewMode === 'annotations' ? (
                <FileText className="h-4 w-4 text-teal-400" />
              ) : (
                <Database className="h-4 w-4 text-teal-400" />
              )}
            </div>
             <div>
               <h2 className="text-teal-300 font-bold text-sm tracking-wide">
                 {viewMode === 'annotations' ? 'ANNOTATIONS & SEGMENTATIONS' : 'IMAGE SERIES'}
               </h2>
                 <Badge
                   variant="secondary"
                   className="bg-teal-900/40 text-teal-200 text-[10px] mt-0.5 px-1.5 py-0 font-semibold border border-teal-700/30"
                 >
                   {viewMode === 'annotations' ? 'Management' : `${seriesList.length} Total`}
               </Badge>
             </div>
          </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`h-6 w-6 p-0 transition-all ${
                        viewMode === 'grid'
                          ? 'text-teal-300 bg-teal-900/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-700 border-slate-600">
                    <p>Grid view</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`h-6 w-6 p-0 transition-all ${
                        viewMode === 'list'
                          ? 'text-teal-300 bg-teal-900/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-700 border-slate-600">
                    <p>List view</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('annotations')}
                      className={`h-6 w-6 p-0 transition-all ${
                        viewMode === 'annotations'
                          ? 'text-teal-300 bg-teal-900/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-700 border-slate-600">
                    <p>Annotations & Segmentations</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {viewMode !== 'annotations' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilter(!showFilter)}
                      className={`h-8 w-8 p-0 transition-all rounded-lg ${
                        showFilter 
                          ? 'text-teal-300 bg-teal-900/40 border border-teal-700/50' 
                          : 'text-white hover:text-teal-300 hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                   <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                     Filter Series
                   </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

        {/* Filter Section */}
        {showFilter && viewMode !== 'annotations' && (
          <SeriesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterModality={filterModality}
            onModalityChange={setFilterModality}
            onClose={() => setShowFilter(false)}
          />
        )}

         {/* Content */}
         <div className="flex-1 overflow-y-auto">
           {viewMode === 'annotations' ? (
             <Tabs value={annotationsTab} onValueChange={(val) => setAnnotationsTab(val as 'annotations' | 'segmentations')} className="h-full flex flex-col">
               <TabsList className="w-full justify-start border-b border-slate-800 bg-slate-900/50 rounded-none h-12 px-2">
                 <TabsTrigger 
                   value="annotations" 
                   className="flex items-center gap-2 data-[state=active]:bg-teal-900/40 data-[state=active]:text-teal-300"
                 >
                   <FileText className="h-4 w-4" />
                   <span>Annotations</span>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="segmentations"
                   className="flex items-center gap-2 data-[state=active]:bg-teal-900/40 data-[state=active]:text-teal-300"
                 >
                   <Layers className="h-4 w-4" />
                   <span>Segmentations</span>
                 </TabsTrigger>
               </TabsList>
               
               <TabsContent value="annotations" className="flex-1 overflow-y-auto p-3 mt-0">
                 <AnnotationAccordion 
                   selectedSeriesId={selectedSeries} 
                   seriesList={seriesList}
                 />
               </TabsContent>
               
               <TabsContent value="segmentations" className="flex-1 overflow-y-auto p-3 mt-0">
                 <SegmentationAccordion
                   selectedSeriesId={selectedSeries}
                   onSaveLayer={handleSaveLayer}
                   onDeleteLayer={handleDeleteLayer}
                   onUpdateLayerMetadata={updateSegmentationLayerMetadata}
                 />
               </TabsContent>
             </Tabs>
           ) : (
             <div className="p-2 space-y-1 flex flex-col h-full">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-8 flex-1">
                   <Loader2 className="h-8 w-8 animate-spin text-teal-400 mb-2" />
                   <span className="text-white">Loading series...</span>
                 </div>
               ) : filteredSeries.length > 0 ? (
                 <div className={viewMode === 'grid' ? 'space-y-1' : 'space-y-1'}>
                   {filteredSeries.map((s) =>
                     renderSeriesCard(s)
                   )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center text-center text-slate-500 flex-1">
                   <FolderOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                   <div className="text-sm">No series available</div>
                   <div className="text-xs mt-1">Load series to view them here</div>
                 </div>
               )}
             </div>
           )}
         </div>
      </div>
    </TooltipProvider>
  );
};

export default ViewerRightSidebar;