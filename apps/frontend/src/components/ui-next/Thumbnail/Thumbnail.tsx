import React, { useRef, useState } from 'react';
import classnames from 'classnames';

import { DisplaySetMessageListTooltip } from '../DisplaySetMessageListTooltip';
import { TooltipTrigger, TooltipContent, Tooltip } from '../Tooltip';
import { AudioWaveform, CircleX, Layers, Link2, Rows2 } from 'lucide-react';

type DragData = {
  type: string;
  [key: string]: any;
};

type Message = {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
};

interface ThumbnailProps {
  displaySetInstanceUID: string;
  className?: string;
  imageSrc?: string;
  imageAltText?: string;
  description: string;
  seriesNumber?: string | number;
  numInstances: number;
  loadingProgress?: number;
  countIcon?: string;
  messages?: Record<string, Message>;
  isActive: boolean;
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick: (e: React.MouseEvent | React.TouchEvent) => void;
  thumbnailType?: 'thumbnail' | 'thumbnailTracked' | 'thumbnailNoImage';
  modality?: string;
  viewPreset?: 'thumbnails' | 'list';
  isHydratedForDerivedDisplaySet?: boolean;
  isTracked?: boolean;
  canReject?: boolean;
  dragData?: DragData;
  onReject?: () => void;
  onClickUntrack?: () => void;
  // ThumbnailMenuItems?: React.ComponentType<{
  //   displaySetInstanceUID: string;
  //   canReject: boolean;
  //   onReject: () => void;
  // }>;
}

/**
 * Display a thumbnail for a display set.
 */
export const Thumbnail: React.FC<ThumbnailProps> = ({
  displaySetInstanceUID,
  className,
  imageSrc,
  imageAltText,
  description,
  seriesNumber,
  numInstances,
  loadingProgress,
  countIcon,
  messages,
  isActive,
  onClick,
  onDoubleClick,
  thumbnailType,
  modality,
  viewPreset = 'thumbnails',
  isHydratedForDerivedDisplaySet = false,
  isTracked = false,
  canReject = false,
  dragData = {},
  onReject = () => {},
  onClickUntrack = () => {},
  // ThumbnailMenuItems = () => null,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);


  const [lastTap, setLastTap] = useState(0);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      onDoubleClick(e);
    } else {
      onClick(e);
    }
    
    setLastTap(currentTime);
  };

  const renderThumbnailPreset = () => {
    return (
      <div
        className={classnames(
          'flex h-full w-full flex-col items-center justify-center gap-[2px] p-[4px]',
          isActive && 'bg-popover rounded'
        )}
      >
        <div className="h-[114px] w-[128px]">
          <div className="relative bg-black">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAltText}
                className="h-[114px] w-[128px] rounded object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="bg-background h-[114px] w-[128px] rounded"></div>
            )}

            {/* Bottom left indicator */}
            <div className="absolute bottom-0 left-0 flex h-[14px] items-center gap-[4px] rounded-tr pt-[10px] pb-[10px] pr-[6px] pl-[5px]">
              <div
                className={classnames(
                  'h-[10px] w-[10px] rounded-[2px]',
                  isActive || isHydratedForDerivedDisplaySet ? 'bg-highlight' : 'bg-primary/65',
                  loadingProgress && loadingProgress < 1 && 'bg-primary/25'
                )}
              />
              <div className="text-[11px] font-semibold text-white">{modality}</div>
            </div>

            {/* Top right messages and tracking */}
            <div className="absolute top-0 right-0 flex items-center gap-[4px]">
              {messages && (
                <DisplaySetMessageListTooltip
                  messages={messages}
                  id={`display-set-tooltip-${displaySetInstanceUID}`}
                />
              )}
              {isTracked && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="group">
                      <AudioWaveform className="text-primary-light h-[15px] w-[15px] group-hover:hidden" />
                      <CircleX
                        className="text-primary-light hidden h-[15px] w-[15px] group-hover:block"
                        onClick={onClickUntrack}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex flex-1 flex-row">
                      <div className="flex-2 flex items-center justify-center pr-4">
                        <Link2 className="text-primary" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-white">
                          {isTracked ? 'Series is tracked' : 'Series is untracked'}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Bottom right menu */}
            {/* <div className="absolute bottom-0 right-0 flex items-center gap-[4px] p-[4px]">
              <ThumbnailMenuItems
                displaySetInstanceUID={displaySetInstanceUID}
                canReject={canReject}
                onReject={onReject}
              />
            </div> */}
          </div>
        </div>

        {/* Thumbnail description */}
        <div className="flex h-[52px] w-[128px] flex-col justify-start pt-px">
          <Tooltip>
            <TooltipContent>{description}</TooltipContent>
            <TooltipTrigger>
              <div className="min-h-[18px] w-[128px] overflow-hidden text-ellipsis whitespace-nowrap pb-0.5 pl-1 text-left text-[12px] font-normal leading-4 text-white">
                {description}
              </div>
            </TooltipTrigger>
          </Tooltip>

          <div className="flex h-[12px] items-center gap-[7px] overflow-hidden">
            <div className="text-foreground pl-1 text-[11px]">S:{seriesNumber}</div>
            <div className="text-foreground text-[11px]">
              <div className="flex items-center gap-[4px]">

                  <Rows2 className="w-3" />

                <div>{numInstances}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListPreset = () => {
    return (
      <div
        className={classnames(
          'flex h-full w-full items-center justify-between pr-[8px] pl-[8px] pt-[4px] pb-[4px]',
          isActive && 'bg-popover rounded'
        )}
      >
        <div className="relative flex h-[32px] w-full items-center gap-[8px] overflow-hidden">
          <div
            className={classnames(
              'h-[32px] w-[4px] min-w-[4px] rounded',
              isActive || isHydratedForDerivedDisplaySet ? 'bg-highlight' : 'bg-primary/65',
              loadingProgress && loadingProgress < 1 && 'bg-primary/25'
            )}
          />

          <div className="flex h-full w-[calc(100%-12px)] flex-col justify-start">
            <div className="flex items-center gap-[7px]">
              <div className="text-[13px] font-semibold text-white">{modality}</div>
              <Tooltip>
                <TooltipContent>{description}</TooltipContent>
                <TooltipTrigger className="w-full overflow-hidden">
                  <div className="max-w-[160px] overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-[13px] font-normal text-white">
                    {description}
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </div>

            <div className="flex h-[12px] items-center gap-[7px] overflow-hidden">
              <div className="text-foreground text-[12px]">S:{seriesNumber}</div>
              <div className="text-foreground text-[12px]">
                <div className="flex items-center gap-[4px]">

                   <Layers className="w-3" />

                  <div>{numInstances}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full items-center gap-[4px]">
          {messages && (
            <DisplaySetMessageListTooltip
              messages={messages}
              id={`display-set-tooltip-${displaySetInstanceUID}`}
            />
          )}
          {isTracked && (
            <Tooltip>
              <TooltipTrigger>
                <div className="group">
                  <Layers className="text-primary-light h-[20px] w-[15px] group-hover:hidden" />
                  <CircleX
                    className="text-primary-light hidden h-[15px] w-[15px] group-hover:block"
                    onClick={onClickUntrack}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-1 flex-row">
                  <div className="flex-2 flex items-center justify-center pr-4">
                    <Link2 className="text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-white">
                      {isTracked ? 'Series is tracked' : 'Series is untracked'}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          {/* <ThumbnailMenuItems
            displaySetInstanceUID={displaySetInstanceUID}
            canReject={canReject}
            onReject={onReject}
          /> */}
        </div>
      </div>
    );
  };

  return (
    <div
      className={classnames(
        className,
        'bg-muted hover:bg-primary/30 group flex cursor-pointer select-none flex-col rounded outline-none',
        viewPreset === 'thumbnails' && 'h-[170px] w-[135px]',
        viewPreset === 'list' && 'h-[40px] w-full'
      )}
      id={`thumbnail-${displaySetInstanceUID}`}
      data-cy={
        thumbnailType === 'thumbnailNoImage'
          ? 'study-browser-thumbnail-no-image'
          : 'study-browser-thumbnail'
      }
      data-series={seriesNumber}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
    >
      <div
        ref={dragRef}
        className="h-full w-full"
      >
        {viewPreset === 'thumbnails' && renderThumbnailPreset()}
        {viewPreset === 'list' && renderListPreset()}
      </div>
    </div>
  );
};