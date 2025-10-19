import React from 'react';
import classnames from 'classnames';
import { ThumbnailList, ThumbnailItem } from '../ThumbnailList';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../Accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';


interface StudyItemProps {
  date: string;
  description?: string;
  numInstances: number;
  modalities: string;
  isActive?: boolean;
  onClick: (e: React.MouseEvent | React.KeyboardEvent) => void;
  isExpanded?: boolean;
  displaySets?: ThumbnailItem[];
  activeDisplaySetInstanceUIDs?: string[];
  onClickThumbnail?: (displaySetInstanceUID: string, event: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClickThumbnail?: (displaySetInstanceUID: string, event: React.MouseEvent | React.TouchEvent) => void;
  onClickUntrack?: (displaySetInstanceUID: string) => void;
  viewPreset?: 'thumbnails' | 'list';
  ThumbnailMenuItems?: React.ComponentType<{
    displaySetInstanceUID: string;
    canReject: boolean;
    onReject: () => void;
  }>;
  StudyInstanceUID: string;
}

export const StudyItem: React.FC<StudyItemProps> = ({
  date,
  description,
  numInstances,
  modalities,
  isActive = false,
  onClick,
  isExpanded = false,
  displaySets = [],
  activeDisplaySetInstanceUIDs = [],
  onClickThumbnail = () => {},
  onDoubleClickThumbnail = () => {},
  onClickUntrack = () => {},
  viewPreset = 'thumbnails',
  // ThumbnailMenuItems,
  // StudyMenuItems,
  // StudyInstanceUID,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    onClick(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      defaultValue={isActive ? 'study-item' : undefined}
    >
      <AccordionItem value="study-item">
        <AccordionTrigger className={classnames('hover:bg-accent bg-popover group w-full rounded')}>
          <div className="flex h-[40px] w-full flex-row overflow-hidden">
            <div className="flex w-full flex-row items-center justify-between">
              <div className="flex min-w-0 flex-col items-start text-[13px]">
                <Tooltip>
                  <TooltipContent>{date}</TooltipContent>
                  <TooltipTrigger
                    className="w-full"
                    asChild
                  >
                    <div className="h-[18px] w-full max-w-[160px] overflow-hidden truncate whitespace-nowrap text-left text-white">
                      {date}
                    </div>
                  </TooltipTrigger>
                </Tooltip>
                <Tooltip>
                  <TooltipContent>{description || 'No description'}</TooltipContent>
                  <TooltipTrigger
                    className="w-full"
                    asChild
                  >
                    <div className="text-foreground h-[18px] w-full overflow-hidden truncate whitespace-nowrap text-left">
                      {description || 'No description'}
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </div>
              <div className="text-foreground flex flex-col items-end pl-[10px] text-[12px]">
                <div className="max-w-[150px] overflow-hidden text-ellipsis">{modalities}</div>
                <div>{numInstances}</div>
              </div>
              {/* {StudyMenuItems && (
                <div className="ml-2 flex items-center">
                  <StudyMenuItems StudyInstanceUID={StudyInstanceUID} />
                </div>
              )} */}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent
          onClick={(event: any) => {
            event.stopPropagation();
          }}
        >
          {isExpanded && displaySets && displaySets.length > 0 && (
            <ThumbnailList
              thumbnails={displaySets}
              activeDisplaySetInstanceUIDs={activeDisplaySetInstanceUIDs}
              onThumbnailClick={onClickThumbnail}
              onThumbnailDoubleClick={onDoubleClickThumbnail}
              onClickUntrack={onClickUntrack}
              viewPreset={viewPreset}
              // ThumbnailMenuItems={ThumbnailMenuItems}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};