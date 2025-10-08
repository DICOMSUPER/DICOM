import React from 'react';
import { StudyItem } from '../StudyItem';
// import { StudyBrowserSort } from '../StudyBrowserSort';
// import { StudyBrowserViewOptions } from '../StudyBrowserViewOptions';
import { ScrollArea } from '../ScrollArea';

type DragData = {
  type: string;
  [key: string]: any;
};

export type ThumbnailItem = {
  displaySetInstanceUID: string;
  imageSrc?: string;
  imageAltText?: string;
  seriesDate?: string;
  seriesNumber?: string | number;
  numInstances?: number;
  description: string;
  componentType?: 'thumbnail' | 'thumbnailTracked' | 'thumbnailNoImage';
  isTracked?: boolean;
  dragData?: DragData;
  modality?: string;
  messages?: Record<string, any>;
  loadingProgress?: number;
  countIcon?: string;
  isHydratedForDerivedDisplaySet?: boolean;
  canReject?: boolean;
};

export type StudyEntry = {
  studyInstanceUid: string;
  date?: string;
  description?: string;
  numInstances?: number;
  modalities?: string;
  displaySets?: ThumbnailItem[];
};

export type Tab = {
  name: string;
  label: string;
  studies?: StudyEntry[];
};

export type ViewPreset = {
  id: string;
  label?: string;
  iconName?: string;
  selected?: boolean;
};

export type PanelProps = {
  tabs: Tab[];
  activeTabName: string;
  expandedStudyInstanceUIDs: string[];
  onClickTab?: (tabName: string) => void;
  onClickStudy?: (studyInstanceUID: string) => void;
  onClickThumbnail?: (displaySetInstanceUID: string, event: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClickThumbnail?: (displaySetInstanceUID: string, event: React.MouseEvent | React.TouchEvent) => void;
  onClickUntrack?: (displaySetInstanceUID: string) => void;
  activeDisplaySetInstanceUIDs?: string[];
  servicesManager?: any;
  showSettings?: boolean;
  viewPresets?: ViewPreset[];
  // ThumbnailMenuItems?: React.ComponentType<{
  //   displaySetInstanceUID: string;
  //   canReject: boolean;
  //   onReject: () => void;
  // }>;
  // StudyMenuItems?: React.ComponentType<{ StudyInstanceUID: string }>;
};

const noop = () => {};

export const StudyBrowser: React.FC<PanelProps> = ({
  tabs,
  activeTabName,
  expandedStudyInstanceUIDs,
  onClickTab = noop,
  onClickStudy = noop,
  onClickThumbnail = noop,
  onDoubleClickThumbnail = noop,
  onClickUntrack = noop,
  activeDisplaySetInstanceUIDs = [],
  viewPresets = [{ id: 'thumbnails', selected: true }],
  // ThumbnailMenuItems,
  // StudyMenuItems,
}) => {
  const getTabContent = () => {
    const tabData = tabs.find(tab => tab.name === activeTabName);
    const viewPreset = viewPresets.find(p => p.selected)?.id || 'thumbnails';

    return tabData?.studies?.map(
      ({ studyInstanceUid, date, description, numInstances, modalities, displaySets }) => {
        const isExpanded = expandedStudyInstanceUIDs.includes(studyInstanceUid);

        return (
          <React.Fragment key={studyInstanceUid}>
            <StudyItem
              date={date || ''}
              description={description}
              numInstances={numInstances || 0}
              isExpanded={isExpanded}
              displaySets={displaySets || []}
              modalities={modalities || ''}
              isActive={isExpanded}
              onClick={() => onClickStudy(studyInstanceUid)}
              onClickThumbnail={onClickThumbnail}
              onDoubleClickThumbnail={onDoubleClickThumbnail}
              onClickUntrack={onClickUntrack}
              activeDisplaySetInstanceUIDs={activeDisplaySetInstanceUIDs}
              viewPreset={viewPreset as 'thumbnails' | 'list'}
              // ThumbnailMenuItems={ThumbnailMenuItems}
              // StudyMenuItems={StudyMenuItems}
              StudyInstanceUID={studyInstanceUid}
            />
          </React.Fragment>
        );
      }
    );
  };

  return (
    <ScrollArea>
      <div className="bg-bkg-low flex flex-1 flex-col gap-[4px]" data-cy="studyBrowser-panel">
        <div className="flex flex-col gap-[4px]">
          {/* {showSettings && (
            <div className="w-100 bg-bkg-low flex h-[48px] items-center justify-center gap-[10px] px-[8px] py-[10px]">
              <StudyBrowserViewOptions tabs={tabs} onSelectTab={onClickTab} activeTabName={activeTabName} />
              <StudyBrowserSort servicesManager={servicesManager} />
            </div>
          )} */}
          {getTabContent()}
        </div>
      </div>
    </ScrollArea>
  );
};

export default StudyBrowser;