import React from 'react';



import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';

const DisplaySetMessageListTooltip = ({ messages, id }: { messages: any; id: string }): React.ReactNode => {

  if (messages?.size()) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger id={id}>
            {/* <Icons.StatusWarning
              className="h-[20px] w-[20px]"
              aria-hidden="true"
              role="presentation"
            /> */}
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="max-w-68 text-left text-lg text-white">
              <div
                className="break-normal text-lg font-semibold text-blue-300"
                style={{
                  marginLeft: '4px',
                  marginTop: '4px',
                }}
              >
                {('Display Set Messages')}
              </div>
              <ol
                style={{
                  marginLeft: '4px',
                  marginRight: '4px',
                }}
              >
                {messages.messages.map((message: any, index: number) => (
                  <li
                    style={{
                      marginTop: '6px',
                      marginBottom: '6px',
                    }}
                    key={index}
                  >
                    {index + 1}. {(message.id)}
                  </li>
                ))}
              </ol>
            </div>
          </TooltipContent>
        </Tooltip>
      </>
    );
  }
  return <></>;
};


export { DisplaySetMessageListTooltip };
