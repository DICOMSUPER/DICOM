import classnames from 'classnames';
import React, { useCallback, useEffect, useState, CSSProperties } from 'react';

import { TooltipTrigger, TooltipContent, Tooltip } from '../Tooltip';
import { Separator } from '../Separator';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { getLucideIcon } from '@/common/utils/get-lucide-icon';

type SidePanelProps = {
  side: 'left' | 'right';
  className?: string; // Changed to optional
  activeTabIndex: number;
  onOpen: () => void;
  onClose: () => void;
  onActiveTabIndexChange: (params: { activeTabIndex: number }) => void;
  isExpanded: boolean;
  expandedWidth?: number; // Made optional with default
  collapsedWidth?: number; // Made optional with default
  expandedInsideBorderSize?: number; // Made optional with default
  collapsedInsideBorderSize?: number; // Made optional with default
  collapsedOutsideBorderSize?: number; // Made optional with default
  tabs: any;
};

type StyleMapValue = {
  marginLeft: string;
  marginRight: string;
  alignItems?: 'flex-end' | 'flex-start';
};

type StyleMap = {
  open: {
    left: StyleMapValue;
    right: StyleMapValue;
  };
  closed: {
    left: StyleMapValue;
    right: StyleMapValue;
  };
};

const closeIconWidth = 30;
const gridHorizontalPadding = 10;
const tabSpacerWidth = 2;

const baseClasses = 'bg-black border-black justify-start box-content flex flex-col';

const getTabWidth = (numTabs: number) => {
  if (numTabs < 3) {
    return 68;
  } else {
    return 40;
  }
};

const getGridWidth = (numTabs: number, gridAvailableWidth: number) => {
  const spacersWidth = (numTabs - 1) * tabSpacerWidth;
  const tabsWidth = getTabWidth(numTabs) * numTabs;

  if (gridAvailableWidth > tabsWidth + spacersWidth) {
    return tabsWidth + spacersWidth;
  }

  return gridAvailableWidth;
};

const getNumGridColumns = (numTabs: number, gridWidth: number) => {
  if (numTabs === 1) {
    return 1;
  }

  const tabWidth = getTabWidth(numTabs);
  const numTabsWithOneSpacerEach = Math.floor(gridWidth / (tabWidth + tabSpacerWidth));

  if (
    (numTabsWithOneSpacerEach + 1) * tabWidth + numTabsWithOneSpacerEach * tabSpacerWidth <=
    gridWidth
  ) {
    return numTabsWithOneSpacerEach + 1;
  }

  return numTabsWithOneSpacerEach;
};

const getTabClassNames = (
  numColumns: number,
  numTabs: number,
  tabIndex: number,
  isActiveTab: boolean,
  isTabDisabled: boolean
) =>
  classnames('h-[28px] mb-[2px] cursor-pointer text-white bg-black', {
    'hover:text-primary': !isActiveTab && !isTabDisabled,
    'rounded-l': tabIndex % numColumns === 0,
    'rounded-r': (tabIndex + 1) % numColumns === 0 || tabIndex === numTabs - 1,
  });

const getTabStyle = (numTabs: number): CSSProperties => {
  return {
    width: `${getTabWidth(numTabs)}px`,
  };
};

const getTabIconClassNames = (numTabs: number, isActiveTab: boolean) => {
  return classnames('h-full w-full flex items-center justify-center', {
    'bg-customblue-40': isActiveTab,
    rounded: isActiveTab,
  });
};

const createStyleMap = (
  expandedWidth: number,
  expandedInsideBorderSize: number,
  collapsedWidth: number,
  collapsedInsideBorderSize: number,
  collapsedOutsideBorderSize: number
): StyleMap => {
  const collapsedHideWidth = expandedWidth - collapsedWidth - collapsedOutsideBorderSize;

  return {
    open: {
      left: { 
        marginLeft: '0px', 
        marginRight: `${expandedInsideBorderSize}px` 
      },
      right: { 
        marginLeft: `${expandedInsideBorderSize}px`, 
        marginRight: '0px' 
      },
    },
    closed: {
      left: {
        marginLeft: `-${collapsedHideWidth}px`,
        marginRight: `${collapsedInsideBorderSize}px`,
        alignItems: 'flex-end' as const,
      },
      right: {
        marginLeft: `${collapsedInsideBorderSize}px`,
        marginRight: `-${collapsedHideWidth}px`,
        alignItems: 'flex-start' as const,
      },
    },
  };
};

const getToolTipContent = (label: string, disabled: boolean) => {
  return (
    <>
      <div>{label}</div>
      {disabled && <div className="text-white">{'Not available based on current context'}</div>}
    </>
  );
};

const createBaseStyle = (expandedWidth: number): CSSProperties => {
  return {
    maxWidth: `${expandedWidth}px`,
    width: `${expandedWidth}px`,
    position: 'relative' as const,
    top: '0.2%',
    height: '99.8%',
  };
};

const SidePanel = ({
  side,
  className = '', // Default empty string
  activeTabIndex: activeTabIndexProp,
  isExpanded,
  tabs,
  onOpen,
  onClose,
  onActiveTabIndexChange,
  expandedWidth = 280,
  collapsedWidth = 25,
  expandedInsideBorderSize = 4,
  collapsedInsideBorderSize = 8,
  collapsedOutsideBorderSize = 4,
}: SidePanelProps) => {
  const [panelOpen, setPanelOpen] = useState(isExpanded);
  const [activeTabIndex, setActiveTabIndex] = useState(activeTabIndexProp ?? 0);

  const [styleMap, setStyleMap] = useState(
    createStyleMap(
      expandedWidth,
      expandedInsideBorderSize,
      collapsedWidth,
      collapsedInsideBorderSize,
      collapsedOutsideBorderSize
    )
  );

  const [baseStyle, setBaseStyle] = useState(createBaseStyle(expandedWidth));

  const [gridAvailableWidth, setGridAvailableWidth] = useState(
    expandedWidth - closeIconWidth - gridHorizontalPadding
  );

  const [gridWidth, setGridWidth] = useState(getGridWidth(tabs.length, gridAvailableWidth));
  const openStatus = panelOpen ? 'open' : 'closed';
  
  // Fix style combination with proper typing
  const combinedStyle: CSSProperties = {
    ...baseStyle,
    ...styleMap[openStatus][side],
  };

  const updatePanelOpen = useCallback(
    (isOpen: boolean) => {
      setPanelOpen(isOpen);
      if (isOpen !== panelOpen) {
        if (isOpen && onOpen) {
          onOpen();
        } else if (onClose && !isOpen) {
          onClose();
        }
      }
    },
    [panelOpen, onOpen, onClose]
  );

  const updateActiveTabIndex = useCallback(
    (activeTabIndex: number, forceOpen: boolean = false) => {
      if (forceOpen) {
        updatePanelOpen(true);
      }

      setActiveTabIndex(activeTabIndex);

      if (onActiveTabIndexChange) {
        onActiveTabIndexChange({ activeTabIndex });
      }
    },
    [onActiveTabIndexChange, updatePanelOpen]
  );

  useEffect(() => {
    updatePanelOpen(isExpanded);
  }, [isExpanded, updatePanelOpen]);

  useEffect(() => {
    setStyleMap(
      createStyleMap(
        expandedWidth,
        expandedInsideBorderSize,
        collapsedWidth,
        collapsedInsideBorderSize,
        collapsedOutsideBorderSize
      )
    );
    setBaseStyle(createBaseStyle(expandedWidth));

    const gridAvailableWidth = expandedWidth - closeIconWidth - gridHorizontalPadding;
    setGridAvailableWidth(gridAvailableWidth);
    setGridWidth(getGridWidth(tabs.length, gridAvailableWidth));
  }, [
    collapsedInsideBorderSize,
    collapsedWidth,
    expandedWidth,
    expandedInsideBorderSize,
    tabs.length,
    collapsedOutsideBorderSize,
  ]);

  useEffect(() => {
    updateActiveTabIndex(activeTabIndexProp ?? 0);
  }, [activeTabIndexProp, updateActiveTabIndex]);

  const getCloseStateComponent = () => {
    const _childComponents = Array.isArray(tabs) ? tabs : [tabs];
    return (
      <>
        <div
          className={classnames(
            'bg-secondary-dark flex h-[28px] w-full cursor-pointer items-center rounded-md',
            side === 'left' ? 'justify-end pr-2' : 'justify-start pl-2'
          )}
          onClick={() => {
            updatePanelOpen(!panelOpen);
          }}
          data-cy={`side-panel-header-${side}`}
        >
          <Menu
            className={classnames('text-primary', side === 'left' && 'rotate-180 transform')}
            size={20}
          />
        </div>
        <div className={classnames('mt-3 flex flex-col space-y-3')}>
          {_childComponents.map((childComponent: any, index: number) => {
            const IconComponent = getLucideIcon(childComponent.iconName);
            
            return (
              <Tooltip key={index}>
                <TooltipTrigger>
                  <div
                    id={`${childComponent.name}-btn`}
                    data-cy={`${childComponent.name}-btn`}
                    className="text-primary hover:cursor-pointer"
                    onClick={() => {
                      return childComponent.disabled ? null : updateActiveTabIndex(index, true);
                    }}
                  >
                    <IconComponent
                      className={classnames({
                        'text-primary': true,
                        'ohif-disabled': childComponent.disabled,
                      })}
                      size={22}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side={side === 'left' ? 'right' : 'left'}>
                  <div
                    className={classnames(
                      'flex items-center',
                      side === 'left' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {getToolTipContent(childComponent.label, childComponent.disabled)}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </>
    );
  };

  const getCloseIcon = () => {
    const CloseIcon = side === 'left' ? ChevronLeft : ChevronRight;
    
    return (
      <div
        className={classnames(
          'absolute flex cursor-pointer items-center justify-center',
          side === 'left' ? 'right-0' : 'left-0'
        )}
        style={{ width: `${closeIconWidth}px` }}
        onClick={() => {
          updatePanelOpen(!panelOpen);
        }}
        data-cy={`side-panel-header-${side}`}
      >
        <CloseIcon className="text-primary" size={20} />
      </div>
    );
  };

  const getTabGridComponent = () => {
    const numCols = getNumGridColumns(tabs.length, gridWidth);

    return (
      <>
        {getCloseIcon()}
        <div className={classnames('flex grow justify-center')}>
          <div className={classnames('bg-primary-dark text-primary flex flex-wrap')}>
            {tabs.map((tab: any, tabIndex: number) => {
              const { disabled } = tab;
              const IconComponent = getLucideIcon(tab.iconName);
              
              return (
                <React.Fragment key={tabIndex}>
                  {tabIndex % numCols !== 0 && (
                    <div
                      className={classnames(
                        'flex h-[28px] w-[2px] items-center bg-black'
                      )}
                    >
                      <div className="bg-primary-dark h-[20px] w-full"></div>
                    </div>
                  )}
                  <Tooltip key={tabIndex}>
                    <TooltipTrigger>
                      <div
                        className={getTabClassNames(
                          numCols,
                          tabs.length,
                          tabIndex,
                          tabIndex === activeTabIndex,
                          disabled
                        )}
                        style={getTabStyle(tabs.length)}
                        onClick={() => {
                          return disabled ? null : updateActiveTabIndex(tabIndex);
                        }}
                        data-cy={`${tab.name}-btn`}
                      >
                        <div
                          className={getTabIconClassNames(tabs.length, tabIndex === activeTabIndex)}
                        >
                          <IconComponent
                            className={classnames({
                              'text-primary': true,
                              'ohif-disabled': disabled,
                            })}
                            size={22}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {getToolTipContent(tab.label, disabled)}
                    </TooltipContent>
                  </Tooltip>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const getOneTabComponent = () => {
    return (
      <div
        className={classnames(
          'text-primary flex grow cursor-pointer select-none justify-center self-center text-[13px]'
        )}
        data-cy={`${tabs[0].name}-btn`}
        onClick={() => updatePanelOpen(!panelOpen)}
      >
        {getCloseIcon()}
        <span>{tabs[0].label}</span>
      </div>
    );
  };

  const getOpenStateComponent = () => {
    return (
      <>
        <div className="bg-bkg-med flex h-[40px] flex-shrink-0 select-none rounded-t p-2">
          {tabs.length === 1 ? getOneTabComponent() : getTabGridComponent()}
        </div>
        <Separator
          orientation="horizontal"
          className="bg-black"
          thickness="2px"
        />
      </>
    );
  };

  return (
    <div
      className={classnames(className, baseClasses)}
      style={combinedStyle}
    >
      {panelOpen ? (
        <>
          {getOpenStateComponent()}
          {tabs.map((tab: any, tabIndex: number) => {
            if (tabIndex === activeTabIndex) {
              return <tab.content key={tabIndex} />;
            }
            return null;
          })}
        </>
      ) : (
        <React.Fragment>{getCloseStateComponent()}</React.Fragment>
      )}
    </div>
  );
};

export { SidePanel };
export type { SidePanelProps };