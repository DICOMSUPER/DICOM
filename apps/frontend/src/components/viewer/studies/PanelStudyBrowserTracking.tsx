import React, { useEffect } from 'react';
import PanelStudyBrowser from './PanelStudies';



// import { UntrackSeriesModal } from './untrackSeriesModal';
// import { useTrackedMeasurements } from '../../getContextModule';

const thumbnailNoImageModalities = ['SR', 'SEG', 'RTSTRUCT', 'RTPLAN', 'RTDOSE', 'PMAP'];

/**
 * Panel component for the Study Browser with tracking capabilities
 */
export default function PanelStudyBrowserTracking() {

//   const [trackedMeasurements, sendTrackedMeasurementsEvent] = useTrackedMeasurements();
//   const { trackedSeries } = trackedMeasurements.context;

  const checkDirtyMeasurements = (displaySetInstanceUID:string) => {
    //     const displaySet = displaySetService.getDisplaySetByUID(displaySetInstanceUID);
    //     if (displaySet.Modality === 'SR' || displaySet.Modality === 'ANN') {
    //     const activeViewportId = viewportGridService.getActiveViewportId();
    //     sendTrackedMeasurementsEvent('CHECK_DIRTY', {
    //         viewportId: activeViewportId,
    //         displaySetInstanceUID: displaySetInstanceUID,
    //     });
    // }
    console.log('Check dirty measurements for displaySetInstanceUID:', displaySetInstanceUID);
    
  };

  useEffect(() => {
    // const subscriptionOndropFired = viewportGridService.subscribe(
    //   viewportGridService.EVENTS.VIEWPORT_ONDROP_HANDLED,
    //   ({ eventData }) => {
    //     checkDirtyMeasurements(eventData.displaySetInstanceUID);
    //   }
    // );

    // return () => {
    //   subscriptionOndropFired.unsubscribe();
    // };
  }, []);

  const onClickUntrack = (displaySetInstanceUID: string) => {
    console.log('Untrack clicked for displaySetInstanceUID:', displaySetInstanceUID);


    // uiModalService.show({
    //   title: 'Untrack Series',
    //   content: UntrackSeriesModal,
    //   contentProps: {
    //     onConfirm,
    //     message: 'Are you sure you want to untrack this series?',
    //   },
    // });

  };

  // Custom mapping function to add tracking data to display sets
  const mapDisplaySetsWithTracking = (
    // displaySets,
    // displaySetLoadingState,
    // thumbnailImageSrcMap,
    // viewports
  ) => {
    // const thumbnailDisplaySets = [];
    // const thumbnailNoImageDisplaySets = [];
    // displaySets
    //   .filter(ds => !ds.excludeFromThumbnailBrowser)
    //   .forEach(ds => {
    //     const { thumbnailSrc, displaySetInstanceUID } = ds;
    //     const componentType = getComponentType(ds);

    //     const array =
    //       componentType === 'thumbnailTracked' ? thumbnailDisplaySets : thumbnailNoImageDisplaySets;

    //     const loadingProgress = displaySetLoadingState?.[displaySetInstanceUID];

    //     array.push({
    //       displaySetInstanceUID,
    //       description: ds.SeriesDescription || '',
    //       seriesNumber: ds.SeriesNumber,
    //       modality: ds.Modality,
    //       seriesDate: ds.SeriesDate ? new Date(ds.SeriesDate).toLocaleDateString() : '',
    //       numInstances: ds.numImageFrames,
    //       loadingProgress,
    //       countIcon: ds.countIcon,
    //       messages: ds.messages,
    //       StudyInstanceUID: ds.StudyInstanceUID,
    //       componentType,
    //       imageSrc: thumbnailSrc || thumbnailImageSrcMap[displaySetInstanceUID],
    //       dragData: {
    //         type: 'displayset',
    //         displaySetInstanceUID,
    //       },
    //       isTracked: trackedSeries.includes(ds.SeriesInstanceUID),
    //       isHydratedForDerivedDisplaySet: ds.isHydrated,
    //     });
    //   });

    // return [...thumbnailDisplaySets, ...thumbnailNoImageDisplaySets];
  };

  // Override component type to use tracking specific components
  const getComponentType = (ds: any) => {
    if (
      thumbnailNoImageModalities.includes(ds.Modality) ||
      ds.unsupported ||
      ds.thumbnailSrc === null
    ) {
      return 'thumbnailNoImage';
    }
    return 'thumbnailTracked';
  };

  return (
    <PanelStudyBrowser
    //   getImageSrc={getImageSrc}
    //   getStudiesForPatientByMRN={getStudiesForPatientByMRN}
    //   requestDisplaySetCreationForStudy={requestDisplaySetCreationForStudy}
   
      customMapDisplaySets={mapDisplaySetsWithTracking}
      onClickUntrack={onClickUntrack}
      onDoubleClickThumbnailHandlerCallBack={checkDirtyMeasurements}
    />
  );
}


