"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FolderOpen, Loader2, Grid3X3, List, FileText, Layers, FolderTree, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DicomSeries } from '@/interfaces/image-dicom/dicom-series.interface';
import { useViewer } from '@/contexts/ViewerContext';
import { useGetImagingOrdersByPatientIdQuery } from "@/store/imagingOrderApi";
import { useCreateImageSegmentationLayerMutation, useDeleteImageSegmentationLayerMutation } from '@/store/imageSegmentationLayerApi';
import { FolderItem } from './FolderItems';
import AnnotationAccordion from '../sidebar/AnnotationAccordion';
import SegmentationAccordion from '../sidebar/SegmentationAccordion';
import { extractApiData } from '@/utils/api';
import { toast } from 'sonner';
import { Pagination } from '@/components/common/PaginationV1';

interface ViewerRightSidebarProps {
  onSeriesSelect?: (series: DicomSeries) => void;
  series?: DicomSeries[];
  studyId?: string;
  patientId?: string;
  selectedSeriesFromParent?: DicomSeries | null;
  urlSeriesId?: string;
  onOrderStatusChange?: (status: string | null) => void;
}

const ViewerRightSidebar = ({
  onSeriesSelect,
  series = [],
  studyId,
  patientId,
  selectedSeriesFromParent,
  urlSeriesId,
  onOrderStatusChange,
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
  const [viewMode, setViewMode] = useState<'annotations' | 'folders'>('folders');
  const [folderListMode, setFolderListMode] = useState<'grid' | 'list'>('grid');
  const [annotationsTab, setAnnotationsTab] = useState<'annotations' | 'segmentations'>('annotations');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedAnnotations, setHasLoadedAnnotations] = useState(false);
  
  const [createImageSegmentationLayers] = useCreateImageSegmentationLayerMutation();
  const [deleteImageSegmentationLayer] = useDeleteImageSegmentationLayerMutation();
  const { 
    data: imagingOrdersData, 
    isLoading: isLoadingOrders,
    refetch: refetchImagingOrders 
  } = useGetImagingOrdersByPatientIdQuery(
    { patientId: patientId ?? "" },
    { skip: !patientId }
  );

  const resolvedOrders = useMemo(() => {
    if (!imagingOrdersData) return [];
    const extracted = extractApiData(imagingOrdersData);
    return Array.isArray(extracted) ? extracted : [];
  }, [imagingOrdersData]);

  // Update order status and expand folders when orders change
  useEffect(() => {
    if (resolvedOrders.length === 0) return;
    
    const firstOrder = resolvedOrders[0] as any;
    
    // Update order status
    if (onOrderStatusChange) {
      const status = firstOrder?.orderStatus || null;
      onOrderStatusChange(status);
    }
    
    // Expand folder if studyId matches
    if (studyId && firstOrder?.id) {
      setExpandedFolders((prev) => {
        if (prev.has(firstOrder.id)) return prev;
        return new Set(prev).add(firstOrder.id);
      });
    }
  }, [resolvedOrders, studyId, onOrderStatusChange]);
  
  // Sync selectedSeries with parent and active viewport
  useEffect(() => {
    if (selectedSeriesFromParent) {
      setSelectedSeries(selectedSeriesFromParent.id);
      return;
    }
    
    const activeViewportSeries = getViewportSeries(state.activeViewport);
    if (activeViewportSeries) {
      if (activeViewportSeries.id !== selectedSeries) {
        setSelectedSeries(activeViewportSeries.id);
      }
    } else if (selectedSeries) {
      setSelectedSeries(null);
    }
  }, [selectedSeriesFromParent, state.activeViewport, getViewportSeries, selectedSeries]);

  const handleSeriesClick = useCallback((seriesItem: DicomSeries) => {
    setSelectedSeries(seriesItem.id);
    onSeriesSelect?.(seriesItem);
  }, [onSeriesSelect]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (viewMode === 'folders') {
        setExpandedFolders(new Set());
        await refetchImagingOrders();
        toast.success('Imaging orders refreshed');
      } else {
        await refetchSegmentationLayers();
        toast.success('Segmentation layers refreshed');
      }
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [viewMode, refetchImagingOrders, refetchSegmentationLayers]);
  const handleSaveLayer = useCallback(async (layerId: string) => {
    try {
      const layers = getSegmentationLayers();
      const layer = layers.find((l) => l.id === layerId);

      if (!layer) {
        toast.error("Layer not found");
        return;
      }

      await createImageSegmentationLayers({
        layerName: layer.name,
        instanceId: layer.instanceId as string,
        notes: layer.notes,
        frame: 1,
        snapshots: layer.snapshots || [],
      }).unwrap();

      toast.success("Segmentation layer saved to database");
      await refetchSegmentationLayers();
    } catch (error) {
      console.error("Error saving segmentation layer:", error);
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
      console.error("Error deleting segmentation layer:", error);
      toast.error("Error deleting segmentation layer");
    }
  }, [getSegmentationLayers, deleteImageSegmentationLayer, deleteSegmentationLayer, refetchSegmentationLayers]);



  return (
    <TooltipProvider>
      <div className="bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 border-l-2 border-teal-900/30 flex flex-col h-full shadow-2xl">
        <div className="h-14 flex items-center justify-between px-4 border-b-2 border-teal-800/40 bg-linear-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-600/20 rounded-lg border border-teal-500/30">
              {viewMode === 'annotations' ? (
                <FileText className="h-4 w-4 text-teal-400" />
              ) : (
                <FolderTree className="h-4 w-4 text-teal-400" />
              )}
            </div>
             <div>
               <h2 className="text-teal-300 font-bold text-sm tracking-wide">
                 {viewMode === 'annotations' 
                   ? 'ANNOTATIONS & SEGMENTATIONS' 
                   : 'IMAGING ORDERS'}
               </h2>
                 <Badge
                   variant="secondary"
                   className="bg-teal-900/40 text-teal-200 text-[10px] mt-0.5 px-1.5 py-0 font-semibold border border-teal-700/30"
                 >
                   {viewMode === 'annotations' 
                     ? 'Management' 
                     : `${resolvedOrders.length} Orders`}
               </Badge>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("folders")}
                      className={`h-6 w-6 p-0 transition-all ${
                        viewMode === "folders"
                          ? "text-teal-300 bg-teal-900/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <FolderTree className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-700 border-slate-600">
                    <p>Folder view (Orders → Studies → Series)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("annotations")}
                      className={`h-6 w-6 p-0 transition-all ${
                        viewMode === "annotations"
                          ? "text-teal-300 bg-teal-900/40"
                          : "text-slate-400 hover:text-white"
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

              {viewMode === 'folders' && (
                <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFolderListMode("grid")}
                        className={`h-6 w-6 p-0 transition-all ${
                          folderListMode === "grid"
                            ? "text-teal-300 bg-teal-900/40"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Grid3X3 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 border-slate-600">
                      <p>Card view</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFolderListMode("list")}
                        className={`h-6 w-6 p-0 transition-all ${
                          folderListMode === "list"
                            ? "text-teal-300 bg-teal-900/40"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 border-slate-600">
                      <p>List view</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoadingOrders}
                  className={`h-8 w-8 p-0 transition-all rounded-lg text-teal-400 hover:text-teal-300 hover:bg-slate-800 border border-transparent ${
                    (isRefreshing || isLoadingOrders) ? 'opacity-50' : ''
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${(isRefreshing || isLoadingOrders) ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
                {viewMode === 'folders' 
                  ? 'Refresh imaging orders'
                  : 'Refresh segmentation layers'}
              </TooltipContent>
            </Tooltip>

          </div>
        </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto">
           {viewMode === 'folders' ? (
             <div className="p-2 space-y-2 h-full flex flex-col">
                 {(isLoadingOrders || isRefreshing) ? (
                   <div className="flex-1 flex flex-col items-center justify-center">
                     <Loader2 className="h-8 w-8 animate-spin text-teal-400 mb-2" />
                     <span className="text-slate-400 text-sm">Loading imaging orders...</span>
                   </div>
                 ) : resolvedOrders.length > 0 ? (
                   resolvedOrders.map((order: any) => {
                     // Create descriptive folder name
                     const procedureName = order.procedure?.name || order.procedureName || "Unknown Procedure";
                     const orderNum = order.orderNumber || "N/A";
                     
                     return (
                     <FolderItem
                       key={order.id}
                       orderId={order.id}
                       folderName={`${orderNum}`}
                       procedureName={procedureName}
                       orderStatus={order.orderStatus}
                       isExpanded={expandedFolders.has(order.id)}
                       onToggle={() => {
                         setExpandedFolders((prev) => {
                           const newSet = new Set(prev);
                           if (newSet.has(order.id)) {
                             newSet.delete(order.id);
                           } else {
                             newSet.add(order.id);
                           }
                           return newSet;
                         });
                       }}
                       selectedSeries={selectedSeries}
                       viewMode={folderListMode}
                       onSeriesClick={handleSeriesClick}
                       urlStudyId={studyId || undefined}
                       urlSeriesId={urlSeriesId}
                     />
                     );
                   })
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                     <FolderOpen className="h-16 w-16 mb-4 text-slate-600" />
                     <div className="text-slate-400 text-base font-medium mb-2">
                       No Imaging Orders Available
                     </div>
                     <div className="text-slate-500 text-sm mb-1">
                       There are no imaging orders for this patient
                     </div>
                     {patientId ? (
                       <div className="text-slate-600 text-xs mt-2 font-mono">
                         Patient ID: {patientId}
                       </div>
                     ) : (
                      <div className="text-amber-500 text-xs mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Patient ID not provided in URL</span>
                      </div>
                     )}
                   </div>
                 )}
               </div>
          ) : (
            <Tabs 
              value={annotationsTab} 
              onValueChange={(val) => setAnnotationsTab(val as 'annotations' | 'segmentations')} 
              className="h-full flex flex-col"
            >
              <TabsList className="w-full justify-start border-b border-slate-800 bg-slate-900/50 rounded-none h-12 px-2 shrink-0">
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
              
              <TabsContent 
                value="annotations" 
                className="flex-1 overflow-y-auto p-3 mt-0 min-h-0"
                forceMount
                hidden={annotationsTab !== 'annotations'}
              >
                <AnnotationAccordion 
                  selectedSeriesId={selectedSeries} 
                  seriesList={series}
                />
              </TabsContent>
              
              <TabsContent 
                value="segmentations" 
                className="flex-1 overflow-y-auto p-3 mt-0 min-h-0"
                forceMount
                hidden={annotationsTab !== 'segmentations'}
              >
                <SegmentationAccordion
                  selectedSeriesId={selectedSeries}
                  onSaveLayer={handleSaveLayer}
                  onDeleteLayer={handleDeleteLayer}
                  onUpdateLayerMetadata={updateSegmentationLayerMetadata}
                />
              </TabsContent>
            </Tabs>
          )}
         </div>
      </div>
    </TooltipProvider>
  );
};

export default ViewerRightSidebar;
