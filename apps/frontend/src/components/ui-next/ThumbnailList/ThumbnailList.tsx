import React from 'react';
import { Thumbnail } from '../Thumbnail';
import useDynamicMaxHeight from '@/common/hooks/useDymaicMaxHeight';
;

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

interface ThumbnailListProps {
  thumbnails: ThumbnailItem[];
  onThumbnailClick: (displaySetInstanceUID: string, event: React.MouseEvent | React.TouchEvent) => void;
  onThumbnailDoubleClick: (displaySetInstanceUID: string, event: React.MouseEvent | React.TouchEvent) => void;
  onClickUntrack: (displaySetInstanceUID: string) => void;
  activeDisplaySetInstanceUIDs?: string[];
  viewPreset?: 'thumbnails' | 'list';
  // ThumbnailMenuItems?: React.ComponentType<{
  //   displaySetInstanceUID: string;
  //   canReject: boolean;
  //   onReject: () => void;
  // }>;
}

export const ThumbnailList: React.FC<ThumbnailListProps> = ({
  thumbnails,
  onThumbnailClick,
  onThumbnailDoubleClick,
  onClickUntrack,
  activeDisplaySetInstanceUIDs = [],
  viewPreset = 'thumbnails',
  // ThumbnailMenuItems = () => null,
}) => {
  // Use the dynamic height hook on the parent container
  const { ref, maxHeight } = useDynamicMaxHeight(thumbnails);


  const listItems = thumbnails?.filter(
    ({ componentType }) => componentType === 'thumbnailNoImage' || viewPreset === 'list'
  );

  const thumbnailItems = thumbnails?.filter(
    ({ componentType }) => componentType !== 'thumbnailNoImage' && viewPreset === 'thumbnails'
  );

  return (
    <div className="flex flex-col">
      <div
        ref={ref}
        className="flex flex-col gap-[2px] pt-[4px] pr-[2.5px] pl-[5px] pb-[4px]"
        style={{ maxHeight }}
      >
        {/* Thumbnail Items */}
        {thumbnailItems.length > 0 && (
          <div
            id="ohif-thumbnail-list"
            className="bg-bkg-low grid grid-cols-[repeat(auto-fit,_minmax(0,135px))] place-items-start gap-[4px]"
          >
            {thumbnailItems.map((item) => {
              const { displaySetInstanceUID, componentType, numInstances, ...rest } = item;

              const isActive = activeDisplaySetInstanceUIDs.includes(displaySetInstanceUID);
              
              return (
                <Thumbnail
                  key={displaySetInstanceUID}
                  {...rest}
                  displaySetInstanceUID={displaySetInstanceUID}
                  numInstances={numInstances || 1}
                  isActive={isActive}
                  thumbnailType={componentType}
                  viewPreset="thumbnails"
                  onClick={(e) => onThumbnailClick(displaySetInstanceUID, e)}
                  onDoubleClick={(e) => onThumbnailDoubleClick(displaySetInstanceUID, e)}
                  onClickUntrack={() => onClickUntrack(displaySetInstanceUID)}
                  // ThumbnailMenuItems={ThumbnailMenuItems}
                />
              );
            })}
          </div>
        )}

        {/* List Items */}
        {listItems.length > 0 && (
          <div
            id="ohif-thumbnail-list"
            className="bg-bkg-low grid grid-cols-[repeat(auto-fit,_minmax(0,275px))] place-items-start gap-[2px]"
          >
            {listItems.map((item) => {
              const { displaySetInstanceUID, componentType, numInstances, ...rest } = item;
              
              const isActive = activeDisplaySetInstanceUIDs.includes(displaySetInstanceUID);
              
              return (
                <Thumbnail
                  key={displaySetInstanceUID}
                  {...rest}
                  displaySetInstanceUID={displaySetInstanceUID}
                  numInstances={numInstances || 1}
                  isActive={isActive}
                  thumbnailType={componentType}
                  viewPreset="list"
                  onClick={(e) => onThumbnailClick(displaySetInstanceUID, e)}
                  onDoubleClick={(e) => onThumbnailDoubleClick(displaySetInstanceUID, e)}
                  onClickUntrack={() => onClickUntrack(displaySetInstanceUID)}
                  // ThumbnailMenuItems={ThumbnailMenuItems}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};