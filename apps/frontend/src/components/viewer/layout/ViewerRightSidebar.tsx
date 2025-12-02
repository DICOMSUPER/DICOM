// "use client";
// import React, { useState, useEffect } from 'react';
// import { Filter, FolderOpen, Database, Loader2, Grid3X3, List } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { DicomInstance } from '@/interfaces/image-dicom/dicom-instances.interface';
// import { DicomSeries } from '@/interfaces/image-dicom/dicom-series.interface';
// import { useViewer } from '@/contexts/ViewerContext';
// import { useLazyGetDicomSeriesByReferenceQuery } from '@/store/dicomSeriesApi';
// import { useLazyGetInstancesByReferenceQuery } from '@/store/dicomInstanceApi';
// import SeriesCard from '../sidebar/SeriesCard';
// import SeriesFilter from '../sidebar/SeriesFilter';
// import { extractApiData } from '@/utils/api';
// import { resolveDicomImageUrl } from '@/utils/dicom/resolveDicomImageUrl';
// import { useGetImagingOrdersByPatientIdQuery } from '@/store/imagingOrderApi';
// import { useGetDicomStudiesByOrderIdQuery } from '@/store/dicomStudyApi';

// interface ViewerRightSidebarProps {
//   onSeriesSelect?: (series: DicomSeries) => void;
//   series?: DicomSeries[];
//   studyId?: string;
//   patientId?: string;
//   onSeriesLoaded?: (series: DicomSeries[]) => void;
// }

// const ViewerRightSidebar = ({
//   onSeriesSelect,
//   series = [],
//   studyId,
//   patientId,
//   onSeriesLoaded,
// }: ViewerRightSidebarProps) => {
//   const { state, getViewportSeries } = useViewer();
//   const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
//   const [showFilter, setShowFilter] = useState(false);
//   const [filterModality, setFilterModality] = useState<string>('All');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
//   const [seriesInstances, setSeriesInstances] = useState<Record<string, DicomInstance[]>>({});
//   const [loadingInstances, setLoadingInstances] = useState<Set<string>>(new Set());
//   const [loading, setLoading] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [loadedStudyId, setLoadedStudyId] = useState<string | null>(null);
//   const [thumbnailPaths, setThumbnailPaths] = useState<Record<string, string>>({});
//   const [seriesList, setSeriesList] = useState<DicomSeries[]>(series);
//   const [fetchSeriesByReference] = useLazyGetDicomSeriesByReferenceQuery();
//   const [fetchInstancesByReference] = useLazyGetInstancesByReferenceQuery();





//   const { data: imagingOrdersData } = useGetImagingOrdersByPatientIdQuery(
//     { patientId: patientId ?? "" },
//     { skip: !patientId }
//   );

//   // const { data: dicomData, isLoading, error } = useGetDicomStudiesByOrderIdQuery(
//   //     );

//   console.log(" check 1",imagingOrdersData)
//   // Sync selected series with active viewport's loaded series
//   useEffect(() => {
//     const activeViewportSeries = getViewportSeries(state.activeViewport);
//     if (activeViewportSeries) {
//       if (activeViewportSeries.id !== selectedSeries) {
//         setSelectedSeries(activeViewportSeries.id);
//         console.log(
//           "🔄 Synced sidebar selection with active viewport:",
//           activeViewportSeries.seriesDescription
//         );
//       }
//       return;
//     }
//     if (selectedSeries) {
//       setSelectedSeries(null);
//       console.log("🔄 Active viewport has no series; cleared sidebar selection");
//     }
//   }, [state.activeViewport, getViewportSeries, selectedSeries]);


//   useEffect(() => {
//     let cancelled = false;

//     if (!Array.isArray(series) || series.length === 0) {
//       setSeriesList([]);
//       if (!loading) {
//         setThumbnailPaths({});
//       }
//       return;
//     }

//     setSeriesList(series);

//     const preload = async () => {
//       setLoading(true);
//       try {
//         await preloadThumbnails(series);
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     void preload();

//     return () => {
//       cancelled = true;
//     };
//   }, [series]);

//   const handleSeriesClick = (seriesItem: DicomSeries) => {
//     setSelectedSeries(seriesItem.id);
//     onSeriesSelect?.(seriesItem);
//     console.log('📌 Series selected:', seriesItem.seriesDescription, 'ID:', seriesItem.id);
//   };
//   // Helper function to get modality for a series
//   const getSeriesModality = (series: DicomSeries) => {
//     // Default modality for now - could be enhanced to fetch from study data
//     return 'CT';
//   };

//   // Load series when studyId changes (with caching)
//   useEffect(() => {
//     const loadSeries = async () => {
//       if (!studyId) {
//         return;
//       }

//       // Skip fetch if series already provided via prop and study hasn't changed
//       if (series && series.length > 0 && studyId === loadedStudyId) {
//         console.log('📦 Using cached series for study:', studyId);
//         return;
//       }

//       if (studyId !== loadedStudyId) {
//         setSeriesList([]);
//         setSeriesInstances({});
//         setThumbnailPaths({});
//       }

//       console.log('🔄 Loading series for studyId:', studyId);
//       setLoading(true);

//       try {
//         const seriesResponse = await fetchSeriesByReference({
//           id: studyId,
//           type: 'study',
//           params: { page: 1, limit: 50 },
//         }).unwrap();

//         console.log('✅ Loaded series for study:', studyId, seriesResponse);

//         const fetchedSeries = extractApiData<DicomSeries>(seriesResponse);

//         setSeriesList(fetchedSeries);
//         onSeriesLoaded?.(fetchedSeries);
//         preloadThumbnails(fetchedSeries);
//         setLoadedStudyId(studyId);
//       } catch (error) {
//         console.error('❌ Failed to load series:', error);
//         setSeriesList([]);
//         onSeriesLoaded?.([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSeries();
//   }, [studyId, series, onSeriesLoaded, loadedStudyId, fetchSeriesByReference]);

//   // Preload thumbnail paths for series
//   const preloadThumbnails = async (seriesArray: DicomSeries[]) => {
//     const updatedThumbnails: Record<string, string> = {};

//     for (const seriesItem of seriesArray) {
//       if (!seriesItem || !seriesItem.id) continue;

//       const cachedInstances = seriesInstances[seriesItem.id];
//       const cachedInstanceWithPath = cachedInstances?.find(
//         (inst: DicomInstance) =>
//           resolveDicomImageUrl(inst.filePath, inst.fileName)
//       );

//       if (cachedInstanceWithPath) {
//         const resolved = resolveDicomImageUrl(
//           cachedInstanceWithPath.filePath,
//           cachedInstanceWithPath.fileName
//         );
//         if (resolved) {
//           updatedThumbnails[seriesItem.id] = resolved;
//         }
//         continue;
//       }

//       try {
//         const response = await fetchInstancesByReference({
//           id: seriesItem.id,
//           type: 'series',
//           params: { page: 1, limit: 1 },
//         }).unwrap();

//         const instances = extractApiData<DicomInstance>(response);
//         const firstWithFile = instances.find(
//           (inst: DicomInstance) =>
//             resolveDicomImageUrl(inst.filePath, inst.fileName)
//         );

//         if (firstWithFile) {
//           const resolved = resolveDicomImageUrl(
//             firstWithFile.filePath,
//             firstWithFile.fileName
//           );
//           if (resolved) {
//             updatedThumbnails[seriesItem.id] = resolved;
//           }
//           setSeriesInstances((prev) => ({
//             ...prev,
//             [seriesItem.id]: instances,
//           }));
//         }
//       } catch (error) {
//         console.warn('Failed to preload thumbnail for series', seriesItem.id, error);
//       }
//     }

//     if (Object.keys(updatedThumbnails).length) {
//       setThumbnailPaths((prev) => ({ ...prev, ...updatedThumbnails }));
//     }
//   };


//   // Toggle series expansion - keep multiple expanded
//   const toggleSeriesExpansion = async (seriesId: string) => {
//     const isExpanding = !expandedSeries.has(seriesId);

//     setExpandedSeries(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(seriesId)) {
//         newSet.delete(seriesId);
//       } else {
//         newSet.add(seriesId);
//       }
//       return newSet;
//     });

//     // Load instances if expanding and not already loaded
//     if (isExpanding && !seriesInstances[seriesId]) {
//       setLoadingInstances(prev => new Set(prev).add(seriesId));
//       try {
//         const response = await fetchInstancesByReference({
//           id: seriesId,
//           type: 'series',
//           params: { page: 1, limit: 1000 },
//         }).unwrap();
//         const instances = response.data?.data || [];
//         setSeriesInstances(prev => ({
//           ...prev,
//           [seriesId]: instances
//         }));
//       } catch (error) {
//         console.error('Failed to load instances:', error);
//       } finally {
//         setLoadingInstances(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(seriesId);
//           return newSet;
//         });
//       }
//     }
//   };


//   // Filter series based on search and modality
//   const filteredSeries = (seriesList || []).filter((s) => {
//     const matchesSearch =
//       searchQuery === '' ||
//       (s.seriesDescription || '')
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase());
//     const matchesModality =
//       filterModality === 'All' || getSeriesModality(s) === filterModality;
//     return matchesSearch && matchesModality;
//   });

//   // Render series card using SeriesCard component
//   const renderSeriesCard = (s: DicomSeries) => {
//     const resolvedFallback = resolveDicomImageUrl(
//       seriesInstances[s.id]?.[0]?.filePath,
//       seriesInstances[s.id]?.[0]?.fileName
//     );
//     const thumbnailPath = thumbnailPaths[s.id] ?? resolvedFallback ?? undefined;
//     const isLoadingThumbnail =
//       (loading || loadingInstances.has(s.id)) &&
//       !thumbnailPath &&
//       (s.numberOfInstances ?? 0) > 0;

//     return (
//       <SeriesCard
//         key={s.id}
//         series={s}
//         isSelected={selectedSeries === s.id}
//         viewMode={viewMode}
//         onSeriesClick={handleSeriesClick}
//         thumbnailPath={thumbnailPath}
//         loadingThumbnail={isLoadingThumbnail}
//       />
//     );
//   };


//   return (
//     <TooltipProvider>
//       <div className="bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 border-l-2 border-teal-900/30 flex flex-col h-full shadow-2xl">
//         {/* Medical-themed Header */}
//         <div className="h-14 flex items-center justify-between px-4 border-b-2 border-teal-800/40 bg-linear-to-r from-slate-800 to-slate-900">
//           <div className="flex items-center gap-3">
//             <div className="p-1.5 bg-teal-600/20 rounded-lg border border-teal-500/30">
//               <Database className="h-4 w-4 text-teal-400" />
//             </div>
//             <div>
//               <h2 className="text-teal-300 font-bold text-sm tracking-wide">
//                 IMAGE SERIES
//               </h2>
//               <Badge
//                 variant="secondary"
//                 className="bg-teal-900/40 text-teal-200 text-[10px] mt-0.5 px-1.5 py-0 font-semibold border border-teal-700/30"
//               >
//                 {seriesList.length} Total
//               </Badge>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {/* View Mode Toggle */}
//             <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setViewMode('grid')}
//                     className={`h-6 w-6 p-0 transition-all ${viewMode === 'grid'
//                       ? 'text-teal-300 bg-teal-900/40'
//                       : 'text-slate-400 hover:text-white'
//                       }`}
//                   >
//                     <Grid3X3 className="h-3.5 w-3.5" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent className="bg-slate-700 border-slate-600">
//                   <p>Grid view</p>
//                 </TooltipContent>
//               </Tooltip>

//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setViewMode('list')}
//                     className={`h-6 w-6 p-0 transition-all ${viewMode === 'list'
//                       ? 'text-teal-300 bg-teal-900/40'
//                       : 'text-slate-400 hover:text-white'
//                       }`}
//                   >
//                     <List className="h-3.5 w-3.5" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent className="bg-slate-700 border-slate-600">
//                   <p>List view</p>
//                 </TooltipContent>
//               </Tooltip>
//             </div>

//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setShowFilter(!showFilter)}
//                   className={`h-8 w-8 p-0 transition-all rounded-lg ${showFilter
//                     ? 'text-teal-300 bg-teal-900/40 border border-teal-700/50'
//                     : 'text-white hover:text-teal-300 hover:bg-slate-800 border border-transparent'
//                     }`}
//                 >
//                   <Filter className="h-4 w-4" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-white">
//                 Filter Series
//               </TooltipContent>
//             </Tooltip>
//           </div>
//         </div>

//         {/* Filter Section */}
//         {showFilter && (
//           <SeriesFilter
//             searchQuery={searchQuery}
//             onSearchChange={setSearchQuery}
//             filterModality={filterModality}
//             onModalityChange={setFilterModality}
//             onClose={() => setShowFilter(false)}
//           />
//         )}

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-2 space-y-1">
//             {loading ? (
//               <div className="flex items-center justify-center py-8">
//                 <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
//                 <span className="ml-2 text-white">Loading series...</span>
//               </div>
//             ) : filteredSeries.length > 0 ? (
//               <div className={viewMode === 'grid' ? 'space-y-1' : 'space-y-1'}>
//                 {filteredSeries.map((s) =>
//                   renderSeriesCard(s)
//                 )}
//               </div>
//             ) : (
//               <div className="text-center text-slate-500 py-8">
//                 <FolderOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
//                 <div className="text-sm">No series available</div>
//                 <div className="text-xs mt-1">Load series to view them here</div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// };

// export default ViewerRightSidebar;
"use client";

import React, { useState, useEffect } from 'react';
import { Filter, FolderOpen, Database, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DicomSeries } from '@/interfaces/image-dicom/dicom-series.interface';
import { useViewer } from '@/contexts/ViewerContext';
import SeriesFilter from '../sidebar/SeriesFilter';
import { useGetImagingOrdersByPatientIdQuery } from '@/store/imagingOrderApi';
import {FolderItem} from './FoderItems';
import {formatDateVN} from '@/utils/FormatDate';


interface ViewerRightSidebarProps {
  onSeriesSelect?: (series: DicomSeries) => void;
  patientId?: string;
}

const ViewerRightSidebar = ({ onSeriesSelect, patientId }: ViewerRightSidebarProps) => {
  const { state, getViewportSeries } = useViewer();

  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterModality, setFilterModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const { data: imagingOrdersData, isLoading: isLoadingOrders } = useGetImagingOrdersByPatientIdQuery(
    { patientId: patientId ?? "" },
    { skip: !patientId }
  );

  useEffect(() => {
    const activeViewportSeries = getViewportSeries(state.activeViewport);
    if (activeViewportSeries && activeViewportSeries.id !== selectedSeries) {
      setSelectedSeries(activeViewportSeries.id);
    }
  }, [state.activeViewport, getViewportSeries, selectedSeries]);

  const handleSeriesClick = (series: DicomSeries) => {
    setSelectedSeries(series.id);
    onSeriesSelect?.(series);
  };

  const toggleFolder = (orderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <TooltipProvider>
      <div className="bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 border-l-2 border-teal-900/30 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b-2 border-teal-800/40 bg-linear-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-600/20 rounded-lg border border-teal-500/30">
              <Database className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-teal-300 font-bold text-sm tracking-wide">IMAGE </h2>
              <Badge
                variant="secondary"
                className="bg-teal-900/40 text-teal-200 text-[10px] mt-0.5 px-1.5 py-0 font-semibold border border-teal-700/30"
              >
                {imagingOrdersData?.data?.length ?? 0} Folders
              </Badge>
            </div>
          </div>

          {/* View Mode + Filter */}
          <div className="flex items-center gap-2">
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
                <TooltipContent className="bg-slate-700 border-slate-600">Grid view</TooltipContent>
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
                <TooltipContent className="bg-slate-700 border-slate-600">List view</TooltipContent>
              </Tooltip>
            </div>

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
          </div>
        </div>

        {/* Filter Section */}
        {showFilter && (
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
          <div className="p-2 space-y-1">
            {imagingOrdersData?.data?.length ? (
              imagingOrdersData.data.map((order) => (
                <FolderItem
                  key={order.id}
                  orderId={order.id}
                  folderName={order?.procedure?.name + " - " + formatDateVN(order?.createdAt || "")}
                  isExpanded={expandedFolders.has(order.id)}
                  onToggle={() => toggleFolder(order.id)}
                  selectedSeries={selectedSeries}
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                  onSeriesClick={handleSeriesClick}
                />
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <div className="text-sm">No folders available</div>
                <div className="text-xs mt-1">Load imaging orders to view them</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ViewerRightSidebar;